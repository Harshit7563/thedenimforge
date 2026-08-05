import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import Newsletter from '../components/Newsletter';
import { api, type Product, type Category } from '../lib/api';
import { getCategoryImage } from '../lib/images';
import SafeImage from '../components/SafeImage';
import { STOREFRONT_NAV, isStorefrontCategory } from '../lib/categories';

const PAGE_SIZE = 12;

function ProductSkeleton() {
  return (
    <div className="animate-pulse bg-white ring-1 ring-[#e4e7ec]">
      <div className="aspect-[3/4] bg-[#eef1f5]" />
      <div className="space-y-2 px-3.5 py-4">
        <div className="h-3 w-2/3 rounded bg-[#eef1f5]" />
        <div className="h-3 w-1/2 rounded bg-[#eef1f5]" />
        <div className="mt-3 h-8 w-full rounded bg-[#eef1f5]" />
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
      api.getProducts({ limit: '50' }),
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
    document.getElementById('hot-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
    return [...pages].filter((n) => n >= 1 && n <= totalPages).sort((a, b) => a - b);
  }, [page, totalPages]);

  return (
    <div>
      <HeroCarousel />

      {/* Categories — one job: navigate into the range */}
      <section className="relative overflow-hidden bg-[#0f1724]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_10%_0%,rgba(196,30,58,0.18),transparent_45%)]" />
        <div className="absolute inset-0 opacity-[0.07] bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Cpath d=%22M0 40L40 0H20L0 20M40 40V20L20 40%22 fill=%22none%22 stroke=%22%23fff%22 stroke-width=%221%22/%3E%3C/svg%3E')]" />

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-4">
          <p className="text-[11px] tracking-[0.28em] uppercase text-[#c41e3a] font-semibold mb-2">Browse</p>
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Shop by category
            </h2>
            <Link
              to="/category/new-arrivals"
              className="hidden sm:inline text-sm font-semibold text-white/70 border-b border-white/40 pb-0.5 hover:text-white hover:border-white transition"
            >
              View all
            </Link>
          </div>
        </div>

        <div className="relative scroll-row px-4 sm:px-6 pb-10 sm:pb-16 gap-3 sm:gap-4 max-w-[1400px] mx-auto snap-x">
          {shopCategories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              className="group relative w-[58vw] max-w-[220px] sm:w-[240px] sm:max-w-none aspect-[3/4] overflow-hidden bg-[#1c2a3d] shrink-0 snap-start"
            >
              <SafeImage
                src={getCategoryImage(cat.slug)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1724] via-[#0f1724]/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-display text-white text-xl font-bold tracking-tight">{cat.name}</p>
                <span className="mt-2 block text-[10px] uppercase tracking-[0.22em] text-white/55 font-semibold group-hover:text-white transition-colors">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hot Products — all categories, max 50, paginated */}
      <section id="hot-products" className="relative bg-[#f7f8fa] border-b border-[#e4e7ec] scroll-mt-36 sm:scroll-mt-28">
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white to-transparent pointer-events-none" />
        <div className="relative max-w-[1280px] mx-auto px-3 sm:px-6 py-10 sm:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
            <div>
              <p className="text-[11px] tracking-[0.28em] uppercase text-[#c41e3a] font-semibold mb-2">In stock</p>
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-[#0f1724] tracking-tight">
                Hot Products
              </h2>
              <p className="text-sm text-[#5c6775] mt-2 max-w-md">
                Fresh wholesale denim across every category — up to 50 styles on the floor.
              </p>
            </div>
            <Link
              to="/search"
              className="text-sm font-semibold text-[#0f1724] border-b border-[#0f1724] pb-0.5 hover:text-[#c41e3a] hover:border-[#c41e3a] transition self-start"
            >
              View full catalog
            </Link>
          </div>

          {(filterTabs.length > 0 || loading) && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-6 sm:mb-8 -mx-1 px-1">
              <button
                type="button"
                onClick={() => setCategory('all')}
                className={`shrink-0 px-3.5 sm:px-4 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] transition touch-manipulation ${
                  activeCategory === 'all'
                    ? 'bg-[#0f1724] text-white'
                    : 'bg-white text-[#5c6775] ring-1 ring-[#e4e7ec] hover:text-[#0f1724]'
                }`}
              >
                All
              </button>
              {filterTabs.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setCategory(cat.slug)}
                  className={`shrink-0 px-3.5 sm:px-4 py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.14em] transition touch-manipulation ${
                    activeCategory === cat.slug
                      ? 'bg-[#0f1724] text-white'
                      : 'bg-white text-[#5c6775] ring-1 ring-[#e4e7ec] hover:text-[#0f1724]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="border border-dashed border-[#d5dae3] bg-white px-6 py-16 text-center">
              <p className="font-display text-xl font-bold text-[#0f1724] mb-2">
                {products.length === 0 ? 'Catalog updating' : 'No styles in this category yet'}
              </p>
              <p className="text-sm text-[#5c6775] mb-6 max-w-sm mx-auto">
                {products.length === 0
                  ? 'New wholesale stock is being added. Check back soon or reach out for factory pricing.'
                  : 'Try another category or browse the full catalog.'}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {products.length > 0 && (
                  <button type="button" onClick={() => setCategory('all')} className="btn-primary">
                    Show all products
                  </button>
                )}
                <Link to="/wholesale" className="btn-primary bg-[#c41e3a] hover:bg-[#9e1830]">
                  Wholesale inquiry
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5">
                {pageProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              <div className="mt-8 sm:mt-10 flex flex-col items-center gap-3 sm:gap-4">
                <p className="text-[11px] sm:text-xs text-[#8a93a1] tracking-wide text-center px-2">
                  Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredProducts.length)} of{' '}
                  {filteredProducts.length} styles
                </p>

                {totalPages > 1 && (
                  <div className="flex items-center gap-1 sm:gap-2 max-w-full overflow-x-auto scrollbar-hide px-1">
                    <button
                      type="button"
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      aria-label="Previous page"
                      className="inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center border border-[#e4e7ec] bg-white text-[#0f1724] transition hover:border-[#0f1724] disabled:cursor-not-allowed disabled:opacity-35 touch-manipulation"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    {pageNumbers.map((n, i) => {
                      const prevNum = pageNumbers[i - 1];
                      const showEllipsis = prevNum != null && n - prevNum > 1;
                      return (
                        <span key={n} className="contents">
                          {showEllipsis && (
                            <span className="px-0.5 sm:px-1 text-sm text-[#8a93a1]" aria-hidden>
                              …
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => goToPage(n)}
                            aria-label={`Page ${n}`}
                            aria-current={n === page ? 'page' : undefined}
                            className={`inline-flex h-9 min-w-9 sm:h-10 sm:min-w-10 shrink-0 items-center justify-center px-2.5 sm:px-3 text-sm font-semibold transition touch-manipulation ${
                              n === page
                                ? 'bg-[#0f1724] text-white'
                                : 'border border-[#e4e7ec] bg-white text-[#5c6775] hover:border-[#0f1724] hover:text-[#0f1724]'
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
                      className="inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center border border-[#e4e7ec] bg-white text-[#0f1724] transition hover:border-[#0f1724] disabled:cursor-not-allowed disabled:opacity-35 touch-manipulation"
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

      {/* Wholesale — single purpose CTA band */}
      <section className="relative overflow-hidden bg-[#0f1724] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_0%,rgba(196,30,58,0.28),transparent_50%)]" />
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full border border-white/5" />
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/5" />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 py-12 sm:py-24 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 sm:gap-10">
          <div className="max-w-xl">
            <p className="text-[11px] tracking-[0.28em] uppercase text-[#c41e3a] font-semibold mb-3">Wholesale</p>
            <h2 className="font-display text-[1.75rem] sm:text-5xl font-bold tracking-tight mb-3 sm:mb-4 leading-[1.1] sm:leading-[1.05]">
              Factory pricing for serious buyers
            </h2>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-md">
              MOQ 1 piece. Pan-India shipping for retailers, distributors and exporters.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full sm:w-auto self-stretch sm:self-center">
            <Link
              to="/wholesale"
              className="btn-primary bg-white text-[#0f1724] hover:bg-[#c41e3a] hover:text-white w-full sm:w-auto justify-center"
            >
              Join Wholesale Program
            </Link>
            <Link to="/contact" className="btn-ghost w-full sm:w-auto justify-center">
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
