import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, MessageSquare, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const NAV = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
];

export function AdminGuard() {
  if (!localStorage.getItem('admin_token')) return <Navigate to="/admin/login" replace />;
  return <Outlet />;
}

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1a1a1a] text-white transform ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform`}>
        <div className="p-5 border-b border-white/10">
          <p className="font-bold text-lg">Denim Forge</p>
          <p className="text-xs text-gray-400">Admin Panel</p>
        </div>
        <nav className="p-3 space-y-1">
          {NAV.map(({ path, label, icon: Icon, exact }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${isActive(path, exact) ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 px-7 py-3 text-sm text-gray-400 hover:text-white mt-4">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-[#e8e8e8] px-4 py-3 flex items-center gap-3 lg:hidden sticky top-0 z-30">
          <button onClick={() => setOpen(true)}><Menu size={22} /></button>
          <span className="font-semibold">Admin</span>
          <button onClick={() => setOpen(false)} className="ml-auto lg:hidden hidden"><X size={22} /></button>
        </header>
        <main className="p-4 sm:p-6 max-w-6xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
