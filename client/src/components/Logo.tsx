import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'full' | 'icon' | 'footer' | 'hero';
  className?: string;
}

function RedTab({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block bg-[#c8102e] rounded-[2px] shadow-[1px_1px_0_rgba(0,0,0,0.25)] ${className}`}
      aria-hidden
    />
  );
}

export default function Logo({ variant = 'full', className = '' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <Link to="/" className={`shrink-0 flex items-center ${className}`} aria-label="The Denim Forge Home">
        <RedTab className="w-6 h-8" />
      </Link>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={className}>
        <div className="flex items-center gap-3 mb-4">
          <RedTab className="w-5 h-8 sm:w-6 sm:h-10" />
          <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
            Est. India · Wholesale
          </p>
        </div>
        <p className="font-display text-white font-bold text-5xl sm:text-7xl md:text-8xl leading-[0.9] tracking-[0.04em]">
          The Denim
          <br />
          Forge
        </p>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <Link to="/" className={`inline-flex items-center gap-3 ${className}`} aria-label="The Denim Forge Home">
        <RedTab className="w-5 h-8" />
        <div>
          <p className="font-display text-white font-bold text-2xl leading-none tracking-[0.06em] uppercase">
            Denim Forge
          </p>
          <p className="text-[10px] text-white/45 uppercase tracking-[0.28em] mt-2 font-semibold">
            Wholesale Jeans
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/"
      className={`shrink-0 flex items-center gap-2.5 group min-w-0 ${className}`}
      aria-label="The Denim Forge Home"
    >
      <RedTab className="w-3.5 h-6 sm:w-4 sm:h-7" />
      <div className="leading-none min-w-0">
        <p className="font-display text-[18px] sm:text-[22px] lg:text-[26px] font-bold text-[#111] tracking-[0.08em] uppercase">
          Denim Forge
        </p>
        <p className="hidden sm:block text-[9px] text-[#6b6b6b] uppercase tracking-[0.32em] mt-1 font-semibold">
          Wholesale Jeans
        </p>
      </div>
    </Link>
  );
}
