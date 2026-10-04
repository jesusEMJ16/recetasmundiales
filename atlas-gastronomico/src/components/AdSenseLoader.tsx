"use client";
import Script from "next/script";
import { ADSENSE_CLIENT, ADSENSE_ENABLED } from "../site";

// Enable only after site approval and configuration of Google's required consent messages.
// This loader is mounted on translated recipe pages, never empty catalogs or utility pages.
export function AdSenseLoader() {
  if (!ADSENSE_ENABLED) return null;
  return <Script id="worldbites-adsense" strategy="afterInteractive"
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
    crossOrigin="anonymous" />;
}
