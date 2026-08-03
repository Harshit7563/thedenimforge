import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  children: ReactNode;
  className?: string;
}

export default function Section({ title, subtitle, viewAllLink, children, className = '' }: Props) {
  return (
    <section className={`max-w-[1280px] mx-auto px-4 sm:px-6 py-12 sm:py-16 ${className}`}>
      <div className="flex items-end justify-between gap-4 mb-8 sm:mb-10">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0f1724] tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-[#5c6775] mt-2">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-sm font-semibold text-[#0f1724] border-b border-[#0f1724] pb-0.5 hover:text-[#c41e3a] hover:border-[#c41e3a] transition shrink-0"
          >
            View All
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
