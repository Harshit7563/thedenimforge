import pool from '../config/db.js';
import { getProductImages } from './product-images.js';
import { BANNER_SLIDER_IMAGES, BANNER_DATA } from './banner-images.js';

async function fixImages() {
  console.log('Assigning product images...');
  const products = await pool.query(
    'SELECT id, slug, wash, category_id FROM products ORDER BY created_at'
  );

  const catRes = await pool.query('SELECT id, slug FROM categories');
  const catMap = Object.fromEntries(catRes.rows.map((c) => [c.id, c.slug]));

  for (let i = 0; i < products.rows.length; i++) {
    const row = products.rows[i];
    const images = getProductImages(
      { wash: row.wash, category: catMap[row.category_id] },
      i
    );
    await pool.query('UPDATE products SET images = $1 WHERE id = $2', [
      JSON.stringify(images),
      row.id,
    ]);
  }

  console.log(`Updated ${products.rows.length} products with jeans images.`);

  await pool.query('DELETE FROM banners');
  for (const b of BANNER_DATA) {
    await pool.query(
      `INSERT INTO banners (title, subtitle, image_url, link_url, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, true)`,
      [b.title, b.subtitle, b.image_url, b.link_url, b.sort_order]
    );
  }
  console.log(`Reset slider with ${BANNER_SLIDER_IMAGES.length} jeans banners.`);

  console.log('All images updated.');
  await pool.end();
}

fixImages().catch((err) => {
  console.error('Fix failed:', err);
  process.exit(1);
});
