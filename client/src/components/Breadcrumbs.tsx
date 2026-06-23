import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface Crumb {
  label: string;
  path?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 overflow-x-auto scrollbar-hide py-3 sm:py-4">
      <Link to="/" className="shrink-0 hover:text-[#1a1a1a] flex items-center gap-1">
        <Home size={14} />
        <span className="hidden sm:inline">Home</span>
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1 shrink-0">
          <ChevronRight size={14} className="text-gray-300" />
          {item.path ? (
            <Link to={item.path} className="hover:text-[#1a1a1a] truncate max-w-[120px] sm:max-w-none">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#1a1a1a] font-medium truncate max-w-[160px] sm:max-w-xs">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
