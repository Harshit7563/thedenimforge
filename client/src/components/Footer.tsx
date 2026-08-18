import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-[#111] text-white/65 mt-auto">
      <div className="max-w-[1440px] mx-auto px-5 sm:px-10 py-14 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <Logo variant="footer" className="mb-5" />
            <p className="text-sm leading-relaxed text-white/50 max-w-sm">
              Premium wholesale denim for retailers, distributors and exporters. Factory-direct pricing from Dombivli.
            </p>
          </div>

          <div>
            <h4 className="font-display text-white text-sm font-semibold mb-5 tracking-[0.14em]">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/category/new-arrivals" className="hover:text-white transition">What's New</Link></li>
              <li><Link to="/category/mens-jeans" className="hover:text-white transition">Men's</Link></li>
              <li><Link to="/category/womens-jeans" className="hover:text-white transition">Women's</Link></li>
              <li><Link to="/category/kids-jeans" className="hover:text-white transition">Kids</Link></li>
              <li><Link to="/category/bulk-orders" className="hover:text-white transition">Bulk Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-white text-sm font-semibold mb-5 tracking-[0.14em]">Help</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/size-chart" className="hover:text-white transition">Size Chart</Link></li>
              <li><Link to="/track-order" className="hover:text-white transition">Track Order</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition">Shipping</Link></li>
              <li><Link to="/wholesale" className="hover:text-white transition">Wholesale</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-white text-sm font-semibold mb-5 tracking-[0.14em]">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone size={14} className="shrink-0 text-white/35" />
                <a href="tel:8424939262" className="hover:text-white transition">8424939262</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={14} className="shrink-0 text-white/35" />
                <a href="mailto:codequipwebtech@gmail.com" className="hover:text-white transition break-all">codequipwebtech@gmail.com</a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={14} className="shrink-0 text-white/35 mt-0.5" />
                <span className="leading-relaxed text-xs">
                  Shop No 22, Bldg 2, B Wing, Navkar Bahar, Vishnu Nagar, Dombivli West 421202
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-14 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-white/35">
          <p>© {new Date().getFullYear()} CODEQUIP WEBTECH PRIVATE LIMITED</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/terms" className="hover:text-white/70">Terms</Link>
            <Link to="/privacy" className="hover:text-white/70">Privacy</Link>
            <Link to="/refund" className="hover:text-white/70">Refund</Link>
            <Link to="/payment" className="hover:text-white/70">Payments</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
