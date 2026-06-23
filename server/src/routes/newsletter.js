import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    await pool.query(
      'INSERT INTO newsletter_subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING',
      [email]
    );
    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
