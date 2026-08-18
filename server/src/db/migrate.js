import pool from '../config/db.js';

async function migrate() {
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS shipping_addresses (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      company VARCHAR(255),
      address_line1 VARCHAR(500) NOT NULL,
      address_line2 VARCHAR(500),
      city VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      pincode VARCHAR(20) NOT NULL,
      is_default BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    ALTER TABLE products ADD COLUMN IF NOT EXISTS size_stock JSONB DEFAULT '{}'
  `);

  await pool.query('UPDATE products SET moq = 1 WHERE moq IS NULL OR moq <> 1');

  await pool.query(`
    UPDATE banners SET image_url = CASE sort_order
      WHEN 1 THEN '/images/banners/hero-ai-1.jpg'
      WHEN 2 THEN '/images/banners/hero-ai-2.jpg'
      WHEN 3 THEN '/images/banners/hero-ai-3.jpg'
      ELSE image_url
    END
  `);

  console.log('Migration complete: is_admin + shipping_addresses + size_stock + moq=1 + banner images.');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
