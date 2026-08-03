import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Package, MapPin, User, Truck, LogOut, Plus, Trash2, CheckCircle2, Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  api, formatPrice,
  type OrderSummary, type OrderDetail, type ShippingAddress,
} from '../lib/api';

type Tab = 'overview' | 'orders' | 'track' | 'addresses' | 'profile';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
];

const emptyAddress = {
  name: '', phone: '', company: '', address_line1: '', address_line2: '',
  city: '', state: 'Maharashtra', pincode: '', is_default: false,
};

export default function AccountPage() {
  const { user, logout, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const tabFromPath = (): Tab => {
    if (location.pathname === '/orders') return 'orders';
    if (location.pathname === '/track-order') return 'track';
    return (params.get('tab') as Tab) || 'overview';
  };
  const tab = tabFromPath();

  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [trackNo, setTrackNo] = useState('');
  const [tracked, setTracked] = useState<OrderDetail | null>(null);
  const [trackError, setTrackError] = useState('');
  const [addrForm, setAddrForm] = useState(emptyAddress);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [profile, setProfile] = useState({ first_name: '', last_name: '', phone: '', company_name: '' });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const setTab = (t: Tab) => {
    setMsg('');
    setSelectedOrder(null);
    if (t === 'orders') navigate('/orders');
    else if (t === 'track') navigate('/track-order');
    else if (t === 'overview') navigate('/account');
    else navigate(`/account?tab=${t}`);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    setProfile({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
      company_name: user.company_name || '',
    });
    api.getOrders().then(setOrders).catch(() => setOrders([]));
    api.getAddresses().then(setAddresses).catch(() => setAddresses([]));
  }, [user, authLoading, navigate]);

  const openOrder = async (id: string) => {
    try {
      const detail = await api.getOrder(id);
      setSelectedOrder(detail);
    } catch {
      setMsg('Could not load order details');
    }
  };

  const handleTrack = async (e: FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTracked(null);
    if (!trackNo.trim()) return;
    try {
      const data = await api.trackOrder(trackNo.trim());
      setTracked(data);
    } catch (err) {
      setTrackError(err instanceof Error ? err.message : 'Order not found');
    }
  };

  const saveAddress = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createAddress(addrForm);
      setAddresses(await api.getAddresses());
      setAddrForm(emptyAddress);
      setShowAddrForm(false);
      setMsg('Shipping address saved');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed to save address');
    }
    setSaving(false);
  };

  const removeAddress = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    await api.deleteAddress(id);
    setAddresses(await api.getAddresses());
  };

  const setDefault = async (addr: ShippingAddress) => {
    await api.updateAddress(addr.id, { is_default: true });
    setAddresses(await api.getAddresses());
  };

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile(profile);
      await refreshUser();
      setMsg('Profile updated');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Update failed');
    }
    setSaving(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading || !user) {
    return <div className="py-24 text-center text-[#5c6775]">Loading account...</div>;
  }

  const nav = [
    { id: 'overview' as Tab, label: 'Overview', icon: User },
    { id: 'orders' as Tab, label: 'My Orders', icon: Package },
    { id: 'track' as Tab, label: 'Track Order', icon: Truck },
    { id: 'addresses' as Tab, label: 'Shipping Address', icon: MapPin },
    { id: 'profile' as Tab, label: 'Profile', icon: User },
  ];

  const statusIndex = (status: string) => {
    const i = STATUS_STEPS.indexOf(status);
    return i >= 0 ? i : 0;
  };

  const OrderTimeline = ({ status }: { status: string }) => {
    if (status === 'cancelled') {
      return <p className="text-sm text-[#c41e3a] font-semibold">Order cancelled</p>;
    }
    const current = statusIndex(status);
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {STATUS_STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${
                i <= current ? 'bg-[#0f1724] text-white' : 'bg-[#eef1f5] text-[#5c6775]'
              }`}
            >
              {i < current ? '✓' : i + 1}
            </span>
            <span className={`text-xs ${i <= current ? 'text-[#0f1724] font-semibold' : 'text-[#5c6775]'}`}>
              {STATUS_LABEL[s]}
            </span>
            {i < STATUS_STEPS.length - 1 && <span className="text-[#d0d5dd] mx-1">—</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-[#f7f8fa] min-h-[70vh]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.28em] uppercase text-[#c41e3a] font-semibold mb-2">Account</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0f1724]">
            Hi, {user.first_name || 'there'}
          </h1>
          <p className="text-sm text-[#5c6775] mt-1">{user.email}</p>
        </div>

        <div className="grid lg:grid-cols-[240px_1fr] gap-6 lg:gap-8">
          <aside className="bg-white border border-[#e4e7ec] h-fit">
            <nav className="p-2">
              {nav.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition ${
                    tab === id ? 'bg-[#0f1724] text-white' : 'text-[#5c6775] hover:bg-[#f7f8fa] hover:text-[#0f1724]'
                  }`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#c41e3a] hover:bg-red-50 mt-2"
              >
                <LogOut size={16} /> Logout
              </button>
            </nav>
          </aside>

          <div className="bg-white border border-[#e4e7ec] p-5 sm:p-8 min-h-[420px]">
            {msg && (
              <div className="mb-5 flex items-center gap-2 bg-green-50 text-green-800 text-sm px-4 py-3 border border-green-100">
                <CheckCircle2 size={16} /> {msg}
              </div>
            )}

            {tab === 'overview' && (
              <div>
                <h2 className="font-display text-xl font-bold text-[#0f1724] mb-6">Account Overview</h2>
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Orders', value: orders.length, tab: 'orders' as Tab },
                    { label: 'Addresses', value: addresses.length, tab: 'addresses' as Tab },
                    { label: 'Account type', value: user.is_wholesale ? 'Wholesale' : 'Retail', tab: 'profile' as Tab },
                  ].map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => setTab(c.tab)}
                      className="border border-[#e4e7ec] p-5 text-left hover:border-[#0f1724] transition"
                    >
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#5c6775] mb-2">{c.label}</p>
                      <p className="font-display text-2xl font-bold text-[#0f1724]">{c.value}</p>
                    </button>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <button type="button" onClick={() => setTab('orders')} className="border border-[#e4e7ec] px-4 py-3 text-sm font-semibold text-left hover:bg-[#f7f8fa]">
                    View My Orders →
                  </button>
                  <button type="button" onClick={() => setTab('track')} className="border border-[#e4e7ec] px-4 py-3 text-sm font-semibold text-left hover:bg-[#f7f8fa]">
                    Track an Order →
                  </button>
                  <button type="button" onClick={() => setTab('addresses')} className="border border-[#e4e7ec] px-4 py-3 text-sm font-semibold text-left hover:bg-[#f7f8fa]">
                    Manage Shipping Address →
                  </button>
                  <Link to="/cart" className="border border-[#e4e7ec] px-4 py-3 text-sm font-semibold hover:bg-[#f7f8fa]">
                    View Cart →
                  </Link>
                </div>
              </div>
            )}

            {tab === 'orders' && (
              <div>
                <h2 className="font-display text-xl font-bold text-[#0f1724] mb-6">My Orders</h2>
                {selectedOrder ? (
                  <div>
                    <button type="button" onClick={() => setSelectedOrder(null)} className="text-sm text-[#5c6775] mb-4 hover:text-[#0f1724]">
                      ← Back to orders
                    </button>
                    <div className="border border-[#e4e7ec] p-5">
                      <div className="flex flex-wrap justify-between gap-3 mb-2">
                        <div>
                          <p className="font-display text-lg font-bold">{selectedOrder.order_number}</p>
                          <p className="text-sm text-[#5c6775]">{new Date(selectedOrder.created_at).toLocaleString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatPrice(selectedOrder.total_amount)}</p>
                          <span className="text-xs uppercase tracking-wide font-semibold text-[#c41e3a]">
                            {STATUS_LABEL[selectedOrder.status] || selectedOrder.status}
                          </span>
                        </div>
                      </div>
                      <OrderTimeline status={selectedOrder.status} />
                      {selectedOrder.shipping_address && (
                        <div className="mt-5 text-sm text-[#5c6775]">
                          <p className="font-semibold text-[#0f1724] mb-1">Shipping to</p>
                          <p>{selectedOrder.shipping_address.name} · {selectedOrder.shipping_address.phone}</p>
                          <p>{selectedOrder.shipping_address.address_line1}</p>
                          <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} — {selectedOrder.shipping_address.pincode}</p>
                        </div>
                      )}
                      <div className="mt-5 border-t border-[#eef1f5] pt-4 space-y-2">
                        {selectedOrder.items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm gap-3">
                            <span className="text-[#0f1724]">{item.product_name} × {item.quantity}
                              <span className="text-[#5c6775]"> (Size {item.size})</span>
                            </span>
                            <span className="font-semibold shrink-0">{formatPrice(Number(item.unit_price) * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="mx-auto text-[#d0d5dd] mb-3" size={40} />
                    <p className="text-[#5c6775] mb-4">No orders yet.</p>
                    <Link to="/category/mens-jeans" className="text-sm font-semibold text-[#c41e3a] hover:underline">Start shopping →</Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <button
                        key={order.id}
                        type="button"
                        onClick={() => openOrder(order.id)}
                        className="w-full border border-[#e4e7ec] p-4 sm:p-5 flex justify-between items-center text-left hover:border-[#0f1724] transition"
                      >
                        <div>
                          <p className="font-semibold text-[#0f1724]">{order.order_number}</p>
                          <p className="text-sm text-[#5c6775] mt-1">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrice(order.total_amount)}</p>
                          <span className="text-[11px] uppercase tracking-wide font-semibold text-[#c41e3a]">
                            {STATUS_LABEL[order.status] || order.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'track' && (
              <div>
                <h2 className="font-display text-xl font-bold text-[#0f1724] mb-2">Track Order</h2>
                <p className="text-sm text-[#5c6775] mb-6">Enter your order number (e.g. DFXXXXXX) to see live status.</p>
                <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-2 mb-6">
                  <input
                    value={trackNo}
                    onChange={(e) => setTrackNo(e.target.value.toUpperCase())}
                    placeholder="Order number"
                    className="flex-1 h-11 border border-[#e4e7ec] px-4 text-sm focus:outline-none focus:border-[#0f1724]"
                  />
                  <button type="submit" className="h-11 px-6 bg-[#0f1724] text-white text-sm font-semibold hover:bg-[#c41e3a] transition flex items-center justify-center gap-2">
                    <Search size={15} /> Track
                  </button>
                </form>
                {trackError && <p className="text-sm text-[#c41e3a] mb-4">{trackError}</p>}
                {tracked && (
                  <div className="border border-[#e4e7ec] p-5">
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <p className="font-display text-lg font-bold">{tracked.order_number}</p>
                        <p className="text-sm text-[#5c6775]">{new Date(tracked.created_at).toLocaleString('en-IN')}</p>
                      </div>
                      <p className="font-bold text-lg">{formatPrice(tracked.total_amount)}</p>
                    </div>
                    <OrderTimeline status={tracked.status} />
                    {tracked.shipping_address && (
                      <div className="mt-5 text-sm text-[#5c6775]">
                        <p className="font-semibold text-[#0f1724] mb-1">Shipping</p>
                        <p>{tracked.shipping_address.city}, {tracked.shipping_address.state} — {tracked.shipping_address.pincode}</p>
                      </div>
                    )}
                    <div className="mt-4 space-y-2">
                      {tracked.items?.map((item, i) => (
                        <p key={i} className="text-sm text-[#0f1724]">{item.product_name} × {item.quantity}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {tab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <h2 className="font-display text-xl font-bold text-[#0f1724]">Shipping Addresses</h2>
                  <button
                    type="button"
                    onClick={() => setShowAddrForm((v) => !v)}
                    className="flex items-center gap-1.5 text-sm font-semibold bg-[#0f1724] text-white px-3 py-2 hover:bg-[#c41e3a] transition"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>

                {showAddrForm && (
                  <form onSubmit={saveAddress} className="border border-[#e4e7ec] p-4 sm:p-5 mb-6 grid sm:grid-cols-2 gap-3">
                    {[
                      ['name', 'Full name *'],
                      ['phone', 'Phone *'],
                      ['company', 'Company'],
                      ['address_line1', 'Address line 1 *'],
                      ['address_line2', 'Address line 2'],
                      ['city', 'City *'],
                      ['pincode', 'Pincode *'],
                    ].map(([key, label]) => (
                      <label key={key} className="text-sm sm:col-span-1">
                        <span className="block mb-1 text-[#5c6775]">{label}</span>
                        <input
                          required={label.includes('*')}
                          value={(addrForm as Record<string, string | boolean>)[key] as string}
                          onChange={(e) => setAddrForm({ ...addrForm, [key]: e.target.value })}
                          className="w-full h-10 border border-[#e4e7ec] px-3 text-sm focus:outline-none focus:border-[#0f1724]"
                        />
                      </label>
                    ))}
                    <label className="text-sm">
                      <span className="block mb-1 text-[#5c6775]">State *</span>
                      <select
                        required
                        value={addrForm.state}
                        onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                        className="w-full h-10 border border-[#e4e7ec] px-3 text-sm focus:outline-none focus:border-[#0f1724]"
                      >
                        {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </label>
                    <label className="flex items-center gap-2 text-sm sm:col-span-2 mt-1">
                      <input
                        type="checkbox"
                        checked={addrForm.is_default}
                        onChange={(e) => setAddrForm({ ...addrForm, is_default: e.target.checked })}
                      />
                      Set as default shipping address
                    </label>
                    <div className="sm:col-span-2 flex gap-2">
                      <button type="submit" disabled={saving} className="h-10 px-5 bg-[#0f1724] text-white text-sm font-semibold disabled:opacity-50">
                        {saving ? 'Saving...' : 'Save Address'}
                      </button>
                      <button type="button" onClick={() => setShowAddrForm(false)} className="h-10 px-4 border border-[#e4e7ec] text-sm">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 ? (
                  <p className="text-[#5c6775] py-10 text-center">No saved shipping addresses yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border border-[#e4e7ec] p-4 relative">
                        {addr.is_default && (
                          <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wide bg-[#0f1724] text-white px-2 py-0.5">
                            Default
                          </span>
                        )}
                        <p className="font-semibold text-[#0f1724]">{addr.name}</p>
                        <p className="text-sm text-[#5c6775] mt-1">{addr.phone}</p>
                        {addr.company && <p className="text-sm text-[#5c6775]">{addr.company}</p>}
                        <p className="text-sm text-[#5c6775] mt-2">{addr.address_line1}</p>
                        {addr.address_line2 && <p className="text-sm text-[#5c6775]">{addr.address_line2}</p>}
                        <p className="text-sm text-[#5c6775]">{addr.city}, {addr.state} — {addr.pincode}</p>
                        <div className="flex gap-3 mt-4">
                          {!addr.is_default && (
                            <button type="button" onClick={() => setDefault(addr)} className="text-xs font-semibold text-[#0f1724] underline">
                              Make default
                            </button>
                          )}
                          <button type="button" onClick={() => removeAddress(addr.id)} className="text-xs font-semibold text-[#c41e3a] flex items-center gap-1">
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'profile' && (
              <div>
                <h2 className="font-display text-xl font-bold text-[#0f1724] mb-6">Profile Details</h2>
                <form onSubmit={saveProfile} className="max-w-lg space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label className="text-sm">
                      <span className="block mb-1 text-[#5c6775]">First name</span>
                      <input
                        value={profile.first_name}
                        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                        className="w-full h-11 border border-[#e4e7ec] px-3 focus:outline-none focus:border-[#0f1724]"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="block mb-1 text-[#5c6775]">Last name</span>
                      <input
                        value={profile.last_name}
                        onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                        className="w-full h-11 border border-[#e4e7ec] px-3 focus:outline-none focus:border-[#0f1724]"
                      />
                    </label>
                  </div>
                  <label className="text-sm block">
                    <span className="block mb-1 text-[#5c6775]">Email</span>
                    <input value={user.email} disabled className="w-full h-11 border border-[#e4e7ec] px-3 bg-[#f7f8fa] text-[#5c6775]" />
                  </label>
                  <label className="text-sm block">
                    <span className="block mb-1 text-[#5c6775]">Phone</span>
                    <input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full h-11 border border-[#e4e7ec] px-3 focus:outline-none focus:border-[#0f1724]"
                    />
                  </label>
                  <label className="text-sm block">
                    <span className="block mb-1 text-[#5c6775]">Company</span>
                    <input
                      value={profile.company_name}
                      onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                      className="w-full h-11 border border-[#e4e7ec] px-3 focus:outline-none focus:border-[#0f1724]"
                    />
                  </label>
                  <p className="text-sm text-[#5c6775]">
                    Account type: <strong className="text-[#0f1724]">{user.is_wholesale ? 'Wholesale buyer' : 'Retail'}</strong>
                  </p>
                  <button type="submit" disabled={saving} className="h-11 px-6 bg-[#0f1724] text-white text-sm font-semibold hover:bg-[#c41e3a] transition disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
