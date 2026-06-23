import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Factory, Package, Truck, ShieldCheck, MapPin, Mail, Phone, Building2, Flame } from 'lucide-react';
import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import Section from '../components/Section';
import Newsletter from '../components/Newsletter';
import { api, type Product, type Category, type Brand } from '../lib/api';
import { getCategoryImage } from '../lib/images';
import SafeImage from '../components/SafeImage';

function ProductSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-[#f0f0f0] overflow-hidden">
      <div className="aspect-[4/5] bg-gray-200" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [hotProducts, setHotProducts] = useState<Product[]>([]);
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getProducts({ hot: 'true', limit: '60' }),
      api.getProducts({ featured: 'true', limit: '8' }),
      api.getProducts({ is_new: 'true', limit: '8' }),
      api.getProducts({ bestseller: 'true', limit: '8' }),
      api.getCategories(),
      api.getBrands(),
    ])
      .then(([hot, f, n, b, c, br]) => {
        setHotProducts(hot);
        setFeatured(f);
        setNewArrivals(n);
        setBestsellers(b);
        setCategories(c);
        setBrands(br);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const topCategories = categories.filter((c) =>
    ['mens-jeans', 'womens-jeans', 'kids-jeans', 'slim-fit', 'new-arrivals', 'bulk-orders'].includes(c.slug)
  );

  return (
    <div className="bg-white">
      <HeroCarousel />

      {/* Hot Products */}
      <section className="border-b border-[#f0f0f0]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex items-end justify-between mb-5 sm:mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame size={22} className="text-orange-500" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] tracking-tight">Hot Products</h2>
              </div>
              <p className="text-sm text-gray-500">Trending wholesale jeans — selling fast</p>
            </div>
            <Link to="/search?hot=true" className="text-sm font-semibold text-[#e11d48] hover:underline shrink-0">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <ProductSkeleton key={i} />)
              : hotProducts.map((p) => <ProductCard key={p.id} product={p} showHotBadge />)}
          </div>
        </div>
      </section>

      {/* Project & company details */}
      <section className="border-b border-[#f0f0f0] bg-[#faf9f7]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="text-center mb-8 sm:mb-10">
            <p className="text-[#e11d48] text-xs font-semibold uppercase tracking-widest mb-2">thedenimforge.com</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] tracking-tight mb-3">The Denim Forge</h2>
            <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
              India's premium wholesale jeans platform by{' '}
              <strong className="text-[#1a1a1a]">CODEQUIP WEBTECH PRIVATE LIMITED</strong>.
              Factory-direct denim for retailers, distributors & exporters — 70+ styles from ₹100/pc.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
            {[
              { icon: Package, label: '70+ Jeans Styles', sub: '₹100 – ₹8,000' },
              { icon: Factory, label: 'Factory Direct', sub: 'MOQ 10 pieces' },
              { icon: Truck, label: 'Pan India Shipping', sub: 'Free above ₹25K' },
              { icon: ShieldCheck, label: 'Export Quality', sub: 'Premium denim' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="bg-white rounded-xl border border-[#f0f0f0] p-4 sm:p-5 text-center">
                <div className="w-10 h-10 mx-auto mb-3 bg-[#1a1a1a] rounded-full flex items-center justify-center">
                  <Icon size={18} className="text-white" />
                </div>
                <p className="text-sm font-semibold text-[#1a1a1a]">{label}</p>
                <p className="text-xs text-gray-500 mt-1">{sub}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl border border-[#f0f0f0] p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={18} className="text-[#e11d48]" />
                <h3 className="font-semibold text-[#1a1a1a]">Company</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong className="text-[#1a1a1a]">CODEQUIP WEBTECH PRIVATE LIMITED</strong>
                <br />
                Wholesale jeans manufacturer & distributor
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#f0f0f0] p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={18} className="text-[#e11d48]" />
                <h3 className="font-semibold text-[#1a1a1a]">Address</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Shop No 22, Building No 2, B Wing, Navkar Bahar,
                Ghanshyam Gupte Road, Vishnu Nagar,
                Dombivli West, Maharashtra — 421202
              </p>
            </div>
            <div className="bg-white rounded-xl border border-[#f0f0f0] p-5 sm:p-6 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Mail size={18} className="text-[#e11d48]" />
                <h3 className="font-semibold text-[#1a1a1a]">Contact</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <a href="mailto:codequipwebtech@gmail.com" className="flex items-center gap-2 hover:text-[#e11d48] transition-colors">
                  <Mail size={14} /> codequipwebtech@gmail.com
                </a>
                <a href="tel:8424939262" className="flex items-center gap-2 hover:text-[#e11d48] transition-colors">
                  <Phone size={14} /> 8424939262
                </a>
                <Link to="/contact" className="inline-block text-[#e11d48] font-medium text-xs mt-1 hover:underline">
                  Send inquiry →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/about"
              className="inline-block text-sm font-semibold text-[#1a1a1a] border border-[#1a1a1a] px-6 py-2.5 rounded-full hover:bg-[#1a1a1a] hover:text-white transition-colors"
            >
              Learn More About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Category scroll — Tira style */}
      <Section title="Top Categories" viewAllLink="/category/mens-jeans">
        <div className="scroll-row -mx-1 px-1 pb-1">
          {(topCategories.length ? topCategories : categories.slice(0, 8)).map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="flex flex-col items-center w-[90px] sm:w-[108px] group"
            >
              <div className="w-[76px] h-[76px] sm:w-[92px] sm:h-[92px] rounded-full overflow-hidden ring-2 ring-[#f0f0f0] group-hover:ring-[#1a1a1a] group-hover:shadow-md transition-all mb-2.5 bg-white">
                <SafeImage
                  src={getCategoryImage(cat.slug)}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-gray-700 text-center leading-tight px-1 group-hover:text-[#e11d48] transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* Featured */}
      <Section title="Top Shelf" subtitle="Handpicked premium wholesale denim" viewAllLink="/search?featured=true">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)
            : featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      {/* Wholesale CTA */}
      <div className="bg-[#1a1a1a] text-white">
        <div className="max-w-[1280px] mx-auto px-4 py-10 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <p className="text-[#e11d48] text-xs font-semibold uppercase tracking-widest mb-2">Forge Red</p>
            <h2 className="text-xl sm:text-2xl font-bold mb-2 tracking-tight">Wholesale Program</h2>
            <p className="text-sm text-white/70 max-w-md leading-relaxed">
              Factory-direct pricing from ₹100/pc. MOQ 10 pieces. 70+ styles in stock.
            </p>
          </div>
          <Link
            to="/wholesale"
            className="bg-white text-[#1a1a1a] px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#e11d48] hover:text-white transition-colors shrink-0"
          >
            Join Wholesale
          </Link>
        </div>
      </div>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <Section title="What's New" viewAllLink="/category/new-arrivals">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </Section>
      )}

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <Section title="Bestsellers" subtitle="Most ordered wholesale styles" viewAllLink="/search?bestseller=true">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </Section>
      )}

      {/* Brands */}
      {brands.length > 0 && (
        <Section title="Popular Brands" className="pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/search?brand=${brand.slug}`}
                className="flex flex-col items-center p-4 border border-[#f0f0f0] rounded-xl hover:border-[#1a1a1a] hover:shadow-sm transition text-center"
              >
                <div className="w-11 h-11 bg-[#faf9f7] rounded-full flex items-center justify-center mb-2">
                  <span className="text-[#1a1a1a] font-bold text-sm">{brand.name.charAt(0)}</span>
                </div>
                <span className="text-[11px] font-medium text-gray-600 leading-tight">{brand.name}</span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Newsletter />
    </div>
  );
}
