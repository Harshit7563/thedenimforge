import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ci.*, p.name, p.slug, p.wholesale_price, p.retail_price, p.images, p.moq
       FROM cart_items ci JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { product_id, quantity = 1, size, color } = req.body;
    const result = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity, size, color)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (user_id, product_id, size, color) DO UPDATE SET quantity = cart_items.quantity + $3
       RETURNING *`,
      [req.user.id, product_id, quantity, size || '32', color || 'Blue']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
