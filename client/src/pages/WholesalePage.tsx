import { useState } from 'react';
import { CheckCircle, Package, Truck, Headphones } from 'lucide-react';
import { api } from '../lib/api';

export default function WholesalePage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company_name: '', product_interest: '', quantity: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.submitInquiry({ ...form, quantity: parseInt(form.quantity) || undefined });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit inquiry. Please try again.');
    }
    setLoading(false);
  };

  const benefits = [
    { icon: Package, title: 'Factory pricing', desc: 'Wholesale from ₹100/pc · MOQ 1 piece' },
    { icon: Truck, title: 'Pan India', desc: 'Fast shipping with bulk logistics support' },
    { icon: CheckCircle, title: 'Export quality', desc: 'Denim built to international standards' },
    { icon: Headphones, title: 'Dedicated support', desc: 'A real person for wholesale buyers' },
  ];

  return (
    <div>
      <div className="bg-[#111] text-white py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[#c8102e] font-semibold mb-4">Partners</p>
          <h1 className="font-display text-4xl sm:text-6xl font-bold mb-4">Wholesale program</h1>
          <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto">
            Factory-direct denim for retailers, distributors and exporters.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((b) => (
            <div key={b.title} className="p-6 border border-[#e8e8e8]">
              <b.icon size={28} className="mb-4" strokeWidth={1.5} />
              <h3 className="font-display text-lg font-bold mb-2">{b.title}</h3>
              <p className="text-sm text-[#6b6b6b]">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div>
            <h2 className="font-display text-3xl font-bold mb-3">Volume guide</h2>
            <p className="text-sm text-[#6b6b6b] mb-6">Indicative tiers — final rates on inquiry. MOQ 1 piece.</p>
            <div className="divide-y divide-[#e8e8e8] border-y border-[#e8e8e8]">
              {[
                { qty: '1–49 pcs', discount: 'Factory wholesale price', price: 'From ₹100/pc' },
                { qty: '50–99 pcs', discount: 'Volume pricing', price: 'Ask for quote' },
                { qty: '100–499 pcs', discount: 'Bulk wholesale', price: 'Ask for quote' },
                { qty: '500+ pcs', discount: 'Custom / export', price: 'Contact us' },
              ].map((tier) => (
                <div key={tier.qty} className="flex justify-between items-center py-4 gap-4">
                  <div>
                    <p className="font-semibold">{tier.qty}</p>
                    <p className="text-sm text-[#c8102e]">{tier.discount}</p>
                  </div>
                  <p className="font-bold text-sm uppercase tracking-[0.06em]">{tier.price}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold mb-6">Request access</h2>
            {submitted ? (
              <div className="border border-[#111] p-8 text-center">
                <CheckCircle size={40} className="mx-auto text-[#1a7a3a] mb-4" />
                <h3 className="font-display text-xl font-bold mb-2">Inquiry sent</h3>
                <p className="text-sm text-[#6b6b6b]">Our team will contact you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <input required placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="field" />
                <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="field" />
                <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="field" />
                <input placeholder="Company name" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="field" />
                <input placeholder="Product interest" value={form.product_interest} onChange={(e) => setForm({ ...form, product_interest: e.target.value })} className="field" />
                <input type="number" placeholder="Estimated quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="field" />
                <textarea placeholder="Message" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="field h-auto py-3" />
                {error && <p className="text-sm text-[#c8102e]">{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Submitting…' : 'Submit inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
