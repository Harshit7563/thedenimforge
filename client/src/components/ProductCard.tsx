import { Link } from 'react-router-dom';
import { type Product, formatPrice } from '../lib/api';
import { FALLBACK_IMAGE } from '../lib/images';
import { MIN_ORDER_QTY } from '../lib/categories';
import SafeImage from './SafeImage';

interface Props {
  product: Product;
  showHotBadge?: boolean;
}

function getImages(images: Product['images']): string[] {
  if (Array.isArray(images)) return images;
  try {
    return JSON.parse(images as unknown as string);
  } catch {
    return [FALLBACK_IMAGE];
  }
}

function discountPct(retail: string | number, wholesale: string | number) {
  const r = Number(retail);
  const w = Number(wholesale);
  if (!r || !w || r <= w) return null;
  return Math.round(((r - w) / r) * 100);
}

export default function ProductCard({ product, showHotBadge }: Props) {
  const images = getImages(product.images);
  const image = images[0] || FALLBACK_IMAGE;
  const hover = images[1];
  const save = discountPct(product.retail_price, product.wholesale_price);
  const badge = showHotBadge
    ? 'Hot'
    : product.is_new
      ? 'New'
      : product.is_bestseller
        ? 'Best'
        : product.is_featured
          ? 'Featured'
          : null;

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#efece6]">
        <SafeImage
          src={image}
          alt={product.name}
          className={`h-full w-full object-cover transition duration-500 ${hover ? 'group-hover:opacity-0' : 'group-hover:scale-105'}`}
        />
        {hover && (
          <img
            src={hover}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:opacity-100"
          />
        )}
        {save != null && save >= 5 && (
          <span className="absolute left-0 top-3 bg-[#c8102e] text-white text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1">
            {save}% Off
          </span>
        )}
        {badge && (
          <span className="absolute right-0 top-3 bg-white text-[#111] text-[10px] font-bold uppercase tracking-[0.12em] px-2.5 py-1">
            {badge}
          </span>
        )}
      </div>
      <div className="pt-3 pb-1">
        <h3 className="text-[13px] sm:text-sm font-medium leading-snug text-[#111] line-clamp-2 min-h-[2.5rem] group-hover:underline underline-offset-2 normal-case tracking-normal" style={{ fontFamily: 'var(--font-sans)' }}>
          {product.name}
        </h3>
        {(product.fit || product.wash) && (
          <p className="mt-1 text-[11px] text-[#6b6b6b] truncate">
            {[product.fit, product.wash].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="mt-2 flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
          <span className="text-[15px] sm:text-base font-bold text-[#111]">
            {formatPrice(product.wholesale_price)}
          </span>
          <span className="text-xs text-[#8a8a8a] line-through">
            {formatPrice(product.retail_price)}
          </span>
        </div>
        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#6b6b6b]">
          MOQ {MIN_ORDER_QTY} · Wholesale
        </p>
      </div>
    </Link>
  );
}
