import Link from "next/link";
import { Restaurant } from "@/domain/types";
import { Locale } from "@/i18n/config";

interface RestaurantCardProps {
  restaurant: Restaurant;
  locale: Locale;
}

export default function RestaurantCard({ restaurant, locale }: RestaurantCardProps) {
  const priceDisplay = "$".repeat(restaurant.priceRange.length);
  
  return (
    <Link 
      href={`/${locale}/restaurantes/${restaurant.slug}`}
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800"
    >
      {/* Imagen */}
      <div className="relative h-48 overflow-hidden">
        {restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
            <span className="text-6xl">🍽️</span>
          </div>
        )}
        
        {/* Badge de destacado */}
        {restaurant.isFeatured && (
          <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            ⭐ Destacado
          </div>
        )}
        
        {/* Precio */}
        <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-gray-900 dark:text-white shadow-md">
          {priceDisplay}
        </div>
      </div>
      
      {/* Contenido */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
          {restaurant.rating && (
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {restaurant.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
          {restaurant.description}
        </p>
        
        {/* Tipo de cocina */}
        <div className="flex flex-wrap gap-2 mb-3">
          {restaurant.cuisineType.slice(0, 3).map((type, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full"
            >
              {type}
            </span>
          ))}
        </div>
        
        {/* Ubicación */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{restaurant.city}, {restaurant.state || restaurant.country}</span>
        </div>
        
        {/* Tags */}
        {restaurant.tags && restaurant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100 dark:border-gray-700">
            {restaurant.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
