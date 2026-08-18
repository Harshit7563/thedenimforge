import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  path?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[11px] sm:text-xs uppercase tracking-[0.12em] text-[#6b6b6b] overflow-x-auto scrollbar-hide py-3 sm:py-4">
      <Link to="/" className="shrink-0 hover:text-[#111]">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1 shrink-0">
          <ChevronRight size={12} className="text-[#ccc]" />
          {item.path ? (
            <Link to={item.path} className="hover:text-[#111] truncate max-w-[120px] sm:max-w-none">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#111] font-semibold truncate max-w-[160px] sm:max-w-xs normal-case tracking-normal" style={{ fontFamily: 'var(--font-sans)' }}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
