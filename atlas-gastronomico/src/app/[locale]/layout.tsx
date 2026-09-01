import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "../../components/SiteHeader";
import { Analytics } from "../../components/Analytics";
import { isLocale, locales, localeMeta } from "../../i18n/config";
import { getDictionary } from "../../i18n/dictionaries";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  
  const t = getDictionary(locale);
  const canonicalUrl = `https://worldbitesapp.com/${locale}`;
  const localeInfo = localeMeta[locale];
  
  return {
    title: {
      default: `${t.home.eyebrow} — ${t.header.tagline}`,
      template: `%s | ${t.header.brand}`,
    },
    description: t.home.subtitle,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        locales.map((l) => [l, `https://worldbitesapp.com/${l}`])
      ),
    },
    openGraph: {
      title: t.home.eyebrow,
      description: t.home.subtitle,
      type: "website",
      locale: localeInfo.htmlLang,
      url: canonicalUrl,
      siteName: t.header.brand,
    },
    twitter: {
      card: "summary_large_image",
      title: t.home.eyebrow,
      description: t.home.subtitle,
    },
  };
}

// WebSite Schema for enhanced structured data
export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Atlas Gastronómico Mundial",
  alternateName: "World Bites App",
  url: "https://worldbitesapp.com",
  inLanguage: "es",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://worldbitesapp.com/{locale}/?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={localeMeta[locale].htmlLang}>
      <body className="min-h-screen">
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <SiteHeader locale={locale} />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-center text-xs text-ink-faint">
          Atlas Gastronómico — recetas con procedencia. Fotos con licencia abierta (Wikimedia Commons).
        </footer>
      </body>
    </html>
  );
}
