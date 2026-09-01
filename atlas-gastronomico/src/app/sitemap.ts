import { MetadataRoute } from 'next';
import { PLACES } from '../data/places';
import { RECIPES } from '../data/recipes';
import { locales } from '../i18n/config';
import { placePathSlugs } from '../domain/places';

const BASE_URL = 'https://worldbitesapp.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Páginas de recetas individuales para todos los idiomas
  locales.forEach((locale) => {
    // Homepage por idioma
    sitemapEntries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    });

    // Página de restaurantes por idioma
    sitemapEntries.push({
      url: `${BASE_URL}/${locale}/restaurantes`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // Páginas de lugares (países y estados)
    PLACES.forEach((place) => {
      const slugs = placePathSlugs(place, PLACES);
      if (slugs.length > 0) {
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}/recetas/${slugs.join('/')}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: place.type === 'pais' ? 0.9 : 0.7,
        });
      }
    });

    // Páginas de recetas individuales
    RECIPES.forEach((recipe) => {
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}/receta/${recipe.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  });

  return sitemapEntries;
}
