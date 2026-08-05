import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'full' | 'icon' | 'footer' | 'hero';
  className?: string;
}

export default function Logo({ variant = 'full', className = '' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <Link to="/" className={`shrink-0 flex items-center ${className}`} aria-label="The Denim Forge Home">
        <img src="/logo-icon.svg" alt="The Denim Forge" className="w-14 h-14" />
      </Link>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`flex items-center gap-3 sm:gap-5 ${className}`}>
        <img
          src="/logo-icon.svg"
          alt=""
          className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 shrink-0 drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        />
        <div className="min-w-0">
          <p className="font-display text-white font-extrabold text-[1.65rem] leading-[0.95] sm:text-5xl md:text-6xl lg:text-7xl sm:leading-[0.92] tracking-[-0.03em]">
            The Denim Forge
          </p>
          <p className="mt-1.5 sm:mt-3 text-[9px] sm:text-xs text-white/55 uppercase tracking-[0.28em] sm:tracking-[0.42em] font-semibold">
            Wholesale Jeans · Est. India
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <Link to="/" className={`inline-flex items-center gap-4 ${className}`} aria-label="The Denim Forge Home">
        <img src="/logo-icon.svg" alt="" className="w-14 h-14" />
        <div>
          <p className="font-display text-white font-extrabold text-xl sm:text-2xl leading-tight tracking-tight">
            The Denim Forge
          </p>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.32em] mt-1.5 font-semibold">
            Wholesale Jeans
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/"
      className={`shrink-0 flex items-center gap-2 sm:gap-3.5 group min-w-0 ${className}`}
      aria-label="The Denim Forge Home"
    >
      <img
        src="/logo-icon.svg"
        alt=""
        className="w-9 h-9 sm:w-14 sm:h-14 lg:w-[3.75rem] lg:h-[3.75rem] shrink-0 transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <div className="leading-none min-w-0">
        <p className="font-display text-[15px] sm:text-[22px] lg:text-[26px] font-extrabold text-[#0f1724] tracking-[-0.03em] truncate">
          The Denim Forge
        </p>
        <div className="hidden sm:flex items-center gap-2 mt-1.5 sm:mt-2">
          <span className="w-5 h-[2.5px] bg-[#c41e3a]" />
          <p className="text-[9px] sm:text-[10px] text-[#5c6775] uppercase tracking-[0.28em] font-bold">
            Wholesale Jeans
          </p>
        </div>
      </div>
    </Link>
  );
}
