import { useState } from "react";

const FALLBACK = "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=800&h=1000&fit=crop";

export function SafeImage({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={failed ? FALLBACK : src}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      {...props}
    />
  );
}
