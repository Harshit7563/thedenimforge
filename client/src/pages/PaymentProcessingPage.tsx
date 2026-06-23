import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { formatPrice } from '../lib/api';
import Breadcrumbs from '../components/Breadcrumbs';

const PAYMENT_LABELS: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  upi: 'UPI Payment',
  cheque: 'Cheque',
};

interface ProcessingState {
  payment_method: string;
  total: number;
  subtotal: number;
  totalQty: number;
  shipping: number;
  customer_name: string;
}

export default function PaymentProcessingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = (location.state as ProcessingState | null);

  useEffect(() => {
    if (!data?.payment_method || data.payment_method === 'cod') {
      navigate('/checkout');
    }
  }, [data, navigate]);

  if (!data || data.payment_method === 'cod') return null;

  const paymentLabel = PAYMENT_LABELS[data.payment_method] || data.payment_method;

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-16">
      <Breadcrumbs items={[{ label: 'Checkout', path: '/checkout' }, { label: 'Payment' }]} />

      <div className="text-center mt-6">
        <div className="w-20 h-20 bg-[#faf9f7] border border-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 size={36} className="text-[#1a1a1a] animate-spin" />
        </div>

        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Payment Processing</h1>
        <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
          Your order details are saved. Online payment for <strong>{paymentLabel}</strong> will be
          available soon — our payment gateway is being integrated.
        </p>

        <div className="bg-[#faf9f7] border border-[#f0f0f0] rounded-2xl p-5 mb-6 text-left">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#e8e8e8]">
            <CreditCard size={20} className="text-[#1a1a1a]" />
            <div>
              <p className="text-xs text-gray-400">Payment Method</p>
              <p className="font-semibold">{paymentLabel}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span className="font-medium">{data.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Items</span>
              <span>{data.totalQty} pcs</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatPrice(data.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span>{data.shipping === 0 ? 'FREE' : formatPrice(data.shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t border-[#e8e8e8]">
              <span>Total</span>
              <span>{formatPrice(data.total)}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-8 text-left">
          <p className="text-sm text-amber-900 leading-relaxed">
            <strong>Note:</strong> Order is not placed yet. For immediate orders, choose{' '}
            <strong>Cash on Delivery (COD)</strong> at checkout (min ₹1,000) or contact us at{' '}
            <a href="tel:8424939262" className="text-[#e11d48] font-medium">8424939262</a>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/checkout"
            className="h-11 px-8 bg-[#1a1a1a] text-white rounded-full font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#333] transition"
          >
            <ArrowLeft size={16} /> Back to Checkout
          </Link>
          <Link
            to="/contact"
            className="h-11 px-8 border border-[#e8e8e8] text-[#1a1a1a] rounded-full font-semibold text-sm flex items-center justify-center hover:border-[#1a1a1a] transition"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
