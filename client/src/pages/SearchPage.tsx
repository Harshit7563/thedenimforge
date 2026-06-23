import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api, type Product } from '../lib/api';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const brand = searchParams.get('brand') || '';
  const featured = searchParams.get('featured') || '';
  const bestseller = searchParams.get('bestseller') || '';
  const hot = searchParams.get('hot') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { limit: hot ? '60' : '40' };
    if (q) params.search = q;
    if (brand) params.brand = brand;
    if (featured) params.featured = 'true';
    if (bestseller) params.bestseller = 'true';
    if (hot) params.hot = 'true';
    api.getProducts(params).then(setProducts).catch(() => {}).finally(() => setLoading(false));
  }, [q, brand, featured, bestseller, hot]);

  const title = q
    ? `Results for "${q}"`
    : brand
      ? brand.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : featured
        ? 'Top Shelf'
        : bestseller
          ? 'Bestsellers'
          : hot
            ? 'Hot Products'
            : 'All Products';

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] tracking-tight mb-1">{title}</h1>
      <p className="text-sm text-gray-500 mb-6">{products.length} products</p>

      {loading ? (
        <p className="text-center py-20 text-gray-400">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-center py-20 text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
