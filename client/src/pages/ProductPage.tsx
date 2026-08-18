import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Minus, Plus, Truck, Shield, RotateCcw,
  Share2, X, ChevronLeft, ChevronRight, Package, Ruler, ChevronDown,
} from 'lucide-react';
import { api, formatPrice } from '../lib/api';
import type { Product } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Breadcrumbs from '../components/Breadcrumbs';
import ProductCard from '../components/ProductCard';
import SafeImage from '../components/SafeImage';
import { FALLBACK_IMAGE } from '../lib/images';
import { MIN_ORDER_QTY } from '../lib/categories';
import { SIZE_CHART, MENS_SIZE_CHART, WOMENS_SIZE_CHART, KIDS_SIZE_CHART } from '../lib/sizeChart';

function parseJsonField<T>(val: T | string, fallback: T): T {
  if (Array.isArray(val)) return val as T;
  try { return JSON.parse(val as string); } catch { return fallback; }
}

function discountPct(retail: string | number, wholesale: string | number) {
  const r = Number(retail);
  const w = Number(wholesale);
  if (!r || !w || r <= w) return null;
  return Math.round(((r - w) / r) * 100);
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#e8e8e8]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-xs font-bold uppercase tracking-[0.16em]">{title}</span>
        <ChevronDown size={18} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-5 text-sm text-[#555] leading-relaxed">{children}</div>}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8 animate-pulse">
      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 aspect-[4/5] bg-[#efece6]" />
        <div className="lg:col-span-5 space-y-4 pt-4">
          <div className="h-4 bg-[#efece6] w-1/3" />
          <div className="h-8 bg-[#efece6] w-3/4" />
          <div className="h-10 bg-[#efece6] w-1/2" />
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
        setQuantity(MIN_ORDER_QTY);
        setActiveImage(0);
        if (p.category_slug) {
          api.getProducts({ category: p.category_slug, limit: '8' })
            .then((items) => setRelated(items.filter((i) => i.slug !== p.slug).slice(0, 4)))
            .catch(() => {});
        }
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  const wholesalePrice = product ? parseFloat(product.wholesale_price) : 0;
  const totalPrice = wholesalePrice * quantity;
  const save = product ? discountPct(product.retail_price, product.wholesale_price) : null;
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
      setMsg('Added to bag');
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
      setMsg('Link copied');
      setTimeout(() => setMsg(''), 2000);
    }
  };

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Package size={48} className="mx-auto text-[#ddd] mb-4" />
        <h1 className="font-display text-3xl font-bold mb-2">Product not found</h1>
        <p className="text-sm text-[#6b6b6b] mb-6">This style may have been removed.</p>
        <Link to="/" className="btn-primary">Back to shop</Link>
      </div>
    );
  }

  if (!product) return <ProductSkeleton />;

  const images = parseJsonField(product.images, [FALLBACK_IMAGE]);
  const sizes = parseJsonField(product.sizes, ['32']);

  const chartForProduct = (() => {
    const s = product.category_slug || '';
    if (s.includes('kids')) return KIDS_SIZE_CHART;
    if (s.includes('women')) return WOMENS_SIZE_CHART;
    if (s.includes('mens') || s.includes('slim') || s.includes('boot') || s.includes('regular') || s.includes('distress')) {
      return MENS_SIZE_CHART;
    }
    return SIZE_CHART;
  })();

  const chartRows = chartForProduct.filter((r) => sizes.includes(r.size)).length
    ? chartForProduct.filter((r) => sizes.includes(r.size))
    : chartForProduct;

  return (
    <div className="pb-24 lg:pb-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-0 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <Breadcrumbs
            items={[
              { label: product.category_name || 'Shop', path: `/category/${product.category_slug}` },
              { label: product.name },
            ]}
          />
        </div>

        <div className="grid lg:grid-cols-12 lg:gap-10 xl:gap-16">
          <div className="lg:col-span-7">
            <div className="lg:hidden relative aspect-[3/4] bg-[#efece6]">
              <SafeImage src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              {save != null && save >= 5 && (
                <span className="absolute left-0 top-4 bg-[#c8102e] text-white text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1">
                  {save}% Off
                </span>
              )}
              {images.length > 1 && (
                <>
                  <button type="button" onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white flex items-center justify-center" aria-label="Previous">
                    <ChevronLeft size={18} />
                  </button>
                  <button type="button" onClick={() => setActiveImage((i) => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-white flex items-center justify-center" aria-label="Next">
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                    {images.map((_, i) => (
                      <button key={i} type="button" onClick={() => setActiveImage(i)} className={`h-1.5 rounded-full ${i === activeImage ? 'w-6 bg-[#111]' : 'w-1.5 bg-white/80'}`} aria-label={`Image ${i + 1}`} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="hidden lg:grid grid-cols-[72px_1fr] gap-3">
              <div className="flex flex-col gap-2 sticky top-36 self-start max-h-[70vh] overflow-y-auto scrollbar-hide">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`aspect-[3/4] overflow-hidden border ${i === activeImage ? 'border-[#111]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  >
                    <SafeImage src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <button type="button" className="relative aspect-[3/4] bg-[#efece6] overflow-hidden" onClick={() => setLightbox(true)}>
                <SafeImage src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
                {save != null && save >= 5 && (
                  <span className="absolute left-0 top-5 bg-[#c8102e] text-white text-[11px] font-bold uppercase tracking-[0.14em] px-3 py-1.5">
                    {save}% Off
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 px-4 sm:px-0 pt-5 lg:pt-2 lg:sticky lg:top-36 lg:self-start">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#c8102e] font-semibold mb-2">
              {product.category_name || 'Denim'}
            </p>
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-[1.35rem] sm:text-2xl font-semibold leading-snug text-[#111] normal-case tracking-tight" style={{ fontFamily: 'var(--font-sans)' }}>
                {product.name}
              </h1>
              <button type="button" onClick={handleShare} className="shrink-0 p-2 border border-[#111]" aria-label="Share">
                <Share2 size={16} />
              </button>
            </div>

            <div className="mt-4 flex items-baseline flex-wrap gap-x-3 gap-y-1">
              <span className="text-2xl sm:text-3xl font-bold">{formatPrice(wholesalePrice)}</span>
              <span className="text-base text-[#8a8a8a] line-through">{formatPrice(product.retail_price)}</span>
              {save != null && save >= 5 && (
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#c8102e]">{save}% off</span>
              )}
            </div>
            <p className="text-xs text-[#6b6b6b] mt-1.5">Wholesale price · MOQ {MIN_ORDER_QTY} piece{product.sku ? ` · ${product.sku}` : ''}</p>
            {savings > 0 && (
              <p className="text-xs text-[#1a7a3a] mt-1">You save {formatPrice(savings)} vs MRP on this qty</p>
            )}

            <div className="mt-7">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-[0.16em]">Select size</p>
                <Link to="/size-chart" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#c8102e] inline-flex items-center gap-1">
                  <Ruler size={12} /> Size chart
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s: string) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`min-w-[48px] h-12 px-3 text-sm font-semibold border transition ${
                      size === s ? 'bg-[#111] text-white border-[#111]' : 'border-[#111] bg-white text-[#111] hover:bg-[#f6f4f0]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] mb-3">Quantity</p>
              <div className="inline-flex items-center border border-[#111]">
                <button type="button" onClick={() => setQuantity(Math.max(MIN_ORDER_QTY, quantity - 1))} className="w-12 h-12 flex items-center justify-center" aria-label="Decrease">
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min={MIN_ORDER_QTY}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(MIN_ORDER_QTY, parseInt(e.target.value) || MIN_ORDER_QTY))}
                  className="w-14 h-12 text-center text-base font-semibold border-x border-[#111] focus:outline-none"
                />
                <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center" aria-label="Increase">
                  <Plus size={16} />
                </button>
              </div>
              <p className="text-sm mt-3">
                Order total: <strong>{formatPrice(totalPrice)}</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={adding}
              className="hidden lg:flex w-full mt-7 h-14 bg-[#111] text-white text-xs font-bold uppercase tracking-[0.18em] items-center justify-center gap-2 hover:bg-[#c8102e] transition disabled:opacity-50"
            >
              <ShoppingBag size={16} /> {adding ? 'Adding…' : 'Add to bag'}
            </button>
            {msg && (
              <p className={`text-sm mt-3 ${msg.toLowerCase().includes('fail') ? 'text-[#c8102e]' : 'text-[#1a7a3a]'}`}>{msg}</p>
            )}

            <div className="grid grid-cols-3 gap-2 mt-8 py-5 border-y border-[#e8e8e8]">
              {[
                { icon: Truck, label: 'Pan India' },
                { icon: Shield, label: 'Export quality' },
                { icon: RotateCcw, label: '7-day returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="text-center">
                  <Icon size={18} className="mx-auto mb-1.5" strokeWidth={1.5} />
                  <p className="text-[10px] uppercase tracking-[0.12em] text-[#6b6b6b]">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-2">
              <Accordion title="Product details" defaultOpen>
                <p className="mb-3">{product.description || product.short_description}</p>
                <ul className="space-y-1 text-[#6b6b6b]">
                  {product.fit && <li>Fit: {product.fit}</li>}
                  {product.fabric && <li>Fabric: {product.fabric}</li>}
                  {product.wash && <li>Wash: {product.wash}</li>}
                  <li>MOQ: {MIN_ORDER_QTY} piece</li>
                </ul>
              </Accordion>
              <Accordion title="Specifications">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['Category', product.category_name],
                      ['Fit', product.fit],
                      ['Fabric', product.fabric],
                      ['Wash', product.wash],
                      ['SKU', product.sku || 'N/A'],
                      ['Sizes', sizes.join(', ')],
                    ].map(([k, v]) => (
                      <tr key={k} className="border-b border-[#f0f0f0]">
                        <td className="py-2 font-semibold text-[#111] w-1/3">{k}</td>
                        <td className="py-2">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Accordion>
              <Accordion title="Size & fit">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[340px]">
                    <thead>
                      <tr className="bg-[#111] text-white">
                        <th className="py-2 px-3 text-left font-semibold">Size</th>
                        <th className="py-2 px-3 text-left font-semibold">Waist</th>
                        <th className="py-2 px-3 text-left font-semibold">Hip</th>
                        <th className="py-2 px-3 text-left font-semibold">Inseam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartRows.map((row) => (
                        <tr key={row.size} className={`border-b border-[#e8e8e8] ${size === row.size ? 'bg-[#f6f4f0] font-medium' : ''}`}>
                          <td className="py-2 px-3">{row.size}</td>
                          <td className="py-2 px-3">{row.waist}</td>
                          <td className="py-2 px-3">{row.hip}</td>
                          <td className="py-2 px-3">{row.inseam}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Accordion>
              <Accordion title="Shipping & returns">
                <p className="mb-2">Delivery 3–7 business days pan India. Bulk (50+) in 7–10 days.</p>
                <p className="mb-2">Shipping ₹199 · Free above ₹25,000.</p>
                <p>Defective items returnable in 7 days. Payment: COD only.</p>
              </Accordion>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="px-4 sm:px-0 mt-14 sm:mt-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#c8102e] font-semibold mb-2">Complete the look</p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold">You may also like</h2>
              </div>
              <Link to={`/category/${product.category_slug}`} className="hidden sm:inline text-xs font-bold uppercase tracking-[0.16em] border-b-2 border-[#111] pb-0.5">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-[#e8e8e8] px-4 py-3 safe-bottom">
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <p className="text-lg font-bold leading-none">{formatPrice(totalPrice)}</p>
            <p className="text-[10px] text-[#6b6b6b] mt-1">Size {size} · {quantity} pc</p>
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={adding}
            className="flex-1 h-12 bg-[#111] text-white text-xs font-bold uppercase tracking-[0.16em] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingBag size={16} /> {adding ? 'Adding…' : 'Add to bag'}
          </button>
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={() => setLightbox(false)}>
          <button type="button" className="absolute top-4 right-4 text-white p-2" onClick={() => setLightbox(false)} aria-label="Close">
            <X size={28} />
          </button>
          <img src={images[activeImage]} alt={product.name} className="max-w-[95vw] max-h-[88vh] object-contain" onClick={(e) => e.stopPropagation()} />
          {images.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i - 1 + images.length) % images.length); }} className="absolute left-3 top-1/2 -translate-y-1/2 text-white p-3" aria-label="Previous">
                <ChevronLeft size={28} />
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); setActiveImage((i) => (i + 1) % images.length); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-white p-3" aria-label="Next">
                <ChevronRight size={28} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
