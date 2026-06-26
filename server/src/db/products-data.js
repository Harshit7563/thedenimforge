const fits = ['Slim', 'Regular', 'Straight', 'Bootcut', 'Tapered', 'Skinny', 'Relaxed', 'Wide Leg', 'Mom Fit', 'Boyfriend', 'Cargo', 'Flared'];
const washes = ['Dark Indigo', 'Mid Blue', 'Light Wash', 'Black', 'Grey', 'Vintage', 'Raw', 'Stone Wash', 'Charcoal', 'Olive', 'Faded Blue', 'Acid Wash'];
const fabrics = [
  '100% Cotton',
  '98% Cotton, 2% Elastane',
  '97% Cotton, 3% Elastane',
  '95% Cotton, 5% Elastane',
  '100% Cotton Selvedge',
  '99% Cotton, 1% Elastane',
];
const brands = [
  'denimforge-classic', 'bluethread', 'urbanrivet', 'stonewash-co',
  'flexdenim', 'rawedge', 'indigocraft', 'westwear',
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function wholesaleFromRetail(retail) {
  const rate = retail <= 500 ? 0.55 : retail <= 1500 ? 0.42 : retail <= 3500 ? 0.36 : 0.32;
  return Math.max(100, Math.min(retail - 50, Math.round(retail * rate / 10) * 10));
}

function makeProduct(i, { name, category, brand, retail, fit, wash, fabric, sizes, moq, featured, is_new, bestseller }) {
  const slug = slugify(name);
  return {
    name,
    slug,
    category,
    brand: brand || brands[i % brands.length],
    retail,
    wholesale: wholesaleFromRetail(retail),
    fabric: fabric || fabrics[i % fabrics.length],
    fit: fit || fits[i % fits.length],
    wash: wash || washes[i % washes.length],
    moq: moq || (category === 'bulk-orders' ? 50 : category === 'export-quality' ? 25 : 10),
    sizes: sizes || (category === 'kids-jeans' ? '["4","6","8","10","12","14"]' : '["28","30","32","34","36","38","40"]'),
    featured: featured || false,
    is_new: is_new || false,
    bestseller: bestseller || false,
  };
}

export function generateProducts() {
  const products = [];
  let i = 0;

  const mens = [
    ['Classic Straight Fit Denim', 'Dark Indigo', 1299],
    ['Slim Fit Stretch Jeans', 'Mid Blue', 1599],
    ['Regular Fit Comfort Denim', 'Black', 1199],
    ['Bootcut Vintage Wash Jeans', 'Vintage', 1899],
    ['Distressed Ripped Slim Jeans', 'Light Wash', 2199],
    ['Cargo Pocket Utility Jeans', 'Olive', 2499],
    ['Tapered Fit Smart Denim', 'Charcoal', 1799],
    ['Relaxed Fit Weekend Denim', 'Stone Wash', 1399],
    ['Skinny Fit Power Stretch', 'Black', 1699],
    ['Straight Fit Office Denim', 'Dark Indigo', 1499],
    ['Athletic Fit Flex Jeans', 'Grey', 1999],
    ['Loose Fit Street Denim', 'Faded Blue', 1299],
    ['Double Knee Work Jeans', 'Indigo', 1599],
    ['Selvedge Straight Denim', 'Raw', 4999],
    ['Premium Japanese Denim', 'Dark Indigo', 6500],
    ['Lightweight Summer Jeans', 'Light Wash', 999],
  ];

  for (const [label, wash, retail] of mens) {
    products.push(makeProduct(i++, {
      name: `${label} - ${wash}`,
      category: 'mens-jeans',
      retail,
      wash,
      featured: i % 5 === 0,
      bestseller: i % 6 === 0,
      is_new: i % 7 === 0,
    }));
  }

  const womens = [
    ['High Waist Skinny Jeans', 'Blue', 1499],
    ['Mom Fit Relaxed Denim', 'Light Wash', 1699],
    ['Wide Leg Palazzo Jeans', 'Indigo', 1999],
    ['Boyfriend Fit Casual Denim', 'Medium Blue', 1399],
    ['Flared Bell Bottom Jeans', 'Dark Blue', 1899],
    ['Cropped Ankle Jeans', 'Black', 1299],
    ['Paperbag Waist Denim', 'Stone Wash', 1599],
    ['Straight Leg Classic Jeans', 'Mid Blue', 1449],
    ['Jeggings Ultra Stretch', 'Charcoal', 1199],
    ['Patch Pocket Trend Jeans', 'Vintage', 1749],
    ['Embroidered Hem Denim', 'Light Wash', 2199],
    ['Distressed Knee Rip Jeans', 'Faded Blue', 1999],
    ['Premium Sculpt Skinny', 'Black', 2499],
    ['High Rise Barrel Leg', 'Dark Indigo', 2299],
  ];

  for (const [label, wash, retail] of womens) {
    products.push(makeProduct(i++, {
      name: `${label} - ${wash}`,
      category: 'womens-jeans',
      retail,
      wash,
      featured: i % 4 === 0,
      bestseller: i % 5 === 0,
      is_new: i % 8 === 0,
    }));
  }

  const kids = [
    ['Kids Regular Fit Denim', 'Blue', 399],
    ['Kids Stretch Jeans', 'Black', 449],
    ['Kids Slim Fit Denim', 'Mid Blue', 499],
    ['Kids Cargo Jeans', 'Olive', 549],
    ['Kids Distressed Jeans', 'Light Wash', 599],
    ['Kids Jogger Denim', 'Grey', 649],
    ['Kids Premium Soft Denim', 'Indigo', 799],
  ];

  for (const [label, wash, retail] of kids) {
    products.push(makeProduct(i++, {
      name: `${label} - ${wash}`,
      category: 'kids-jeans',
      retail,
      wash,
      is_new: i % 3 === 0,
    }));
  }

  const slimFit = [
    ['Ultra Slim Power Stretch', 'Black', 1599],
    ['Slim Tapered Indigo', 'Dark Indigo', 1449],
    ['Slim Fit Acid Wash', 'Acid Wash', 1799],
    ['Slim Fit Ripped Knee', 'Light Wash', 1999],
    ['Slim Fit Export Grade', 'Mid Blue', 3499],
  ];

  for (const [label, wash, retail] of slimFit) {
    products.push(makeProduct(i++, {
      name: label,
      category: 'slim-fit',
      retail,
      wash,
      fit: 'Slim',
      featured: i % 3 === 0,
    }));
  }

  const regularFit = [
    ['Regular Comfort Everyday', 'Mid Blue', 1199],
    ['Regular Fit Classic Blue', 'Blue', 1099],
    ['Regular Fit Stone Wash', 'Stone Wash', 1349],
    ['Regular Fit Black Denim', 'Black', 1249],
    ['Regular Fit Workwear', 'Charcoal', 1499],
  ];

  for (const [label, wash, retail] of regularFit) {
    products.push(makeProduct(i++, {
      name: label,
      category: 'regular-fit',
      retail,
      wash,
      fit: 'Regular',
    }));
  }

  const bootcut = [
    ['Classic Bootcut Denim', 'Dark Blue', 1699],
    ['Flare Bootcut Vintage', 'Vintage', 1899],
    ['Bootcut Stretch Comfort', 'Mid Blue', 1599],
    ['Wide Bootcut Premium', 'Indigo', 2299],
  ];

  for (const [label, wash, retail] of bootcut) {
    products.push(makeProduct(i++, {
      name: label,
      category: 'bootcut',
      retail,
      wash,
      fit: 'Bootcut',
    }));
  }

  const distressed = [
    ['Heavy Rip Distressed Jeans', 'Light Wash', 2199],
    ['Light Abrasion Denim', 'Faded Blue', 1899],
    ['Shredded Hem Ripped', 'Mid Blue', 2499],
    ['Vintage Destroyed Denim', 'Vintage', 2799],
  ];

  for (const [label, wash, retail] of distressed) {
    products.push(makeProduct(i++, {
      name: label,
      category: 'distressed',
      retail,
      wash,
      fit: 'Slim',
      featured: true,
    }));
  }

  const newArrivals = [
    ['2026 Spring Drop Slim', 'Light Wash', 1799],
    ['2026 Summer Flex Denim', 'Stone Wash', 1599],
    ['2026 Urban Street Fit', 'Black', 1999],
    ['2026 Premium Indigo Line', 'Dark Indigo', 2899],
  ];

  for (const [label, wash, retail] of newArrivals) {
    products.push(makeProduct(i++, {
      name: label,
      category: 'new-arrivals',
      retail,
      wash,
      is_new: true,
      featured: i % 2 === 0,
    }));
  }

  const bulk = [
    ['Wholesale Starter Pack Denim', 'Mixed', 799],
    ['Economy Wholesale Denim', 'Blue', 499],
  ];

  for (const [label, wash, retail] of bulk) {
    products.push(makeProduct(i++, {
      name: label,
      category: 'bulk-orders',
      retail,
      wash,
      fit: 'Mixed',
      fabric: 'Mixed Cotton Blend',
      moq: 50,
      featured: true,
    }));
  }

  const exportGrade = [
    ['Export Grade Premium Raw', 'Raw', 4999],
    ['Export Selvedge Straight', 'Dark Indigo', 5999],
    ['Export Heavyweight Denim', 'Black', 4499],
    ['Export Stone Wash Classic', 'Stone Wash', 3999],
    ['Export Ultra Premium Line', 'Indigo', 7500],
    ['Export Limited Edition Denim', 'Vintage', 8000],
  ];

  for (const [label, wash, retail] of exportGrade) {
    products.push(makeProduct(i++, {
      name: label,
      category: 'export-quality',
      retail,
      wash,
      fit: 'Straight',
      fabric: '100% Cotton Selvedge',
      moq: 25,
      featured: retail >= 5000,
      bestseller: retail === 4999,
    }));
  }

  products.push(makeProduct(i++, {
    name: 'Starter Economy Denim - Blue',
    category: 'bulk-orders',
    retail: 100,
    wash: 'Blue',
    fit: 'Regular',
    moq: 10,
    fabric: '100% Cotton',
  }));

  products.push(makeProduct(i++, {
    name: 'Basic Wholesale Denim - Light Wash',
    category: 'mens-jeans',
    retail: 249,
    wash: 'Light Wash',
    fit: 'Regular',
    fabric: '100% Cotton',
  }));

  products.push(makeProduct(i++, {
    name: 'Entry Level Kids Denim - Blue',
    category: 'kids-jeans',
    retail: 199,
    wash: 'Blue',
    fit: 'Regular',
  }));

  const final = products.map((p) => ({
    ...p,
    retail: Math.min(8000, Math.max(100, p.retail)),
    wholesale: wholesaleFromRetail(Math.min(8000, Math.max(100, p.retail))),
  }));

  if (final.length !== 70) {
    throw new Error(`Expected 70 products, got ${final.length}`);
  }

  return final;
}
