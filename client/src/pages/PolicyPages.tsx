import { Link } from 'react-router-dom';

const COMPANY = 'CODEQUIP WEBTECH PRIVATE LIMITED';
const BRAND = 'The Denim Forge';
const EMAIL = 'codequipwebtech@gmail.com';
const PHONE = '8424939262';
const ADDRESS = 'Shop No 22, Building Number 2, B Wing, Navkar Bahar, Ghanshyam Gupte Road, Vishnu Nagar, Dombivli West, Maharashtra 421202';
const WEBSITE = 'https://thedenimforge.com';

function PolicyLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
      <nav className="text-xs text-gray-400 mb-6">
        <Link to="/" className="hover:text-[#1a1a1a]">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-[#1a1a1a]">{title}</span>
      </nav>
      <h1 className="text-2xl sm:text-3xl font-bold text-[#1a1a1a] mb-2 tracking-tight">{title}</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: June 22, 2026 · {WEBSITE}</p>
      <div className="prose-policy text-sm text-gray-700 space-y-5 leading-relaxed">{children}</div>
      <div className="mt-10 pt-6 border-t border-[#e8e8e8] text-sm text-gray-500">
        <p className="font-semibold text-[#1a1a1a] mb-2">Contact Us</p>
        <p>{COMPANY}</p>
        <p>{ADDRESS}</p>
        <p>Email: <a href={`mailto:${EMAIL}`} className="text-[#1a1a1a] hover:underline">{EMAIL}</a></p>
        <p>Phone: <a href={`tel:${PHONE}`} className="text-[#1a1a1a] hover:underline">{PHONE}</a></p>
      </div>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-[#1a1a1a] mt-6 mb-2">{children}</h2>;
}

export function TermsPage() {
  return (
    <PolicyLayout title="Terms & Conditions">
      <p>Welcome to {BRAND} ({WEBSITE}), operated by {COMPANY} ("we", "us", "our"). By accessing or using our website, placing an order, or registering a wholesale account, you agree to be bound by these Terms & Conditions.</p>

      <H2>1. About Us</H2>
      <p>{BRAND} is a B2B wholesale denim platform supplying premium jeans to retailers, distributors, boutiques, and exporters across India. All transactions are governed by Indian law.</p>

      <H2>2. Eligibility</H2>
      <p>You must be 18 years or older and legally capable of entering into binding contracts. Wholesale accounts are intended for business buyers. We reserve the right to verify business credentials and reject registrations at our discretion.</p>

      <H2>3. Product Information</H2>
      <p>We make every effort to display accurate product images, descriptions, fabric compositions, fits, and washes. However, actual products may vary slightly in shade, texture, or finish due to fabric batch variations, washing processes, and display settings. Product images on {WEBSITE} are for representation purposes.</p>

      <H2>4. Pricing & MOQ</H2>
      <p>All prices are listed in Indian Rupees (INR). Wholesale prices require minimum order quantities (MOQ) as specified per product. Prices are subject to change without prior notice. Confirmed orders will be honoured at the price agreed at the time of order confirmation.</p>

      <H2>5. Order Confirmation</H2>
      <p>Placing an order on our website constitutes an offer to purchase. An order is confirmed only after we send written confirmation via email and receive the required advance payment. We reserve the right to cancel orders due to stock unavailability, pricing errors, or incomplete verification.</p>

      <H2>6. Account Responsibility</H2>
      <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately at {EMAIL} of any unauthorized use.</p>

      <H2>7. Intellectual Property</H2>
      <p>All content on {WEBSITE} including logos, text, images, and design is the property of {COMPANY} and protected under applicable copyright and trademark laws. Unauthorized reproduction is prohibited.</p>

      <H2>8. Limitation of Liability</H2>
      <p>{COMPANY} shall not be liable for indirect, incidental, or consequential damages arising from use of our website or products. Our maximum liability is limited to the value of the specific order in dispute.</p>

      <H2>9. Governing Law</H2>
      <p>These terms are governed by the laws of India. Disputes shall be subject to the exclusive jurisdiction of courts in Thane, Maharashtra.</p>

      <H2>10. Changes</H2>
      <p>We may update these Terms at any time. Continued use of {WEBSITE} after changes constitutes acceptance of the revised terms.</p>
    </PolicyLayout>
  );
}

export function PrivacyPage() {
  return (
    <PolicyLayout title="Privacy Policy">
      <p>{COMPANY} ("we") operates {BRAND} at {WEBSITE}. This Privacy Policy explains how we collect, use, and protect your personal information in compliance with the Information Technology Act, 2000 and applicable data protection principles.</p>

      <H2>1. Information We Collect</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Account data:</strong> Name, email, phone, company name, GST number (if provided)</li>
        <li><strong>Order data:</strong> Shipping address, billing details, order history, payment references</li>
        <li><strong>Communication:</strong> Emails, wholesale inquiry forms, order notifications</li>
        <li><strong>Technical data:</strong> IP address, browser type, device information, cookies</li>
        <li><strong>Newsletter:</strong> Email address for marketing communications</li>
      </ul>

      <H2>2. How We Use Your Information</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Process and fulfil wholesale orders</li>
        <li>Manage your account and provide customer support</li>
        <li>Send order updates, invoices, and shipping notifications</li>
        <li>Improve our website and product offerings</li>
        <li>Send promotional offers (with your consent; unsubscribe anytime)</li>
        <li>Comply with legal obligations</li>
      </ul>

      <H2>3. Information Sharing</H2>
      <p>We do not sell your personal data. We may share information with:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Courier and logistics partners for order delivery</li>
        <li>Payment processors for transaction processing</li>
        <li>Legal authorities when required by law</li>
      </ul>

      <H2>4. Data Security</H2>
      <p>We implement reasonable security measures including encrypted connections (HTTPS), secure password storage, and access controls. However, no method of transmission over the internet is 100% secure.</p>

      <H2>5. Data Retention</H2>
      <p>We retain your data for as long as your account is active or as needed to fulfil orders and legal obligations. You may request deletion by emailing {EMAIL}.</p>

      <H2>6. Cookies</H2>
      <p>We use cookies to maintain login sessions, remember preferences, and analyse site traffic. You can disable cookies in your browser settings, though some features may not function properly.</p>

      <H2>7. Your Rights</H2>
      <p>You have the right to access, correct, or delete your personal data. Contact us at {EMAIL} to exercise these rights.</p>

      <H2>8. Children's Privacy</H2>
      <p>Our services are not directed at individuals under 18. We do not knowingly collect data from minors.</p>
    </PolicyLayout>
  );
}

export function ShippingPage() {
  return (
    <PolicyLayout title="Shipping & Delivery Policy">
      <H2>1. Delivery Coverage</H2>
      <p>We deliver across India through trusted courier partners including DTDC, Delhivery, Blue Dart, and India Post. Export/international shipping is available on request — contact us at {EMAIL} or {PHONE}.</p>

      <H2>2. Processing Time</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>Standard orders (10–49 pcs):</strong> 3–5 business days after payment confirmation</li>
        <li><strong>Medium bulk (50–99 pcs):</strong> 5–7 business days</li>
        <li><strong>Large bulk (100+ pcs):</strong> 7–10 business days</li>
        <li><strong>Custom/manufacturing orders:</strong> 15–21 business days (timeline shared at confirmation)</li>
      </ul>

      <H2>3. Shipping Charges</H2>
      <p>Shipping charges are calculated based on order weight, volume, and delivery pin code. Free shipping is available on orders above ₹25,000 within India. Exact shipping cost is communicated before order confirmation.</p>

      <H2>4. Order Tracking</H2>
      <p>Once dispatched, you will receive a tracking number via email. You can also track orders from your account on {WEBSITE} under "Track Order".</p>

      <H2>5. Delivery Attempts</H2>
      <p>Courier partners typically make 2–3 delivery attempts. If delivery fails, the package may be returned to us and re-shipping charges will apply.</p>

      <H2>6. Inspection on Delivery</H2>
      <p>Please inspect the package upon delivery. Report any visible damage or quantity discrepancy within 24 hours to {EMAIL} with photos of the package and products.</p>

      <H2>7. Address Accuracy</H2>
      <p>You are responsible for providing accurate shipping details. {COMPANY} is not liable for delays or losses due to incorrect addresses provided by the buyer.</p>
    </PolicyLayout>
  );
}

export function RefundPage() {
  return (
    <PolicyLayout title="Cancellation & Refund Policy">
      <H2>1. Order Cancellation</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Orders can be cancelled within 24 hours of placement, before production/packing begins</li>
        <li>After 24 hours or once production starts, cancellation may incur up to 25% restocking fee</li>
        <li>Custom/manufacturing orders cannot be cancelled once production has started</li>
        <li>To cancel, email {EMAIL} or call {PHONE} with your order number</li>
      </ul>

      <H2>2. Refund Eligibility</H2>
      <p>Refunds are issued in the following cases:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Defective or damaged products (with photo evidence within 7 days of delivery)</li>
        <li>Wrong items shipped (report within 48 hours)</li>
        <li>Significant variation from agreed specifications</li>
        <li>Order cancelled by us due to stock unavailability</li>
      </ul>

      <H2>3. Non-Refundable Cases</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Minor shade or wash variations within industry tolerance</li>
        <li>Change of mind after order confirmation</li>
        <li>Products damaged due to improper storage by buyer</li>
        <li>Shipping charges (unless return is due to our error)</li>
      </ul>

      <H2>4. Refund Process</H2>
      <p>Approved refunds are processed within 7–10 business days to the original payment method. Bank transfer refunds may take an additional 3–5 business days.</p>

      <H2>5. Returns</H2>
      <p>Return shipping for defective items is borne by {COMPANY}. For other approved returns, the buyer bears return shipping costs. Products must be returned in original condition with tags.</p>
    </PolicyLayout>
  );
}

export function PaymentPage() {
  return (
    <PolicyLayout title="Fees & Payments Policy">
      <H2>1. Accepted Payment Methods</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Bank Transfer (NEFT/RTGS/IMPS)</li>
        <li>UPI (Google Pay, PhonePe, Paytm)</li>
        <li>Cheque (for established buyers only)</li>
        <li>Cash on Delivery (COD) — minimum order value ₹1,000</li>
        <li>Online payment gateway (where available)</li>
      </ul>

      <H2>2. Payment Terms</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong>New buyers:</strong> 50% advance at order confirmation, balance before dispatch</li>
        <li><strong>Established buyers:</strong> Credit terms up to 15 days may be offered upon approval</li>
        <li><strong>Bulk orders (500+ pcs):</strong> Custom payment schedule by mutual agreement</li>
      </ul>

      <H2>3. GST</H2>
      <p>All prices are exclusive of GST unless stated otherwise. GST at applicable rates will be added to invoices. GSTIN can be provided for input tax credit.</p>

      <H2>4. Pricing Errors</H2>
      <p>In case of pricing errors on {WEBSITE}, we reserve the right to cancel the order and issue a full refund of any payment received. We will notify you before processing.</p>

      <H2>5. Bank Details</H2>
      <p>Payment details are shared upon order confirmation via email. Never transfer money to unverified accounts. Official communication is only from {EMAIL} and {PHONE}.</p>
    </PolicyLayout>
  );
}

export function WholesalePolicyPage() {
  return (
    <PolicyLayout title="Wholesale Terms & Conditions">
      <H2>1. Wholesale Program</H2>
      <p>The {BRAND} Wholesale Program ("Forge Red") provides registered business buyers access to factory-direct denim pricing. Registration is free and subject to verification.</p>

      <H2>2. Eligibility</H2>
      <p>Open to registered businesses including retail stores, boutiques, online sellers, distributors, and exporters. Valid business proof (GST, shop license, or company registration) may be required.</p>

      <H2>3. Minimum Order Quantity</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Standard MOQ: 10 pieces per style</li>
        <li>Export quality: MOQ 25 pieces per style</li>
        <li>Bulk mixed packs: MOQ 50 pieces</li>
      </ul>

      <H2>4. Pricing Tiers</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>10–49 pcs: Factory wholesale price</li>
        <li>50–99 pcs: Additional 5% discount</li>
        <li>100–499 pcs: Additional 10% discount</li>
        <li>500+ pcs: Custom pricing — contact sales team</li>
      </ul>

      <H2>5. Samples</H2>
      <p>Free samples available on orders of 100+ pieces. Sample charges apply for smaller quantities and are adjustable against the first bulk order.</p>

      <H2>6. Exclusivity</H2>
      <p>Wholesale pricing is confidential. Buyers must not share wholesale rates publicly or with competitors. Violation may result in account termination.</p>

      <H2>7. Account Termination</H2>
      <p>We may suspend or terminate wholesale accounts for payment defaults, policy violations, or fraudulent activity without prior notice.</p>
    </PolicyLayout>
  );
}
