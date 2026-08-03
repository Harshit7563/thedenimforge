import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-denim text-center mb-2">Help Centre</h1>
      <p className="text-center text-gray-500 mb-12">We're here to help with your wholesale denim needs</p>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="border border-gray-200 rounded-xl p-6">
          <Phone size={24} className="text-denim mb-4" />
          <h3 className="font-semibold mb-2">Call Us</h3>
          <a href="tel:8424939262" className="text-denim font-medium text-lg">8424939262</a>
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1"><Clock size={14} /> Mon-Sat, 9am-7pm</p>
        </div>
        <div className="border border-gray-200 rounded-xl p-6">
          <Mail size={24} className="text-denim mb-4" />
          <h3 className="font-semibold mb-2">Email Us</h3>
          <a href="mailto:codequipwebtech@gmail.com" className="text-denim font-medium">codequipwebtech@gmail.com</a>
          <p className="text-sm text-gray-500 mt-2">We respond within 24 hours</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-8">
        <h2 className="text-xl font-bold text-denim mb-6">Our Location</h2>
        <div className="flex items-start gap-3">
          <MapPin size={20} className="text-denim shrink-0 mt-1" />
          <div>
            <p className="font-semibold">CODEQUIP WEBTECH PRIVATE LIMITED</p>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Shop No 22, Building Number 2, B Wing,<br />
              Navkar Bahar, Ghanshyam Gupte Road,<br />
              Vishnu Nagar, Dombivli West 421202
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-denim mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: 'What is the minimum order quantity (MOQ)?', a: 'Our MOQ starts from just 1 piece per style. Larger bulk orders receive additional discounts.' },
            { q: 'Do you offer samples?', a: 'Yes, we offer free samples on bulk orders of 100+ pieces. Sample charges apply for smaller orders.' },
            { q: 'What is the delivery timeline?', a: 'Standard orders are dispatched within 3-5 business days. Bulk orders may take 7-10 business days.' },
            { q: 'Do you ship internationally?', a: 'Yes, we export to multiple countries. Contact us for export pricing and logistics.' },
          ].map((faq) => (
            <div key={faq.q} className="border-b border-gray-200 pb-4">
              <h3 className="font-medium mb-1">{faq.q}</h3>
              <p className="text-sm text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
