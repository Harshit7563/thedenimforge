import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Smartphone, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { api, formatPrice } from '../lib/api';
import Breadcrumbs from '../components/Breadcrumbs';

interface PayState {
  orderId: string;
  orderNumber: string;
  intentUrl: string;
  total: number;
  payment_method: string;
}

function loadStored(): PayState | null {
  try {
    const raw = sessionStorage.getItem('df_pending_payment');
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p.orderId || !p.intentUrl) return null;
    return {
      orderId: p.orderId,
      orderNumber: p.orderNumber,
      intentUrl: p.intentUrl,
      total: Number(p.total || p.amount || 0),
      payment_method: 'upi',
    };
  } catch {
    return null;
  }
}

export default function PaymentProcessingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const fromNav = location.state as PayState | null;
  const data = fromNav?.orderId ? fromNav : loadStored();

  const [phase, setPhase] = useState<'waiting' | 'paid' | 'failed'>('waiting');
  const [gatewayStatus, setGatewayStatus] = useState('PENDING_VBV');
  const [opened, setOpened] = useState(false);

  const qrSrc = useMemo(() => {
    if (!data?.intentUrl) return '';
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(data.intentUrl)}`;
  }, [data?.intentUrl]);

  const openUpi = useCallback(() => {
    if (!data?.intentUrl) return;
    setOpened(true);
    // Mobile browsers open installed UPI apps from upi:// links
    window.location.href = data.intentUrl;
  }, [data?.intentUrl]);

  useEffect(() => {
    if (!data?.orderId) {
      navigate('/checkout');
      return;
    }
    // Auto-open UPI apps on phones
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (mobile && !opened) {
      const t = setTimeout(openUpi, 400);
      return () => clearTimeout(t);
    }
  }, [data, navigate, openUpi, opened]);

  useEffect(() => {
    if (!data?.orderId || phase !== 'waiting') return;

    let cancelled = false;
    const poll = async () => {
      try {
        const s = await api.getPaymentStatus(data.orderId);
        if (cancelled) return;
        if (s.gateway_status) setGatewayStatus(s.gateway_status);
        if (s.payment_status === 'paid') {
          setPhase('paid');
          sessionStorage.removeItem('df_pending_payment');
          setTimeout(() => {
            navigate('/order-success', {
              state: {
                order: {
                  id: data.orderId,
                  order_number: s.order_number || data.orderNumber,
                  total_amount: data.total,
                  payment_method: 'upi',
                },
              },
            });
          }, 800);
        } else if (s.payment_status === 'failed') {
          setPhase('failed');
        }
      } catch {
        /* keep polling */
      }
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [data, navigate, phase]);

  if (!data) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-16">
      <Breadcrumbs items={[{ label: 'Checkout', path: '/checkout' }, { label: 'UPI Payment' }]} />

      <div className="text-center mt-6">
        {phase === 'waiting' && (
          <div className="w-20 h-20 bg-[#faf9f7] border border-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 size={36} className="text-[#1a1a1a] animate-spin" />
          </div>
        )}
        {phase === 'paid' && (
          <div className="w-20 h-20 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-green-700" />
          </div>
        )}
        {phase === 'failed' && (
          <div className="w-20 h-20 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={36} className="text-red-600" />
          </div>
        )}

        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">
          {phase === 'paid' ? 'Payment successful' : phase === 'failed' ? 'Payment failed' : 'Complete UPI payment'}
        </h1>
        <p className="text-sm text-gray-500 mb-2">
          Order <strong>{data.orderNumber}</strong> · {formatPrice(data.total)}
        </p>
        {phase === 'waiting' && (
          <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
            Open your UPI app and pay, or scan the QR on desktop. This page updates automatically when HDFC confirms payment.
          </p>
        )}

        {phase === 'waiting' && (
          <>
            <div className="bg-white border border-[#f0f0f0] rounded-2xl p-5 mb-5 inline-block">
              {qrSrc ? (
                <img src={qrSrc} alt="UPI QR" width={240} height={240} className="mx-auto" />
              ) : (
                <Smartphone size={48} className="mx-auto text-gray-300" />
              )}
              <p className="text-xs text-gray-400 mt-3">Scan with any UPI app</p>
            </div>

            <button
              type="button"
              onClick={openUpi}
              className="h-12 px-8 bg-[#111] text-white rounded-full font-semibold text-sm inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Smartphone size={18} /> Open UPI app
            </button>

            <p className="text-xs text-gray-400 mt-4">Status: {gatewayStatus}</p>
          </>
        )}

        {phase === 'failed' && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link to="/checkout" className="h-11 px-8 bg-[#1a1a1a] text-white rounded-full font-semibold text-sm flex items-center justify-center gap-2">
              <ArrowLeft size={16} /> Try again / COD
            </Link>
            <Link to="/contact" className="h-11 px-8 border border-[#e8e8e8] text-[#1a1a1a] rounded-full font-semibold text-sm flex items-center justify-center">
              Contact Us
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
