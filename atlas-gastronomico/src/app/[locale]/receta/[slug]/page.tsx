import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RECIPES } from "../../../../data/recipes";
import { PLACES } from "../../../../data/places";
import { getBreadcrumb, placePathSlugs } from "../../../../domain/places";
import { getRelatedRecipes } from "../../../../domain/related";
import { getRecipeImage } from "../../../../data/recipe-images";
import { StarRating } from "../../../../components/StarRating";
import { RecipeCard } from "../../../../components/RecipeCard";
import { isLocale, locales, localeMeta } from "../../../../i18n/config";
import type { Locale } from "../../../../i18n/config";
import { getDictionary } from "../../../../i18n/dictionaries";
import { placeHrefFromSlugs } from "../../../../i18n/routing";
import { translateRecipe, translatePlaceName } from "../../../../i18n/content";

export function generateStaticParams() {
  return locales.flatMap((locale) => RECIPES.map((r) => ({ locale, slug: r.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const base = RECIPES.find((x) => x.slug === slug);
  if (!base) return {};
  const r = isLocale(locale) ? translateRecipe(base, locale) : base;
  
  const canonicalUrl = `https://worldbitesapp.com/${locale}/receta/${slug}`;
  const localeInfo = localeMeta[locale as Locale];
  
  // Get place for breadcrumb
  const place = PLACES.find((p) => p.id === r.placeId);
  const placeName = place ? translatePlaceName(place, locale as Locale) : "Receta";

  // Build breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `https://worldbitesapp.com/${locale}`,
      },
      ...(place ? [{
        "@type": "ListItem" as const,
        position: 2,
        name: placeName,
        item: canonicalUrl,
      }] : []),
      {
        "@type": "ListItem" as const,
        position: place ? 3 : 2,
        name: r.dishName,
        item: canonicalUrl,
      },
    ],
  };

  return {
    title: r.dishName,
    description: r.summary,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        locales.map((l) => [l, `https://worldbitesapp.com/${l}/receta/${slug}`])
      ),
    },
    openGraph: {
      title: r.dishName,
      description: r.summary,
      type: "article",
      locale: localeInfo?.htmlLang || "es",
      url: canonicalUrl,
      siteName: "Atlas Gastronómico Mundial",
    },
    twitter: {
      card: "summary_large_image",
      title: r.dishName,
      description: r.summary,
    },
  };
}

function iso(min: number) {
  return `PT${min}M`;
}
function hasPhoto(src: string) {
  return src.startsWith("http") || src.startsWith("/");
}

export default async function RecipePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const base = RECIPES.find((r) => r.slug === slug);
  if (!base) notFound();

  const t = getDictionary(locale);
  const recipe = translateRecipe(base, locale);

  const place = PLACES.find((p) => p.id === recipe.placeId);
  const breadcrumb = place ? getBreadcrumb(place, PLACES) : [];
  const related = getRelatedRecipes(base, RECIPES, 6);

  const credit = getRecipeImage(recipe.slug);
  const photo = credit?.url ?? (hasPhoto(recipe.image) ? recipe.image : null);

  // Build breadcrumb schema
  const placeName = place ? translatePlaceName(place, locale as Locale) : "Receta";
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
      ...(place ? [{
        "@type": "ListItem" as const,
        position: 2,
        name: placeName,
        item: `https://worldbitesapp.com/${locale}/recetas/${placePathSlugs(place, PLACES).join('/')}`,
      }] : []),
      {
        "@type": "ListItem" as const,
        position: place ? 3 : 2,
        name: recipe.dishName,
        item: `https://worldbitesapp.com/${locale}/receta/${slug}`,
      },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.dishName,
    description: recipe.summary,
    image: photo ? [photo] : undefined,
    author: { "@type": "Organization", name: "Atlas Gastronómico Mundial" },
    prepTime: iso(recipe.prepTimeMin),
    cookTime: iso(recipe.cookTimeMin),
    totalTime: iso(recipe.totalTimeMin),
    recipeYield: t.recipe.servings(recipe.servings),
    recipeIngredient: recipe.ingredients.map((i) => i.text),
    recipeInstructions: recipe.steps.map((s) => ({ "@type": "HowToStep", text: typeof s === 'string' ? s : s.text })),
    aggregateRating: { "@type": "AggregateRating", ratingValue: recipe.ratingAvg, reviewCount: recipe.ratingCount },
  };

  // Combined schema with Recipe and BreadcrumbList
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [jsonLd, breadcrumbSchema],
  };

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }} />

      <nav className="reveal flex flex-wrap items-center gap-1 text-sm text-ink-soft">
        <Link href={`/${locale}`} className="transition-colors hover:text-terracota">{t.header.navHome}</Link>
        {breadcrumb.map((p) => (
          <span key={p.id} className="flex items-center gap-1">
            <span className="text-ink-faint">›</span>
            <Link href={placeHrefFromSlugs(locale, placePathSlugs(p, PLACES))} className="transition-colors hover:text-terracota">
              {translatePlaceName(p, locale)}
            </Link>
          </span>
        ))}
      </nav>

      <header className="reveal space-y-4" style={{ animationDelay: "60ms" }}>
        {place && <p className="eyebrow text-terracota">📍 {translatePlaceName(place, locale)}</p>}
        <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">{recipe.dishName}</h1>
        <div className="flex flex-wrap items-center gap-4">
          <StarRating value={recipe.ratingAvg} count={recipe.ratingCount} />
          <span className="text-sm capitalize text-ink-soft">· {t.moments[recipe.moment]}</span>
        </div>
        <p className="text-lg leading-relaxed text-ink-soft">{recipe.summary}</p>
      </header>

      <figure className="reveal-scale space-y-1.5" style={{ animationDelay: "120ms" }}>
        <div className="overflow-hidden rounded-[var(--radius-xl2)] border border-line shadow-[var(--shadow-card)]">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={recipe.dishName} className="aspect-[16/9] w-full object-cover" />
          ) : (
            <div className="img-placeholder flex aspect-[16/9] w-full items-center justify-center">
              <span className="text-7xl opacity-70">🍽️</span>
            </div>
          )}
        </div>
        {credit && (
          <figcaption className="text-right text-xs text-ink-faint">
            {t.recipe.photoCredit}: {credit.author} · {credit.license} ·{" "}
            <a href={credit.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-terracota">
              {t.recipe.via} Wikimedia Commons
            </a>
          </figcaption>
        )}
      </figure>

      <div className="flex flex-wrap gap-2.5 text-sm">
        <span className="rounded-full bg-card px-3 py-1.5 ring-1 ring-line">⏱ {recipe.totalTimeMin} min</span>
        <span className="rounded-full bg-card px-3 py-1.5 ring-1 ring-line">🍽 {t.recipe.servings(recipe.servings)}</span>
        <span className="rounded-full bg-card px-3 py-1.5 capitalize ring-1 ring-line">📊 {recipe.difficulty}</span>
        <span className="rounded-full bg-dorado/15 px-3 py-1.5 text-terracota-deep ring-1 ring-dorado/30">
          🏷 {t.recipe.confidence[recipe.originConfidence]}
        </span>
        {recipe.diet.map((d) => (
          <span key={d} className="rounded-full bg-agave/12 px-3 py-1.5 text-agave-deep ring-1 ring-agave/25">
            🌱 {t.diets[d]}
          </span>
        ))}
      </div>

      <section className="space-y-2">
        <h2 className="font-display text-2xl text-ink">{t.recipe.history}</h2>
        <p className="leading-relaxed text-ink-soft">{recipe.history}</p>
      </section>

      {recipe.nutrition && (
        <section className="rounded-[var(--radius-xl2)] border border-line bg-gradient-to-br from-agave/5 to-transparent p-5">
          <h2 className="font-display text-xl text-ink mb-3">📊 {t.recipe.nutrition || 'Información Nutricional'}</h2>
          <p className="text-sm text-ink-soft mb-4">{t.recipe.nutritionPerServing || 'Por porción'}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-paper p-3 text-center">
              <div className="text-2xl font-bold text-terracota">{recipe.nutrition.calories}</div>
              <div className="text-xs text-ink-faint uppercase tracking-wide">Calorías</div>
            </div>
            <div className="rounded-lg bg-paper p-3 text-center">
              <div className="text-2xl font-bold text-agave-deep">{recipe.nutrition.protein}g</div>
              <div className="text-xs text-ink-faint uppercase tracking-wide">Proteínas</div>
            </div>
            <div className="rounded-lg bg-paper p-3 text-center">
              <div className="text-2xl font-bold text-dorado-deep">{recipe.nutrition.carbohydrates}g</div>
              <div className="text-xs text-ink-faint uppercase tracking-wide">Carbohidratos</div>
            </div>
            <div className="rounded-lg bg-paper p-3 text-center">
              <div className="text-2xl font-bold text-terracota-soft">{recipe.nutrition.fat}g</div>
              <div className="text-xs text-ink-faint uppercase tracking-wide">Grasas</div>
            </div>
            <div className="rounded-lg bg-paper p-3 text-center">
              <div className="text-2xl font-bold text-ink">{recipe.nutrition.fiber}g</div>
              <div className="text-xs text-ink-faint uppercase tracking-wide">Fibra</div>
            </div>
            <div className="rounded-lg bg-paper p-3 text-center">
              <div className="text-2xl font-bold text-ink-soft">{recipe.nutrition.sodium}mg</div>
              <div className="text-xs text-ink-faint uppercase tracking-wide">Sodio</div>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[var(--radius-xl2)] border border-line bg-card p-5 shadow-[var(--shadow-card)] md:sticky md:top-20 md:self-start">
          <h2 className="font-display text-xl text-ink">{t.recipe.ingredients}</h2>
          <ul className="mt-3 space-y-2">
            {recipe.ingredients.map((i, idx) => (
              <li key={idx} className="flex gap-2.5 text-sm text-ink-soft">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracota" />
                <span>{i.text}{i.optional ? <em className="text-ink-faint"> ({t.recipe.optional})</em> : ""}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-xl text-ink">{t.recipe.preparation}</h2>
          <ol className="mt-3 space-y-4">
            {recipe.steps.map((s, idx) => {
              const stepText = typeof s === 'string' ? s : s.text;
              return (
                <li key={idx} className="flex gap-3.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-terracota font-display text-sm font-semibold text-paper">
                    {idx + 1}
                  </span>
                  <p className="pt-1 leading-relaxed text-ink-soft">{stepText}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="rounded-[var(--radius-xl2)] border border-line-soft bg-paper-2/50 p-5">
        <h2 className="eyebrow text-ink-faint">{t.recipe.sources}</h2>
        <ul className="mt-2 space-y-1 text-sm text-ink-soft">
          {recipe.sources.map((s, idx) => <li key={idx}>· {s}</li>)}
        </ul>
      </section>

      {related.length > 0 && (
        <section className="space-y-4 border-t border-line-soft pt-8">
          <div>
            <p className="eyebrow text-terracota">{t.recipe.relatedEyebrow}</p>
            <h2 className="font-display text-2xl text-ink">
              {place ? t.recipe.relatedTitle(translatePlaceName(place, locale)) : t.recipe.relatedTitleGeneric}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <RecipeCard key={r.id} recipe={r} index={i} locale={locale} />
            ))}
          </div>
          {place && (
            <div className="pt-1">
              <Link
                href={placeHrefFromSlugs(locale, placePathSlugs(place, PLACES))}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-terracota hover:underline"
              >
                {t.recipe.seeAll(translatePlaceName(place, locale))}
              </Link>
            </div>
          )}
        </section>
      )}
    </article>
  );
}
