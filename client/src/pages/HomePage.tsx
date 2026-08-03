import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import Newsletter from '../components/Newsletter';
import { api, type Product, type Category } from '../lib/api';
import { getCategoryImage } from '../lib/images';
import SafeImage from '../components/SafeImage';

function ProductSkeleton() {
  return (
    <div className="animate-pulse border border-[#e8ecf2] bg-white">
      <div className="aspect-[3/4] bg-[#eef1f5]" />
      <div className="space-y-2 px-3.5 py-3.5">
        <div className="h-2.5 w-1/3 rounded bg-[#eef1f5]" />
        <div className="h-4 w-full rounded bg-[#eef1f5]" />
        <div className="h-4 w-2/3 rounded bg-[#eef1f5]" />
        <div className="mt-3 h-8 w-full rounded bg-[#eef1f5]" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProducts({ limit: '48', hot: 'true' }),
      api.getCategories(),
    ])
      .then(([p, c]) => {
        setProducts(p);
        setCategories(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const topCategories = categories.filter((c) =>
    ['mens-jeans', 'womens-jeans', 'kids-jeans', 'slim-fit', 'new-arrivals', 'bulk-orders'].includes(c.slug)
  );

  return (
    <div>
      <HeroCarousel />

      <section className="border-b border-[#e4e7ec] bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-end justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <p className="text-[11px] tracking-[0.28em] uppercase text-[#c41e3a] font-semibold mb-2">Shop by</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0f1724]">Categories</h2>
            </div>
            <Link
              to="/category/mens-jeans"
              className="text-sm font-semibold text-[#0f1724] border-b border-[#0f1724] pb-0.5 hover:text-[#c41e3a] hover:border-[#c41e3a] transition"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {(topCategories.length ? topCategories : categories.slice(0, 6)).map((cat, i) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className={`group relative overflow-hidden bg-[#eef1f5] ${
                  i === 0 ? 'lg:row-span-2 min-h-[280px] sm:min-h-[360px] lg:min-h-full' : 'min-h-[180px] sm:min-h-[220px]'
                }`}
              >
                <SafeImage
                  src={getCategoryImage(cat.slug)}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1724]/85 via-[#0f1724]/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="font-display text-white text-lg sm:text-xl font-bold tracking-tight">
                    {cat.name}
                  </p>
                  <span className="mt-2 inline-flex items-center text-[11px] uppercase tracking-[0.2em] text-white/70 font-semibold group-hover:text-white transition-colors">
                    Shop now
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Shelf — many products above Wholesale */}
      <section className="bg-[#f7f8fa] border-y border-[#e4e7ec]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 sm:mb-10">
            <div>
              <p className="text-[11px] tracking-[0.28em] uppercase text-[#c41e3a] font-semibold mb-2">Curated</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0f1724] tracking-tight">Top Shelf</h2>
              <p className="text-sm text-[#5c6775] mt-2">Handpicked premium wholesale denim</p>
            </div>
            <Link
              to="/search?featured=true"
              className="text-sm font-semibold text-[#0f1724] border-b border-[#0f1724] pb-0.5 hover:text-[#c41e3a] hover:border-[#c41e3a] transition self-start sm:self-auto"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)
              : products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0f1724] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(196,30,58,0.22),transparent_50%)]" />
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 py-14 sm:py-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-[11px] tracking-[0.28em] uppercase text-[#c41e3a] font-semibold mb-3">Wholesale</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Factory pricing for serious buyers
            </h2>
            <p className="text-white/65 text-sm sm:text-base leading-relaxed">
              MOQ 1 piece. 70+ styles in stock. Pan-India shipping for retailers, distributors and exporters.
            </p>
          </div>
          <Link to="/wholesale" className="btn-primary bg-white text-[#0f1724] hover:bg-[#c41e3a] hover:text-white self-start lg:self-center">
            Join Wholesale Program
          </Link>
        </div>
      </section>

      <section className="border-t border-[#e4e7ec] bg-[#f7f8fa]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <p className="text-[11px] tracking-[0.28em] uppercase text-[#c41e3a] font-semibold mb-3">Company</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0f1724] mb-4">
                CODEQUIP WEBTECH PRIVATE LIMITED
              </h2>
              <p className="text-[#5c6775] leading-relaxed max-w-lg">
                The Denim Forge is our wholesale jeans platform — factory-direct denim for retailers, distributors and exporters across India.
              </p>
              <Link to="/about" className="inline-block mt-6 text-sm font-semibold text-[#0f1724] border-b border-[#0f1724] pb-0.5 hover:text-[#c41e3a] hover:border-[#c41e3a] transition">
                About us
              </Link>
            </div>
            <div className="space-y-5 text-sm text-[#5c6775]">
              <div className="flex gap-3">
                <MapPin size={18} className="text-[#c41e3a] shrink-0 mt-0.5" />
                <p>
                  Shop No 22, Building No 2, B Wing, Navkar Bahar, Ghanshyam Gupte Road, Vishnu Nagar, Dombivli West, Maharashtra — 421202
                </p>
              </div>
              <a href="mailto:codequipwebtech@gmail.com" className="flex gap-3 hover:text-[#c41e3a] transition">
                <Mail size={18} className="text-[#c41e3a] shrink-0" />
                codequipwebtech@gmail.com
              </a>
              <a href="tel:8424939262" className="flex gap-3 hover:text-[#c41e3a] transition">
                <Phone size={18} className="text-[#c41e3a] shrink-0" />
                8424939262
              </a>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </div>
  );
}
