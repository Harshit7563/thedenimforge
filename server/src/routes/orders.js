import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

function generateOrderNumber() {
  return 'DF' + Date.now().toString(36).toUpperCase();
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
      'SELECT id, order_number, status, total_amount, shipping_address, notes, created_at, user_id FROM orders WHERE order_number = $1',
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
      return res.status(400).json({ error: 'Complete shipping address is required' });
    }

    const userRes = await client.query('SELECT is_wholesale FROM users WHERE id = $1', [req.user.id]);
    // B2B storefront always uses wholesale pricing
    const isWholesale = true;
    void userRes;
    let subtotal = 0;
    for (const item of cartItems.rows) {
      subtotal += parseFloat(item.wholesale_price) * item.quantity;
    }
    const SHIPPING_FEE = 199;
    const FREE_SHIPPING_AT = 25000;
    const shipping = subtotal >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE;
    const total = subtotal + shipping;

    const paymentMethod = 'cod';

    const orderRes = await client.query(
      `INSERT INTO orders (user_id, order_number, total_amount, is_wholesale, shipping_address, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        req.user.id,
        generateOrderNumber(),
        total,
        isWholesale,
        JSON.stringify({ ...addr, payment_method: paymentMethod, shipping_fee: shipping, subtotal }),
        req.body.notes || 'Payment: Cash on Delivery (COD)',
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
    res.status(201).json(order);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;
