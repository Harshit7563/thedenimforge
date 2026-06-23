import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { type Product, formatPrice } from '../lib/api';
import { FALLBACK_IMAGE } from '../lib/images';
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
    return ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600'];
  }
}

export default function ProductCard({ product, showHotBadge }: Props) {
  const images = getImages(product.images);
  const image = images[0] || FALLBACK_IMAGE;

  return (
    <Link to={`/product/${product.slug}`} className="product-card group block bg-white rounded-xl overflow-hidden border border-[#f0f0f0]">
      <div className="relative aspect-[4/5] bg-[#f5f5f5] overflow-hidden">
        <SafeImage
          src={image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {showHotBadge && (
            <span className="bg-gradient-to-r from-orange-500 to-[#e11d48] text-white text-[10px] px-2 py-0.5 rounded-sm font-bold tracking-wide">🔥 HOT</span>
          )}
          {product.is_new && (
            <span className="bg-[#1a1a1a] text-white text-[10px] px-2 py-0.5 rounded-sm font-semibold tracking-wide">NEW</span>
          )}
          {product.is_bestseller && (
            <span className="bg-[#e11d48] text-white text-[10px] px-2 py-0.5 rounded-sm font-semibold tracking-wide">BESTSELLER</span>
          )}
        </div>
      </div>

      <div className="p-3 sm:p-3.5">
        {product.brand_name && (
          <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 truncate">{product.brand_name}</p>
        )}
        <h3 className="text-[13px] sm:text-sm font-medium text-[#1a1a1a] line-clamp-2 leading-snug min-h-[2.5rem] group-hover:text-[#e11d48] transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mt-1.5 mb-2">
          <Star size={11} className="fill-amber-400 text-amber-400" />
          <span className="text-[11px] text-gray-500">{product.rating} · {product.review_count} reviews</span>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#1a1a1a]">{formatPrice(product.wholesale_price)}</span>
            <span className="text-[11px] text-gray-400 line-through">{formatPrice(product.retail_price)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#e11d48] font-semibold uppercase tracking-wide">Wholesale</span>
            <span className="text-[10px] text-gray-400">MOQ {product.moq}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
