import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, Package, Banknote } from 'lucide-react';
import { api, formatPrice } from '../lib/api';
import { useAuth } from '../context/AuthContext';

/**
 * HDFC return_url landing — bank UAT requires real-time display of:
 * Order number, Amount, Success message.
 */
export default function PaymentReturnPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orderNumber = (params.get('order_id') || params.get('orderId') || '').toUpperCase();
  const [status, setStatus] = useState<'checking' | 'paid' | 'pending' | 'failed'>('checking');
  const [amount, setAmount] = useState<string | number>('');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!orderNumber) {
        setStatus('failed');
        return;
      }

      try {
        const raw = sessionStorage.getItem('df_pending_payment');
        if (raw && user) {
          const pending = JSON.parse(raw);
          if (pending.orderId) {
            if (pending.total) setAmount(pending.total);
            for (let i = 0; i < 10; i += 1) {
              const s = await api.getPaymentStatus(pending.orderId);
              if (cancelled) return;
              if (s.amount) setAmount(s.amount);
              if (s.payment_status === 'paid') {
                sessionStorage.removeItem('df_pending_payment');
                setStatus('paid');
                const amt = s.amount || pending.total;
                setTimeout(() => {
                  navigate(
                    `/order-success?order=${encodeURIComponent(s.order_number || orderNumber)}&amount=${encodeURIComponent(String(amt || ''))}&method=upi`,
                    {
                      replace: true,
                      state: {
                        order: {
                          id: pending.orderId,
                          order_number: s.order_number || orderNumber,
                          total_amount: amt,
                          payment_method: 'upi',
                        },
                      },
                    }
                  );
                }, 2500);
                return;
              }
              if (s.payment_status === 'failed') {
                setStatus('failed');
                return;
              }
              await new Promise((r) => setTimeout(r, 1500));
            }
            setStatus('pending');
            return;
          }
        }
      } catch {
        /* fall through */
      }

      try {
        const tracked = await api.trackOrder(orderNumber);
        if (cancelled) return;
        setAmount(tracked.total_amount);
        if (tracked.payment_status === 'paid') {
          setStatus('paid');
          setTimeout(() => {
            navigate(
              `/order-success?order=${encodeURIComponent(tracked.order_number)}&amount=${encodeURIComponent(String(tracked.total_amount || ''))}&method=upi`,
              {
                replace: true,
                state: {
                  order: {
                    order_number: tracked.order_number,
                    total_amount: tracked.total_amount,
                    payment_method: 'upi',
                  },
                },
              }
            );
          }, 2500);
          return;
        }
        if (tracked.payment_status === 'failed' || tracked.status === 'cancelled') {
          setStatus('failed');
          return;
        }
        setStatus('pending');
      } catch {
        setStatus('pending');
      }
    }

    run();
    return () => { cancelled = true; };
  }, [orderNumber, navigate, user]);

  const amountLabel = amount !== '' && amount != null
    ? formatPrice(Number(amount).toFixed(2))
    : '—';

  return (
    <div className="min-h-[70vh] bg-[#f6f4f0]">
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <div className="bg-white border border-[#e8e8e8] p-6">
          {status === 'checking' && (
            <>
              <Loader2 className="mx-auto mb-4 animate-spin text-[#111]" size={36} />
              <h1 className="text-xl font-bold mb-2">Confirming payment…</h1>
            </>
          )}

          {status === 'paid' && (
            <>
              <div className="bg-green-600 text-white -mx-6 -mt-6 px-6 py-5 mb-5">
                <CheckCircle2 className="mx-auto mb-2" size={36} />
                <h1 className="text-xl font-bold">Payment Successful</h1>
                <p className="text-sm text-white/90 mt-1">Success — Transaction completed.</p>
              </div>
            </>
          )}

          {status === 'pending' && (
            <>
              <Loader2 className="mx-auto mb-4 animate-spin text-[#111]" size={36} />
              <h1 className="text-xl font-bold mb-2">Payment still processing</h1>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="mx-auto mb-4 text-red-600" size={36} />
              <h1 className="text-xl font-bold mb-2">Payment not confirmed</h1>
            </>
          )}

          {/* Bank-required fields always visible when order id known */}
          <div className="text-left space-y-3 mt-2">
            <div className="border border-[#e8e8e8] p-3 flex gap-3 bg-[#faf9f7]">
              <Package size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#6b6b6b] font-semibold">Order Number</p>
                <p className="font-bold text-[#111]">{orderNumber || '—'}</p>
              </div>
            </div>
            <div className="border border-[#e8e8e8] p-3 flex gap-3 bg-[#faf9f7]">
              <Banknote size={18} className="shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-[#6b6b6b] font-semibold">Amount</p>
                <p className="font-bold text-[#111]">{amountLabel}</p>
              </div>
            </div>
            {status === 'paid' && (
              <p className="text-sm font-semibold text-green-800 bg-green-50 border border-green-200 p-3">
                Success message: Payment successful. Thank you.
              </p>
            )}
          </div>

          {status === 'pending' && (
            <Link to="/orders" className="inline-flex h-11 px-6 bg-[#111] text-white text-sm font-semibold items-center mt-6">
              View orders
            </Link>
          )}
          {status === 'failed' && (
            <Link to="/checkout" className="inline-flex h-11 px-6 bg-[#111] text-white text-sm font-semibold items-center mt-6">
              Back to checkout
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
