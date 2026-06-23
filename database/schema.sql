-- The Denim Forge - Wholesale Jeans E-commerce Database

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  company_name VARCHAR(255),
  is_wholesale BOOLEAN DEFAULT false,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  parent_id INTEGER REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0
);

-- Brands
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url VARCHAR(500),
  description TEXT
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  category_id INTEGER REFERENCES categories(id),
  brand_id INTEGER REFERENCES brands(id),
  retail_price DECIMAL(10,2) NOT NULL,
  wholesale_price DECIMAL(10,2) NOT NULL,
  moq INTEGER DEFAULT 10,
  sku VARCHAR(50) UNIQUE,
  fabric VARCHAR(100),
  fit VARCHAR(50),
  wash VARCHAR(50),
  sizes JSONB DEFAULT '["28","30","32","34","36","38","40"]',
  colors JSONB DEFAULT '["Blue","Black","Grey"]',
  images JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  stock INTEGER DEFAULT 1000,
  rating DECIMAL(2,1) DEFAULT 4.5,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Banners / Hero slides
CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  subtitle VARCHAR(500),
  image_url VARCHAR(500),
  link_url VARCHAR(500),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Cart
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  size VARCHAR(10),
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id, size, color)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  total_amount DECIMAL(12,2) NOT NULL,
  is_wholesale BOOLEAN DEFAULT false,
  shipping_address JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  size VARCHAR(10),
  color VARCHAR(50)
);

-- Wholesale inquiries
CREATE TABLE IF NOT EXISTS wholesale_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company_name VARCHAR(255),
  message TEXT,
  product_interest VARCHAR(255),
  quantity INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
