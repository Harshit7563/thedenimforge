import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type Banner } from '../lib/api';
import SafeImage from './SafeImage';
import Logo from './Logo';

export default function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    api.getBanners().then(setBanners).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent((c) => (c + 1) % banners.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || banners.length <= 1) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) prev();
    else next();
  };

  if (!banners.length) {
    return (
      <section className="relative min-h-[68dvh] sm:min-h-[90vh] bg-[#0f1724] flex items-end sm:items-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_15%,rgba(42,61,85,0.6),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_90%_80%,rgba(196,30,58,0.12),transparent_45%)]" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 pb-14 sm:pb-0 w-full">
          <div className="reveal mb-5 sm:mb-10">
            <Logo variant="hero" />
          </div>
          <p className="text-sm sm:text-xl text-white/70 max-w-lg leading-relaxed reveal reveal-delay-1">
            Factory-direct wholesale jeans for retailers and exporters — from ₹100/pc.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 reveal reveal-delay-2 w-full sm:w-auto">
            <Link
              to="/category/mens-jeans"
              className="btn-primary bg-white text-[#0f1724] hover:bg-[#c41e3a] hover:text-white w-full sm:w-auto justify-center"
            >
              Shop Collection
            </Link>
            <Link to="/wholesale" className="btn-ghost w-full sm:w-auto justify-center">
              Wholesale Program
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const banner = banners[current];

  return (
    <section
      className="relative min-h-[68dvh] sm:min-h-[92vh] overflow-hidden bg-[#0f1724] group"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-out ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <SafeImage
            src={b.image_url}
            alt={b.title}
            className={`w-full h-full object-cover object-center ${i === current ? 'hero-image-active' : ''}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1724] via-[#0f1724]/55 to-[#0f1724]/30 sm:bg-gradient-to-r sm:from-[#0f1724]/92 sm:via-[#0f1724]/62 sm:to-[#0f1724]/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1724]/80 via-transparent to-transparent sm:from-[#0f1724]/75" />
        </div>
      ))}

      <div className="relative z-20 min-h-[68dvh] sm:min-h-[92vh] flex items-end sm:items-center">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 pb-16 sm:pb-0 w-full">
          <div className="reveal mb-4 sm:mb-8">
            <Logo variant="hero" />
          </div>

          <p className="font-display text-base sm:text-2xl font-semibold text-white/88 leading-snug max-w-lg reveal reveal-delay-1">
            {banner.title}
          </p>
          <p className="mt-2 sm:mt-4 text-[13px] sm:text-base text-white/60 max-w-md leading-relaxed reveal reveal-delay-2">
            {banner.subtitle || 'Factory-direct wholesale jeans for retailers and exporters — from ₹100/pc.'}
          </p>

          <div className="mt-5 sm:mt-9 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 reveal reveal-delay-3">
            {banner.link_url && (
              <Link
                to={banner.link_url}
                className="btn-primary bg-white text-[#0f1724] hover:bg-[#c41e3a] hover:text-white w-full sm:w-auto justify-center"
              >
                Shop Collection
              </Link>
            )}
            <Link to="/wholesale" className="btn-ghost w-full sm:w-auto justify-center">
              Join Wholesale
            </Link>
          </div>
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 sm:left-6 top-[42%] sm:top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 border border-white/40 text-white flex items-center justify-center bg-black/20 sm:bg-transparent sm:opacity-0 sm:group-hover:opacity-100 transition hover:bg-white/10 touch-manipulation"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 sm:right-6 top-[42%] sm:top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 border border-white/40 text-white flex items-center justify-center bg-black/20 sm:bg-transparent sm:opacity-0 sm:group-hover:opacity-100 transition hover:bg-white/10 touch-manipulation"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setCurrent(i)}
                className={`h-1 sm:h-[2px] transition-all touch-manipulation ${i === current ? 'bg-white w-7 sm:w-8' : 'bg-white/40 w-3.5 sm:w-4'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
