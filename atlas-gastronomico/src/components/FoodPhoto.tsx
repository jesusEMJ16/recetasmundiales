"use client";
import { useState } from "react";
import { Utensils } from "lucide-react";

/** Native responsive images: no third-party hotlinks or image-service dependency. */
export function FoodPhoto({ src, srcSet, sizes, alt, className, width = 640, height = 480, priority = false, fallbackLabel }: {
  src?: string; srcSet?: string; sizes?: string; alt: string; className?: string;
  width?: number; height?: number; priority?: boolean; fallbackLabel?: string;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (!src || failed === src) {
    return (
      <div role="img" aria-label={fallbackLabel ? `${alt}: ${fallbackLabel}` : alt}
        className={`img-placeholder flex w-full flex-col items-center justify-center gap-3 ${className ?? "h-full"}`}>
        <Utensils size={38} strokeWidth={1.3} aria-hidden="true" />
        {fallbackLabel && <span className="px-4 text-center text-sm text-ink-soft">{fallbackLabel}</span>}
      </div>
    );
  }
  // Files and sizes are generated ahead of time and validated in CI.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} srcSet={srcSet} sizes={srcSet ? sizes : undefined} alt={alt}
    width={width} height={height} className={className} decoding="async"
    loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined}
    onError={() => setFailed(src)} />;
}
