import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate(from.startsWith('/') ? from : '/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 bg-[#faf9f7]">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#e8e8e8] p-6 sm:p-8 shadow-sm">
        <h1 className="text-xl font-bold text-[#1a1a1a] text-center mb-1">Welcome Back</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Login to your wholesale account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
          </div>
          {error && <p className="text-sm text-[#e11d48]">{error}</p>}
          <button type="submit" disabled={loading} className="w-full h-11 bg-[#1a1a1a] text-white rounded-full font-semibold hover:bg-[#333] transition disabled:opacity-50">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-sm text-center mt-5 text-gray-500">
          Don't have an account? <Link to="/register" className="text-[#1a1a1a] font-semibold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
