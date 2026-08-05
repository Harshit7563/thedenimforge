import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

/** Only these categories are public on the storefront */
const STOREFRONT_SLUGS = [
  'new-arrivals',
  'mens-jeans',
  'womens-jeans',
  'kids-jeans',
  'bulk-orders',
];

const STOREFRONT_NAMES = {
  'new-arrivals': "What's New",
  'mens-jeans': "Men's",
  'womens-jeans': "Women's",
  'kids-jeans': 'Kids',
  'bulk-orders': 'Bulk Orders',
};

router.get('/', async (req, res) => {
  try {
    // Admin product form: only Men / Women / Kids
    const forAdmin = req.query.for === 'admin';
    const slugs = forAdmin
      ? ['mens-jeans', 'womens-jeans', 'kids-jeans']
      : STOREFRONT_SLUGS;

    const result = await pool.query(
      `SELECT * FROM categories
       WHERE slug = ANY($1::text[])
       ORDER BY array_position($1::text[], slug)`,
      [slugs]
    );
    const rows = result.rows.map((row) => ({
      ...row,
      name: STOREFRONT_NAMES[row.slug] || row.name,
    }));
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    if (!STOREFRONT_SLUGS.includes(req.params.slug)) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const result = await pool.query('SELECT * FROM categories WHERE slug = $1', [req.params.slug]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Category not found' });
    const row = result.rows[0];
    res.json({ ...row, name: STOREFRONT_NAMES[row.slug] || row.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
