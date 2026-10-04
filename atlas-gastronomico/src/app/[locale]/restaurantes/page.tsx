import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale, locales, localeMeta, isLocale } from "@/i18n/config";
import { absoluteUrl } from "@/site";
import { restaurants } from "@/data/restaurants";
import RestaurantCard from "@/components/RestaurantCard";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  
  const dict = getDictionary(locale);
  const canonicalUrl = absoluteUrl(`/${locale}/restaurantes`);
  const localeInfo = localeMeta[locale];
  
  return {
    robots: { index: false, follow: true },
    title: `${dict.restaurants.title} - World Bites`,
    description: dict.restaurants.subtitle,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        locales.map((l) => [l, absoluteUrl(`/${l}/restaurantes`)])
      ),
    },
    openGraph: {
      title: dict.restaurants.title,
      description: dict.restaurants.subtitle,
      type: "website",
      locale: localeInfo.htmlLang,
      url: canonicalUrl,
      siteName: dict.header.brand,
    },
    twitter: {
      card: "summary_large_image",
      title: dict.restaurants.title,
      description: dict.restaurants.subtitle,
    },
  };
}

export default async function RestaurantsPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  const contentLocale = locale === "es" ? "es" : "en";
  return <div className="space-y-6 py-8">
    <h1 className="font-display text-4xl text-ink">{dict.restaurants.title}</h1>
    <p lang={contentLocale} className="rounded-xl border border-line bg-card p-5 leading-relaxed text-ink-soft">
      {contentLocale === "es"
        ? "Este directorio contiene fichas de ejemplo del prototipo. No ofrece reservas, registro de negocios ni opiniones verificadas. Los precios y otros datos deben confirmarse directamente con cada establecimiento."
        : "This directory contains example listings from the prototype. It does not offer reservations, business registration or verified reviews. Confirm prices and other details directly with each establishment."}
    </p>
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {restaurants.map(restaurant => <RestaurantCard key={restaurant.id} restaurant={restaurant} locale={locale} />)}
    </div>
  </div>;
}
