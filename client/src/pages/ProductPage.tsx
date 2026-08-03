import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Star, ShoppingBag, Minus, Plus, Truck, Shield, RotateCcw,
  Share2, X, ChevronLeft, ChevronRight, Package, Ruler, Info,
} from 'lucide-react';
import { api, formatPrice } from '../lib/api';
import type { Product } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductCard from '../components/ProductCard';
import Section from '../components/Section';
import SafeImage from '../components/SafeImage';
import { FALLBACK_IMAGE } from '../lib/images';
import { SIZE_CHART, MENS_SIZE_CHART, WOMENS_SIZE_CHART, KIDS_SIZE_CHART } from '../lib/sizeChart';

function parseJsonField<T>(val: T | string, fallback: T): T {
  if (Array.isArray(val)) return val as T;
  try { return JSON.parse(val as string); } catch { return fallback; }
}

type Tab = 'description' | 'specs' | 'sizechart' | 'shipping';

function ProductSkeleton() {
  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-48 mb-6" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-[4/5] bg-gray-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-12 bg-gray-200 rounded w-1/2" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { increment, refresh } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState('32');
  const [activeImage, setActiveImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!slug) return;
    setProduct(null);
    setNotFound(false);
    api.getProduct(slug)
      .then((p) => {
        setProduct(p);
        const sizes = parseJsonField(p.sizes, ['32']);
        setSize(sizes[0] || '32');
        setQuantity(p.moq || 1);
        setActiveImage(0);
        if (p.category_slug) {
          api.getProducts({ category: p.category_slug, limit: '5' })
            .then((items) => setRelated(items.filter((i) => i.slug !== p.slug).slice(0, 4)))
            .catch(() => {});
        }
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  const wholesalePrice = product ? parseFloat(product.wholesale_price) : 0;
  const totalPrice = wholesalePrice * quantity;
  const savings = product ? (parseFloat(product.retail_price) - wholesalePrice) * quantity : 0;

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    if (!user) { navigate('/login'); return; }
    setAdding(true);
    setMsg('');
    try {
      await api.addToCart({ product_id: product.id, quantity, size, color: product.wash || 'Blue' });
      increment();
      refresh();
      setMsg('Added to cart successfully!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Failed to add to cart');
    }
    setAdding(false);
  }, [product, user, quantity, size, navigate, increment, refresh]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product?.name, url });
    } else {
      await navigator.clipboard.writeText(url);
      setMsg('Link copied to clipboard!');
      setTimeout(() => setMsg(''), 2000);
    }
  };


  if (notFound) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Package size={48} className="mx-auto text-gray-300 mb-4" />
        <h1 className="text-xl font-bold mb-2">Product Not Found</h1>
        <p className="text-gray-500 text-sm mb-6">This product may have been removed or the link is incorrect.</p>
        <Link to="/" className="inline-block bg-[#1a1a1a] text-white px-8 py-3 rounded-full text-sm font-semibold">Back to Shop</Link>
      </div>
    );
  }

  if (!product) return <ProductSkeleton />;

  const images = parseJsonField(product.images, [FALLBACK_IMAGE]);
  const sizes = parseJsonField(product.sizes, ['32']);

  const btnClass = (active: boolean) =>
    `min-w-[44px] h-10 px-3.5 border rounded-lg text-sm font-medium transition ${
      active ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white' : 'border-[#e8e8e8] bg-white hover:border-[#1a1a1a] text-gray-700'
    }`;

  const tabs: { id: Tab; label: string; icon: typeof Info }[] = [
    { id: 'description', label: 'Description', icon: Info },
    { id: 'specs', label: 'Specifications', icon: Package },
    { id: 'sizechart', label: 'Size Chart', icon: Ruler },
    { id: 'shipping', label: 'Shipping', icon: Truck },
  ];

  const bulkTiers = [
    { range: `${product.moq}+ pcs`, price: wholesalePrice, label: 'Wholesale' },
    { range: '50+ pcs', price: null, label: 'Volume quote' },
    { range: '100+ pcs', price: null, label: 'Bulk quote' },
    { range: '500+ pcs', price: null, label: 'Custom / export' },
  ];

  const chartForProduct = (() => {
    const slug = product.category_slug || '';
    if (slug.includes('kids')) return KIDS_SIZE_CHART;
    if (slug.includes('women')) return WOMENS_SIZE_CHART;
    if (slug.includes('mens') || slug.includes('slim') || slug.includes('boot') || slug.includes('regular') || slug.includes('distress')) {
      return MENS_SIZE_CHART;
    }
    return SIZE_CHART;
  })();

  return (
    <div className="pb-24 md:pb-10">
      <div className="max-w-[1280px] mx-auto px-4">
        <Breadcrumbs
          items={[
            { label: product.category_name || 'Jeans', path: `/category/${product.category_slug}` },
            { label: product.name },
          ]}
        />

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Images */}
          <div className="lg:sticky lg:top-36 lg:self-start">
            <div
              className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] bg-[#f5f5f5] rounded-2xl overflow-hidden cursor-zoom-in"
              onClick={() => setLightbox(true)}
            >
              <SafeImage src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.is_new && <span className="bg-[#1a1a1a] text-white text-[10px] px-2.5 py-1 rounded font-bold tracking-wide">NEW</span>}
                {product.is_bestseller && <span className="bg-[#e11d48] text-white text-[10px] px-2.5 py-1 rounded font-bold tracking-wide">BESTSELLER</span>}
              </div>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i - 1 + images.length) % images.length); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow md:hidden"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i + 1) % images.length); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow md:hidden"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-20 sm:w-[72px] sm:h-[88px] rounded-xl overflow-hidden border-2 shrink-0 transition ${i === activeImage ? 'border-[#1a1a1a]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <SafeImage src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                {product.category_name && (
                  <p className="text-xs text-[#e11d48] font-semibold uppercase tracking-wide">
                    {product.category_name}
                  </p>
                )}
                <h1 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-[#1a1a1a] mt-1 mb-2 leading-snug tracking-tight">
                  {product.name}
                </h1>
              </div>
              <button type="button" onClick={handleShare} className="shrink-0 p-2 border border-[#e8e8e8] rounded-full hover:border-[#1a1a1a] transition" aria-label="Share">
                <Share2 size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.floor(parseFloat(product.rating)) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                ))}
              </div>
              <span className="text-sm font-semibold">{product.rating}</span>
              <span className="text-sm text-gray-400">({product.review_count} reviews)</span>
            </div>

            {product.short_description && (
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{product.short_description}</p>
            )}

            {/* Pricing */}
            <div className="bg-[#faf9f7] border border-[#f0f0f0] rounded-2xl p-4 sm:p-5 mb-5">
              <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
                <span className="text-2xl sm:text-3xl font-bold text-[#1a1a1a]">{formatPrice(wholesalePrice)}</span>
                <span className="text-base text-gray-400 line-through">{formatPrice(product.retail_price)}</span>
                <span className="text-xs bg-[#e11d48] text-white px-2 py-0.5 rounded font-bold">WHOLESALE</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">per piece · MOQ {product.moq} pcs{product.sku ? ` · SKU: ${product.sku}` : ''}</p>
              {product.stock !== undefined && (
                <p className={`text-xs mt-1 font-medium ${product.stock > 100 ? 'text-green-600' : 'text-amber-600'}`}>
                  {product.stock > 0 ? `${product.stock}+ pcs in stock` : 'Made to order'}
                </p>
              )}
              <div className="mt-3 pt-3 border-t border-[#e8e8e8] flex justify-between items-center">
                <span className="text-sm text-gray-600">Order total ({quantity} pcs)</span>
                <span className="text-lg font-bold text-[#1a1a1a]">{formatPrice(totalPrice)}</span>
              </div>
              {savings > 0 && (
                <p className="text-xs text-green-600 mt-1">You save {formatPrice(savings)} vs retail</p>
              )}
            </div>

            {/* Bulk tiers */}
            <div className="mb-5">
              <p className="text-sm font-semibold mb-2">Bulk Pricing</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {bulkTiers.map((t) => (
                  <div key={t.range} className="border border-[#e8e8e8] rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{t.label}</p>
                    <p className="text-xs font-medium mt-0.5 mb-1">{t.range}</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">
                      {t.price ? formatPrice(t.price) : 'Contact'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Selectors */}
            <div className="space-y-4 mb-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold">Select Size</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('sizechart')}
                    className="text-xs font-semibold text-[#c41e3a] hover:underline inline-flex items-center gap-1"
                  >
                    <Ruler size={13} /> Size Chart
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s: string) => (
                    <button key={s} type="button" onClick={() => setSize(s)} className={btnClass(size === s)}>{s}</button>
                  ))}
                </div>
                <Link to="/size-chart" className="mt-2 inline-block text-xs text-[#5c6775] hover:text-[#0f1724] underline underline-offset-2">
                  View full size chart (Men / Women / Kids)
                </Link>
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block">Quantity <span className="font-normal text-gray-400">(min {product.moq})</span></label>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setQuantity(Math.max(product.moq, quantity - 1))} className="w-11 h-11 border border-[#e8e8e8] rounded-xl flex items-center justify-center hover:border-[#1a1a1a] active:scale-95 transition">
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min={product.moq}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(product.moq, parseInt(e.target.value) || product.moq))}
                    className="w-20 h-11 text-center text-lg font-semibold border border-[#e8e8e8] rounded-xl focus:outline-none focus:border-[#1a1a1a]"
                  />
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-11 h-11 border border-[#e8e8e8] rounded-xl flex items-center justify-center hover:border-[#1a1a1a] active:scale-95 transition">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden md:block mb-4">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={adding}
                className="w-full h-12 bg-[#1a1a1a] text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[#333] transition disabled:opacity-50"
              >
                <ShoppingBag size={18} /> {adding ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>

            {msg && (
              <p className={`text-sm mb-4 ${msg.includes('success') || msg.includes('copied') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-[#f0f0f0] mb-6">
              {[
                { icon: Truck, label: 'Pan India Delivery' },
                { icon: Shield, label: 'Export Quality' },
                { icon: RotateCcw, label: '7-Day Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center px-1">
                  <Icon size={20} className="mx-auto mb-1.5 text-[#1a1a1a]" strokeWidth={1.5} />
                  <p className="text-[10px] sm:text-xs text-gray-500 leading-tight">{label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div>
              <div className="flex gap-1 overflow-x-auto scrollbar-hide border-b border-[#e8e8e8] mb-4">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition shrink-0 ${
                      activeTab === id ? 'border-[#1a1a1a] text-[#1a1a1a]' : 'border-transparent text-gray-500 hover:text-[#1a1a1a]'
                    }`}
                  >
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>

              <div className="text-sm text-gray-600 leading-relaxed min-h-[120px]">
                {activeTab === 'description' && (
                  <div className="space-y-3">
                    <p>{product.description}</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-500">
                      <li>Premium {product.fit} fit denim</li>
                      <li>{product.fabric} composition</li>
                      <li>{product.wash} wash finish</li>
                      <li>Ideal for retail stores, boutiques & distributors</li>
                    </ul>
                  </div>
                )}
                {activeTab === 'specs' && (
                  <table className="w-full text-sm">
                    <tbody>
                      {[
                        ['Category', product.category_name],
                        ['Fit', product.fit],
                        ['Fabric', product.fabric],
                        ['Wash', product.wash],
                        ['SKU', product.sku || 'N/A'],
                        ['MOQ', `${product.moq} pieces`],
                        ['Available Sizes', sizes.join(', ')],
                      ].map(([k, v]) => (
                        <tr key={k} className="border-b border-[#f0f0f0]">
                          <td className="py-2.5 font-medium text-[#1a1a1a] w-2/5">{k}</td>
                          <td className="py-2.5 text-gray-600">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {activeTab === 'sizechart' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[360px]">
                      <thead>
                        <tr className="bg-[#faf9f7]">
                          <th className="py-2.5 px-3 text-left font-semibold">Size</th>
                          <th className="py-2.5 px-3 text-left font-semibold">Waist</th>
                          <th className="py-2.5 px-3 text-left font-semibold">Hip</th>
                          <th className="py-2.5 px-3 text-left font-semibold">Inseam</th>
                          <th className="py-2.5 px-3 text-left font-semibold">Length</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(chartForProduct.filter((r) => sizes.includes(r.size)).length
                          ? chartForProduct.filter((r) => sizes.includes(r.size))
                          : chartForProduct
                        ).map((row) => (
                          <tr key={row.size} className={`border-b border-[#f0f0f0] ${size === row.size ? 'bg-[#faf9f7] font-medium' : ''}`}>
                            <td className="py-2.5 px-3">{row.size}</td>
                            <td className="py-2.5 px-3">{row.waist}</td>
                            <td className="py-2.5 px-3">{row.hip}</td>
                            <td className="py-2.5 px-3">{row.inseam}</td>
                            <td className="py-2.5 px-3">{row.length}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="text-xs text-gray-400 mt-3">
                      Measurements are approximate.{' '}
                      <Link to="/size-chart" className="text-[#c41e3a] font-medium hover:underline">
                        Full size chart →
                      </Link>
                    </p>
                  </div>
                )}
                {activeTab === 'shipping' && (
                  <div className="space-y-3">
                    <p><strong className="text-[#1a1a1a]">Delivery:</strong> 3–7 business days pan India. Bulk orders (50+ pcs) dispatched in 7–10 days.</p>
                    <p><strong className="text-[#1a1a1a]">Shipping:</strong> ₹199 flat · Free on orders above ₹25,000.</p>
                    <p><strong className="text-[#1a1a1a]">Returns:</strong> Defective items can be returned within 7 days. Sample policy available for new buyers.</p>
                    <p><strong className="text-[#1a1a1a]">Payment:</strong> Cash on Delivery (COD) only.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-10 sm:mt-14 border-t border-[#f0f0f0] pt-8">
            <Section title="You May Also Like" viewAllLink={`/category/${product.category_slug}`}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {related.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </Section>
          </div>
        )}
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-[#e8e8e8] px-4 py-3 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="shrink-0 flex-1">
            <p className="text-lg font-bold text-[#1a1a1a]">{formatPrice(totalPrice)}</p>
            <p className="text-[10px] text-gray-400">{quantity} pcs · Size {size}</p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className="flex-1 max-w-[180px] h-11 bg-[#1a1a1a] text-white rounded-full font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingBag size={16} /> {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button type="button" className="absolute top-4 right-4 text-white p-2" onClick={() => setLightbox(false)}>
            <X size={28} />
          </button>
          <img src={images[activeImage]} alt={product.name} className="max-w-[95vw] max-h-[85vh] object-contain" onClick={(e) => e.stopPropagation()} />
          {images.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i - 1 + images.length) % images.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 text-white p-3">
                <ChevronLeft size={28} />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i + 1) % images.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white p-3">
                <ChevronRight size={28} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
