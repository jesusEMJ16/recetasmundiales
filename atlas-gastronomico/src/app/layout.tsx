import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import { defaultLocale, localeMeta } from "../i18n/config";
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

// Dominio del sitio: en Vercel se detecta solo; en local usa localhost.
// Para tu dominio propio, define NEXT_PUBLIC_SITE_URL en Vercel (p. ej. https://atlasgastronomico.com).
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Atlas Gastronómico Mundial — Explora México cocinando",
    template: "%s · Atlas Gastronómico",
  },
  description:
    "Un atlas interactivo de la cocina de México: explora por estado, descubre recetas con procedencia y ordénalas por estrellas, novedad o tiempo.",
  keywords: ["recetas mexicanas", "cocina de méxico", "gastronomía", "atlas culinario"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={localeMeta[defaultLocale].htmlLang} className={`${fraunces.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
