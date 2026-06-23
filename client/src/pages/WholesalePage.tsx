import { useState } from 'react';
import { CheckCircle, Package, Truck, Headphones } from 'lucide-react';
import { api } from '../lib/api';

export default function WholesalePage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company_name: '', product_interest: '', quantity: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.submitInquiry({ ...form, quantity: parseInt(form.quantity) || undefined });
      setSubmitted(true);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const benefits = [
    { icon: Package, title: 'Factory Direct Pricing', desc: 'Wholesale rates from ₹100/piece up to ₹8,000 — 70+ styles with MOQ of just 10 units' },
    { icon: Truck, title: 'Pan India Delivery', desc: 'Fast shipping across India with bulk order logistics support' },
    { icon: CheckCircle, title: 'Export Quality', desc: 'Premium denim meeting international quality standards' },
    { icon: Headphones, title: 'Dedicated Support', desc: 'Personal account manager for wholesale buyers' },
  ];

  return (
    <div>
      <div className="bg-denim text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Forge Red — Wholesale Program</h1>
          <p className="text-lg opacity-90">Join India's fastest growing wholesale denim platform. Factory-direct pricing for retailers, distributors & exporters.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((b) => (
            <div key={b.title} className="text-center p-6 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <b.icon size={32} className="mx-auto mb-4 text-denim" />
              <h3 className="font-semibold mb-2">{b.title}</h3>
              <p className="text-sm text-gray-600">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-denim mb-6">Wholesale Pricing Tiers</h2>
            <div className="space-y-4">
              {[
                { qty: '10-49 pcs', discount: 'Factory Price', price: 'From ₹100/pc' },
                { qty: '50-99 pcs', discount: '5% Extra Off', price: 'From ₹551/pc' },
                { qty: '100-499 pcs', discount: '10% Extra Off', price: 'From ₹522/pc' },
                { qty: '500+ pcs', discount: 'Custom Pricing', price: 'Contact Us' },
              ].map((tier) => (
                <div key={tier.qty} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{tier.qty}</p>
                    <p className="text-sm text-forge-red">{tier.discount}</p>
                  </div>
                  <p className="font-bold text-denim">{tier.price}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-denim mb-6">Request Wholesale Access</h2>
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">Inquiry Submitted!</h3>
                <p className="text-sm text-green-700">Our team will contact you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-denim" />
                <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-denim" />
                <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-denim" />
                <input placeholder="Company Name" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-denim" />
                <input placeholder="Product Interest" value={form.product_interest} onChange={(e) => setForm({ ...form, product_interest: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-denim" />
                <input type="number" placeholder="Estimated Quantity" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-denim" />
                <textarea placeholder="Message" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-denim" />
                <button type="submit" disabled={loading} className="w-full bg-forge-red text-white py-3 rounded-full font-semibold hover:bg-red-700 transition disabled:opacity-50">
                  {loading ? 'Submitting...' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
