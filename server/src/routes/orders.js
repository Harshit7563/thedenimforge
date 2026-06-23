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

router.post('/', authMiddleware, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cartItems = await client.query(
      `SELECT ci.*, p.name, p.wholesale_price, p.retail_price
       FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.user_id = $1`,
      [req.user.id]
    );
    if (!cartItems.rows.length) return res.status(400).json({ error: 'Cart is empty' });

    const addr = req.body.shipping_address;
    if (!addr?.name || !addr?.phone || !addr?.address_line1 || !addr?.city || !addr?.state || !addr?.pincode) {
      return res.status(400).json({ error: 'Complete shipping address is required' });
    }

    const userRes = await client.query('SELECT is_wholesale FROM users WHERE id = $1', [req.user.id]);
    const isWholesale = userRes.rows[0]?.is_wholesale;
    let total = 0;
    for (const item of cartItems.rows) {
      total += (isWholesale ? parseFloat(item.wholesale_price) : parseFloat(item.retail_price)) * item.quantity;
    }

    const paymentMethod = addr.payment_method || 'bank_transfer';
    if (paymentMethod === 'cod' && total < 1000) {
      return res.status(400).json({ error: 'Cash on Delivery is only available on orders of ₹1,000 or above.' });
    }

    const orderRes = await client.query(
      `INSERT INTO orders (user_id, order_number, total_amount, is_wholesale, shipping_address, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, generateOrderNumber(), total, isWholesale, req.body.shipping_address, req.body.notes || `Payment: ${paymentMethod}`]
    );
    const order = orderRes.rows[0];

    for (const item of cartItems.rows) {
      const price = isWholesale ? item.wholesale_price : item.retail_price;
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
