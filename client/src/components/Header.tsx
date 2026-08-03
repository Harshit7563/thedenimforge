import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api, type Category } from '../lib/api';
import Logo from './Logo';

const NAV_ITEMS = [
  { label: 'Forge Red', path: '/wholesale', highlight: true },
  { label: 'Offers', path: '/category/bulk-orders' },
  { label: 'Top Shelf', path: '/search?featured=true' },
  { label: "What's New", path: '/category/new-arrivals' },
  { label: "Men's", path: '/category/mens-jeans' },
  { label: "Women's", path: '/category/womens-jeans' },
  { label: 'Kids', path: '/category/kids-jeans' },
  { label: 'Slim Fit', path: '/category/slim-fit' },
  { label: 'Bulk Orders', path: '/category/bulk-orders' },
  { label: 'Export', path: '/category/export-quality' },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { count, refresh } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
    refresh();
  }, [refresh, user]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#e4e7ec]">
      <div className="bg-[#0f1724] text-white text-[11px] sm:text-xs">
        <div className="max-w-[1280px] mx-auto px-4 h-9 flex items-center justify-between gap-2">
          <Link to="/track-order" className="hover:text-white/75 transition shrink-0">Track Order</Link>
          <p className="hidden md:block text-white/55 truncate text-center flex-1 px-4 tracking-wide">
            Wholesale denim from ₹100/pc · MOQ 1 · 70+ styles
          </p>
          <div className="shrink-0">
            {user ? (
              <span className="flex items-center gap-2">
                <span className="hidden sm:inline truncate max-w-[120px]">Hi, {user.first_name || 'there'}</span>
                <button onClick={logout} className="underline underline-offset-2 hover:text-white/75">Logout</button>
              </span>
            ) : (
              <Link to="/login" className="hover:text-white/75">Login / Sign Up</Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex items-center gap-3 sm:gap-5 lg:gap-8 py-4 sm:py-5">
          <button
            type="button"
            className="lg:hidden p-1 -ml-1 text-[#0f1724]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Brand-first: logo dominates the header */}
          <Logo />

          <form onSubmit={handleSearch} className="flex-1 max-w-md ml-auto hidden md:block">
            <div className="relative">
              <input
                type="text"
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

          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            <Link
              to={user ? '/account' : '/login'}
              className="hidden lg:flex flex-col items-center gap-0.5 text-[11px] text-[#5c6775] hover:text-[#0f1724] min-w-[52px]"
            >
              <User size={20} strokeWidth={1.5} />
              <span>Account</span>
            </Link>
            <Link
              to="/cart"
              className="flex flex-col items-center gap-0.5 text-[11px] text-[#5c6775] hover:text-[#0f1724] min-w-[44px] relative"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span>Cart</span>
              {count > 0 && (
                <span className="absolute -top-0.5 right-0.5 bg-[#c41e3a] text-white text-[9px] min-w-[16px] h-4 flex items-center justify-center font-bold px-1">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        <form onSubmit={handleSearch} className="pb-3 sm:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search jeans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 bg-[#f7f8fa] pl-4 pr-10 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#0f1724]"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5c6775]">
              <Search size={16} />
            </button>
          </div>
        </form>
      </div>

      <div className="bg-[#c41e3a] text-white text-center text-xs sm:text-sm py-2 px-4 font-medium tracking-wide">
        Wholesale denim from ₹100/pc · MOQ 1 —{' '}
        <Link to="/register" className="underline underline-offset-2 font-semibold">Register Now</Link>
      </div>

      <nav className="hidden lg:block border-t border-[#e4e7ec] bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`nav-link px-4 py-3.5 text-[13px] font-medium transition-colors ${
                  item.highlight
                    ? 'text-[#c41e3a]'
                    : location.pathname === item.path
                      ? 'text-[#0f1724]'
                      : 'text-[#5c6775] hover:text-[#0f1724]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="relative group shrink-0">
              <button className="nav-link px-4 py-3.5 text-[13px] font-medium text-[#5c6775] hover:text-[#0f1724] flex items-center gap-1">
                Shop By ▾
              </button>
              <div className="absolute top-full left-0 bg-white border border-[#e4e7ec] py-2 min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="block px-4 py-2.5 text-sm text-[#5c6775] hover:bg-[#f7f8fa] hover:text-[#0f1724]"
                  >
                    {cat.name}
                  </Link>
                ))}
                <div className="border-t border-[#e4e7ec] mt-1 pt-1">
                  <Link
                    to="/size-chart"
                    className="block px-4 py-2.5 text-sm font-medium text-[#0f1724] hover:bg-[#f7f8fa]"
                  >
                    Size Chart
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="lg:hidden border-t border-[#e4e7ec] bg-white max-h-[70vh] overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`block px-4 py-3.5 text-sm border-b border-[#f0f0f0] ${
                item.highlight ? 'text-[#c41e3a] font-semibold' : 'text-[#121820]'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="px-4 py-3 text-[11px] font-semibold text-[#5c6775] uppercase tracking-[0.18em]">Shop By</div>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="block px-4 py-3 text-sm text-[#5c6775] border-b border-[#f0f0f0]"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            to="/size-chart"
            className="block px-4 py-3.5 text-sm font-semibold text-[#0f1724] border-b border-[#f0f0f0]"
          >
            Size Chart
          </Link>
          <Link
            to="/account"
            className="block px-4 py-3.5 text-sm font-semibold text-[#0f1724] border-b border-[#f0f0f0]"
          >
            Account
          </Link>
          <Link
            to="/contact"
            className="block px-4 py-3.5 text-sm text-[#0f1724] border-b border-[#f0f0f0]"
          >
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
