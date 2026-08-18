export default function AboutPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-12 sm:py-16">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[#c8102e] font-semibold mb-2">The brand</p>
      <h1 className="font-display text-4xl sm:text-6xl font-bold mb-8">Who we are</h1>
      <div className="space-y-6 text-[#333] leading-relaxed">
        <p className="text-lg">
          <strong>The Denim Forge</strong> is a wholesale denim house operated by <strong>CODEQUIP WEBTECH PRIVATE LIMITED</strong>. Based in Dombivli, we connect retailers, distributors and exporters with factory-direct denim.
        </p>
        <p>
          From slim classics to wide-leg washes — men's, women's and kids — we source and ship quality denim with tight QC at every step.
        </p>
        <h2 className="font-display text-2xl font-bold pt-4">Why Denim Forge</h2>
        <ul className="space-y-2 text-sm">
          <li>— Factory-direct pricing from ₹100 to ₹8,000 per piece</li>
          <li>— MOQ 1 piece per style</li>
          <li>— Export-quality denim</li>
          <li>— Fits: Slim, Regular, Bootcut, Skinny, Wide Leg & more</li>
          <li>— Pan India shipping</li>
        </ul>
      </div>
    </div>
  );
}
