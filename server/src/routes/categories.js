import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY sort_order');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories WHERE slug = $1', [req.params.slug]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Category not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
