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
    <header className="sticky top-0 z-50 bg-white border-b border-[#e8e8e8]">
      {/* Top utility bar */}
      <div className="bg-[#1a1a1a] text-white text-[11px] sm:text-xs">
        <div className="max-w-[1280px] mx-auto px-4 h-8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <Link to="/orders" className="hover:text-white/80 transition">Track Order</Link>
            <Link to="/contact" className="hover:text-white/80 transition hidden xs:inline">Help Centre</Link>
          </div>
          <p className="hidden md:block text-white/70 truncate text-center flex-1 px-4">
            Wholesale denim from ₹100/pc · MOQ 10 pieces · 70+ products
          </p>
          <div className="shrink-0 text-right">
            {user ? (
              <span className="flex items-center gap-2 justify-end">
                <span className="hidden sm:inline truncate max-w-[120px]">Hi, {user.first_name || 'there'}</span>
                <button onClick={logout} className="hover:text-white/80 underline underline-offset-2">Logout</button>
              </span>
            ) : (
              <Link to="/login" className="hover:text-white/80">Login / Sign Up</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main header row */}
      <div className="max-w-[1280px] mx-auto px-4">
        <div className="flex items-center gap-3 sm:gap-6 py-3 sm:py-4">
          <button
            type="button"
            className="lg:hidden p-1 -ml-1 text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Logo />

          <form onSubmit={handleSearch} className="flex-1 max-w-lg mx-auto hidden sm:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for jeans, brands, fits..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 bg-[#f5f5f5] border border-transparent rounded-full pl-5 pr-12 text-sm focus:outline-none focus:bg-white focus:border-[#1a1a1a] transition"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center hover:bg-[#333] transition"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-1 sm:gap-4 ml-auto shrink-0">
            <Link
              to={user ? '/orders' : '/login'}
              className="hidden md:flex flex-col items-center gap-0.5 text-[11px] text-gray-600 hover:text-[#1a1a1a] min-w-[52px]"
            >
              <User size={20} strokeWidth={1.5} />
              <span>Account</span>
            </Link>
            <Link
              to="/cart"
              className="flex flex-col items-center gap-0.5 text-[11px] text-gray-600 hover:text-[#1a1a1a] min-w-[44px] relative"
            >
              <ShoppingBag size={20} strokeWidth={1.5} />
              <span>Cart</span>
              {count > 0 && (
                <span className="absolute -top-0.5 right-1 bg-[#e11d48] text-white text-[9px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="pb-3 sm:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search jeans..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 bg-[#f5f5f5] rounded-full pl-4 pr-10 text-sm focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1a1a1a]"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <Search size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Promo strip */}
      <div className="bg-[#e11d48] text-white text-center text-xs sm:text-sm py-2 px-4 font-medium">
        ₹500 off on your first wholesale order —{' '}
        <Link to="/register" className="underline underline-offset-2 font-semibold">Register Now</Link>
      </div>

      {/* Desktop category nav */}
      <nav className="hidden lg:block border-t border-[#e8e8e8] bg-white">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-hide">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`nav-link px-4 py-3.5 text-[13px] font-medium transition-colors ${
                  item.highlight
                    ? 'text-[#e11d48]'
                    : location.pathname === item.path
                      ? 'text-[#1a1a1a]'
                      : 'text-gray-600 hover:text-[#1a1a1a]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="relative group shrink-0">
              <button className="nav-link px-4 py-3.5 text-[13px] font-medium text-gray-600 hover:text-[#1a1a1a] flex items-center gap-1">
                Shop By ▾
              </button>
              <div className="absolute top-full left-0 bg-white shadow-lg border border-[#e8e8e8] rounded-lg py-2 min-w-[220px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-[#faf9f7] hover:text-[#1a1a1a]"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="lg:hidden border-t border-[#e8e8e8] bg-white max-h-[70vh] overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`block px-4 py-3.5 text-sm border-b border-[#f0f0f0] ${
                item.highlight ? 'text-[#e11d48] font-semibold' : 'text-gray-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Shop By</div>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="block px-4 py-3 text-sm text-gray-600 border-b border-[#f0f0f0]"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
