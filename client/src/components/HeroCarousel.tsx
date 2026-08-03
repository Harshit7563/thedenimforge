import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type Banner } from '../lib/api';
import SafeImage from './SafeImage';
import Logo from './Logo';

export default function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.getBanners().then(setBanners).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <section className="relative min-h-[82vh] sm:min-h-[90vh] bg-[#0f1724] flex items-end sm:items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_15%,rgba(42,61,85,0.6),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_80%,rgba(196,30,58,0.12),transparent_45%)]" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-8 pb-16 sm:pb-0 w-full">
          <div className="reveal mb-8 sm:mb-10">
            <Logo variant="hero" />
          </div>
          <p className="text-base sm:text-xl text-white/70 max-w-lg leading-relaxed reveal reveal-delay-1">
            Factory-direct wholesale jeans for retailers and exporters — from ₹100/pc.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 reveal reveal-delay-2">
            <Link to="/category/mens-jeans" className="btn-primary bg-white text-[#0f1724] hover:bg-[#c41e3a] hover:text-white">
              Shop Collection
            </Link>
            <Link to="/wholesale" className="btn-ghost">Wholesale Program</Link>
          </div>
        </div>
      </section>
    );
  }

  const banner = banners[current];
  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent((c) => (c + 1) % banners.length);

  return (
    <section className="relative min-h-[82vh] sm:min-h-[92vh] overflow-hidden bg-[#0f1724] group">
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <SafeImage
            src={b.image_url}
            alt={b.title}
            className={`w-full h-full object-cover ${i === current ? 'hero-image-active' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f1724]/92 via-[#0f1724]/62 to-[#0f1724]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1724]/75 via-transparent to-[#0f1724]/25" />
        </div>
      ))}

      <div className="relative z-20 min-h-[82vh] sm:min-h-[92vh] flex items-end sm:items-center">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 pb-16 sm:pb-0 w-full">
          {/* Brand is the hero signal — larger than any promo headline */}
          <div className="reveal mb-6 sm:mb-8">
            <Logo variant="hero" />
          </div>

          <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold text-white/90 leading-snug max-w-xl reveal reveal-delay-1">
            {banner.title}
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-white/65 max-w-md leading-relaxed reveal reveal-delay-2">
            {banner.subtitle}
          </p>

          <div className="mt-7 sm:mt-9 flex flex-wrap gap-3 reveal reveal-delay-3">
            {banner.link_url && (
              <Link to={banner.link_url} className="btn-primary bg-white text-[#0f1724] hover:bg-[#c41e3a] hover:text-white">
                Shop Now
              </Link>
            )}
            <Link to="/wholesale" className="btn-ghost">Join Wholesale</Link>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white/10"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 border border-white/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white/10"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setCurrent(i)}
                className={`h-[2px] transition-all ${i === current ? 'bg-white w-8' : 'bg-white/40 w-4'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
