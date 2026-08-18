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
    return <div className="max-w-5xl mx-auto px-4 py-20 text-center text-[#8a8a8a]">Loading bag…</div>;
  }

  if (!items.length) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 text-center">
        <ShoppingBag size={48} className="mx-auto text-[#ddd] mb-4" />
        <h1 className="font-display text-3xl font-bold mb-2">Your bag is empty</h1>
        <p className="text-sm text-[#6b6b6b] mb-6">Browse wholesale denim and add styles to your bag.</p>
        <Link to="/" className="btn-primary">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="pb-28 lg:pb-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#6b6b6b] mb-2">Bag → Checkout → Done</p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-1">Shopping bag</h1>
        <p className="text-sm text-[#6b6b6b] mb-8">{items.length} styles · {totalQty} pieces</p>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 divide-y divide-[#e8e8e8] border-y border-[#e8e8e8]">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 py-5">
                <Link to={`/product/${item.slug}`} className="w-24 h-32 sm:w-28 sm:h-36 overflow-hidden shrink-0 bg-[#efece6]">
                  <SafeImage src={getImage(item.images)} alt={item.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.slug}`} className="font-medium text-sm sm:text-base hover:underline line-clamp-2">
                    {item.name}
                  </Link>
                  <p className="text-xs text-[#6b6b6b] mt-2">Size {item.size} · Qty {item.quantity}</p>
                  <p className="text-sm mt-1">{formatPrice(item.wholesale_price)} / pc</p>
                  <p className="text-base font-bold mt-2">
                    {formatPrice(parseFloat(item.wholesale_price) * item.quantity)}
                  </p>
                </div>
                <button type="button" onClick={() => remove(item.id)} className="text-[#aaa] hover:text-[#c8102e] self-start p-1" aria-label="Remove">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div>
            <div className="bg-[#f6f4f0] p-6 sticky top-32">
              <h2 className="font-display text-xl font-bold mb-4">Order summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#6b6b6b]">Subtotal ({totalQty} pcs)</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-[#6b6b6b]">Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
                {subtotal < 25000 && <p className="text-xs text-[#1a7a3a]">Free shipping above ₹25,000</p>}
                <div className="flex justify-between pt-3 border-t border-[#e0ddd6] font-bold text-base">
                  <span>Total</span><span>{formatPrice(total)}</span>
                </div>
              </div>
              <button type="button" onClick={() => navigate('/checkout')} className="btn-primary w-full mt-6">
                Checkout <ArrowRight size={16} className="ml-1" />
              </button>
              <p className="text-[10px] text-[#8a8a8a] text-center mt-3 flex items-center justify-center gap-1 uppercase tracking-[0.12em]">
                <ShieldCheck size={12} /> Secure checkout
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-[#e8e8e8] px-4 py-3 safe-bottom">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#6b6b6b]">Total</p>
            <p className="text-xl font-bold">{formatPrice(total)}</p>
          </div>
          <button type="button" onClick={() => navigate('/checkout')} className="flex-1 max-w-[200px] h-12 bg-[#111] text-white text-xs font-bold uppercase tracking-[0.16em]">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
