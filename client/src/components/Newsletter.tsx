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
    <section className="bg-[#faf9f7] border-t border-[#e8e8e8] py-10 sm:py-12">
      <div className="max-w-lg mx-auto px-4 text-center">
        <h3 className="text-base sm:text-lg font-bold text-[#1a1a1a] mb-2 tracking-tight">
          Be the first to hear about all things Denim Forge
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-5 leading-relaxed">
          Exclusive wholesale offers and latest denim updates, straight to your inbox
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 h-11 border border-[#e8e8e8] rounded-full px-5 text-sm bg-white focus:outline-none focus:border-[#1a1a1a] transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 bg-[#1a1a1a] text-white px-8 rounded-full text-sm font-semibold hover:bg-[#333] transition disabled:opacity-50 shrink-0"
          >
            {loading ? 'Sending...' : 'Subscribe'}
          </button>
        </form>
        {msg && <p className="text-sm text-green-600 mt-3">{msg}</p>}
      </div>
    </section>
  );
}
