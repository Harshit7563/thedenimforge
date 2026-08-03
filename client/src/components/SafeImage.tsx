import { useEffect, useState } from 'react';
import { FALLBACK_IMAGE } from '../lib/images';

interface Props {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export default function SafeImage({ src, alt, className = '', loading = 'lazy' }: Props) {
  const [imgSrc, setImgSrc] = useState(src || FALLBACK_IMAGE);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setImgSrc(src || FALLBACK_IMAGE);
    setFailed(false);
  }, [src]);

  if (failed || !src) {
    return (
      <div className={`bg-[#e8ecf2] flex items-center justify-center ${className}`}>
        <img src={FALLBACK_IMAGE} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => {
        if (imgSrc !== FALLBACK_IMAGE) {
          setImgSrc(FALLBACK_IMAGE);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
