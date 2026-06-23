import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM banners WHERE is_active = true ORDER BY sort_order');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
