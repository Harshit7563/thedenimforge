import { useEffect, useState } from 'react';
import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api, PRODUCT_LIST_LIMIT, type Product } from '../lib/api';
import { STOREFRONT_NAV, isStorefrontCategory } from '../lib/categories';

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    if (!slug || !isStorefrontCategory(slug)) return;
    setLoading(true);
    const params: Record<string, string> = { limit: PRODUCT_LIST_LIMIT, category: slug };
    if (sort) params.sort = sort;
    api.getProducts(params).then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, [slug, sort]);

  if (slug && !isStorefrontCategory(slug)) {
    return <Navigate to="/category/mens-jeans" replace />;
  }

  const title = STOREFRONT_NAV.find((n) => n.slug === slug)?.label
    || slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    || 'Products';

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[#6b6b6b] mb-3">Shop</p>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 border-b border-[#e8e8e8] pb-6">
        <div>
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#111] tracking-[0.04em]">{title}</h1>
          <p className="text-sm text-[#6b6b6b] mt-2">{loading ? 'Loading…' : `${products.length} products`}</p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSearchParams({ sort: e.target.value })}
          className="h-11 border border-[#111] px-3 text-sm bg-white focus:outline-none w-full sm:w-auto uppercase tracking-[0.08em]"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-[#efece6]" />
              <div className="h-3 w-2/3 bg-[#efece6] mt-3" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#6b6b6b]">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
