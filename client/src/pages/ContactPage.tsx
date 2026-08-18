import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[#c8102e] font-semibold mb-2">Help</p>
      <h1 className="font-display text-4xl sm:text-6xl font-bold mb-3">Contact</h1>
      <p className="text-[#6b6b6b] mb-12 max-w-xl">We're here for wholesale denim orders, sizing and shipping.</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        <div className="border border-[#e8e8e8] p-6">
          <Phone size={22} className="mb-4" strokeWidth={1.5} />
          <p className="text-xs font-bold uppercase tracking-[0.14em] mb-2">Call</p>
          <a href="tel:8424939262" className="text-lg font-semibold">8424939262</a>
          <p className="text-sm text-[#6b6b6b] mt-2 flex items-center gap-1"><Clock size={14} /> Mon–Sat, 9am–7pm</p>
        </div>
        <div className="border border-[#e8e8e8] p-6">
          <Mail size={22} className="mb-4" strokeWidth={1.5} />
          <p className="text-xs font-bold uppercase tracking-[0.14em] mb-2">Email</p>
          <a href="mailto:codequipwebtech@gmail.com" className="font-semibold break-all">codequipwebtech@gmail.com</a>
          <p className="text-sm text-[#6b6b6b] mt-2">We respond within 24 hours</p>
        </div>
      </div>

      <div className="bg-[#f6f4f0] p-6 sm:p-10 mb-14">
        <div className="flex items-start gap-3">
          <MapPin size={20} className="shrink-0 mt-1" />
          <div>
            <p className="font-display text-xl font-bold mb-2">Studio</p>
            <p className="font-semibold">CODEQUIP WEBTECH PRIVATE LIMITED</p>
            <p className="text-sm text-[#6b6b6b] mt-2 leading-relaxed">
              Shop No 22, Building Number 2, B Wing,<br />
              Navkar Bahar, Ghanshyam Gupte Road,<br />
              Vishnu Nagar, Dombivli West 421202
            </p>
          </div>
        </div>
      </div>

      <h2 className="font-display text-3xl font-bold mb-6">FAQ</h2>
      <div className="divide-y divide-[#e8e8e8] border-y border-[#e8e8e8]">
        {[
          { q: 'What is the minimum order quantity (MOQ)?', a: 'MOQ starts from 1 piece per style. Larger bulk orders get extra discounts.' },
          { q: 'Do you offer samples?', a: 'Yes — free samples on bulk orders of 100+ pieces. Sample charges apply for smaller orders.' },
          { q: 'What is the delivery timeline?', a: 'Standard orders dispatch in 3–5 business days. Bulk may take 7–10 days.' },
          { q: 'Do you ship internationally?', a: 'Yes. Contact us for export pricing and logistics.' },
        ].map((faq) => (
          <div key={faq.q} className="py-5">
            <h3 className="font-semibold mb-1">{faq.q}</h3>
            <p className="text-sm text-[#6b6b6b]">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
