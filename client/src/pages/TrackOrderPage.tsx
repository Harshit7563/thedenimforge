import { useEffect, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Truck, Search, Package } from 'lucide-react';
import { api, formatPrice, type OrderDetail } from '../lib/api';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function TrackOrderPage() {
  const [params] = useSearchParams();
  const [trackNo, setTrackNo] = useState(params.get('order') || '');
  const [tracked, setTracked] = useState<OrderDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const runTrack = async (orderNumber: string) => {
    setError('');
    setTracked(null);
    setLoading(true);
    try {
      const data = await api.trackOrder(orderNumber.trim());
      setTracked(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found');
    }
    setLoading(false);
  };

  useEffect(() => {
    const q = params.get('order');
    if (q) runTrack(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleTrack = (e: FormEvent) => {
    e.preventDefault();
    if (!trackNo.trim()) return;
    runTrack(trackNo);
  };

  const statusIndex = (status: string) => {
    const i = STATUS_STEPS.indexOf(status);
    return i >= 0 ? i : 0;
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 sm:py-14">
      <nav className="text-xs text-[#5c6775] mb-6">
        <Link to="/" className="hover:text-[#0f1724]">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-[#0f1724]">Track Order</span>
      </nav>

      <div className="flex items-center gap-3 mb-2">
        <Truck className="text-[#c41e3a]" size={26} />
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0f1724]">Track Order</h1>
      </div>
      <p className="text-sm text-[#5c6775] mb-8">
        Enter your order number (e.g. DF…) to see live status. No login required.
      </p>

      <form onSubmit={handleTrack} className="flex gap-2 mb-8">
        <input
          value={trackNo}
          onChange={(e) => setTrackNo(e.target.value.toUpperCase())}
          placeholder="Order number"
          className="flex-1 h-12 border border-[#e4e7ec] rounded-xl px-4 text-sm font-medium focus:outline-none focus:border-[#0f1724]"
        />
        <button
          type="submit"
          disabled={loading}
          className="h-12 px-5 bg-[#0f1724] text-white rounded-xl font-semibold text-sm inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Search size={16} /> {loading ? '…' : 'Track'}
        </button>
      </form>

      {error && <p className="text-sm text-[#c41e3a] mb-4">{error}</p>}

      {tracked && (
        <div className="border border-[#e4e7ec] bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3 mb-4">
            <Package size={22} className="text-[#0f1724] mt-0.5" />
            <div>
              <p className="text-xs text-[#5c6775]">Order Number</p>
              <p className="font-bold text-lg text-[#0f1724]">{tracked.order_number}</p>
              <p className="text-sm text-[#5c6775] mt-1">
                Total {formatPrice(tracked.total_amount)} ·{' '}
                <span className="font-semibold text-[#0f1724]">
                  {STATUS_LABEL[tracked.status] || tracked.status}
                </span>
              </p>
            </div>
          </div>

          {tracked.status === 'cancelled' ? (
            <p className="text-sm text-[#c41e3a] font-semibold">Order cancelled</p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2 mb-5">
              {STATUS_STEPS.map((s, i) => {
                const current = statusIndex(tracked.status);
                return (
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
                  </div>
                );
              })}
            </div>
          )}

          {tracked.items?.length > 0 && (
            <div className="border-t border-[#e4e7ec] pt-4 space-y-2">
              {tracked.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm gap-3">
                  <span className="text-[#5c6775]">
                    {item.product_name}
                    {item.size ? ` · Size ${item.size}` : ''} ×{item.quantity}
                  </span>
                  <span className="font-medium shrink-0">{formatPrice(item.unit_price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-[#5c6775] mt-8">
        Have an account?{' '}
        <Link to="/login" className="text-[#c41e3a] font-semibold hover:underline">
          Login
        </Link>{' '}
        to view full order history.
      </p>
    </div>
  );
}
