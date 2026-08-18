import { Link } from 'react-router-dom';

const COMPANY = 'CODEQUIP WEBTECH PRIVATE LIMITED';
const BRAND = 'The Denim Forge';
const EMAIL = 'codequipwebtech@gmail.com';
const PHONE = '8424939262';
const ADDRESS =
  'Shop No 22, Building No 2, B Wing, Navkar Bahar, Ghanshyam Gupte Road, Vishnu Nagar, Dombivli West, Maharashtra — 421202';
const WEBSITE = 'https://thedenimforge.com';
const UPDATED = 'August 5, 2026';

function PolicyLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-14">
      <nav className="text-[11px] uppercase tracking-[0.14em] text-[#6b6b6b] mb-6">
        <Link to="/" className="hover:text-[#111]">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#111]">{title}</span>
      </nav>
      <h1 className="font-display text-3xl sm:text-5xl font-bold mb-3">{title}</h1>
      <p className="text-sm text-gray-500 mb-2">
        Operated by <strong className="text-[#1a1a1a]">{COMPANY}</strong>
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Last updated: {UPDATED} · {WEBSITE}
      </p>
      <div className="prose-policy text-sm text-gray-700 space-y-5 leading-relaxed">{children}</div>
      <div className="mt-10 pt-6 border-t border-[#e8e8e8] text-sm text-gray-500 space-y-1">
        <p className="font-semibold text-[#1a1a1a] mb-2">Registered Business & Contact</p>
        <p>{COMPANY}</p>
        <p>Brand: {BRAND}</p>
        <p>{ADDRESS}</p>
        <p>
          Email:{' '}
          <a href={`mailto:${EMAIL}`} className="text-[#1a1a1a] hover:underline">
            {EMAIL}
          </a>
        </p>
        <p>
          Phone:{' '}
          <a href={`tel:${PHONE}`} className="text-[#1a1a1a] hover:underline">
            {PHONE}
          </a>
        </p>
        <p>
          Website:{' '}
          <a href={WEBSITE} className="text-[#1a1a1a] hover:underline">
            {WEBSITE}
          </a>
        </p>
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
      <p>
        These Terms & Conditions (“Terms”) govern your use of {WEBSITE} and all purchases made on{' '}
        {BRAND}, a wholesale denim platform operated by {COMPANY} (“Company”, “we”, “us”, “our”). By
        browsing the website, creating an account, submitting an inquiry, or placing an order, you
        agree to these Terms.
      </p>

      <H2>1. Company identity</H2>
      <p>
        {COMPANY} owns and operates {BRAND}. Our registered place of business is at {ADDRESS}. For
        support related to orders, accounts, or policies, contact {EMAIL} or {PHONE}.
      </p>

      <H2>2. Nature of business</H2>
      <p>
        {BRAND} is a B2B wholesale platform for denim jeans and related apparel. We supply retailers,
        distributors, boutiques, online sellers, and exporters across India. Listings, pricing, and
        stock on the website are intended for business buyers.
      </p>

      <H2>3. Eligibility & accounts</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>You must be 18 years or older and legally competent to contract under Indian law.</li>
        <li>Wholesale registration may require business details (name, phone, company, GST if any).</li>
        <li>You are responsible for keeping login credentials confidential.</li>
        <li>We may refuse, suspend, or terminate accounts for misuse, fraud, or policy breach.</li>
      </ul>

      <H2>4. Products & representations</H2>
      <p>
        Product names, photos, fits, washes, fabrics, and sizes are described in good faith. Denim
        is a natural-feel fabric; minor shade, texture, or wash variation between batches is normal
        and not a defect. Images are representative. Always check the size chart on {WEBSITE} before
        ordering.
      </p>

      <H2>5. Pricing, MOQ & stock</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>All prices are in Indian Rupees (INR) and shown as wholesale rates unless stated otherwise.</li>
        <li>Minimum order quantity (MOQ) starts from <strong>1 piece</strong> per style unless a product page states otherwise.</li>
        <li>Prices may change without prior notice; confirmed orders are honoured at the checkout total shown when you placed the order.</li>
        <li>We may cancel or partially fulfil orders if stock or logistics constraints arise, with notice to you.</li>
      </ul>

      <H2>6. Orders</H2>
      <p>
        Submitting an order is an offer to buy. An order is accepted when we confirm it (email/SMS
        and/or status in your account). We may decline orders for incomplete address, verification
        issues, pricing errors, or suspected fraud.
      </p>

      <H2>7. Payment</H2>
      <p>
        Currently, the only payment method on {WEBSITE} is <strong>Cash on Delivery (COD)</strong>.
        You pay the delivery partner when the shipment is delivered. See our Fees & Payments Policy
        for details.
      </p>

      <H2>8. Shipping</H2>
      <p>
        Orders are shipped pan-India as per our Shipping & Delivery Policy. Standard shipping is
        ₹199; orders of ₹25,000 and above qualify for free shipping within India (unless otherwise
        stated at checkout).
      </p>

      <H2>9. Intellectual property</H2>
      <p>
        Logos, brand name “{BRAND}”, website design, text, and product photography on {WEBSITE} are
        owned by {COMPANY} or used under licence. You may not copy, scrape, or commercially reuse
        them without written permission.
      </p>

      <H2>10. Acceptable use</H2>
      <p>
        You agree not to misuse the site (including hacking, scraping at scale, posting false
        reviews, or using wholesale rates for deceptive consumer advertising). We may block access
        for violations.
      </p>

      <H2>11. Limitation of liability</H2>
      <p>
        To the fullest extent permitted by law, {COMPANY} is not liable for indirect, incidental, or
        consequential losses. Our aggregate liability for any claim related to an order is limited
        to the amount paid (or payable) for that order.
      </p>

      <H2>12. Governing law & disputes</H2>
      <p>
        These Terms are governed by the laws of India. Courts at Thane, Maharashtra shall have
        exclusive jurisdiction, subject to applicable consumer/business protections.
      </p>

      <H2>13. Changes</H2>
      <p>
        We may update these Terms from time to time. The “Last updated” date above will change.
        Continued use of {WEBSITE} after updates means you accept the revised Terms.
      </p>
    </PolicyLayout>
  );
}

export function PrivacyPage() {
  return (
    <PolicyLayout title="Privacy Policy">
      <p>
        This Privacy Policy explains how {COMPANY} (“we”), operating {BRAND} at {WEBSITE}, collects,
        uses, stores, and protects personal information. We follow applicable Indian law, including
        the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023
        (as applicable).
      </p>

      <H2>1. Who we are</H2>
      <p>
        Data fiduciary / controller for this website: {COMPANY}, {ADDRESS}. Contact for privacy
        requests: {EMAIL} / {PHONE}.
      </p>

      <H2>2. Information we collect</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Account & profile:</strong> name, email, phone, company name, and optional
          business identifiers (e.g. GSTIN if you provide it).
        </li>
        <li>
          <strong>Orders & shipping:</strong> delivery address, pin code, order items, quantities,
          sizes, and COD payment notes.
        </li>
        <li>
          <strong>Communications:</strong> contact forms, wholesale inquiries, emails, and support
          messages.
        </li>
        <li>
          <strong>Technical data:</strong> IP address, browser/device type, approximate location,
          cookies, and usage logs needed to run the site securely.
        </li>
        <li>
          <strong>Marketing (optional):</strong> email if you subscribe to the newsletter.
        </li>
      </ul>

      <H2>3. Why we use your data</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Create and manage your wholesale account</li>
        <li>Process, pack, ship, and track orders</li>
        <li>Collect COD payments via logistics partners</li>
        <li>Send order confirmations, dispatch updates, and support replies</li>
        <li>Improve catalogue, pricing tools, and site performance</li>
        <li>Send offers only where you have opted in (you may unsubscribe anytime)</li>
        <li>Detect fraud and meet legal / tax / accounting duties</li>
      </ul>

      <H2>4. Legal bases (summary)</H2>
      <p>
        We process data to perform a contract (orders/accounts), for legitimate business operations
        (security, analytics), with consent where required (marketing), and to comply with law.
      </p>

      <H2>5. Sharing</H2>
      <p>We do not sell personal data. We may share limited data with:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>Courier / logistics partners for delivery and COD collection</li>
        <li>Hosting, email, and IT service providers who process data on our instructions</li>
        <li>Professional advisors (e.g. accountants) under confidentiality</li>
        <li>Government or courts when legally required</li>
      </ul>

      <H2>6. Security</H2>
      <p>
        We use HTTPS, access controls, and hashed passwords. No online system is perfectly secure;
        please use a strong password and do not share OTPs or login links.
      </p>

      <H2>7. Retention</H2>
      <p>
        Account and order records are kept while your account is active and thereafter as needed
        for tax, dispute, and legal retention periods. You may request deletion subject to those
        obligations by emailing {EMAIL}.
      </p>

      <H2>8. Cookies</H2>
      <p>
        We use essential cookies for login/session and may use analytics cookies to understand
        traffic. You can block non-essential cookies in your browser; some features may then not
        work.
      </p>

      <H2>9. Your rights</H2>
      <p>
        Subject to law, you may request access, correction, withdrawal of consent (for marketing),
        or deletion of your personal data. Write to {EMAIL} with the subject “Privacy Request”.
      </p>

      <H2>10. Children</H2>
      <p>
        The website is for business users 18+. We do not knowingly collect data from children for
        account registration.
      </p>

      <H2>11. Updates</H2>
      <p>
        We may update this Privacy Policy. Material changes will be reflected by updating the date
        at the top of this page.
      </p>
    </PolicyLayout>
  );
}

export function ShippingPage() {
  return (
    <PolicyLayout title="Shipping & Delivery Policy">
      <p>
        This Shipping & Delivery Policy applies to orders placed on {BRAND} ({WEBSITE}) operated by{' '}
        {COMPANY}.
      </p>

      <H2>1. Service area</H2>
      <p>
        We ship across India through reputed courier partners (for example Delhivery, DTDC, Blue
        Dart, India Post, or equivalent). International / export shipments are arranged on request —
        contact {EMAIL} or {PHONE}.
      </p>

      <H2>2. Shipping charges (India)</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Flat shipping:</strong> ₹199 per order
        </li>
        <li>
          <strong>Free shipping:</strong> on orders of <strong>₹25,000 and above</strong> (product
          subtotal before COD handling, unless checkout shows otherwise)
        </li>
        <li>Remote or special-handling pin codes may require extra time or charges — we will inform you if applicable</li>
      </ul>

      <H2>3. Processing & dispatch timelines</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          <strong>Standard orders:</strong> typically packed and handed to courier within 3–5
          business days after confirmation
        </li>
        <li>
          <strong>Larger wholesale lots (50+ pcs):</strong> usually 5–10 business days
        </li>
        <li>
          <strong>Very large / made-to-order lots:</strong> timeline confirmed in writing before
          production
        </li>
      </ul>
      <p>Business days exclude Sundays and public holidays at origin (Dombivli / Mumbai region).</p>

      <H2>4. Transit time</H2>
      <p>
        After dispatch, metro and major cities often receive parcels in 2–5 business days; other
        locations may take 4–8 business days depending on the courier network. These are estimates,
        not guarantees.
      </p>

      <H2>5. Tracking</H2>
      <p>
        When your order ships, we share tracking details by email/SMS where available. You can also
        use <Link to="/track-order" className="underline font-medium text-[#1a1a1a]">Track Order</Link>{' '}
        on {WEBSITE} or check your account order history after login.
      </p>

      <H2>6. Delivery attempts & failed delivery</H2>
      <p>
        Couriers usually attempt delivery 2–3 times. If the package is returned to us due to wrong
        address, unreachable phone, or refusal (except our error), re-shipping charges may apply.
      </p>

      <H2>7. Address accuracy</H2>
      <p>
        Provide a complete address with pin code and a reachable mobile number. {COMPANY} is not
        responsible for delays or loss caused by incorrect buyer details.
      </p>

      <H2>8. Inspection on delivery</H2>
      <p>
        Please check outer packaging on delivery. For visible damage or shortage, note it with the
        delivery person where possible and email {EMAIL} within <strong>24 hours</strong> with
        photos, order number, and description.
      </p>

      <H2>9. COD deliveries</H2>
      <p>
        For Cash on Delivery orders, please keep the exact payable amount ready. The amount due is
        the checkout total (products + shipping, if any).
      </p>
    </PolicyLayout>
  );
}

export function RefundPage() {
  return (
    <PolicyLayout title="Cancellation & Refund Policy">
      <p>
        This policy explains cancellations, returns, and refunds for orders on {BRAND}, operated by{' '}
        {COMPANY}.
      </p>

      <H2>1. Cancellation by buyer</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          You may request cancellation within <strong>24 hours</strong> of placing the order, if
          packing / dispatch has not started.
        </li>
        <li>
          After packing or dispatch begins, cancellation may not be possible, or a restocking fee of
          up to 25% may apply for wholesale lots.
        </li>
        <li>Custom / made-to-order production cannot be cancelled once cutting or stitching has started.</li>
        <li>
          Email {EMAIL} or call {PHONE} with your order number to request cancellation.
        </li>
      </ul>

      <H2>2. Cancellation by us</H2>
      <p>
        We may cancel an order for stock issues, address problems, suspected fraud, or pricing
        errors. If any advance was collected (rare on COD), it will be refunded as per Section 5.
      </p>

      <H2>3. When refunds / replacements apply</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Manufacturing defect or damaged product (photo evidence within 7 days of delivery)</li>
        <li>Wrong style / size shipped versus your confirmed order (report within 48 hours)</li>
        <li>Missing pieces versus packing list (report within 48 hours)</li>
        <li>Order cancelled by us before delivery</li>
      </ul>

      <H2>4. Not eligible</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Minor shade / wash / stretch variation within normal denim tolerance</li>
        <li>Change of mind, wrong size ordered by buyer, or “didn’t like the fit”</li>
        <li>Damage after delivery due to improper storage, washing, or alteration</li>
        <li>Products returned without tags / in unsaleable condition (unless we caused the issue)</li>
      </ul>

      <H2>5. Refund process (COD context)</H2>
      <p>
        Most {BRAND} orders are COD, so no online payment is collected at checkout. If a refund is
        due (for example after a paid re-ship or approved claim), we will arrange bank transfer /
        UPI after you share account details. Approved refunds are typically initiated within{' '}
        <strong>7–10 business days</strong>; banks may take additional time to credit.
      </p>

      <H2>6. Returns</H2>
      <p>
        For approved defective / wrong-item returns, return shipping is borne by {COMPANY}. We will
        share the return address and instructions. For other approved returns, return shipping is
        usually borne by the buyer unless we agree otherwise in writing.
      </p>

      <H2>7. How to raise a claim</H2>
      <p>
        Email {EMAIL} with: order number, issue description, clear photos/videos, and your
        preferred resolution (replacement / refund / store credit). Incomplete claims may be delayed.
      </p>
    </PolicyLayout>
  );
}

export function PaymentPage() {
  return (
    <PolicyLayout title="Fees & Payments Policy">
      <p>
        This Fees & Payments Policy applies to purchases on {BRAND} ({WEBSITE}), operated by{' '}
        {COMPANY}.
      </p>

      <H2>1. Accepted payment method</H2>
      <p>
        At present, <strong>Cash on Delivery (COD)</strong> is the only payment method available on
        the website. Online prepaid gateways (UPI / cards / net banking) are not enabled for
        checkout.
      </p>

      <H2>2. How COD works</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Add products to cart, checkout, and place the order — payment method is COD by default.</li>
        <li>You receive order confirmation by email / account status.</li>
        <li>Pay the delivery executive the order total when the parcel is delivered.</li>
        <li>Please keep exact cash ready for the amount shown at checkout.</li>
      </ul>

      <H2>3. What you pay</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Wholesale product subtotal (as listed)</li>
        <li>
          Shipping: <strong>₹199</strong>, or <strong>FREE</strong> if order subtotal is ₹25,000 or
          more
        </li>
        <li>Any taxes shown on the invoice / packing documents</li>
      </ul>

      <H2>4. GST & invoices</H2>
      <p>
        Prices on the website are typically shown as wholesale rates. Applicable GST (if any) will
        be charged as per Indian tax law and reflected on tax invoices. Share your GSTIN at
        checkout/notes or by email if you need it on the invoice for ITC.
      </p>

      <H2>5. Pricing errors</H2>
      <p>
        If a product or shipping charge is listed incorrectly due to a technical error, we may
        cancel or adjust the order after notifying you. You may choose to proceed at the corrected
        price or cancel without charge.
      </p>

      <H2>6. Failed / refused COD</H2>
      <p>
        Repeated COD refusals without valid reason may lead to account review, prepaid-only
        requests for future orders, or suspension.
      </p>

      <H2>7. Support</H2>
      <p>
        For billing or COD disputes, contact {EMAIL} or {PHONE} with your order number. Official
        communication is only from {COMPANY} channels listed on {WEBSITE}.
      </p>
    </PolicyLayout>
  );
}

export function WholesalePolicyPage() {
  return (
    <PolicyLayout title="Wholesale Terms & Conditions">
      <p>
        These Wholesale Terms apply to business buyers using {BRAND}’s wholesale programme on{' '}
        {WEBSITE}, operated by {COMPANY}. They apply together with our general Terms & Conditions,
        Shipping, Payments, and Refund policies.
      </p>

      <H2>1. Programme overview</H2>
      <p>
        {BRAND} offers factory-oriented wholesale denim pricing for retailers, distributors,
        boutiques, online sellers, and exporters. Registration on the website creates a buyer
        account for browsing, ordering, and tracking.
      </p>

      <H2>2. Eligibility & verification</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Intended for genuine business buyers (not casual one-off consumer retail misuse).</li>
        <li>
          We may ask for GST certificate, shop licence, company incorporation, or other proof before
          large consignments.
        </li>
        <li>{COMPANY} may approve, reject, or limit accounts at its discretion.</li>
      </ul>

      <H2>3. Minimum order quantity (MOQ)</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Standard MOQ: <strong>1 piece per style</strong> (unless a product page states a higher MOQ)
        </li>
        <li>Mixed styles in one order are allowed</li>
        <li>Bulk / export programmes may use separate written MOQs agreed by email</li>
      </ul>

      <H2>4. Pricing</H2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Website wholesale prices are the default rate for registered buyers.</li>
        <li>
          Volume discounts for larger lots (for example 50+, 100+, 500+ pieces) may be offered on
          inquiry — final rates are confirmed in writing before dispatch.
        </li>
        <li>Wholesale rates are confidential business pricing; do not publish them as MRP lists.</li>
      </ul>

      <H2>5. Categories & catalogue</H2>
      <p>
        Products are assigned to Men’s, Women’s, or Kids categories. “What’s New” and “Bulk Orders”
        on the storefront showcase available catalogue styles for discovery; order fulfilment follows
        the product’s actual category, size, and stock rules.
      </p>

      <H2>6. Samples</H2>
      <p>
        Sample pairs may be arranged for serious wholesale buyers. Sample charges (if any) and
        adjustment against a follow-up bulk order will be confirmed before dispatch.
      </p>

      <H2>7. Payment & credit</H2>
      <p>
        Website checkout is COD only. Any credit period, advance, or bank transfer arrangement for
        large buyers must be agreed separately in writing with {COMPANY}.
      </p>

      <H2>8. Quality & claims</H2>
      <p>
        Wholesale buyers should inspect goods promptly on receipt. Claims follow our Cancellation &
        Refund Policy. Industry-standard denim shade variation is not a quality failure.
      </p>

      <H2>9. Exclusivity & brand use</H2>
      <p>
        Unless we grant written territory exclusivity, purchasing wholesale does not create exclusive
        distribution rights. You may not use {BRAND} / {COMPANY} trademarks in a way that suggests
        partnership or ownership without permission.
      </p>

      <H2>10. Account suspension</H2>
      <p>
        We may suspend wholesale access for non-payment / COD abuse, policy breaches, sharing of
        confidential rates in bad faith, or fraudulent conduct.
      </p>

      <H2>11. Contact for wholesale</H2>
      <p>
        Wholesale desk: {EMAIL} · {PHONE} · {ADDRESS}
      </p>
    </PolicyLayout>
  );
}
