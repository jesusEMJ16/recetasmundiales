"use client";
import { useState } from "react";
import { Utensils } from "lucide-react";

/** Keep the layout usable if a recipe's image URL is unavailable. */
export function FoodPhoto({ src, alt, className, width = 640, height = 480 }: {
  src: string; alt: string; className?: string; width?: number; height?: number;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  if (failed === src) return <div className="destination-placeholder img-placeholder"><Utensils size={38} strokeWidth={1.3} aria-hidden="true" /><span className="sr-only">{alt}</span></div>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={width} height={height} className={className} loading="lazy" onError={() => setFailed(src)} />;
}
