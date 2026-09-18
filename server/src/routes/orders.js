import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { createUpiIntentPayment, hdfcConfigured } from '../services/hdfc.js';

const router = Router();

function generateOrderNumber() {
  // HDFC: < 21 chars, alphanumeric only, non-sequential-looking
  return ('DF' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)).toUpperCase().slice(0, 20);
}

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/track/:orderNumber', async (req, res) => {
  try {
    const orderRes = await pool.query(
      `SELECT id, order_number, status, total_amount, shipping_address, notes, created_at, user_id,
              payment_method, payment_status, payment_gateway_status
       FROM orders WHERE order_number = $1`,
      [req.params.orderNumber.toUpperCase()]
    );
    const order = orderRes.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found. Check your order number.' });

    const items = await pool.query(
      'SELECT product_name, quantity, unit_price, size, color FROM order_items WHERE order_id = $1',
      [order.id]
    );

    res.json({
      order_number: order.order_number,
      status: order.status,
      total_amount: order.total_amount,
      shipping_address: order.shipping_address,
      notes: order.notes,
      created_at: order.created_at,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      items: items.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const orderRes = await pool.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    const order = orderRes.rows[0];
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = await pool.query(
      'SELECT product_name, quantity, unit_price, size, color FROM order_items WHERE order_id = $1',
      [order.id]
    );
    res.json({ ...order, items: items.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cartItems = await client.query(
      `SELECT ci.*, p.name, p.wholesale_price, p.retail_price
       FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = $1`,
      [req.user.id]
    );
    if (!cartItems.rows.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const addr = req.body.shipping_address;
    if (!addr?.name || !addr?.phone || !addr?.address_line1 || !addr?.city || !addr?.state || !addr?.pincode) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Complete shipping address is required' });
    }

    const requestedMethod = String(addr.payment_method || req.body.payment_method || 'cod').toLowerCase();
    const paymentMethod = requestedMethod === 'upi' ? 'upi' : 'cod';

    if (paymentMethod === 'upi' && !hdfcConfigured()) {
      await client.query('ROLLBACK');
      return res.status(503).json({ error: 'UPI payment is temporarily unavailable. Please use COD.' });
    }

    const isWholesale = true;
    let subtotal = 0;
    for (const item of cartItems.rows) {
      subtotal += parseFloat(item.wholesale_price) * item.quantity;
    }
    const SHIPPING_FEE = 199;
    const FREE_SHIPPING_AT = 25000;
    const shipping = subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    const orderNumber = generateOrderNumber();
    const orderStatus = paymentMethod === 'upi' ? 'awaiting_payment' : 'pending';
    const paymentStatus = paymentMethod === 'upi' ? 'pending' : 'cod';
    const notes =
      req.body.notes ||
      (paymentMethod === 'upi' ? 'Payment: UPI (HDFC SmartGateway)' : 'Payment: Cash on Delivery (COD)');

    const userRow = await client.query(
      'SELECT email, phone, first_name, last_name FROM users WHERE id = $1',
      [req.user.id]
    );
    const user = userRow.rows[0] || {};
    const paymentCustomerId = `u${String(req.user.id).replace(/-/g, '').slice(0, 28)}`;

    const orderRes = await client.query(
      `INSERT INTO orders (
         user_id, order_number, total_amount, is_wholesale, shipping_address, notes,
         status, payment_method, payment_status, payment_customer_id
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        req.user.id,
        orderNumber,
        total,
        isWholesale,
        JSON.stringify({ ...addr, payment_method: paymentMethod, shipping_fee: shipping, subtotal }),
        notes,
        orderStatus,
        paymentMethod,
        paymentStatus,
        paymentCustomerId,
      ]
    );
    const order = orderRes.rows[0];

    for (const item of cartItems.rows) {
      const price = item.wholesale_price;
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, size, color)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [order.id, item.product_id, item.name, item.quantity, price, item.size, item.color]
      );
    }
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    await client.query('COMMIT');

    if (paymentMethod === 'cod') {
      return res.status(201).json(order);
    }

    // UPI Intent — create HDFC order + txn after local order is committed
    try {
      const site = process.env.SITE_URL || process.env.CLIENT_URL || 'https://thedenimforge.com';
      const returnUrl = `${site.replace(/\/$/, '')}/api/payments/return`;

      const upi = await createUpiIntentPayment({
        orderId: order.order_number,
        amount: total,
        customerId: paymentCustomerId,
        customerEmail: addr.email || user.email,
        customerPhone: addr.phone || user.phone,
        customerName: addr.name || [user.first_name, user.last_name].filter(Boolean).join(' '),
        returnUrl,
        description: `Order ${order.order_number}`,
        address: addr,
      });

      await pool.query(
        `UPDATE orders
         SET payment_txn_id = $2,
             payment_gateway_status = $3,
             payment_meta = $4::jsonb
         WHERE id = $1`,
        [
          order.id,
          upi.txn_id || upi.txn_uuid,
          upi.status,
          JSON.stringify({
            intent_url: upi.intent_url,
            authentication_url: upi.authentication_url,
            sdk_params: upi.sdk_params,
            hdfc_order_id: upi.hdfc_order_id,
            txn_uuid: upi.txn_uuid,
          }),
        ]
      );

      return res.status(201).json({
        ...order,
        payment_method: 'upi',
        payment_status: 'pending',
        upi_intent_url: upi.intent_url,
        authentication_url: upi.authentication_url,
        amount: upi.amount,
      });
    } catch (payErr) {
      console.error('UPI initiate failed:', payErr.message, payErr.payload || '');
      await pool.query(
        `UPDATE orders
         SET payment_status = 'failed',
             status = 'cancelled',
             payment_gateway_status = $2,
             notes = COALESCE(notes,'') || $3
         WHERE id = $1`,
        [order.id, 'INIT_FAILED', `\nUPI init error: ${payErr.message}`]
      );
      return res.status(502).json({
        error: payErr.message || 'Could not start UPI payment. Try COD or contact support.',
        order_number: order.order_number,
      });
    }
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;
