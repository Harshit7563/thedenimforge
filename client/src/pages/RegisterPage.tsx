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
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10 sm:py-14 bg-[#f6f4f0]">
      <div className="w-full max-w-md bg-white border border-[#e8e8e8] p-6 sm:p-10">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[#c8102e] font-semibold text-center mb-2">Wholesale</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-center mb-2">Create account</h1>
        <p className="text-sm text-[#6b6b6b] text-center mb-8">Factory-direct denim pricing for your business</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.14em] block mb-2">First name *</label>
              <input required value={form.first_name} onChange={(e) => update('first_name', e.target.value)} className="field" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-[0.14em] block mb-2">Last name</label>
              <input value={form.last_name} onChange={(e) => update('last_name', e.target.value)} className="field" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.14em] block mb-2">Company</label>
            <input value={form.company_name} onChange={(e) => update('company_name', e.target.value)} className="field" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.14em] block mb-2">Email *</label>
            <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className="field" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.14em] block mb-2">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="8424939262" className="field" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.14em] block mb-2">Password *</label>
            <input type="password" required minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} className="field" />
          </div>
          <label className="flex items-center gap-2.5 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_wholesale} onChange={(e) => update('is_wholesale', e.target.checked)} className="w-4 h-4 accent-[#111]" />
            Register as wholesale buyer
          </label>
          {error && <p className="text-sm text-[#c8102e]">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="text-sm text-center mt-6 text-[#6b6b6b]">
          Already have an account? <Link to="/login" className="text-[#111] font-semibold underline underline-offset-2">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
