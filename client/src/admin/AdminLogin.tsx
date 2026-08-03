import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../lib/adminApi';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { token } = await adminApi.login(email, password);
      localStorage.setItem('admin_token', token);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-6 sm:p-8">
        <h1 className="text-xl font-bold text-center mb-1">Admin Login</h1>
        <p className="text-sm text-gray-500 text-center mb-6">The Denim Forge · thedenimforge.com</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Admin email" className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full h-11 bg-[#1a1a1a] text-white rounded-full font-semibold disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
