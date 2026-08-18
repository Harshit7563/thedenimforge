import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type Banner } from '../lib/api';
import { BANNER_IMAGES } from '../lib/images';

const FALLBACK_SLIDES: Banner[] = [
  {
    id: 1,
    title: 'Live in denim',
    subtitle: 'Factory-direct wholesale jeans from ₹100/pc · MOQ 1',
    image_url: '/images/banners/hero-jeans-1.jpg',
    link_url: '/category/mens-jeans',
  },
  {
    id: 2,
    title: 'New season 2026',
    subtitle: 'Fresh fits, export-grade wash · ready for retailers',
    image_url: '/images/banners/hero-jeans-2.jpg',
    link_url: '/category/new-arrivals',
  },
  {
    id: 3,
    title: 'Wholesale drop',
    subtitle: 'Bulk pricing for distributors and exporters',
    image_url: '/images/banners/hero-jeans-3.jpg',
    link_url: '/wholesale',
  },
];

const INTERVAL_MS = 7000;

export default function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    api.getBanners()
      .then((rows) => {
        if (!rows?.length) return;
        setBanners(
          rows.map((b, i) => ({
            ...b,
            image_url: b.image_url || BANNER_IMAGES[i % BANNER_IMAGES.length],
          }))
        );
      })
      .catch(() => {});
  }, []);

  const count = banners.length;
  const go = useCallback(
    (dir: number) => {
      setCurrent((c) => (c + dir + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(() => go(1), INTERVAL_MS);
    return () => clearInterval(timer);
  }, [count, paused, go, current]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || count <= 1) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    go(delta > 0 ? -1 : 1);
  };

  const slide = banners[current];
  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section
      className="relative h-[78dvh] sm:h-[92vh] overflow-hidden bg-[#111] group"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {banners.map((b, i) => (
        <div
          key={`${b.id}-${i}`}
          className={`absolute inset-0 transition-opacity duration-[900ms] ease-out ${
            i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={b.image_url}
            alt={b.title}
            className={`w-full h-full object-cover object-center ${i === current ? 'slider-img-active' : 'scale-105'}`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
        </div>
      ))}

      <div className="relative z-20 h-full flex items-end sm:items-center">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-10 pb-20 sm:pb-0 w-full">
          <div key={current} className="max-w-2xl">
            <div className="slider-copy-in flex items-center gap-3 mb-4 sm:mb-6">
              <span className="w-8 h-[2px] bg-[#c8102e]" />
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.32em] text-white/85">
                The Denim Forge · {pad(current + 1)} / {pad(count)}
              </p>
            </div>
            <h1
              className="slider-copy-in font-display text-white font-bold text-[2.75rem] sm:text-7xl md:text-[5.5rem] leading-[0.9] tracking-[0.04em]"
              style={{ animationDelay: '80ms' }}
            >
              {slide?.title || 'Live in denim'}
            </h1>
            <p
              className="slider-copy-in mt-4 sm:mt-6 text-sm sm:text-xl text-white/80 max-w-lg leading-relaxed"
              style={{ animationDelay: '160ms' }}
            >
              {slide?.subtitle || 'Factory-direct wholesale jeans for retailers and exporters.'}
            </p>
            <div
              className="slider-copy-in mt-7 sm:mt-10 flex flex-col sm:flex-row gap-3 max-w-lg"
              style={{ animationDelay: '240ms' }}
            >
              <Link
                to={slide?.link_url || '/category/mens-jeans'}
                className="btn-primary bg-white text-[#111] hover:bg-[#c8102e] hover:text-white justify-center"
              >
                Shop the collection
              </Link>
              <Link to="/wholesale" className="btn-ghost-light justify-center">
                Join wholesale
              </Link>
            </div>
          </div>
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 border border-white/40 bg-black/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white hover:text-[#111] hover:border-white transition touch-manipulation"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next slide"
            className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-14 sm:h-14 border border-white/40 bg-black/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-white hover:text-[#111] hover:border-white transition touch-manipulation"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-6 sm:bottom-8 left-5 sm:left-10 right-5 sm:right-10 z-30 flex items-center gap-4">
            <div className="flex-1 flex gap-2 max-w-md">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setCurrent(i)}
                  className="relative h-[3px] flex-1 bg-white/30 overflow-hidden touch-manipulation"
                >
                  {i === current && (
                    <span
                      key={`${current}-${paused}`}
                      className="absolute inset-0 bg-white slider-progress-fill"
                      style={{ animationPlayState: paused ? 'paused' : 'running', animationDuration: `${INTERVAL_MS}ms` }}
                    />
                  )}
                  {i < current && <span className="absolute inset-0 bg-white" />}
                </button>
              ))}
            </div>
            <p className="hidden sm:block text-white/70 text-xs font-semibold tracking-[0.2em] uppercase">
              {pad(current + 1)} — {pad(count)}
            </p>
          </div>
        </>
      )}
    </section>
  );
}
