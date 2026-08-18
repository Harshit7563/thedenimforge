import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type Banner } from '../lib/api';
import SafeImage from './SafeImage';

export default function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    api.getBanners().then(setBanners).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 6500);
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

  const copy = banners[current];

  return (
    <section
      className="relative h-[72dvh] sm:h-[86vh] overflow-hidden bg-[#111] group"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {banners.length > 0 ? (
        banners.map((b, i) => (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <SafeImage
              src={b.image_url}
              alt={b.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/35" />
          </div>
        ))
      ) : (
        <div className="absolute inset-0 bg-[#1a1a1a]" />
      )}

      <div className="relative z-20 h-full flex items-end sm:items-center">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 pb-16 sm:pb-0 w-full">
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.32em] text-white/80 mb-4">
            New season · 2026
          </p>
          <h1 className="font-display text-white font-bold text-[2.6rem] sm:text-7xl md:text-8xl leading-[0.92] tracking-[0.04em] max-w-3xl">
            {copy?.title || 'Live in denim'}
          </h1>
          <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-white/80 max-w-md leading-relaxed font-medium">
            {copy?.subtitle || 'Factory-direct wholesale jeans for retailers and exporters — from ₹100/pc.'}
          </p>
          <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row gap-3 max-w-md">
            <Link
              to={copy?.link_url || '/category/mens-jeans'}
              className="btn-primary bg-white text-[#111] hover:bg-[#c8102e] hover:text-white justify-center"
            >
              Shop now
            </Link>
            <Link to="/wholesale" className="btn-ghost-light justify-center">
              Wholesale
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
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/90 text-[#111] flex items-center justify-center hover:bg-white touch-manipulation"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-white/90 text-[#111] flex items-center justify-center hover:bg-white touch-manipulation"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setCurrent(i)}
                className={`h-[3px] transition-all ${i === current ? 'bg-white w-8' : 'bg-white/45 w-4'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
