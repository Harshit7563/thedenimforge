import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', password: '', first_name: '', last_name: '', phone: '', company_name: '', is_wholesale: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
    setLoading(false);
  };

  const update = (key: string, value: string | boolean) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-10 sm:py-12 bg-[#faf9f7]">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#e8e8e8] p-5 sm:p-8 shadow-sm">
        <h1 className="text-xl font-bold text-[#1a1a1a] text-center mb-1">Create Wholesale Account</h1>
        <p className="text-sm text-gray-500 text-center mb-6">Factory-direct denim pricing for your business</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">First Name *</label>
              <input required value={form.first_name} onChange={(e) => update('first_name', e.target.value)} className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Last Name</label>
              <input value={form.last_name} onChange={(e) => update('last_name', e.target.value)} className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Company Name</label>
            <input value={form.company_name} onChange={(e) => update('company_name', e.target.value)} className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Email *</label>
            <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="8424939262" className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Password *</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} className="w-full h-11 border border-[#e8e8e8] rounded-lg px-4 text-sm focus:outline-none focus:border-[#1a1a1a]" />
          </div>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_wholesale} onChange={(e) => update('is_wholesale', e.target.checked)} className="w-4 h-4 accent-[#1a1a1a]" />
            Register as wholesale buyer
          </label>
          {error && <p className="text-sm text-[#e11d48]">{error}</p>}
          <button type="submit" disabled={loading} className="w-full h-11 bg-[#1a1a1a] text-white rounded-full font-semibold hover:bg-[#333] transition disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-sm text-center mt-5 text-gray-500">
          Already have an account? <Link to="/login" className="text-[#1a1a1a] font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
