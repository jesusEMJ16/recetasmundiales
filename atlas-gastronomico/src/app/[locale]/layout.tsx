import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteHeader } from "../../components/SiteHeader";
import { Analytics } from "../../components/Analytics";
import { defaultLocale, isLocale, locales, localeMeta } from "../../i18n/config";
import type { Locale } from "../../i18n/config";
import { getDictionary } from "../../i18n/dictionaries";
import { SITE_URL, absoluteUrl } from "../../site";
import { siteUi } from "../../i18n/site-ui";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  
  const t = getDictionary(locale);
  const canonicalUrl = absoluteUrl(`/${locale}`);
  const localeInfo = localeMeta[locale];
  
  // Build hreflang links with x-default
  const hreflangLinks: Record<string, string> = Object.fromEntries(
    locales.map((l) => [l, absoluteUrl(`/${l}`)])
  );
  hreflangLinks['x-default'] = absoluteUrl(`/${defaultLocale}`);
  
  return {
    title: {
      default: `${t.home.eyebrow} — ${t.header.tagline}`,
      template: `%s | ${t.header.brand}`,
    },
    description: t.home.subtitle,
    alternates: {
      canonical: canonicalUrl,
      languages: hreflangLinks,
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

// WebSite structured data, in the language of the current page.
function websiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Atlas Gastronómico Mundial",
    alternateName: "World Bites App",
    url: SITE_URL,
    inLanguage: localeMeta[locale].htmlLang,
  };
}

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
    <div className="min-h-screen" lang={localeMeta[locale].htmlLang}>
        <Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema(locale)) }}
        />
        <a className="skip-link" href="#main-content">{siteUi[locale].skipToContent}</a>
        <SiteHeader locale={locale} />
        <main id="main-content" className="site-shell">{children}</main>
        <footer className="site-footer">
          <strong>WorldBites.</strong><span>{getDictionary(locale).header.tagline} · Wikimedia Commons</span>
        </footer>
      </div>
  );
}
