import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OtpVerifyForm from '../components/OtpVerifyForm';

export default function LoginPage() {
  const { sendLoginOtp, verifyLoginOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from || '/account';

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const res = await sendLoginOtp(email, password);
      setInfo(res.message);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
    setLoading(false);
  };

  const handleVerify = async (otp: string) => {
    setLoading(true);
    setError('');
    try {
      await verifyLoginOtp(email, otp);
      navigate(from.startsWith('/') ? from : '/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setError('');
    const res = await sendLoginOtp(email, password);
    setInfo(res.message);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-[#f6f4f0]">
      <div className="w-full max-w-md bg-white border border-[#e8e8e8] p-6 sm:p-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#c8102e] font-semibold text-center mb-2">Account</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-center mb-2">
          {step === 'form' ? 'Sign in' : 'Verify email'}
        </h1>
        <p className="text-sm text-[#6b6b6b] text-center mb-8">
          {step === 'form' ? 'Login to your wholesale account' : 'We sent a one-time code to your email'}
        </p>

        {step === 'form' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.14em] block mb-2">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.14em] block mb-2">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" />
            </div>
            {error && <p className="text-sm text-[#c8102e]">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending OTP…' : 'Continue'}
            </button>
          </form>
        ) : (
          <OtpVerifyForm
            email={email}
            loading={loading}
            error={error}
            info={info}
            onVerify={handleVerify}
            onResend={handleResend}
            onBack={() => {
              setStep('form');
              setError('');
              setInfo('');
            }}
          />
        )}

        <p className="text-sm text-center mt-6 text-[#6b6b6b]">
          New here? <Link to="/register" className="text-[#111] font-semibold underline underline-offset-2">Create account</Link>
        </p>
      </div>
    </div>
  );
}
