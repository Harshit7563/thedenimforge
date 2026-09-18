import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Smartphone, ArrowLeft, CheckCircle2, XCircle, ShieldCheck } from 'lucide-react';
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

function friendlyStatus(code: string): string {
  const s = (code || '').toUpperCase();
  if (s === 'CHARGED') return 'Payment received';
  if (s.includes('FAIL') || s.includes('DECLINED')) return 'Payment failed';
  if (s === 'PENDING_VBV' || s === 'PENDING' || s === 'NEW' || s === 'AUTHORIZING') {
    return 'Waiting for payment…';
  }
  return 'Confirming with bank…';
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
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(data.intentUrl)}`;
  }, [data?.intentUrl]);

  const openUpi = useCallback(() => {
    if (!data?.intentUrl) return;
    setOpened(true);
    window.location.href = data.intentUrl;
  }, [data?.intentUrl]);

  useEffect(() => {
    if (!data?.orderId) {
      navigate('/checkout');
      return;
    }
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (mobile && !opened) {
      const t = setTimeout(openUpi, 500);
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
          }, 900);
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
    <div className="min-h-[70vh] bg-[#f6f4f0]">
      <div className="max-w-md mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs items={[{ label: 'Checkout', path: '/checkout' }, { label: 'UPI Payment' }]} />

        <div className="mt-5 bg-white border border-[#e8e8e8] overflow-hidden">
          {/* HDFC brand strip */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#f0f0f0] bg-white">
            <img
              src="/images/payments/hdfc-logo.svg"
              alt="HDFC Bank"
              className="w-11 h-11 rounded-lg border border-[#e8e8e8] object-contain bg-white"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#1a1a1a]">UPI by HDFC</p>
              <p className="text-xs font-medium text-[#004c8f]">HDFC Bank SmartGateway</p>
            </div>
            {phase === 'waiting' && (
              <Loader2 size={18} className="ml-auto text-[#6b6b6b] animate-spin shrink-0" />
            )}
            {phase === 'paid' && (
              <CheckCircle2 size={20} className="ml-auto text-green-600 shrink-0" />
            )}
            {phase === 'failed' && (
              <XCircle size={20} className="ml-auto text-red-600 shrink-0" />
            )}
          </div>

          <div className="px-5 pt-6 pb-7 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6b6b6b] mb-2">
              {phase === 'paid' ? 'Payment complete' : phase === 'failed' ? 'Payment failed' : 'Complete payment'}
            </p>
            <h1 className="font-display text-2xl sm:text-[1.75rem] font-bold text-[#111] tracking-tight">
              {formatPrice(data.total)}
            </h1>
            <p className="text-sm text-[#6b6b6b] mt-1.5">
              Order <span className="font-semibold text-[#111]">{data.orderNumber}</span>
            </p>

            {phase === 'waiting' && (
              <>
                <p className="text-sm text-[#5c6775] mt-4 max-w-xs mx-auto leading-relaxed">
                  Scan the QR with any UPI app, or tap below to open GPay / PhonePe / Paytm.
                </p>

                <div className="mt-6 mx-auto w-fit border border-[#e8e8e8] bg-[#faf9f7] p-4">
                  {qrSrc ? (
                    <img
                      src={qrSrc}
                      alt="UPI payment QR"
                      width={260}
                      height={260}
                      className="block mx-auto bg-white"
                    />
                  ) : (
                    <div className="w-[260px] h-[260px] flex items-center justify-center">
                      <Smartphone size={40} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-[#8a8a8a] mt-2.5">Scan with any UPI app</p>

                <button
                  type="button"
                  onClick={openUpi}
                  className="mt-5 w-full h-12 bg-[#111] text-white text-xs font-bold uppercase tracking-[0.14em] inline-flex items-center justify-center gap-2 hover:bg-[#333] transition"
                >
                  <Smartphone size={16} /> Open UPI app
                </button>

                <div className="mt-5 flex items-center justify-center gap-2 text-sm text-[#111]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8102e] opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c8102e]" />
                  </span>
                  <span className="font-medium">{friendlyStatus(gatewayStatus)}</span>
                </div>
                <p className="text-[11px] text-[#8a8a8a] mt-1.5">
                  Page updates automatically after you pay
                </p>

                <ol className="mt-6 text-left space-y-2 border-t border-[#f0f0f0] pt-5">
                  {[
                    'Open UPI app or scan QR',
                    'Confirm ₹ amount and pay',
                    'Wait here — we detect payment',
                  ].map((step, i) => (
                    <li key={step} className="flex items-start gap-3 text-xs text-[#5c6775]">
                      <span className="w-5 h-5 rounded-full bg-[#111] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </>
            )}

            {phase === 'paid' && (
              <div className="mt-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-3">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <p className="text-sm text-[#5c6775]">Redirecting to order confirmation…</p>
              </div>
            )}

            {phase === 'failed' && (
              <div className="mt-6 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-red-50 flex items-center justify-center">
                  <XCircle size={32} className="text-red-600" />
                </div>
                <p className="text-sm text-[#5c6775]">
                  Payment nahi hua. Dubara try karo ya COD choose karo.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    to="/checkout"
                    className="h-11 w-full bg-[#111] text-white text-xs font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={14} /> Back to checkout
                  </Link>
                  <Link
                    to="/contact"
                    className="h-11 w-full border border-[#e8e8e8] text-[#111] text-xs font-bold uppercase tracking-[0.14em] flex items-center justify-center"
                  >
                    Contact us
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="px-5 py-3 border-t border-[#f0f0f0] bg-[#faf9f7] flex items-center justify-center gap-1.5 text-[10px] text-[#6b6b6b]">
            <ShieldCheck size={12} className="text-[#004c8f]" />
            Secured by HDFC Bank SmartGateway
          </div>
        </div>
      </div>
    </div>
  );
}
