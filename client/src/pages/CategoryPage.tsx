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
    <div className="max-w-[1280px] mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] tracking-tight">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} products</p>
        </div>
        <select
          value={sort}
          onChange={(e) => setSearchParams({ sort: e.target.value })}
          className="h-10 border border-[#e8e8e8] rounded-lg px-3 text-sm bg-white focus:outline-none focus:border-[#1a1a1a] w-full sm:w-auto"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border border-[#f0f0f0] overflow-hidden">
              <div className="aspect-[4/5] bg-gray-200" />
              <div className="p-3.5 space-y-2"><div className="h-4 bg-gray-200 rounded" /></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No products found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
