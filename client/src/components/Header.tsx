import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Logo from './Logo';
import { STOREFRONT_NAV } from '../lib/categories';

const TICKER = [
  'Wholesale denim from ₹100/pc',
  'MOQ 1 piece',
  'Pan-India shipping',
  'Factory-direct from Dombivli',
];

export default function Header() {
  const { user, logout } = useAuth();
  const { count, refresh } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh, user]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const navClass = (active: boolean) =>
    `nav-link px-3 xl:px-4 py-4 text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors ${
      active ? 'text-[#c8102e] active' : 'text-[#111] hover:text-[#c8102e]'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="bg-[#111] text-white overflow-hidden h-8">
        <div className="marquee-track h-full items-center">
          {[...TICKER, ...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="px-8 text-[11px] tracking-[0.18em] uppercase font-medium text-white/90">
              {t}
              <span className="mx-8 text-[#c8102e]">●</span>
            </span>
          ))}
        </div>
      </div>

      <div className="border-b border-[#e8e8e8]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-14 sm:h-[72px] gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="lg:hidden p-2 -ml-1 text-[#111] touch-manipulation"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <button
                type="button"
                className="p-2 text-[#111] touch-manipulation"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search"
              >
                <Search size={20} strokeWidth={1.6} />
              </button>
            </div>

            <Logo className="justify-self-center" />

            <div className="flex items-center justify-end gap-1 sm:gap-2">
              {user ? (
                <button
                  type="button"
                  onClick={logout}
                  className="hidden sm:inline text-[11px] uppercase tracking-[0.16em] font-semibold text-[#6b6b6b] hover:text-[#111] px-2"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline text-[11px] uppercase tracking-[0.16em] font-semibold text-[#6b6b6b] hover:text-[#111] px-2"
                >
                  Login
                </Link>
              )}
              <Link
                to={user ? '/account' : '/login'}
                className="p-2 text-[#111] touch-manipulation"
                aria-label="Account"
              >
                <User size={20} strokeWidth={1.6} />
              </Link>
              <Link to="/cart" className="relative p-2 text-[#111] touch-manipulation" aria-label="Cart">
                <ShoppingBag size={20} strokeWidth={1.6} />
                {count > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#c8102e] text-white text-[9px] min-w-[16px] h-4 flex items-center justify-center font-bold px-1 rounded-full">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {searchOpen && (
            <form onSubmit={handleSearch} className="pb-3">
              <div className="relative">
                <input
                  type="search"
                  autoFocus
                  placeholder="Search jeans, fits, washes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-12 border border-[#111] pl-4 pr-12 text-sm focus:outline-none"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#111]" aria-label="Search">
                  <Search size={18} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <nav className="hidden lg:block border-b border-[#e8e8e8] bg-white" aria-label="Categories">
        <div className="max-w-[1440px] mx-auto px-6">
          <div className="flex items-center justify-center">
            {STOREFRONT_NAV.map((item) => (
              <Link key={item.label} to={item.path} className={navClass(location.pathname === item.path)}>
                {item.label}
              </Link>
            ))}
            <Link to="/size-chart" className={navClass(location.pathname === '/size-chart')}>
              Size Chart
            </Link>
          </div>
        </div>
      </nav>

      <nav className="lg:hidden border-b border-[#e8e8e8] bg-white overflow-x-auto scrollbar-hide" aria-label="Categories">
        <div className="flex justify-start min-w-max px-2">
          {STOREFRONT_NAV.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`shrink-0 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.14em] whitespace-nowrap ${
                  active ? 'text-[#c8102e] border-b-2 border-[#c8102e]' : 'text-[#111]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/size-chart"
            className={`shrink-0 px-3 py-3 text-[11px] font-bold uppercase tracking-[0.14em] whitespace-nowrap ${
              location.pathname === '/size-chart' ? 'text-[#c8102e] border-b-2 border-[#c8102e]' : 'text-[#111]'
            }`}
          >
            Size Chart
          </Link>
        </div>
      </nav>

      {menuOpen && (
        <div className="lg:hidden border-b border-[#e8e8e8] bg-white max-h-[min(70vh,520px)] overflow-y-auto">
          {STOREFRONT_NAV.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="block px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] border-b border-[#f0f0f0]"
            >
              {item.label}
            </Link>
          ))}
          <Link to="/size-chart" className="block px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] border-b border-[#f0f0f0]">
            Size Chart
          </Link>
          <Link to="/wholesale" className="block px-5 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-[#c8102e] border-b border-[#f0f0f0]">
            Wholesale Program
          </Link>
          <Link to="/track-order" className="block px-5 py-4 text-sm uppercase tracking-[0.14em] border-b border-[#f0f0f0]">
            Track Order
          </Link>
          <Link to="/contact" className="block px-5 py-4 text-sm uppercase tracking-[0.14em]">
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
