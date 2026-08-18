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
  const save = discountPct(product.retail_price, product.wholesale_price);
  const badge = showHotBadge
    ? 'Hot'
    : product.is_new
      ? 'New'
      : product.is_bestseller
        ? 'Best'
        : product.is_featured
          ? 'Top'
          : null;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-sm bg-white shadow-[0_1px_3px_rgba(15,23,36,0.06)] ring-1 ring-[#e4e7ec] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,36,0.12)] hover:ring-[#0f1724]/25 active:scale-[0.99]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#dfe5ee]">
        <SafeImage
          src={image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1724]/50 via-transparent to-transparent opacity-50 sm:opacity-60 transition-opacity group-hover:opacity-80" />

        <div className="absolute left-2 top-2 sm:left-3 sm:top-3 flex flex-col gap-1 sm:gap-1.5">
          {badge && (
            <span className="w-fit bg-[#0f1724] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.14em] text-white">
              {badge}
            </span>
          )}
          {save != null && save >= 10 && (
            <span className="w-fit bg-[#c41e3a] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[9px] font-bold uppercase tracking-wide text-white">
              Save {save}%
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2.5 py-3 sm:px-4 sm:py-4">
        <h3 className="font-display line-clamp-2 min-h-[2.4rem] sm:min-h-[2.75rem] text-[12px] sm:text-[15px] font-semibold leading-snug text-[#0f1724] transition-colors group-hover:text-[#c41e3a]">
          {product.name}
        </h3>

        {(product.fit || product.wash) && (
          <p className="mt-1 truncate text-[10px] sm:text-[11px] text-[#6b7585]">
            {[product.fit, product.wash].filter(Boolean).join(' · ')}
          </p>
        )}

        <div className="mt-auto pt-2.5 sm:pt-3.5 border-t border-[#eef1f5] mt-3 sm:mt-4">
          <p className="mb-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.14em] text-[#c41e3a]">
            Wholesale
          </p>
          <div className="flex items-end justify-between gap-1.5">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                <span className="text-[16px] sm:text-[20px] font-bold leading-none tracking-tight text-[#0f1724]">
                  {formatPrice(product.wholesale_price)}
                </span>
                <span className="text-[10px] sm:text-xs text-[#a0a8b4] line-through">
                  {formatPrice(product.retail_price)}
                </span>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-[#0f1724] px-1.5 sm:px-2.5 py-0.5 sm:py-1 text-[8px] sm:text-[10px] font-semibold text-white">
              MOQ {MIN_ORDER_QTY}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
