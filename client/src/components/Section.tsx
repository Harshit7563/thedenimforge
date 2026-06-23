import { Link } from 'react-router-dom';

interface Props {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Section({ title, subtitle, viewAllLink, children, className = '' }: Props) {
  return (
    <section className={`max-w-[1280px] mx-auto px-4 py-8 sm:py-10 ${className}`}>
      <div className="flex items-end justify-between gap-4 mb-5 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-[#1a1a1a] tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-xs sm:text-sm text-[#1a1a1a] font-medium border-b border-[#1a1a1a] pb-0.5 hover:text-[#e11d48] hover:border-[#e11d48] transition shrink-0"
          >
            View All
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
