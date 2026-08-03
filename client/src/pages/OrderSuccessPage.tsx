import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Package, Banknote } from 'lucide-react';
import { formatPrice } from '../lib/api';
import { useEffect } from 'react';

interface OrderResult {
  order_number: string;
  id: string;
  total_amount: string;
}

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = (location.state as { order?: OrderResult })?.order;

  useEffect(() => {
    if (!order) navigate('/orders');
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-12 sm:py-20 text-center">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle size={36} className="text-green-600" />
      </div>
      <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Order Placed Successfully!</h1>
      <p className="text-sm text-gray-500 mb-6">
        Thank you for your wholesale order. We'll confirm via email shortly.
      </p>

      <div className="bg-[#faf9f7] border border-[#f0f0f0] rounded-2xl p-5 mb-6 text-left">
        <div className="flex items-center gap-3 mb-3">
          <Package size={20} className="text-[#1a1a1a]" />
          <div>
            <p className="text-xs text-gray-400">Order Number</p>
            <p className="font-bold text-lg">{order.order_number}</p>
          </div>
        </div>
        <div className="flex justify-between text-sm pt-3 border-t border-[#e8e8e8]">
          <span className="text-gray-500">Order Total</span>
          <span className="font-bold">{formatPrice(order.total_amount)}</span>
        </div>
        <div className="flex items-start gap-2 mt-4 pt-3 border-t border-[#e8e8e8]">
          <Banknote size={16} className="text-[#0f1724] mt-0.5 shrink-0" />
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong className="text-[#1a1a1a]">Cash on Delivery (COD)</strong> — pay cash when your
            order is delivered. No advance payment needed.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to={`/track-order?order=${encodeURIComponent(order.order_number)}`}
          className="h-11 px-8 bg-[#1a1a1a] text-white rounded-full font-semibold text-sm flex items-center justify-center hover:bg-[#333] transition"
        >
          Track Order
        </Link>
        <Link
          to="/"
          className="h-11 px-8 border border-[#e8e8e8] text-[#1a1a1a] rounded-full font-semibold text-sm flex items-center justify-center hover:border-[#1a1a1a] transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
