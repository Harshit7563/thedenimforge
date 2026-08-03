import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM shipping_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const d = req.body;
    if (!d.name || !d.phone || !d.address_line1 || !d.city || !d.state || !d.pincode) {
      return res.status(400).json({ error: 'Name, phone, address, city, state and pincode are required' });
    }

    if (d.is_default) {
      await pool.query('UPDATE shipping_addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    }

    const existing = await pool.query('SELECT COUNT(*) FROM shipping_addresses WHERE user_id = $1', [req.user.id]);
    const makeDefault = d.is_default || parseInt(existing.rows[0].count, 10) === 0;

    const result = await pool.query(
      `INSERT INTO shipping_addresses
       (user_id, name, phone, company, address_line1, address_line2, city, state, pincode, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        req.user.id,
        d.name,
        d.phone,
        d.company || '',
        d.address_line1,
        d.address_line2 || '',
        d.city,
        d.state,
        d.pincode,
        makeDefault,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const d = req.body;
    if (d.is_default) {
      await pool.query('UPDATE shipping_addresses SET is_default = false WHERE user_id = $1', [req.user.id]);
    }
    const result = await pool.query(
      `UPDATE shipping_addresses SET
         name = COALESCE($1, name),
         phone = COALESCE($2, phone),
         company = COALESCE($3, company),
         address_line1 = COALESCE($4, address_line1),
         address_line2 = COALESCE($5, address_line2),
         city = COALESCE($6, city),
         state = COALESCE($7, state),
         pincode = COALESCE($8, pincode),
         is_default = COALESCE($9, is_default)
       WHERE id = $10 AND user_id = $11 RETURNING *`,
      [
        d.name, d.phone, d.company, d.address_line1, d.address_line2,
        d.city, d.state, d.pincode, d.is_default, req.params.id, req.user.id,
      ]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Address not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM shipping_addresses WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
