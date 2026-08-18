import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import Newsletter from '../components/Newsletter';
import { api, PRODUCT_LIST_LIMIT, type Product, type Category } from '../lib/api';
import { getCategoryImage } from '../lib/images';
import SafeImage from '../components/SafeImage';
import { STOREFRONT_NAV, isStorefrontCategory } from '../lib/categories';

const PAGE_SIZE = 12;

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-[#efece6]" />
      <div className="pt-3 space-y-2">
        <div className="h-3 w-4/5 bg-[#efece6]" />
        <div className="h-3 w-1/3 bg-[#efece6]" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    Promise.all([
      api.getProducts({ limit: PRODUCT_LIST_LIMIT }),
      api.getCategories(),
    ])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const shopCategories = useMemo((): Category[] => {
    return STOREFRONT_NAV.map((nav) => {
      const fromApi = categories.find((c) => c.slug === nav.slug);
      return {
        id: fromApi?.id ?? 0,
        name: nav.label,
        slug: nav.slug,
        description: fromApi?.description ?? '',
      };
    });
  }, [categories]);

  const filterTabs = useMemo(() => {
    const present = new Set(
      products.map((p) => p.category_slug).filter((s): s is string => Boolean(s) && isStorefrontCategory(s))
    );
    return shopCategories.filter((c) => present.has(c.slug));
  }, [shopCategories, products]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter((p) => p.category_slug === activeCategory);
  }, [products, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));

  const pageProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredProducts.slice(start, start + PAGE_SIZE);
  }, [filteredProducts, page]);

  const setCategory = (slug: string) => {
    setActiveCategory(slug);
    setPage(1);
  };

  const goToPage = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalPages);
    setPage(clamped);
    document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
    return [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  }, [page, totalPages]);

  return (
    <div>
      <HeroCarousel />

      <section className="bg-white py-10 sm:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#c8102e] font-semibold mb-2">Trending right now</p>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#111]">Shop the look</h2>
            </div>
            <Link to="/category/new-arrivals" className="hidden sm:inline text-xs font-bold uppercase tracking-[0.18em] border-b-2 border-[#111] pb-0.5 hover:text-[#c8102e] hover:border-[#c8102e]">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
            {shopCategories.map((cat, i) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className={`group relative overflow-hidden ${i < 2 ? 'col-span-1 lg:col-span-1 min-h-[220px] sm:min-h-[340px]' : 'min-h-[180px] sm:min-h-[340px]'}`}
              >
                <SafeImage
                  src={getCategoryImage(cat.slug)}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="font-display text-white text-xl sm:text-2xl font-bold tracking-[0.06em]">{cat.name}</p>
                  <span className="mt-1 inline-block text-[10px] uppercase tracking-[0.2em] text-white/80 font-semibold border-b border-white/60 pb-0.5">
                    Shop now
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-8 max-w-[1440px] mx-auto pb-6">
        <div className="grid sm:grid-cols-2 gap-3">
          <Link to="/category/mens-jeans" className="relative min-h-[240px] sm:min-h-[380px] overflow-hidden group bg-[#111]">
            <SafeImage src={getCategoryImage('mens-jeans')} alt="Men's" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-700" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <p className="font-display text-white text-4xl sm:text-6xl font-bold tracking-[0.08em]">Men</p>
              <span className="mt-4 btn-primary bg-white text-[#111] hover:bg-[#c8102e] hover:text-white">Shop men's</span>
            </div>
          </Link>
          <Link to="/category/womens-jeans" className="relative min-h-[240px] sm:min-h-[380px] overflow-hidden group bg-[#111]">
            <SafeImage src={getCategoryImage('womens-jeans')} alt="Women's" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-700" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <p className="font-display text-white text-4xl sm:text-6xl font-bold tracking-[0.08em]">Women</p>
              <span className="mt-4 btn-primary bg-white text-[#111] hover:bg-[#c8102e] hover:text-white">Shop women's</span>
            </div>
          </Link>
        </div>
      </section>

      <section id="trending" className="bg-white scroll-mt-28">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-10 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#c8102e] font-semibold mb-2">Best of denim</p>
              <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#111]">Trending right now</h2>
            </div>
            <Link to="/search" className="text-xs font-bold uppercase tracking-[0.18em] border-b-2 border-[#111] pb-0.5 self-start hover:text-[#c8102e] hover:border-[#c8102e]">
              View full catalog
            </Link>
          </div>

          {(filterTabs.length > 0 || loading) && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-8">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`shrink-0 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] ${
                  activeCategory === 'all' ? 'bg-[#111] text-white' : 'bg-[#f6f4f0] text-[#111] hover:bg-[#efece6]'
                }`}
              >
                All
              </button>
              {filterTabs.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setCategory(cat.slug)}
                  className={`shrink-0 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] ${
                    activeCategory === cat.slug ? 'bg-[#111] text-white' : 'bg-[#f6f4f0] text-[#111] hover:bg-[#efece6]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="border border-[#e8e8e8] px-6 py-16 text-center">
              <p className="font-display text-2xl font-bold text-[#111] mb-2">
                {products.length === 0 ? 'Catalog updating' : 'No styles in this category yet'}
              </p>
              <p className="text-sm text-[#6b6b6b] mb-6">
                {products.length === 0
                  ? 'New wholesale stock is being added. Check back soon.'
                  : 'Try another category or browse the full catalog.'}
              </p>
              {products.length > 0 && (
                <button type="button" onClick={() => setCategory('all')} className="btn-primary">
                  Show all products
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10">
                {pageProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              <div className="mt-10 flex flex-col items-center gap-4">
                <p className="text-xs text-[#8a8a8a] uppercase tracking-[0.14em]">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredProducts.length)} of {filteredProducts.length}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                    <button
                      type="button"
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      aria-label="Previous page"
                      className="h-10 w-10 flex items-center justify-center border border-[#e8e8e8] disabled:opacity-30"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {pageNumbers.map((n, i) => {
                      const prevNum = pageNumbers[i - 1];
                      const showEllipsis = prevNum != null && n - prevNum > 1;
                      return (
                        <span key={n} className="contents">
                          {showEllipsis && <span className="px-1 text-[#8a8a8a]">…</span>}
                          <button
                            type="button"
                            onClick={() => goToPage(n)}
                            aria-current={n === page ? 'page' : undefined}
                            className={`h-10 min-w-10 px-3 text-sm font-semibold ${
                              n === page ? 'bg-[#111] text-white' : 'border border-[#e8e8e8] text-[#111]'
                            }`}
                          >
                            {n}
                          </button>
                        </span>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPages}
                      aria-label="Next page"
                      className="h-10 w-10 flex items-center justify-center border border-[#e8e8e8] disabled:opacity-30"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="bg-[#111] text-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-14 sm:py-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-[11px] tracking-[0.28em] uppercase text-[#c8102e] font-semibold mb-3">Wholesale</p>
            <h2 className="font-display text-4xl sm:text-6xl font-bold tracking-[0.04em] mb-4">
              Factory pricing
            </h2>
            <p className="text-white/65 text-sm sm:text-base max-w-md">
              MOQ 1 piece. Pan-India shipping for retailers, distributors and exporters.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/wholesale" className="btn-primary bg-white text-[#111] hover:bg-[#c8102e] hover:text-white justify-center">
              Join wholesale
            </Link>
            <Link to="/contact" className="btn-ghost-light justify-center">
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
