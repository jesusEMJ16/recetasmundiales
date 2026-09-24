import type { Metadata } from "next";
import { getDictionary } from "@/i18n/dictionaries";
import { Locale, locales, localeMeta, isLocale } from "@/i18n/config";
import { absoluteUrl } from "@/site";
import { restaurants, getFeaturedRestaurants } from "@/data/restaurants";
import RestaurantCard from "@/components/RestaurantCard";
import { NativeAd } from "@/components/AdSenseBanner";
import { siteUi } from "@/i18n/site-ui";

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
  const ui = siteUi[locale].restaurants;
  const featuredRestaurants = getFeaturedRestaurants();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-amber-500/10 dark:from-orange-500/5 dark:to-amber-500/5" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 mb-4">
            🍽️ {dict.header.navRestaurants}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-4">
            {dict.restaurants.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {dict.restaurants.subtitle}
          </p>
        </div>
      </section>

      {/* Restaurantes Destacados */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                ⭐ {dict.restaurants.featured}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {ui.featuredSubtitle}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* Anuncio Nativo */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <NativeAd
            title={ui.partnerTitle}
            description={ui.partnerText}
            cta={ui.partnerCta}
            badge={ui.sponsored}
          />
        </div>
      </section>

      {/* Todos los Restaurantes */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8">
            🌎 {dict.restaurants.nearby}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.filter((restaurant) => !restaurant.isFeatured).map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} locale={locale} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 sm:p-12 text-white shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              {ui.ctaTitle}
            </h2>
            <p className="text-orange-100 mb-6 text-lg">
              {ui.ctaText}
            </p>
            <button className="bg-white text-orange-600 font-semibold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors shadow-lg">
              {dict.restaurants.add} →
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
