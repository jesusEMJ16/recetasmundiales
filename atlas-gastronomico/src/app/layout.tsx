import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import { defaultLocale, localeMeta } from "../i18n/config";
import { ADSENSE_CLIENT, SITE_URL } from "../site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dmsans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Atlas Gastronómico Mundial — El mundo, plato por plato",
    template: "%s · Atlas Gastronómico",
  },
  description:
    "Un atlas interactivo de la cocina del mundo: explora por país y región, descubre recetas con procedencia y ordénalas por estrellas, novedad o tiempo.",
  keywords: ["recetas del mundo", "cocina internacional", "recetas mexicanas", "gastronomía", "atlas culinario"],
  // Verificación de la cuenta de Google AdSense.
  other: { "google-adsense-account": ADSENSE_CLIENT },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang={localeMeta[defaultLocale].htmlLang} className={`${fraunces.variable} ${dmSans.variable}`}>
      <head>
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches));}catch(e){document.documentElement.classList.toggle('dark',matchMedia('(prefers-color-scheme: dark)').matches);}})();` }} />
        {/* Google AdSense: se sirve en el HTML, tal como indica el código de AdSense. */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
