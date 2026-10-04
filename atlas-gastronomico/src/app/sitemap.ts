import { MetadataRoute } from 'next';
import { PLACES } from '../data/places';
import { RECIPES } from '../data/recipes';
import { locales } from '../i18n/config';
import { getRecipeLocales } from '../i18n/recipe-content';
import { buildRecipeCounts } from '../domain/atlas';
import { placePathSlugs } from '../domain/places';
import { SITE_URL as BASE_URL } from '../site';
import { informationSlugs, informationUpdatedAt } from '../data/site-information';

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapEntries: MetadataRoute.Sitemap = [];
  const counts = buildRecipeCounts(PLACES, RECIPES);
  // Listing pages change when their recipes change, not on every build.
  const catalogUpdatedAt = new Date(RECIPES.map(recipe => recipe.updatedAt ?? recipe.publishedAt).sort().at(-1)!);

  // Páginas de recetas individuales para todos los idiomas
  locales.forEach((locale) => {
    // Homepage por idioma
    sitemapEntries.push({
      url: `${BASE_URL}/${locale}`,
      lastModified: catalogUpdatedAt,
      changeFrequency: 'weekly',
      priority: 1.0,
    });

    if (locale === 'es' || locale === 'en') {
      informationSlugs.forEach(slug => sitemapEntries.push({
        url: `${BASE_URL}/${locale}/informacion/${slug}`,
        lastModified: new Date(informationUpdatedAt), changeFrequency: 'monthly', priority: 0.3,
      }));
    }

    // Páginas de lugares (países y estados)
    // Keep the sitemap below protocol limits and avoid indexing empty catalogs.
    PLACES.filter(place => (counts.get(place.id) ?? 0) > 0).forEach((place) => {
      const slugs = placePathSlugs(place, PLACES);
      if (slugs.length > 0) {
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}/recetas/${slugs.join('/')}`,
          lastModified: catalogUpdatedAt,
          changeFrequency: 'weekly',
          priority: place.type === 'pais' ? 0.9 : 0.7,
        });
      }
    });

    // Páginas de recetas individuales
    RECIPES.filter(recipe => getRecipeLocales(recipe.id).includes(locale)).forEach((recipe) => {
      sitemapEntries.push({
        url: `${BASE_URL}/${locale}/receta/${recipe.slug}`,
        lastModified: new Date(recipe.updatedAt ?? recipe.publishedAt),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  });

  return sitemapEntries;
}
