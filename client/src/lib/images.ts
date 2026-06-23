export const PRODUCT_IMAGES = [
  '/images/products/jeans-mens-blue-1.jpg',
  '/images/products/jeans-mens-dark-1.jpg',
  '/images/products/jeans-mens-light-1.jpg',
  '/images/products/jeans-mens-black-1.jpg',
  '/images/products/jeans-kids-1.jpg',
  '/images/products/jeans-womens-1.jpg',
];

export const BANNER_IMAGES = [
  '/images/banners/slider-jeans-stack.jpg',
  '/images/banners/slider-jeans-folded.jpg',
  '/images/banners/slider-jeans-wholesale.jpg',
];

export const CATEGORY_IMAGES: Record<string, string> = {
  'mens-jeans': '/images/categories/mens-jeans.jpg',
  'womens-jeans': '/images/categories/womens-jeans.jpg',
  'kids-jeans': '/images/categories/kids-jeans.jpg',
  'slim-fit': '/images/categories/slim-fit.jpg',
  'regular-fit': '/images/categories/regular-fit.jpg',
  'bootcut': '/images/categories/bootcut.jpg',
  'distressed': '/images/categories/distressed.jpg',
  'new-arrivals': '/images/categories/new-arrivals.jpg',
  'bulk-orders': '/images/categories/bulk-orders.jpg',
  'export-quality': '/images/categories/export-quality.jpg',
};

export const FALLBACK_IMAGE = '/images/products/jeans-mens-blue-1.jpg';
export const FALLBACK_CATEGORY_IMAGE = '/images/categories/mens-jeans.jpg';

export function getCategoryImage(slug: string) {
  return CATEGORY_IMAGES[slug] || FALLBACK_CATEGORY_IMAGE;
}
