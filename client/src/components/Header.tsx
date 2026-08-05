import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Logo from './Logo';
import { STOREFRONT_NAV } from '../lib/categories';

export default function Header() {
  const { user, logout } = useAuth();
  const { count, refresh } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    refresh();
  }, [refresh, user]);

  useEffect(() => {
    setMenuOpen(false);
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

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e4e7ec]">
      <div className="bg-[#0f1724] text-white text-[10px] sm:text-xs">
        <div className="max-w-[1280px] mx-auto px-3 sm:px-4 h-8 sm:h-9 flex items-center justify-between gap-2">
          <Link to="/track-order" className="hover:text-white/75 transition shrink-0">
            Track Order
          </Link>
          <p className="hidden sm:block text-white/55 truncate text-center flex-1 px-3 tracking-wide">
            Wholesale denim from ₹100/pc · MOQ 1 · 70+ styles
          </p>
          <div className="shrink-0">
            {user ? (
              <span className="flex items-center gap-2">
                <span className="hidden sm:inline truncate max-w-[120px]">Hi, {user.first_name || 'there'}</span>
                <button type="button" onClick={logout} className="underline underline-offset-2 hover:text-white/75">
                  Logout
                </button>
              </span>
            ) : (
              <Link to="/login" className="hover:text-white/75">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-5 lg:gap-8 py-2.5 sm:py-5">
          <button
            type="button"
            className="lg:hidden p-2 -ml-1 text-[#0f1724] touch-manipulation"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Logo className="min-w-0 flex-1 lg:flex-none" />

          <form onSubmit={handleSearch} className="flex-1 max-w-md ml-auto hidden md:block">
            <div className="relative">
              <input
                type="search"
                placeholder="Search jeans, fits, washes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 bg-[#f7f8fa] border border-transparent pl-4 pr-12 text-sm focus:outline-none focus:bg-white focus:border-[#0f1724] transition"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#0f1724] text-white flex items-center justify-center hover:bg-[#c41e3a] transition"
              >
                <Search size={15} />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-0.5 sm:gap-4 shrink-0">
            <Link
              to={user ? '/account' : '/login'}
              className="hidden lg:flex flex-col items-center gap-0.5 text-[11px] text-[#5c6775] hover:text-[#0f1724] min-w-[52px]"
            >
              <User size={20} strokeWidth={1.5} />
              <span>Account</span>
            </Link>
            <Link
              to="/cart"
              className="flex flex-col items-center gap-0.5 text-[10px] sm:text-[11px] text-[#5c6775] hover:text-[#0f1724] min-w-[40px] sm:min-w-[44px] relative p-1.5 touch-manipulation"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span>Cart</span>
              {count > 0 && (
                <span className="absolute top-0 right-0 bg-[#c41e3a] text-white text-[9px] min-w-[16px] h-4 flex items-center justify-center font-bold px-1 rounded-full">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          </div>
        </div>

        <form onSubmit={handleSearch} className="pb-2.5 md:hidden">
          <div className="relative">
            <input
              type="search"
              placeholder="Search jeans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 bg-[#f7f8fa] pl-4 pr-10 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0f1724]"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c6775] p-1" aria-label="Search">
              <Search size={16} />
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#c41e3a] text-white text-center text-[11px] sm:text-sm py-1.5 sm:py-2 px-3 sm:px-4 font-medium tracking-wide">
        <span className="sm:hidden">From ₹100/pc · MOQ 1 — </span>
        <span className="hidden sm:inline">Wholesale denim from ₹100/pc · MOQ 1 — </span>
        <Link to="/register" className="underline underline-offset-2 font-semibold">
          Register
        </Link>
      </div>

      {/* Mobile category strip — centered + bold */}
      <nav className="lg:hidden border-t border-[#e4e7ec] bg-white" aria-label="Categories">
        <div className="flex flex-wrap justify-center gap-x-1 gap-y-0.5 px-2 py-1.5">
          {STOREFRONT_NAV.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`shrink-0 px-2.5 py-2 text-[12px] font-bold whitespace-nowrap transition touch-manipulation ${
                  active
                    ? 'text-[#c41e3a] border-b-2 border-[#c41e3a]'
                    : 'text-[#0f1724]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/size-chart"
            className={`shrink-0 px-2.5 py-2 text-[12px] font-bold whitespace-nowrap transition touch-manipulation ${
              location.pathname === '/size-chart'
                ? 'text-[#c41e3a] border-b-2 border-[#c41e3a]'
                : 'text-[#0f1724]'
            }`}
          >
            Size Chart
          </Link>
        </div>
      </nav>

      <nav className="hidden lg:block border-t border-[#e4e7ec] bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center justify-center gap-1 xl:gap-2">
            {STOREFRONT_NAV.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`nav-link px-4 py-3.5 text-[14px] font-bold transition-colors ${
                  location.pathname === item.path
                    ? 'text-[#0f1724]'
                    : 'text-[#0f1724] hover:text-[#c41e3a]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/size-chart"
              className={`nav-link px-4 py-3.5 text-[14px] font-bold transition-colors ${
                location.pathname === '/size-chart'
                  ? 'text-[#0f1724]'
                  : 'text-[#0f1724] hover:text-[#c41e3a]'
              }`}
            >
              Size Chart
            </Link>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="lg:hidden border-t border-[#e4e7ec] bg-white max-h-[min(70vh,480px)] overflow-y-auto overscroll-contain shadow-lg">
          {STOREFRONT_NAV.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="block px-4 py-3.5 text-sm border-b border-[#f0f0f0] text-[#121820] active:bg-[#f7f8fa]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/size-chart"
            className="block px-4 py-3.5 text-sm font-semibold text-[#0f1724] border-b border-[#f0f0f0]"
          >
            Size Chart
          </Link>
          <Link
            to="/wholesale"
            className="block px-4 py-3.5 text-sm font-semibold text-[#c41e3a] border-b border-[#f0f0f0]"
          >
            Wholesale Program
          </Link>
          <Link
            to="/account"
            className="block px-4 py-3.5 text-sm font-semibold text-[#0f1724] border-b border-[#f0f0f0]"
          >
            Account
          </Link>
          <Link to="/contact" className="block px-4 py-3.5 text-sm text-[#0f1724] border-b border-[#f0f0f0]">
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
