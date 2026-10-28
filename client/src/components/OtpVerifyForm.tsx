import { useState } from 'react';

type Props = {
  email: string;
  loading: boolean;
  error: string;
  info?: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
};

export default function OtpVerifyForm({ email, loading, error, info, onVerify, onResend, onBack }: Props) {
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onVerify(otp.trim());
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await onResend();
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-[#6b6b6b] text-center">
        Enter the 6-digit code sent to <span className="text-[#111] font-semibold">{email}</span>
      </p>
      <div>
        <label className="text-xs font-bold uppercase tracking-[0.14em] block mb-2">OTP</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="field text-center text-2xl tracking-[0.4em] font-semibold"
          placeholder="••••••"
          autoFocus
        />
      </div>
      {info && <p className="text-sm text-[#2d6a4f]">{info}</p>}
      {error && <p className="text-sm text-[#c8102e]">{error}</p>}
      <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full">
        {loading ? 'Verifying…' : 'Verify OTP'}
      </button>
      <div className="flex items-center justify-between gap-3 text-sm">
        <button type="button" onClick={onBack} className="text-[#6b6b6b] hover:text-[#111] underline underline-offset-2">
          Back
        </button>
        <button
          type="button"
          disabled={resending || loading}
          onClick={handleResend}
          className="text-[#111] font-semibold underline underline-offset-2 disabled:opacity-50"
        >
          {resending ? 'Sending…' : 'Resend OTP'}
        </button>
      </div>
    </form>
  );
}
