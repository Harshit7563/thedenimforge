/** Hero slider — jeans only (no t-shirts / full outfits) */
export const BANNER_SLIDER_IMAGES = [
  '/images/banners/slider-jeans-stack.jpg',
  '/images/banners/slider-jeans-folded.jpg',
  '/images/banners/slider-jeans-wholesale.jpg',
];

export const BANNER_DOWNLOADS = [
  {
    file: 'slider-jeans-stack.jpg',
    url: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=1600&h=600&fit=crop&q=80',
  },
  {
    file: 'slider-jeans-folded.jpg',
    url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1600&h=600&fit=crop&q=80',
  },
  {
    file: 'slider-jeans-wholesale.jpg',
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1600&h=600&fit=crop&q=80',
  },
];

export const BANNER_DATA = [
  {
    title: 'Wholesale Denim Starts at ₹100/pc',
    subtitle: 'MOQ 1 piece | 70+ jeans styles in stock',
    image_url: BANNER_SLIDER_IMAGES[0],
    link_url: '/category/bulk-orders',
    sort_order: 1,
  },
  {
    title: 'New Season Jeans Collection 2026',
    subtitle: 'Premium export quality denim at factory prices',
    image_url: BANNER_SLIDER_IMAGES[1],
    link_url: '/category/new-arrivals',
    sort_order: 2,
  },
  {
    title: '₹500 off on your first wholesale order',
    subtitle: 'Register as a wholesale jeans buyer today',
    image_url: BANNER_SLIDER_IMAGES[2],
    link_url: '/wholesale',
    sort_order: 3,
  },
];
