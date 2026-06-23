import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-gray-400 mt-auto">
      <div className="max-w-[1280px] mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo variant="footer" className="mb-4" />
            <p className="text-sm leading-relaxed text-gray-400 mb-3">
              Premium wholesale denim for retailers, distributors & exporters. Factory-direct pricing.
            </p>
            <p className="text-xs text-gray-500 italic">For every fit, for every style, for every you</p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-white transition">Who We Are</Link></li>
              <li><Link to="/wholesale" className="hover:text-white transition">Wholesale Program</Link></li>
              <li><Link to="/category/new-arrivals" className="hover:text-white transition">New Arrivals</Link></li>
              <li><Link to="/category/bulk-orders" className="hover:text-white transition">Bulk Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/category/mens-jeans" className="hover:text-white transition">Men's Jeans</Link></li>
              <li><Link to="/category/womens-jeans" className="hover:text-white transition">Women's Jeans</Link></li>
              <li><Link to="/category/kids-jeans" className="hover:text-white transition">Kids Jeans</Link></li>
              <li><Link to="/category/export-quality" className="hover:text-white transition">Export Quality</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone size={15} className="shrink-0 text-gray-500" />
                <a href="tel:8424939262" className="hover:text-white transition">8424939262</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={15} className="shrink-0 text-gray-500" />
                <a href="mailto:codequipwebtech@gmail.com" className="hover:text-white transition break-all">codequipwebtech@gmail.com</a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin size={15} className="shrink-0 text-gray-500 mt-0.5" />
                <span className="leading-relaxed text-xs sm:text-sm">
                  Shop No 22, Bldg 2, B Wing, Navkar Bahar, Ghanshyam Gupte Road, Vishnu Nagar, Dombivli West 421202
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} CODEQUIP WEBTECH PRIVATE LIMITED</p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link to="/terms" className="hover:text-gray-300 transition">Terms & Conditions</Link>
            <Link to="/privacy" className="hover:text-gray-300 transition">Privacy Policy</Link>
            <Link to="/shipping" className="hover:text-gray-300 transition">Shipping & Delivery</Link>
            <Link to="/refund" className="hover:text-gray-300 transition">Cancellation & Refund</Link>
            <Link to="/payment" className="hover:text-gray-300 transition">Fees & Payments</Link>
            <Link to="/wholesale-terms" className="hover:text-gray-300 transition">Wholesale Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
