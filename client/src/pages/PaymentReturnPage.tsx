import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

/**
 * Landing page after HDFC return_url redirect.
 * Server already synced status at /api/payments/return; we confirm + send user to success.
 */
export default function PaymentReturnPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const orderNumber = (params.get('order_id') || '').toUpperCase();
  const [status, setStatus] = useState<'checking' | 'paid' | 'pending' | 'failed'>('checking');

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!orderNumber) {
        setStatus('failed');
        return;
      }

      // Prefer pending payment session (has internal UUID)
      try {
        const raw = sessionStorage.getItem('df_pending_payment');
        if (raw && user) {
          const pending = JSON.parse(raw);
          if (pending.orderId) {
            for (let i = 0; i < 8; i += 1) {
              const s = await api.getPaymentStatus(pending.orderId);
              if (cancelled) return;
              if (s.payment_status === 'paid') {
                sessionStorage.removeItem('df_pending_payment');
                setStatus('paid');
                navigate('/order-success', {
                  replace: true,
                  state: {
                    order: {
                      id: pending.orderId,
                      order_number: s.order_number || orderNumber,
                      total_amount: pending.total,
                      payment_method: 'upi',
                    },
                  },
                });
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

      // Track by order number (public)
      try {
        const tracked = await api.trackOrder(orderNumber);
        if (cancelled) return;
        if (tracked.payment_status === 'paid') {
          setStatus('paid');
          navigate('/order-success', {
            replace: true,
            state: {
              order: {
                order_number: tracked.order_number,
                total_amount: tracked.total_amount,
                payment_method: 'upi',
              },
            },
          });
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

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {status === 'checking' && (
        <>
          <Loader2 className="mx-auto mb-4 animate-spin text-[#111]" size={36} />
          <h1 className="text-xl font-bold mb-2">Confirming payment…</h1>
          <p className="text-sm text-gray-500">Order {orderNumber || '—'}</p>
        </>
      )}
      {status === 'paid' && (
        <>
          <CheckCircle2 className="mx-auto mb-4 text-green-700" size={36} />
          <h1 className="text-xl font-bold mb-2">Payment received</h1>
        </>
      )}
      {status === 'pending' && (
        <>
          <Loader2 className="mx-auto mb-4 animate-spin text-[#111]" size={36} />
          <h1 className="text-xl font-bold mb-2">Payment still processing</h1>
          <p className="text-sm text-gray-500 mb-6">
            If you completed UPI, wait a minute then check Orders. Status updates via HDFC callback.
          </p>
          <Link to="/orders" className="inline-flex h-11 px-6 bg-[#111] text-white text-sm font-semibold items-center">
            View orders
          </Link>
        </>
      )}
      {status === 'failed' && (
        <>
          <XCircle className="mx-auto mb-4 text-red-600" size={36} />
          <h1 className="text-xl font-bold mb-2">Payment not confirmed</h1>
          <Link to="/checkout" className="inline-flex h-11 px-6 bg-[#111] text-white text-sm font-semibold items-center mt-4">
            Back to checkout
          </Link>
        </>
      )}
    </div>
  );
}
