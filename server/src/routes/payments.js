import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  getHdfcOrderStatus,
  hdfcConfigured,
  isPaidStatus,
  verifyReturnSignature,
} from '../services/hdfc.js';

const router = Router();

const TERMINAL_FAIL = new Set([
  'AUTHENTICATION_FAILED',
  'AUTHORIZATION_FAILED',
  'JUSPAY_DECLINED',
]);

async function markOrderPaid(orderNumber, gatewayStatus, extra = {}) {
  const result = await pool.query(
    `UPDATE orders
     SET payment_status = 'paid',
         status = CASE WHEN status = 'awaiting_payment' THEN 'pending' ELSE status END,
         payment_gateway_status = $2,
         paid_at = COALESCE(paid_at, NOW()),
         payment_meta = COALESCE(payment_meta, '{}'::jsonb) || $3::jsonb
     WHERE order_number = $1
     RETURNING *`,
    [orderNumber, gatewayStatus, JSON.stringify(extra)]
  );
  return result.rows[0] || null;
}

async function markOrderFailed(orderNumber, gatewayStatus, extra = {}) {
  const result = await pool.query(
    `UPDATE orders
     SET payment_status = 'failed',
         status = CASE WHEN status = 'awaiting_payment' THEN 'cancelled' ELSE status END,
         payment_gateway_status = $2,
         payment_meta = COALESCE(payment_meta, '{}'::jsonb) || $3::jsonb
     WHERE order_number = $1 AND payment_status = 'pending'
     RETURNING *`,
    [orderNumber, gatewayStatus, JSON.stringify(extra)]
  );
  return result.rows[0] || null;
}

/** Poll / sync payment status for an order owned by the logged-in user. */
router.get('/status/:orderId', authMiddleware, async (req, res) => {
  try {
    if (!hdfcConfigured()) {
      return res.status(503).json({ error: 'Payment gateway not configured' });
    }

    const orderRes = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.orderId, req.user.id]
    );
    const order = orderRes.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.payment_method !== 'upi') {
      return res.json({
        order_number: order.order_number,
        payment_status: order.payment_status || 'paid',
        status: order.status,
        gateway_status: order.payment_gateway_status,
      });
    }

    if (order.payment_status === 'paid') {
      return res.json({
        order_number: order.order_number,
        payment_status: 'paid',
        status: order.status,
        gateway_status: order.payment_gateway_status || 'CHARGED',
      });
    }

    const customerId = order.payment_customer_id || `u${req.user.id}`.replace(/-/g, '').slice(0, 32);
    let gateway;
    try {
      gateway = await getHdfcOrderStatus(order.order_number, customerId);
    } catch (err) {
      console.error('HDFC status error:', err.message);
      return res.json({
        order_number: order.order_number,
        payment_status: order.payment_status,
        status: order.status,
        gateway_status: order.payment_gateway_status || 'PENDING',
        error: err.message,
      });
    }

    const gatewayStatus = String(gateway.status || '').toUpperCase();
    let paymentStatus = order.payment_status;

    if (isPaidStatus(gatewayStatus) || gatewayStatus === 'CHARGED') {
      const updated = await markOrderPaid(order.order_number, gatewayStatus, {
        txn_id: gateway.txn_id || gateway?.txn_detail?.txn_id,
        last_status_check: new Date().toISOString(),
        last_status_response: {
          status: gateway.status,
          status_id: gateway.status_id,
          amount: gateway.amount,
          order_id: gateway.order_id,
          txn_detail: gateway.txn_detail || null,
        },
      });
      paymentStatus = updated?.payment_status || 'paid';
    } else if (
      TERMINAL_FAIL.has(gatewayStatus) ||
      gatewayStatus.includes('FAILED') ||
      gatewayStatus === 'NOT_FOUND'
    ) {
      await markOrderFailed(order.order_number, gatewayStatus, {
        last_status_check: new Date().toISOString(),
        last_status_response: {
          status: gateway.status,
          status_id: gateway.status_id,
          amount: gateway.amount,
          order_id: gateway.order_id,
        },
      });
      paymentStatus = 'failed';
    } else {
      await pool.query(
        `UPDATE orders SET payment_gateway_status = $2,
           payment_meta = COALESCE(payment_meta, '{}'::jsonb) || $3::jsonb
         WHERE id = $1`,
        [
          order.id,
          gatewayStatus,
          JSON.stringify({
            last_status_check: new Date().toISOString(),
            last_status_response: {
              status: gateway.status,
              status_id: gateway.status_id,
              amount: gateway.amount,
              order_id: gateway.order_id,
            },
          }),
        ]
      );
    }

    res.json({
      order_number: order.order_number,
      payment_status: paymentStatus,
      status: paymentStatus === 'paid' ? 'pending' : order.status,
      gateway_status: gatewayStatus,
      amount: gateway.amount ?? order.total_amount,
      txn_id: gateway?.txn_detail?.txn_id || gateway.txn_id || order.payment_txn_id,
      txn_uuid: gateway?.txn_detail?.txn_uuid || null,
      bank_error: gateway.bank_error_message || gateway?.txn_detail?.error_message || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Force-sync one order against HDFC Order Status API (auth user owns order).
 * Useful when payment page is stuck on AUTHORIZING / PENDING_VBV.
 */
router.post('/sync/:orderId', authMiddleware, async (req, res) => {
  try {
    if (!hdfcConfigured()) {
      return res.status(503).json({ error: 'Payment gateway not configured' });
    }
    const orderRes = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.orderId, req.user.id]
    );
    const order = orderRes.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const customerId = order.payment_customer_id || `u${String(req.user.id).replace(/-/g, '').slice(0, 28)}`;
    const gateway = await getHdfcOrderStatus(order.order_number, customerId);
    const gatewayStatus = String(gateway.status || '').toUpperCase();

    let paymentStatus = order.payment_status;
    if (gatewayStatus === 'CHARGED') {
      await markOrderPaid(order.order_number, gatewayStatus, {
        via: 'manual_sync',
        txn_id: gateway?.txn_detail?.txn_id,
      });
      paymentStatus = 'paid';
    } else if (TERMINAL_FAIL.has(gatewayStatus) || gatewayStatus.includes('FAILED')) {
      await markOrderFailed(order.order_number, gatewayStatus, { via: 'manual_sync' });
      paymentStatus = 'failed';
    } else {
      await pool.query(
        `UPDATE orders SET payment_gateway_status = $2,
           payment_meta = COALESCE(payment_meta, '{}'::jsonb) || $3::jsonb
         WHERE id = $1`,
        [order.id, gatewayStatus, JSON.stringify({ last_sync: new Date().toISOString(), hdfc_status: gatewayStatus })]
      );
    }

    res.json({
      order_number: order.order_number,
      payment_status: paymentStatus,
      gateway_status: gatewayStatus,
      hdfc: {
        status: gateway.status,
        status_id: gateway.status_id,
        amount: gateway.amount,
        txn_detail: gateway.txn_detail || null,
        payment_gateway_response: gateway.payment_gateway_response || null,
        upi: gateway.upi || null,
      },
    });
  } catch (err) {
    console.error('HDFC sync error:', err.message, err.payload || '');
    res.status(502).json({ error: err.message, details: err.payload || null });
  }
});

/**
 * Return URL — HDFC SmartGateway POSTs form fields here after pay / timeout / cancel.
 * (GET also supported for manual redirects.)
 */
async function handlePaymentReturn(req, res) {
  try {
    const params = { ...(req.query || {}), ...(req.body || {}) };
    const orderNumber = String(params.order_id || params.orderId || '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 20);
    const statusHint = String(params.status || params.txn_status || '').toUpperCase();
    const site = (process.env.SITE_URL || process.env.CLIENT_URL || 'https://thedenimforge.com').replace(
      /\/$/,
      ''
    );

    if (params.signature && !verifyReturnSignature(params)) {
      console.warn('HDFC return signature mismatch for', orderNumber || '(no order)');
    }

    if (orderNumber) {
      const orderRes = await pool.query('SELECT * FROM orders WHERE order_number = $1', [orderNumber]);
      const order = orderRes.rows[0];
      if (order && order.payment_status !== 'paid') {
        const customerId = order.payment_customer_id || 'guest';
        try {
          const gateway = await getHdfcOrderStatus(order.order_number, customerId);
          const gatewayStatus = String(gateway.status || statusHint || '').toUpperCase();
          if (gatewayStatus === 'CHARGED' || isPaidStatus(gatewayStatus)) {
            await markOrderPaid(order.order_number, gatewayStatus, { via: 'return_url' });
          } else if (
            TERMINAL_FAIL.has(gatewayStatus) ||
            gatewayStatus.includes('FAIL') ||
            gatewayStatus === 'EXPIRED' ||
            gatewayStatus === 'TIMEOUT'
          ) {
            await markOrderFailed(order.order_number, gatewayStatus, { via: 'return_url' });
          } else if (
            TERMINAL_FAIL.has(statusHint) ||
            statusHint.includes('FAIL') ||
            statusHint === 'EXPIRED' ||
            statusHint === 'TIMEOUT'
          ) {
            await markOrderFailed(order.order_number, statusHint, { via: 'return_url_hint' });
          }
        } catch (err) {
          console.error('HDFC return status:', err.message);
          if (
            TERMINAL_FAIL.has(statusHint) ||
            statusHint.includes('FAIL') ||
            statusHint === 'EXPIRED' ||
            statusHint === 'TIMEOUT'
          ) {
            await markOrderFailed(order.order_number, statusHint || 'RETURN_TIMEOUT', {
              via: 'return_url_hint',
            });
          }
        }
      }
      return res.redirect(
        303,
        `${site}/payment/return?order_id=${encodeURIComponent(orderNumber)}${
          statusHint ? `&status=${encodeURIComponent(statusHint)}` : ''
        }`
      );
    }

    return res.redirect(303, `${site}/payment/return`);
  } catch (err) {
    console.error('Payment return error:', err);
    const site = (process.env.SITE_URL || 'https://thedenimforge.com').replace(/\/$/, '');
    return res.redirect(303, `${site}/checkout`);
  }
}

router.get('/return', handlePaymentReturn);
router.post('/return', handlePaymentReturn);

/** Webhook from SmartGateway — always respond 200 when accepted. */
router.post('/webhook', async (req, res) => {
  try {
    const body = req.body || {};
    const content = body.content || body;
    const orderPayload = content.order || content;
    const orderNumber = String(orderPayload.order_id || body.order_id || '').toUpperCase();
    const gatewayStatus = String(orderPayload.status || body.status || '').toUpperCase();

    if (orderNumber && gatewayStatus === 'CHARGED') {
      await markOrderPaid(orderNumber, gatewayStatus, {
        via: 'webhook',
        event_name: body.event_name || body.event,
      });
    } else if (orderNumber && (gatewayStatus.includes('FAILED') || TERMINAL_FAIL.has(gatewayStatus))) {
      await markOrderFailed(orderNumber, gatewayStatus, { via: 'webhook' });
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('HDFC webhook error:', err.message);
    res.status(200).json({ status: 'ok' });
  }
});

router.get('/config', (_req, res) => {
  res.json({
    enabled: hdfcConfigured(),
    methods: hdfcConfigured() ? ['cod', 'upi'] : ['cod'],
  });
});

export default router;
export { markOrderPaid, markOrderFailed };
