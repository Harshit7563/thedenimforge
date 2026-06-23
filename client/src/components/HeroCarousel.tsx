import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type Banner } from '../lib/api';
import SafeImage from './SafeImage';

export default function HeroCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    api.getBanners().then(setBanners).catch(() => {});
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <div className="relative h-[280px] sm:h-[380px] md:h-[420px] bg-gradient-to-br from-[#1a1a1a] to-[#333] flex items-center justify-center">
        <div className="text-center text-white px-6">
          <h2 className="text-2xl sm:text-4xl font-bold mb-3 tracking-tight">The Denim Forge</h2>
          <p className="text-sm sm:text-lg text-white/80">Premium Wholesale Jeans — Factory Direct Pricing</p>
        </div>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c - 1 + banners.length) % banners.length);
  const next = () => setCurrent((c) => (c + 1) % banners.length);

  return (
    <div className="relative h-[280px] sm:h-[380px] md:h-[420px] overflow-hidden bg-[#1a1a1a] group">
      {banners.map((banner, i) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <SafeImage src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-[1280px] mx-auto px-6 sm:px-10 w-full">
              <h2 className="text-xl sm:text-3xl md:text-[42px] font-bold text-white mb-2 sm:mb-3 max-w-lg leading-tight tracking-tight">
                {banner.title}
              </h2>
              <p className="text-xs sm:text-base text-white/85 mb-5 sm:mb-7 max-w-md">{banner.subtitle}</p>
              {banner.link_url && (
                <Link
                  to={banner.link_url}
                  className="inline-block bg-white text-[#1a1a1a] px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold hover:bg-[#e11d48] hover:text-white transition-colors"
                >
                  Shop Now
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white shadow-md"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white shadow-md"
          >
            <ChevronRight size={18} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-6' : 'bg-white/50 w-1.5'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
