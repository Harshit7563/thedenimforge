import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-[#0f1724] text-white/55 mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo variant="footer" className="mb-5" />
            <p className="text-sm leading-relaxed text-white/50">
              Premium wholesale denim for retailers, distributors and exporters. Factory-direct pricing from Dombivli.
            </p>
          </div>

          <div>
            <h4 className="font-display text-white text-sm font-semibold mb-4 tracking-wide">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-white transition">Who We Are</Link></li>
              <li><Link to="/size-chart" className="hover:text-white transition">Size Chart</Link></li>
              <li><Link to="/wholesale" className="hover:text-white transition">Wholesale Program</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-white text-sm font-semibold mb-4 tracking-wide">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/category/new-arrivals" className="hover:text-white transition">What's New</Link></li>
              <li><Link to="/category/mens-jeans" className="hover:text-white transition">Men's</Link></li>
              <li><Link to="/category/womens-jeans" className="hover:text-white transition">Women's</Link></li>
              <li><Link to="/category/kids-jeans" className="hover:text-white transition">Kids</Link></li>
              <li><Link to="/category/bulk-orders" className="hover:text-white transition">Bulk Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-white text-sm font-semibold mb-4 tracking-wide">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="shrink-0 text-white/35" />
                <a href="tel:8424939262" className="hover:text-white transition">8424939262</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="shrink-0 text-white/35" />
                <a href="mailto:codequipwebtech@gmail.com" className="hover:text-white transition break-all">codequipwebtech@gmail.com</a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="shrink-0 text-white/35 mt-0.5" />
                <span className="leading-relaxed text-xs sm:text-sm">
                  Shop No 22, Bldg 2, B Wing, Navkar Bahar, Vishnu Nagar, Dombivli West 421202
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/35">
          <p>&copy; {new Date().getFullYear()} CODEQUIP WEBTECH PRIVATE LIMITED</p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link to="/terms" className="hover:text-white/70 transition">Terms</Link>
            <Link to="/privacy" className="hover:text-white/70 transition">Privacy</Link>
            <Link to="/shipping" className="hover:text-white/70 transition">Shipping</Link>
            <Link to="/refund" className="hover:text-white/70 transition">Refund</Link>
            <Link to="/payment" className="hover:text-white/70 transition">Payments</Link>
            <Link to="/wholesale-terms" className="hover:text-white/70 transition">Wholesale Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
