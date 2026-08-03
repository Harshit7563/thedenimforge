import { useState } from 'react';
import { api } from '../lib/api';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.subscribeNewsletter(email);
      setMsg('Thank you for subscribing!');
      setEmail('');
    } catch {
      setMsg('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <section className="border-t border-[#e4e7ec] bg-white py-14 sm:py-16">
      <div className="max-w-xl mx-auto px-4 text-center">
        <p className="text-[11px] tracking-[0.28em] uppercase text-[#c41e3a] font-semibold mb-3">Newsletter</p>
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#0f1724] mb-3">
          Stay ahead of the drop
        </h3>
        <p className="text-sm text-[#5c6775] mb-7 leading-relaxed">
          Wholesale offers and new denim arrivals, straight to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-12 border border-[#e4e7ec] px-4 text-sm bg-[#f7f8fa] focus:outline-none focus:border-[#0f1724] focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-[#0f1724] text-white px-8 text-sm font-semibold hover:bg-[#c41e3a] transition disabled:opacity-50 shrink-0"
          >
            {loading ? 'Sending...' : 'Subscribe'}
          </button>
        </form>
        {msg && <p className="text-sm text-green-700 mt-3">{msg}</p>}
      </div>
    </section>
  );
}
