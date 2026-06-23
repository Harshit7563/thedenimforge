import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Truck, AlertCircle, X } from 'lucide-react';
import { api, formatPrice, type CartItem } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SafeImage from '../components/SafeImage';
import { FALLBACK_IMAGE } from '../lib/images';
import Breadcrumbs from '../components/Breadcrumbs';

const COD_MIN_AMOUNT = 1000;

const PAYMENT_METHODS = [
  { id: 'bank_transfer', label: 'Bank Transfer (NEFT/RTGS/IMPS)', desc: '50% advance for new buyers' },
  { id: 'upi', label: 'UPI Payment', desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'cheque', label: 'Cheque', desc: 'For established wholesale buyers' },
  { id: 'cod', label: 'Cash on Delivery (COD)', desc: `Pay cash when order arrives · Min order ${formatPrice(COD_MIN_AMOUNT)}`, minAmount: COD_MIN_AMOUNT },
] as const;

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
];

interface ShippingForm {
  name: string;
  company: string;
  phone: string;
  email: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  payment_method: string;
  notes: string;
}

function getImage(images: CartItem['images']) {
  if (Array.isArray(images)) return images[0] || FALLBACK_IMAGE;
  try { return JSON.parse(images as unknown as string)[0] || FALLBACK_IMAGE; } catch { return FALLBACK_IMAGE; }
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { refresh } = useCart();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [disabledPopup, setDisabledPopup] = useState(false);
  const [form, setForm] = useState<ShippingForm>({
    name: '', company: '', phone: '', email: '',
    address_line1: '', address_line2: '', city: '', state: 'Maharashtra',
    pincode: '', payment_method: 'cod', notes: '',
  });

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: '/checkout' } }); return; }
    Promise.all([api.getCart(), api.getMe()])
      .then(([cart, me]) => {
        if (!cart.length) { navigate('/cart'); return; }
        setItems(cart);
        setForm((f) => ({
          ...f,
          name: [me.first_name, me.last_name].filter(Boolean).join(' ') || f.name,
          company: me.company_name || f.company,
          phone: me.phone || f.phone,
          email: me.email || f.email,
        }));
      })
      .catch(() => navigate('/cart'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const set = (key: keyof ShippingForm, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const subtotal = items.reduce((s, i) => s + parseFloat(i.wholesale_price) * i.quantity, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const shipping = subtotal >= 25000 ? 0 : 199;
  const total = subtotal + shipping;
  const codEligible = subtotal >= COD_MIN_AMOUNT;

  useEffect(() => {
    if (codEligible && form.payment_method !== 'cod') {
      setForm((f) => ({ ...f, payment_method: 'cod' }));
    }
  }, [codEligible, form.payment_method]);

  const handlePaymentTap = (methodId: string) => {
    if (methodId === 'cod') {
      if (codEligible) set('payment_method', 'cod');
      return;
    }
    setDisabledPopup(true);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.phone || !form.address_line1 || !form.city || !form.state || !form.pincode) {
      setError('Please fill all required fields.');
      return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      setError('Please enter a valid 6-digit pincode.');
      return;
    }
    if (form.payment_method !== 'cod') {
      setDisabledPopup(true);
      return;
    }
    if (!codEligible) {
      setError(`Cash on Delivery is only available on orders of ${formatPrice(COD_MIN_AMOUNT)} or above.`);
      return;
    }
    setPlacing(true);
    try {
      const order = await api.placeOrder({
        shipping_address: form,
        notes: form.notes || `Payment: ${form.payment_method}`,
      });
      refresh();
      navigate('/order-success', { state: { order } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed. Please try again.');
      setPlacing(false);
    }
  };

  const submitLabel = placing ? 'Placing Order...' : 'Place Order (COD)';

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-400 animate-pulse">Loading checkout...</div>;
  }

  return (
    <div className="pb-28 md:pb-10">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <Breadcrumbs items={[{ label: 'Cart', path: '/cart' }, { label: 'Checkout' }]} />

        <div className="flex items-center gap-2 text-xs mb-6">
          <span className="text-gray-400">Cart</span><span className="text-gray-300">→</span>
          <span className="text-[#1a1a1a] font-semibold">Checkout</span><span className="text-gray-300">→</span>
          <span className="text-gray-400">Confirmation</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">Checkout</h1>
          <Link to="/cart" className="text-sm text-gray-500 hover:text-[#1a1a1a] flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Cart
          </Link>
        </div>

        <form id="checkout-form" onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-5">
            {/* Contact */}
            <section className="bg-white border border-[#f0f0f0] rounded-2xl p-5">
              <h2 className="font-semibold mb-4">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
                  <input required value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Company Name</label>
                  <input value={form.company} onChange={(e) => set('company', e.target.value)} className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Phone *</label>
                  <input required type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
                </div>
              </div>
            </section>

            {/* Shipping */}
            <section className="bg-white border border-[#f0f0f0] rounded-2xl p-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2"><Truck size={18} /> Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Address Line 1 *</label>
                  <input required value={form.address_line1} onChange={(e) => set('address_line1', e.target.value)} placeholder="Shop/Building, Street" className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Address Line 2</label>
                  <input value={form.address_line2} onChange={(e) => set('address_line2', e.target.value)} placeholder="Area, Landmark" className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">City *</label>
                  <input required value={form.city} onChange={(e) => set('city', e.target.value)} className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Pincode *</label>
                  <input required value={form.pincode} onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-gray-600 mb-1 block">State *</label>
                  <select required value={form.state} onChange={(e) => set('state', e.target.value)} className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a] bg-white">
                    {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="bg-white border border-[#f0f0f0] rounded-2xl p-5">
              <h2 className="font-semibold mb-4">Payment Method</h2>
              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => {
                  const isCod = m.id === 'cod';
                  const codDisabled = isCod && !codEligible;
                  const isDisabledMethod = !isCod;

                  return (
                    <div
                      key={m.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handlePaymentTap(m.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handlePaymentTap(m.id)}
                      className={`flex items-start gap-3 p-3 border rounded-xl transition ${
                        codDisabled
                          ? 'border-[#e8e8e8] bg-gray-50 opacity-60 cursor-not-allowed'
                          : isDisabledMethod
                            ? 'border-[#e8e8e8] bg-gray-50/80 opacity-75 cursor-pointer hover:border-gray-300'
                            : form.payment_method === m.id
                              ? 'border-[#1a1a1a] bg-[#faf9f7] cursor-pointer'
                              : 'border-[#e8e8e8] hover:border-gray-300 cursor-pointer'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m.id}
                        checked={form.payment_method === m.id}
                        readOnly
                        disabled={codDisabled || isDisabledMethod}
                        className="mt-1 accent-[#1a1a1a] pointer-events-none"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium flex items-center gap-2">
                          {m.label}
                          {isDisabledMethod && (
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Unavailable</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">{m.desc}</p>
                        {codDisabled && (
                          <p className="text-xs text-[#e11d48] mt-1 font-medium">
                            Add {formatPrice(COD_MIN_AMOUNT - subtotal)} more for COD (min {formatPrice(COD_MIN_AMOUNT)})
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Only Cash on Delivery (COD) is active. Other payment methods coming soon.
              </p>
            </section>

            {/* Notes */}
            <section className="bg-white border border-[#f0f0f0] rounded-2xl p-5">
              <label className="text-sm font-semibold mb-2 block">Order Notes (optional)</label>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} placeholder="Special instructions, GST number, delivery preferences..." className="w-full border border-[#e8e8e8] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1a1a1a] resize-none" />
            </section>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#faf9f7] border border-[#f0f0f0] rounded-2xl p-5 sticky top-28">
              <h2 className="font-semibold mb-4">Your Order ({items.length} items)</h2>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-white">
                      <SafeImage src={getImage(item.images)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-2">{item.name}</p>
                      <p className="text-[10px] text-gray-400">{item.size} · {item.color} · ×{item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold shrink-0">{formatPrice(parseFloat(item.wholesale_price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm border-t border-[#e8e8e8] pt-4">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal ({totalQty} pcs)</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-[#e8e8e8]">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>

              {error && <p className="text-sm text-red-500 mt-3">{error}</p>}

              <button
                type="submit"
                disabled={placing || !codEligible}
                className="w-full mt-5 h-12 bg-[#1a1a1a] text-white rounded-full font-semibold hover:bg-[#333] transition disabled:opacity-50 hidden md:flex items-center justify-center gap-2"
              >
                {submitLabel}
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-3 hidden md:flex items-center justify-center gap-1">
                <ShieldCheck size={12} /> By placing order you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Mobile sticky */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[#e8e8e8] px-4 py-3 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Total ({totalQty} pcs)</p>
            <p className="text-xl font-bold text-[#1a1a1a]">{formatPrice(total)}</p>
          </div>
          <button type="submit" form="checkout-form" disabled={placing || !codEligible} className="flex-1 max-w-[200px] h-11 bg-[#1a1a1a] text-white rounded-full font-semibold text-sm disabled:opacity-50">
            {submitLabel}
          </button>
        </div>
      </div>

      {/* Disabled payment popup */}
      {disabledPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDisabledPopup(false)}>
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDisabledPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#1a1a1a]"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-[#1a1a1a] text-center mb-2">Function Disabled</h3>
            <p className="text-sm text-gray-600 text-center leading-relaxed mb-6">
              This function is disabled due to technical reasons. Please use{' '}
              <strong>Cash on Delivery (COD)</strong> to place your order.
            </p>
            <button
              type="button"
              onClick={() => setDisabledPopup(false)}
              className="w-full h-11 bg-[#1a1a1a] text-white rounded-full font-semibold text-sm hover:bg-[#333] transition"
            >
              OK, Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
