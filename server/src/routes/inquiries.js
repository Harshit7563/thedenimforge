import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company_name, message, product_interest, quantity } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });
    const result = await pool.query(
      `INSERT INTO wholesale_inquiries (name, email, phone, company_name, message, product_interest, quantity)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, email, phone, company_name, message, product_interest, quantity]
    );
    res.status(201).json({ success: true, inquiry: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
