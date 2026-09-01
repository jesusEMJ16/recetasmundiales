import { getDictionary } from "@/i18n/dictionaries";
import { Locale, locales } from "@/i18n/config";
import { restaurants, getFeaturedRestaurants } from "@/data/restaurants";
import RestaurantCard from "@/components/RestaurantCard";
import AdSenseBanner, { NativeAd, InFeedAd } from "@/components/AdSenseBanner";

interface PageProps {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  
  const canonicalUrl = `https://worldbitesapp.com/${locale}/restaurantes`;
  
  return {
    title: `${dict.restaurants.title} - World Bites`,
    description: dict.restaurants.subtitle,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        locales.map((l) => [l, `https://worldbitesapp.com/${l}/restaurantes`])
      ),
    },
  };
}

export default async function RestaurantsPage({ params }: PageProps) {
  const { locale } = await params;
  const dict = getDictionary(locale);
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

      {/* Anuncio Horizontal Superior */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <AdSenseBanner slot="1234567890" format="horizontal" className="my-4" />
      </div>

      {/* Restaurantes Destacados */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                ⭐ {dict.restaurants.featured}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Los mejores restaurantes seleccionados para ti
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRestaurants.map((restaurant, index) => (
              <>
                <RestaurantCard key={restaurant.id} restaurant={restaurant} locale={locale} />
                {/* Insertar anuncio in-feed después del segundo restaurante */}
                {index === 1 && (
                  <InFeedAd slot="2345678901" className="md:col-span-2 lg:col-span-1" />
                )}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* Anuncio Nativo */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <NativeAd
            title="¿Tienes un restaurante?"
            description="Únete a World Bites y muestra tu cocina al mundo. Miles de foodies están buscando experiencias como la tuya."
            cta="Registra tu restaurante"
            imageUrl="/images/ads/restaurant-partner.jpg"
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
            {restaurants.map((restaurant, index) => (
              !restaurant.isFeatured && (
                <>
                  <RestaurantCard key={restaurant.id} restaurant={restaurant} locale={locale} />
                  {/* Insertar anuncio in-feed cada 3 restaurantes */}
                  {index % 3 === 2 && index < restaurants.length - 1 && (
                    <InFeedAd slot="3456789012" className="md:col-span-2 lg:col-span-1" />
                  )}
                </>
              )
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-8 sm:p-12 text-white shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              ¿Tienes un restaurante o puesto de comida?
            </h2>
            <p className="text-orange-100 mb-6 text-lg">
              Únete a nuestra comunidad y llega a miles de amantes de la comida de todo el mundo.
            </p>
            <button className="bg-white text-orange-600 font-semibold px-8 py-3 rounded-full hover:bg-orange-50 transition-colors shadow-lg">
              {dict.restaurants.add} →
            </button>
          </div>
        </div>
      </section>

      {/* Anuncio Rectangular Inferior */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <AdSenseBanner slot="4567890123" format="rectangle" className="my-4" />
      </div>
    </div>
  );
}
