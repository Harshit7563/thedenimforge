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
    <section className="bg-[#f6f4f0] py-14 sm:py-20">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <p className="text-[11px] tracking-[0.28em] uppercase text-[#c8102e] font-semibold mb-3">Stay in the loop</p>
        <h3 className="font-display text-3xl sm:text-5xl font-bold text-[#111] mb-3">
          New drops & wholesale offers
        </h3>
        <p className="text-sm text-[#6b6b6b] mb-8">
          Be first to know when fresh denim lands.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row">
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-12 border border-[#111] px-4 text-sm bg-white focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-12 bg-[#111] text-white px-8 text-xs font-bold uppercase tracking-[0.16em] hover:bg-[#c8102e] transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Subscribe'}
          </button>
        </form>
        {msg && <p className="text-sm text-green-700 mt-3">{msg}</p>}
      </div>
    </section>
  );
}
