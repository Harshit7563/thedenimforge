import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { api, formatPrice, type CartItem } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SafeImage from '../components/SafeImage';
import { FALLBACK_IMAGE } from '../lib/images';

function getImage(images: CartItem['images']) {
  if (Array.isArray(images)) return images[0] || FALLBACK_IMAGE;
  try { return JSON.parse(images as unknown as string)[0] || FALLBACK_IMAGE; } catch { return FALLBACK_IMAGE; }
}

export default function CartPage() {
  const { user } = useAuth();
  const { refresh } = useCart();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login', { state: { from: '/cart' } }); return; }
    api.getCart().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, [user, navigate]);

  const remove = async (id: string) => {
    await api.removeFromCart(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    refresh();
  };

  const subtotal = items.reduce((s, i) => s + parseFloat(i.wholesale_price) * i.quantity, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const shipping = subtotal >= 25000 ? 0 : 199;
  const total = subtotal + shipping;

  if (loading) {
    return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-gray-400 animate-pulse">Loading cart...</div>;
  }

  if (!items.length) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 text-center">
        <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
        <h1 className="text-xl font-bold text-[#1a1a1a] mb-2">Your Cart is Empty</h1>
        <p className="text-sm text-gray-500 mb-6">Browse our wholesale denim collection and add items.</p>
        <Link to="/" className="inline-block bg-[#1a1a1a] text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#333] transition">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-28 md:pb-10">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <span className="text-[#1a1a1a] font-medium">Cart</span>
          <span>→</span>
          <span>Checkout</span>
          <span>→</span>
          <span>Confirmation</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] mb-1">Shopping Cart</h1>
        <p className="text-sm text-gray-500 mb-6">{items.length} styles · {totalQty} pieces</p>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3 sm:gap-4 border border-[#f0f0f0] rounded-2xl p-3 sm:p-4 bg-white">
                <Link to={`/product/${item.slug}`} className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-[#f5f5f5]">
                  <SafeImage src={getImage(item.images)} alt={item.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.slug}`} className="font-medium text-sm sm:text-base text-[#1a1a1a] hover:text-[#e11d48] line-clamp-2 leading-snug">
                    {item.name}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1.5">Size {item.size} · {item.color}</p>
                  <p className="text-xs text-gray-400">Qty {item.quantity} · {formatPrice(item.wholesale_price)}/pc</p>
                  <p className="text-base font-bold text-[#1a1a1a] mt-1.5">
                    {formatPrice(parseFloat(item.wholesale_price) * item.quantity)}
                  </p>
                </div>
                <button type="button" onClick={() => remove(item.id)} className="text-gray-300 hover:text-[#e11d48] self-start p-1" aria-label="Remove">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#faf9f7] border border-[#f0f0f0] rounded-2xl p-5 sticky top-28">
              <h2 className="font-semibold text-[#1a1a1a] mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal ({totalQty} pcs)</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                {subtotal < 25000 && <p className="text-xs text-green-600">Free shipping on orders above ₹25,000</p>}
                <div className="flex justify-between pt-3 border-t border-[#e8e8e8] font-bold text-base">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="w-full mt-5 h-12 bg-[#1a1a1a] text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[#333] transition"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <ShieldCheck size={12} /> Secure wholesale checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[#e8e8e8] px-4 py-3 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500">Total ({totalQty} pcs)</p>
            <p className="text-xl font-bold text-[#1a1a1a]">{formatPrice(total)}</p>
          </div>
          <button type="button" onClick={() => navigate('/checkout')} className="flex-1 max-w-[200px] h-11 bg-[#1a1a1a] text-white rounded-full font-semibold text-sm">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
