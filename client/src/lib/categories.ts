/** Storefront categories — keep nav / home / footer in sync */
export const STOREFRONT_CATEGORY_SLUGS = [
  'new-arrivals',
  'mens-jeans',
  'womens-jeans',
  'kids-jeans',
  'bulk-orders',
] as const;

/** Admin Add/Edit Product — assign product to one of these only */
export const ADMIN_PRODUCT_CATEGORY_SLUGS = [
  'mens-jeans',
  'womens-jeans',
  'kids-jeans',
] as const;

/** Virtual storefront categories that list every product automatically */
export const VIRTUAL_ALL_PRODUCT_SLUGS = ['new-arrivals', 'bulk-orders'] as const;

export const UNLIMITED_STOCK = 99999;

export type StorefrontCategorySlug = (typeof STOREFRONT_CATEGORY_SLUGS)[number];

export const STOREFRONT_NAV = [
  { label: "What's New", path: '/category/new-arrivals', slug: 'new-arrivals' },
  { label: "Men's", path: '/category/mens-jeans', slug: 'mens-jeans' },
  { label: "Women's", path: '/category/womens-jeans', slug: 'womens-jeans' },
  { label: 'Kids', path: '/category/kids-jeans', slug: 'kids-jeans' },
  { label: 'Bulk Orders', path: '/category/bulk-orders', slug: 'bulk-orders' },
] as const;

export function isStorefrontCategory(slug: string) {
  return (STOREFRONT_CATEGORY_SLUGS as readonly string[]).includes(slug);
}

export function isVirtualAllProductsCategory(slug: string) {
  return (VIRTUAL_ALL_PRODUCT_SLUGS as readonly string[]).includes(slug);
}
