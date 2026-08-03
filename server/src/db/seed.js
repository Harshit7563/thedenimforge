import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import { generateProducts } from './products-data.js';
import { getProductImages } from './product-images.js';
import { BANNER_DATA } from './banner-images.js';

const categories = [
  { name: "Men's Jeans", slug: 'mens-jeans', description: 'Premium wholesale mens denim', sort_order: 1 },
  { name: "Women's Jeans", slug: 'womens-jeans', description: 'Trendy womens denim wholesale', sort_order: 2 },
  { name: 'Kids Jeans', slug: 'kids-jeans', description: 'Durable kids denim', sort_order: 3 },
  { name: 'Slim Fit', slug: 'slim-fit', description: 'Slim fit collection', sort_order: 4 },
  { name: 'Regular Fit', slug: 'regular-fit', description: 'Classic regular fit', sort_order: 5 },
  { name: 'Bootcut', slug: 'bootcut', description: 'Bootcut & flare styles', sort_order: 6 },
  { name: 'Distressed', slug: 'distressed', description: 'Ripped & distressed denim', sort_order: 7 },
  { name: 'New Arrivals', slug: 'new-arrivals', description: 'Latest wholesale styles', sort_order: 8 },
  { name: 'Bulk Orders', slug: 'bulk-orders', description: 'Volume pricing for larger wholesale buys', sort_order: 9 },
  { name: 'Export Quality', slug: 'export-quality', description: 'International export grade', sort_order: 10 },
];

const brands = [
  { name: 'DenimForge Classic', slug: 'denimforge-classic' },
  { name: 'BlueThread', slug: 'bluethread' },
  { name: 'UrbanRivet', slug: 'urbanrivet' },
  { name: 'StoneWash Co', slug: 'stonewash-co' },
  { name: 'FlexDenim', slug: 'flexdenim' },
  { name: 'RawEdge', slug: 'rawedge' },
  { name: 'IndigoCraft', slug: 'indigocraft' },
  { name: 'WestWear', slug: 'westwear' },
];

const products = generateProducts();
const banners = BANNER_DATA;

async function seed() {
  console.log('Seeding database...');

  for (const cat of categories) {
    await pool.query(
      `INSERT INTO categories (name, slug, description, sort_order) VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING`,
      [cat.name, cat.slug, cat.description, cat.sort_order]
    );
  }

  for (const brand of brands) {
    await pool.query(
      `INSERT INTO brands (name, slug) VALUES ($1, $2) ON CONFLICT (slug) DO NOTHING`,
      [brand.name, brand.slug]
    );
  }

  await pool.query('DELETE FROM cart_items');
  await pool.query('DELETE FROM order_items');
  await pool.query('DELETE FROM products');

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const catRes = await pool.query('SELECT id FROM categories WHERE slug = $1', [p.category]);
    const brandRes = await pool.query('SELECT id FROM brands WHERE slug = $1', [p.brand]);
    const images = getProductImages(p, i);
    await pool.query(
      `INSERT INTO products (name, slug, description, short_description, category_id, brand_id, retail_price, wholesale_price, moq, sku, fabric, fit, wash, images, is_featured, is_new, is_bestseller, sizes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [
        p.name, p.slug,
        `Premium wholesale ${p.fit.toLowerCase()} fit denim jeans. ${p.fabric}. Perfect for retailers and distributors.`,
        `${p.fit} fit | ${p.wash} | MOQ ${p.moq || 1} pcs`,
        catRes.rows[0]?.id, brandRes.rows[0]?.id,
        p.retail, p.wholesale, p.moq || 1,
        `DF-${String(i + 1).padStart(4, '0')}`,
        p.fabric, p.fit, p.wash,
        JSON.stringify(images),
        p.featured || false, p.is_new || false, p.bestseller || false,
        p.sizes || '["28","30","32","34","36","38","40"]',
      ]
    );
  }

  await pool.query('DELETE FROM banners');
  for (const b of banners) {
    await pool.query(
      `INSERT INTO banners (title, subtitle, image_url, link_url, sort_order) VALUES ($1,$2,$3,$4,$5)`,
      [b.title, b.subtitle, b.image_url, b.link_url, b.sort_order]
    );
  }

  const hash = await bcrypt.hash('demo1234', 10);
  await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, company_name, is_wholesale)
     VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (email) DO NOTHING`,
    ['demo@denimforge.com', hash, 'Demo', 'Buyer', '8424939262', 'CODEQUIP WEBTECH PRIVATE LIMITED', true]
  );

  const adminHash = await bcrypt.hash('admin@denim2026', 10);
  await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, phone, company_name, is_wholesale, is_admin)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (email) DO UPDATE SET is_admin = true, password_hash = $2`,
    ['codequipwebtech@gmail.com', adminHash, 'Admin', 'DenimForge', '8424939262', 'CODEQUIP WEBTECH PRIVATE LIMITED', true, true]
  );

  console.log(`Seeded ${products.length} products (₹100 – ₹8,000 range).`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
