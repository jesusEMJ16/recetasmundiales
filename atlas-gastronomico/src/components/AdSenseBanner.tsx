"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ADSENSE_CLIENT } from "../site";

// adsbygoogle.js se carga una sola vez en app/layout.tsx.
declare global {
  interface Window {
    adsbygoogle?: object[];
  }
}

interface AdSenseProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "horizontal";
  layout?: "in-article" | "in-feed" | "fixed";
  className?: string;
}

export default function AdSenseBanner({ 
  slot, 
  format = "auto", 
  layout,
  className = "my-4" 
}: AdSenseProps) {
  const pathname = usePathname();

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn("AdSense error:", e);
    }
  }, [pathname, slot]);

  return (
    <div className={`${className} w-full flex justify-center`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layout && { "data-layout": layout })}
      />
    </div>
  );
}

// Componente para anuncios nativos (estilo contenido)
export function NativeAd({ title, description, cta, imageUrl, className = "" }: {
  title: string;
  description: string;
  cta: string;
  imageUrl?: string;
  className?: string;
}) {
  return (
    <div className={`bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-750 rounded-xl p-4 border border-orange-100 dark:border-gray-700 ${className}`}>
      <div className="flex items-start gap-3">
        {imageUrl && (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
              Anuncio
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{description}</p>
          <button className="text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors">
            {cta} →
          </button>
        </div>
      </div>
    </div>
  );
}

// Banner horizontal para header o entre contenido
export function HorizontalAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={`w-full h-[90px] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <AdSenseBanner slot={slot} format="horizontal" className="h-full" />
    </div>
  );
}

// Banner rectangular para sidebar
export function RectangleAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={`w-[300px] h-[250px] bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <AdSenseBanner slot={slot} format="rectangle" className="w-full h-full" />
    </div>
  );
}

// Anuncio in-feed (integrado en listas)
export function InFeedAd({ slot, className = "" }: { slot: string; className?: string }) {
  return (
    <div className={`w-full bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-dashed border-gray-200 dark:border-gray-700 ${className}`}>
      <AdSenseBanner slot={slot} format="fluid" layout="in-feed" className="min-h-[150px]" />
    </div>
  );
}
