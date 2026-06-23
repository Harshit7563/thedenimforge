import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM brands ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
