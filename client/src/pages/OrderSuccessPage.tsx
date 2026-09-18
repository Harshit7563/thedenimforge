import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Banknote, ShieldCheck } from 'lucide-react';
import { formatPrice } from '../lib/api';
import { useEffect, useState } from 'react';

interface OrderResult {
  order_number: string;
  id?: string;
  total_amount: string | number;
  payment_method?: string;
}

/**
 * Bank UAT requirement (HDFC):
 * Response page must show in real-time:
 * 1) Order number (HDFC order ID)
 * 2) Amount
 * 3) Success message
 */
export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fromState = (location.state as { order?: OrderResult })?.order;

  const order: OrderResult | null = fromState || (params.get('order')
    ? {
        order_number: String(params.get('order') || '').toUpperCase(),
        total_amount: params.get('amount') || '',
        payment_method: params.get('method') || 'upi',
      }
    : null);

  const [ready, setReady] = useState(Boolean(order?.order_number));

  useEffect(() => {
    if (!order?.order_number) {
      navigate('/orders');
      return;
    }
    setReady(true);
  }, [order, navigate]);

  if (!ready || !order) return null;

  const isUpi = order.payment_method === 'upi' || params.get('method') === 'upi';
  const amountNum = Number(order.total_amount);
  const amountLabel = Number.isFinite(amountNum) && amountNum > 0
    ? formatPrice(amountNum.toFixed(2))
    : formatPrice(order.total_amount);

  return (
    <div className="min-h-[70vh] bg-[#f6f4f0]">
      <div className="max-w-lg mx-auto px-4 py-12 sm:py-16 text-center">
        <div className="bg-white border border-[#e8e8e8] overflow-hidden">
          <div className="bg-green-600 text-white px-5 py-4">
            <div className="w-14 h-14 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">Payment Successful</h1>
            <p className="text-sm text-white/90 mt-1">
              {isUpi ? 'Your UPI payment has been received successfully.' : 'Your order has been placed successfully.'}
            </p>
          </div>

          <div className="p-5 sm:p-6 text-left space-y-4">
            <div className="flex items-start gap-3 border border-[#e8e8e8] p-4 bg-[#faf9f7]">
              <Package size={20} className="text-[#111] mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b6b6b]">Order Number</p>
                <p className="font-bold text-lg text-[#111] tracking-wide" data-testid="order-number">
                  {order.order_number}
                </p>
                {isUpi && (
                  <p className="text-[11px] text-[#004c8f] mt-0.5">HDFC SmartGateway Order ID</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 border border-[#e8e8e8] p-4 bg-[#faf9f7]">
              <Banknote size={20} className="text-[#111] mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b6b6b]">Amount</p>
                <p className="font-bold text-lg text-[#111]" data-testid="order-amount">
                  {amountLabel}
                </p>
                <p className="text-[11px] text-[#6b6b6b] mt-0.5">INR · paid {isUpi ? 'via UPI' : 'as COD'}</p>
              </div>
            </div>

            <div className="border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-800" data-testid="success-message">
                Success — Transaction completed.
              </p>
              <p className="text-xs text-green-700 mt-1 leading-relaxed">
                {isUpi
                  ? 'Payment confirmed in real-time through HDFC Bank SmartGateway.'
                  : 'Thank you for your wholesale order. We will confirm shortly.'}
              </p>
            </div>

            {isUpi && (
              <div className="flex items-center gap-2 text-[11px] text-[#6b6b6b]">
                <ShieldCheck size={14} className="text-[#004c8f]" />
                Secured by HDFC Bank SmartGateway · Merchant SG6133
              </div>
            )}
          </div>

          <div className="px-5 pb-5 flex flex-col sm:flex-row gap-2">
            <Link
              to={`/track-order?order=${encodeURIComponent(order.order_number)}`}
              className="h-11 flex-1 bg-[#111] text-white text-xs font-bold uppercase tracking-[0.14em] flex items-center justify-center"
            >
              Track Order
            </Link>
            <Link
              to="/"
              className="h-11 flex-1 border border-[#e8e8e8] text-[#111] text-xs font-bold uppercase tracking-[0.14em] flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
