/**
 * Jeans-only product images. Every file is denim jeans (no shirts, models in full outfits, etc.)
 */
export const JEANS_IMAGES = {
  mensDark: [
    '/images/products/jeans-mens-dark-1.jpg',
    '/images/products/jeans-mens-dark-2.jpg',
    '/images/products/jeans-mens-dark-3.jpg',
  ],
  mensBlue: [
    '/images/products/jeans-mens-blue-1.jpg',
    '/images/products/jeans-mens-blue-2.jpg',
    '/images/products/jeans-mens-blue-3.jpg',
  ],
  mensLight: [
    '/images/products/jeans-mens-light-1.jpg',
    '/images/products/jeans-mens-light-2.jpg',
  ],
  mensBlack: [
    '/images/products/jeans-mens-black-1.jpg',
    '/images/products/jeans-mens-black-2.jpg',
  ],
  mensStack: [
    '/images/products/jeans-stack-1.jpg',
    '/images/products/jeans-stack-2.jpg',
    '/images/products/jeans-stack-3.jpg',
  ],
  womens: [
    '/images/products/jeans-womens-1.jpg',
    '/images/products/jeans-womens-2.jpg',
    '/images/products/jeans-womens-3.jpg',
  ],
  kids: [
    '/images/products/jeans-kids-1.jpg',
    '/images/products/jeans-kids-2.jpg',
  ],
  distressed: [
    '/images/products/jeans-distressed-1.jpg',
    '/images/products/jeans-distressed-2.jpg',
  ],
  bootcut: [
    '/images/products/jeans-bootcut-1.jpg',
    '/images/products/jeans-bootcut-2.jpg',
  ],
  folded: [
    '/images/products/jeans-folded-1.jpg',
    '/images/products/jeans-folded-2.jpg',
  ],
};

const WASH_POOL = {
  'Dark Indigo': 'mensDark',
  Indigo: 'mensDark',
  Raw: 'mensDark',
  'Mid Blue': 'mensBlue',
  Blue: 'mensBlue',
  'Medium Blue': 'mensBlue',
  'Light Wash': 'mensLight',
  'Stone Wash': 'mensLight',
  'Faded Blue': 'mensLight',
  'Acid Wash': 'mensLight',
  Black: 'mensBlack',
  Charcoal: 'mensBlack',
  Grey: 'mensBlack',
  Olive: 'mensBlue',
  Vintage: 'bootcut',
  Mixed: 'mensStack',
};

export const FALLBACK_PRODUCT_IMAGE = '/images/products/jeans-mens-blue-1.jpg';

export function getProductImages(product, index = 0) {
  let poolKey = WASH_POOL[product.wash] || 'mensBlue';

  if (product.category === 'kids-jeans') poolKey = 'kids';
  else if (product.category === 'womens-jeans') poolKey = 'womens';
  else if (product.category === 'distressed') poolKey = 'distressed';
  else if (product.category === 'bootcut') poolKey = 'bootcut';
  else if (product.category === 'bulk-orders') poolKey = 'mensStack';
  else if (product.category === 'export-quality') poolKey = 'folded';

  const pool = JEANS_IMAGES[poolKey] || JEANS_IMAGES.mensBlue;
  const a = pool[index % pool.length];
  const b = pool[(index + 1) % pool.length];
  return a === b ? [a, pool[(index + 2) % pool.length] || a] : [a, b];
}

/** Verified jeans-only photos (Unsplash) */
export const IMAGE_DOWNLOADS = [
  { file: 'jeans-mens-dark-1.jpg', url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-mens-dark-2.jpg', url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-mens-dark-3.jpg', url: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=600&h=750&fit=crop' },
  { file: 'jeans-mens-blue-1.jpg', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-mens-blue-2.jpg', url: 'https://images.pexels.com/photos/4672420/pexels-photo-4672420.jpeg?auto=compress&cs=tinysrgb&w=600&h=750&fit=crop' },
  { file: 'jeans-mens-blue-3.jpg', url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-mens-light-1.jpg', url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-mens-light-2.jpg', url: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=600&h=750&fit=crop' },
  { file: 'jeans-mens-black-1.jpg', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-mens-black-2.jpg', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-stack-1.jpg', url: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-stack-2.jpg', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-stack-3.jpg', url: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-womens-1.jpg', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-womens-2.jpg', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-womens-3.jpg', url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-kids-1.jpg', url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-kids-2.jpg', url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-distressed-1.jpg', url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-distressed-2.jpg', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-bootcut-1.jpg', url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-bootcut-2.jpg', url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-folded-1.jpg', url: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=600&h=750&fit=crop&q=80' },
  { file: 'jeans-folded-2.jpg', url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=750&fit=crop&q=80' },
];
