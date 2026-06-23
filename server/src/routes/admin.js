import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { adminMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_admin = true', [email]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, is_admin: true }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, user: { id: user.id, email: user.email, first_name: user.first_name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', adminMiddleware, async (_req, res) => {
  try {
    const [products, orders, inquiries, users, revenue] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM products'),
      pool.query('SELECT COUNT(*) FROM orders'),
      pool.query('SELECT COUNT(*) FROM wholesale_inquiries'),
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query("SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE status != 'cancelled'"),
    ]);
    res.json({
      products: parseInt(products.rows[0].count),
      orders: parseInt(orders.rows[0].count),
      inquiries: parseInt(inquiries.rows[0].count),
      users: parseInt(users.rows[0].count),
      revenue: revenue.rows[0].total,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/orders', adminMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.email, u.first_name, u.last_name, u.company_name
      FROM orders o LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC LIMIT 100`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/orders/:id', adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/inquiries', adminMiddleware, async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM wholesale_inquiries ORDER BY created_at DESC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/products', adminMiddleware, async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ORDER BY p.created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/products', adminMiddleware, async (req, res) => {
  try {
    const d = req.body;
    const result = await pool.query(
      `INSERT INTO products (name, slug, description, short_description, category_id, brand_id, retail_price, wholesale_price, moq, sku, fabric, fit, wash, images, sizes, colors, is_featured, is_new, is_bestseller, stock)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20) RETURNING *`,
      [d.name, d.slug, d.description, d.short_description, d.category_id, d.brand_id, d.retail_price, d.wholesale_price, d.moq || 10, d.sku, d.fabric, d.fit, d.wash, JSON.stringify(d.images || ['/images/products/jeans-mens-blue-1.jpg']), JSON.stringify(d.sizes || ['28','30','32','34','36','38','40']), JSON.stringify(d.colors || ['Blue','Black']), d.is_featured || false, d.is_new || false, d.is_bestseller || false, d.stock || 1000]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/products/:id', adminMiddleware, async (req, res) => {
  try {
    const d = req.body;
    const result = await pool.query(
      `UPDATE products SET name=$1, slug=$2, description=$3, short_description=$4, category_id=$5, brand_id=$6,
       retail_price=$7, wholesale_price=$8, moq=$9, sku=$10, fabric=$11, fit=$12, wash=$13, images=$14,
       sizes=$15, colors=$16, is_featured=$17, is_new=$18, is_bestseller=$19, stock=$20
       WHERE id=$21 RETURNING *`,
      [d.name, d.slug, d.description, d.short_description, d.category_id, d.brand_id, d.retail_price, d.wholesale_price, d.moq, d.sku, d.fabric, d.fit, d.wash, JSON.stringify(d.images), JSON.stringify(d.sizes), JSON.stringify(d.colors), d.is_featured, d.is_new, d.is_bestseller, d.stock, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/products/:id', adminMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/newsletter', adminMiddleware, async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
