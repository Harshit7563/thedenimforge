import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category, brand, featured, is_new, bestseller, hot, search, sort, limit = 20, offset = 0 } = req.query;
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 1000);
    const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug, b.name as brand_name, b.slug as brand_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE 1=1`;
    const params = [];
    let idx = 1;

    if (category) {
      // What's New + Bulk Orders show every product automatically
      if (category !== 'new-arrivals' && category !== 'bulk-orders') {
        query += ` AND c.slug = $${idx++}`;
        params.push(category);
      }
    }
    if (brand) { query += ` AND b.slug = $${idx++}`; params.push(brand); }
    if (featured === 'true') query += ` AND p.is_featured = true`;
    if (is_new === 'true') query += ` AND p.is_new = true`;
    if (bestseller === 'true') query += ` AND p.is_bestseller = true`;
    if (hot === 'true') query += ` AND (p.is_featured = true OR p.is_bestseller = true OR p.is_new = true)`;
    if (search) {
      query += ` AND (p.name ILIKE $${idx} OR p.description ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    const sortMap = {
      price_asc: 'p.wholesale_price ASC',
      price_desc: 'p.wholesale_price DESC',
      newest: 'p.created_at DESC',
      rating: 'p.rating DESC',
      hot: 'p.rating DESC, p.review_count DESC',
    };
    query += ` ORDER BY ${sortMap[hot === 'true' && !sort ? 'hot' : sort] || 'p.created_at DESC'}`;
    query += ` LIMIT $${idx++} OFFSET $${idx}`;
    params.push(safeLimit, safeOffset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug, b.name as brand_name, b.slug as brand_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.slug = $1`,
      [req.params.slug]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
