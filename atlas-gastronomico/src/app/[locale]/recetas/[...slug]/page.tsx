import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PLACES } from "../../../../data/places";
import { RECIPES } from "../../../../data/recipes";
import {
  resolvePlacePath, getChildren, getBreadcrumb, getRecipesForPlace,
} from "../../../../domain/places";
import { sortRecipes } from "../../../../domain/sorting";
import { filterRecipes } from "../../../../domain/filtering";
import type { Diet, Moment, SortKey } from "../../../../domain/types";
import { RecipeList } from "../../../../components/RecipeList";
import { SortControls } from "../../../../components/SortControls";
import { FilterControls } from "../../../../components/FilterControls";
import { StatesGrid } from "../../../../components/StatesGrid";
import { isLocale, locales, localeMeta } from "../../../../i18n/config";
import type { Locale } from "../../../../i18n/config";
import { getDictionary } from "../../../../i18n/dictionaries";
import { placeHref, placeHrefFromSlugs } from "../../../../i18n/routing";
import { translatePlaceName } from "../../../../i18n/content";
import { placePathSlugs } from "../../../../domain/places";

const VALID_SORTS: SortKey[] = ["estrellas", "recientes", "populares", "rapidas", "alfabetico"];

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    PLACES.map((p) => ({ locale, slug: placePathSlugs(p, PLACES) })),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string[] }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  
  const place = resolvePlacePath(slug, PLACES);
  if (!place) return {};
  
  const t = getDictionary(locale);
  const canonicalUrl = `https://worldbitesapp.com/${locale}/recetas/${slug.join('/')}`;
  const localeInfo = localeMeta[locale as Locale];
  const placeName = translatePlaceName(place, locale as Locale);
  const recipes = getRecipesForPlace(place.id, PLACES, RECIPES);
  
  // Build breadcrumb schema for place pages
  const breadcrumb = getBreadcrumb(place, PLACES);
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem" as const,
        position: 1,
        name: "Home",
        item: `https://worldbitesapp.com/${locale}`,
      },
      ...breadcrumb.map((p, index) => ({
        "@type": "ListItem" as const,
        position: index + 2,
        name: translatePlaceName(p, locale as Locale),
        item: `https://worldbitesapp.com/${locale}/recetas/${placePathSlugs(p, PLACES).join('/')}`,
      })),
    ],
  };
  
  return {
    title: t.place.title(placeName),
    description: `${t.place.kind[place.type]} · ${t.place.recipes(recipes.length)}. ${t.home.subtitle}`,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        locales.map((l) => [l, `https://worldbitesapp.com/${l}/recetas/${slug.join('/')}`])
      ),
    },
    openGraph: {
      title: t.place.title(placeName),
      description: `${t.place.kind[place.type]} · ${t.place.recipes(recipes.length)}`,
      type: "website",
      locale: localeInfo?.htmlLang || "es",
      url: canonicalUrl,
      siteName: "Atlas Gastronómico Mundial",
    },
    twitter: {
      card: "summary_large_image",
      title: t.place.title(placeName),
      description: `${t.place.kind[place.type]} · ${t.place.recipes(recipes.length)}`,
    },
  };
}

export default async function PlacePage({
  params, searchParams,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
  searchParams: Promise<{ sort?: string; momento?: string; tiempo?: string; dieta?: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;
  const t = getDictionary(locale);

  const place = resolvePlacePath(slug, PLACES);
  if (!place) notFound();

  const sort: SortKey = VALID_SORTS.includes(sp.sort as SortKey) ? (sp.sort as SortKey) : "estrellas";

  const allHere = getRecipesForPlace(place.id, PLACES, RECIPES);
  const filtered = filterRecipes(allHere, {
    momento: sp.momento as Moment | undefined,
    dieta: sp.dieta as Diet | undefined,
    maxTiempo: sp.tiempo ? Number(sp.tiempo) : undefined,
  });
  const recipes = sortRecipes(filtered, sort);

  const breadcrumb = getBreadcrumb(place, PLACES);
  const children = getChildren(place.id, PLACES);
  const childItems = children.map((c) => ({
    id: c.id,
    name: translatePlaceName(c, locale),
    href: placeHref(locale, c),
    count: getRecipesForPlace(c.id, PLACES, RECIPES).length,
  }));

  // Build breadcrumb schema for place pages (must be inside component to access variables)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem" as const,
        position: 1,
        name: "Home",
        item: `https://worldbitesapp.com/${locale}`,
      },
      ...breadcrumb.map((p, index) => ({
        "@type": "ListItem" as const,
        position: index + 2,
        name: translatePlaceName(p, locale as Locale),
        item: `https://worldbitesapp.com/${locale}/recetas/${placePathSlugs(p, PLACES).join('/')}`,
      })),
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: t.place.title(translatePlaceName(place, locale)),
    itemListElement: recipes.map((r, i) => ({
      "@type": "ListItem", position: i + 1, name: r.dishName, url: `/${locale}/receta/${r.slug}`,
    })),
  };

  // Combine ItemList schema with BreadcrumbList
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [jsonLd, breadcrumbSchema],
  };

  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }} />

      <nav className="reveal flex flex-wrap items-center gap-1 text-sm text-ink-soft">
        <Link href={`/${locale}`} className="transition-colors hover:text-terracota">{t.header.navHome}</Link>
        {breadcrumb.map((p) => (
          <span key={p.id} className="flex items-center gap-1">
            <span className="text-ink-faint">›</span>
            <Link
              href={placeHrefFromSlugs(locale, placePathSlugs(p, PLACES))}
              className={p.id === place.id ? "font-medium text-ink" : "transition-colors hover:text-terracota"}
            >
              {translatePlaceName(p, locale)}
            </Link>
          </span>
        ))}
      </nav>

      <header className="reveal" style={{ animationDelay: "60ms" }}>
        <p className="eyebrow text-terracota">{t.place.kind[place.type]} · {t.place.recipes(allHere.length)}</p>
        <h1 className="mt-2 font-display text-4xl leading-none text-ink sm:text-5xl">
          {t.place.title("")}<span className="deco-underline">{translatePlaceName(place, locale)}</span>
        </h1>
      </header>

      {childItems.length > 0 && (
        <section className="reveal space-y-3" style={{ animationDelay: "120ms" }}>
          <h2 className="font-display text-xl text-ink">
            {place.type === "pais" ? t.place.exploreByState : t.place.exploreByPlace}
          </h2>
          <StatesGrid
            items={childItems}
            searchLabel={place.type === "pais" ? t.place.searchState : t.place.searchPlace}
          />
        </section>
      )}

      <section className="space-y-4">
        <Suspense fallback={null}>
          <FilterControls />
        </Suspense>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink">{t.place.recipes(recipes.length)}</p>
          <Suspense fallback={null}>
            <SortControls current={sort} />
          </Suspense>
        </div>

        <RecipeList recipes={recipes} locale={locale} />
      </section>
    </div>
  );
}
