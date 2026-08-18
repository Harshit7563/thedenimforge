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
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#111] tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-[#6b6b6b] mt-2">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs font-bold uppercase tracking-[0.16em] text-[#111] border-b-2 border-[#111] pb-0.5 hover:text-[#c8102e] hover:border-[#c8102e] transition shrink-0"
          >
            View All
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
