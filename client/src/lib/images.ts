export const PRODUCT_IMAGES = [
  '/images/products/jeans-blue.svg',
  '/images/products/jeans-black.svg',
  '/images/products/jeans-light.svg',
  '/images/products/jeans-kids.svg',
];

export const BANNER_IMAGES = [
  '/images/banners/banner-1.svg',
  '/images/banners/banner-2.svg',
  '/images/banners/banner-3.svg',
];

const CAT_V = 'v2';

export const CATEGORY_IMAGES: Record<string, string> = {
  'mens-jeans': `/images/categories/mens-jeans.jpg?${CAT_V}`,
  'womens-jeans': `/images/categories/womens-jeans.jpg?${CAT_V}`,
  'kids-jeans': `/images/categories/kids-jeans.jpg?${CAT_V}`,
  'slim-fit': `/images/categories/slim-fit.jpg?${CAT_V}`,
  'regular-fit': `/images/categories/regular-fit.jpg?${CAT_V}`,
  'bootcut': `/images/categories/bootcut.jpg?${CAT_V}`,
  'distressed': `/images/categories/distressed.jpg?${CAT_V}`,
  'new-arrivals': `/images/categories/new-arrivals.jpg?${CAT_V}`,
  'bulk-orders': `/images/categories/bulk-orders.jpg?${CAT_V}`,
  'export-quality': `/images/categories/export-quality.jpg?${CAT_V}`,
};

export const FALLBACK_IMAGE = '/images/products/jeans-blue.svg';
export const FALLBACK_CATEGORY_IMAGE = '/images/categories/mens-jeans.jpg';

export function getCategoryImage(slug: string) {
  return CATEGORY_IMAGES[slug] || FALLBACK_CATEGORY_IMAGE;
}
