import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api, PRODUCT_LIST_LIMIT, type Product } from '../lib/api';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const featured = searchParams.get('featured') || '';
  const bestseller = searchParams.get('bestseller') || '';
  const hot = searchParams.get('hot') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { limit: PRODUCT_LIST_LIMIT };
    if (q) params.search = q;
    if (featured) params.featured = 'true';
    if (bestseller) params.bestseller = 'true';
    if (hot) params.hot = 'true';
    api.getProducts(params).then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, [q, featured, bestseller, hot]);

  const title = q
    ? `Results for “${q}”`
    : featured
      ? 'Featured'
      : bestseller
        ? 'Bestsellers'
        : hot
          ? 'Trending'
          : 'All Products';

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#111] tracking-[0.04em] mb-2">{title}</h1>
      <p className="text-sm text-[#6b6b6b] mb-8">{products.length} products</p>

      {loading ? (
        <p className="text-center py-20 text-[#8a8a8a]">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-center py-20 text-[#6b6b6b]">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
