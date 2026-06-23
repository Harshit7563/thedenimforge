import { Link } from 'react-router-dom';

interface LogoProps {
  variant?: 'full' | 'icon' | 'footer';
  className?: string;
}

export default function Logo({ variant = 'full', className = '' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <Link to="/" className={`shrink-0 flex items-center ${className}`} aria-label="The Denim Forge Home">
        <img src="/logo-icon.svg" alt="The Denim Forge" className="w-11 h-11 sm:w-12 sm:h-12" />
      </Link>
    );
  }

  if (variant === 'footer') {
    return (
      <Link to="/" className={`inline-flex items-center gap-3 ${className}`} aria-label="The Denim Forge Home">
        <img src="/logo-icon.svg" alt="" className="w-11 h-11" />
        <div>
          <p className="text-white font-bold text-base leading-tight tracking-tight">The Denim Forge</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.22em] mt-0.5">Wholesale Jeans</p>
        </div>
      </Link>
    );
  }

  return (
    <Link to="/" className={`shrink-0 flex items-center gap-2.5 sm:gap-3 ${className}`} aria-label="The Denim Forge Home">
      <img src="/logo-icon.svg" alt="" className="w-11 h-11 sm:w-12 sm:h-12" />
      <div className="hidden sm:block leading-none">
        <p className="text-[17px] lg:text-[18px] font-bold text-[#111827] tracking-tight">The Denim Forge</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="w-4 h-[2px] bg-[#e11d48] rounded-full" />
          <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-semibold">Wholesale Jeans</p>
        </div>
      </div>
    </Link>
  );
}
