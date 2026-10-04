import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RECIPES } from "../../../../data/recipes";
import { PLACES } from "../../../../data/places";
import { getBreadcrumb, placePathSlugs } from "../../../../domain/places";
import { getRelatedRecipes } from "../../../../domain/related";
import { getRecipeImage, photoSrcSet, absolutePhotoUrl } from "../../../../data/recipe-images";
import { StarRating } from "../../../../components/StarRating";
import { RecipeCard } from "../../../../components/RecipeCard";
import { FoodPhoto } from "../../../../components/FoodPhoto";
import { photoUi } from "../../../../i18n/photo-ui";
import { isLocale, locales, localeMeta, localeDirection } from "../../../../i18n/config";
import { getDictionary } from "../../../../i18n/dictionaries";
import { placeHrefFromSlugs } from "../../../../i18n/routing";
import { translatePlaceName } from "../../../../i18n/content";
import { translateRecipe, recipeContentLocale, getRecipeLocales } from "../../../../i18n/recipe-content";
import { recipeEditorialUi, nutritionLabels, translationPending } from "../../../../i18n/recipe-editorial-ui";
import { absoluteUrl } from "../../../../site";
import { trustUi, informationHref } from "../../../../i18n/trust-ui";
import { RecipeIngredients } from "../../../../components/RecipeIngredients";
import { AdSenseLoader } from "../../../../components/AdSenseLoader";
import { cookingGuides } from "../../../../data/cooking-guides";
import { editorialGuidesUi } from "../../../../i18n/editorial-guides-ui";
import { getRecipeReferences } from "../../../../domain/references";

export function generateStaticParams() {
  return locales.flatMap((locale) => RECIPES.map((r) => ({ locale, slug: r.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const base = RECIPES.find((x) => x.slug === slug);
  if (!base || !isLocale(locale)) return {};
  const r = translateRecipe(base, locale);
  
  const canonicalUrl = absoluteUrl(`/${locale}/receta/${slug}`);
  const photo = getRecipeImage(slug);
  const images = photo ? [{ url: absolutePhotoUrl(photo), width: photo.width, height: photo.height, alt: `${r.dishName}: ${r.summary}` }] : [];
  
  return {
    robots: { index: getRecipeLocales(base.id).includes(locale), follow: true },
    title: r.dishName,
    description: r.summary,
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        getRecipeLocales(base.id).map((l) => [l, absoluteUrl(`/${l}/receta/${slug}`)])
      ),
    },
    openGraph: {
      title: r.dishName,
      description: r.summary,
      type: "article",
      locale: localeMeta[recipeContentLocale(locale, base.id)].htmlLang,
      url: canonicalUrl,
      siteName: getDictionary(locale).header.brand,
      images,
    },
    twitter: {
      card: photo ? "summary_large_image" : "summary",
      images,
      title: r.dishName,
      description: r.summary,
    },
  };
}

function iso(min: number) {
  return `PT${min}M`;
}

export default async function RecipePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const base = RECIPES.find((r) => r.slug === slug);
  if (!base) notFound();

  const t = getDictionary(locale);
  const recipe = translateRecipe(base, locale);
  const contentLocale = recipeContentLocale(locale, base.id);
  const editorial = recipeEditorialUi[locale];
  const guideLanguage = locale === "es" ? "es" : "en";
  const guide = cookingGuides[slug]?.[guideLanguage];
  const guideUi = editorialGuidesUi[locale];
  const references = getRecipeReferences(recipe);

  const place = PLACES.find((p) => p.id === recipe.placeId);
  const breadcrumb = place ? getBreadcrumb(place, PLACES) : [];
  const related = getRelatedRecipes(base, RECIPES, 6);

  const credit = getRecipeImage(recipe.slug);
  const photo = credit?.url;

  // Build breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem" as const,
        position: 1,
        name: t.header.navHome,
        item: absoluteUrl(`/${locale}`),
      },
      ...(place ? [{
        "@type": "ListItem" as const,
        position: 2,
        name: translatePlaceName(place, locale),
        item: absoluteUrl(placeHrefFromSlugs(locale, placePathSlugs(place, PLACES))),
      }] : []),
      {
        "@type": "ListItem" as const,
        position: place ? 3 : 2,
        name: recipe.dishName,
        item: absoluteUrl(`/${locale}/receta/${slug}`),
      },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.dishName,
    description: recipe.summary,
    image: credit ? [absolutePhotoUrl(credit)] : undefined,
    author: { "@type": "Organization", name: "WorldBites", url: absoluteUrl(informationHref(locale, "acerca-de")) },
    prepTime: iso(recipe.prepTimeMin),
    cookTime: iso(recipe.cookTimeMin),
    totalTime: iso(recipe.totalTimeMin),
    inLanguage: contentLocale,
    datePublished: recipe.publishedAt,
    dateModified: recipe.updatedAt,
    recipeYield: t.recipe.servings(recipe.servings),
    recipeIngredient: recipe.ingredients.map((i) => i.text),
    recipeInstructions: recipe.steps.map((s) => ({ "@type": "HowToStep", text: typeof s === 'string' ? s : s.text })),
  };

  // Combined schema with Recipe and BreadcrumbList
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [jsonLd, breadcrumbSchema],
  };

  return (
    <article dir={localeDirection(locale)} className="mx-auto max-w-3xl space-y-8">
      {contentLocale === locale && <AdSenseLoader />}
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
        <h1 lang={contentLocale} dir={localeDirection(contentLocale)} className="font-display text-4xl leading-tight text-ink sm:text-5xl">{recipe.dishName}</h1>
        <div className="flex flex-wrap items-center gap-4">
          {recipe.ratingCount > 0 && <StarRating value={recipe.ratingAvg} count={recipe.ratingCount} locale={locale} />}
          <span className="text-sm capitalize text-ink-soft">· {t.moments[recipe.moment]}</span>
        </div>
        <p lang={contentLocale} dir={localeDirection(contentLocale)} className="text-lg leading-relaxed text-ink-soft">{recipe.summary}</p>
        <p className="text-sm text-ink-soft">
          <Link href={informationHref(locale, "politica-editorial")} className="underline">{trustUi[locale].editor}</Link>
          {recipe.updatedAt && <> · <time dateTime={recipe.updatedAt}>{recipe.updatedAt}</time></>}
          {" · "}<Link href={informationHref(locale, "contacto")} className="underline">{trustUi[locale].contact}</Link>
        </p>
        {contentLocale !== locale && <p className="text-sm text-ink-soft">{translationPending[locale]}</p>}
      </header>

      <figure className="reveal-scale space-y-1.5" style={{ animationDelay: "120ms" }}>
        <div className="overflow-hidden rounded-[var(--radius-xl2)] border border-line shadow-[var(--shadow-card)]">
          <FoodPhoto src={photo} srcSet={credit ? photoSrcSet(credit) : undefined}
            sizes="(max-width: 767px) 100vw, 768px" alt={`${recipe.dishName}: ${recipe.summary}`}
            width={credit?.width} height={credit?.height} priority
            className="aspect-[16/9] w-full object-cover"
            fallbackLabel={photoUi[locale].pending} />
        </div>
        {credit && credit.provider !== "WorldBites" && (
          <figcaption className="text-right text-xs text-ink-faint">
            <>
              {t.recipe.photoCredit}: {credit.author} · <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-terracota">{credit.license}</a> ·{" "}
              <a href={credit.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-terracota">
                {t.recipe.via} {credit.provider}
              </a>
              <span className="block mt-1">{photoUi[locale].transformed}</span>
            </>
          </figcaption>
        )}
      </figure>

      <div className="flex flex-wrap gap-2.5 text-sm">
        <span className="rounded-full bg-card px-3 py-1.5 ring-1 ring-line">⏱ {recipe.totalTimeMin} min</span>
        <span className="rounded-full bg-card px-3 py-1.5 ring-1 ring-line">🍽 {t.recipe.servings(recipe.servings)}</span>
        <span className="rounded-full bg-card px-3 py-1.5 capitalize ring-1 ring-line">📊 {editorial.difficulty[recipe.difficulty]}</span>
        <span className="rounded-full bg-dorado/15 px-3 py-1.5 text-terracota-deep ring-1 ring-dorado/30">
          🏷 {t.recipe.confidence[recipe.originConfidence]}
        </span>
        {recipe.diet.map((d) => (
          <span key={d} className="rounded-full bg-agave/12 px-3 py-1.5 text-agave-deep ring-1 ring-agave/25">
            🌱 {t.diets[d]}
          </span>
        ))}
      </div>

      <dl className="grid grid-cols-3 gap-3 rounded-xl border border-line bg-card p-4 text-sm">
        {[[editorial.prep, recipe.prepTimeMin], [editorial.cook, recipe.cookTimeMin], [editorial.rest, recipe.restTimeMin ?? 0]].map(([label, minutes]) => <div key={label}><dt className="text-ink-soft">{label}</dt><dd className="mt-1 font-semibold text-ink">{Number(minutes).toLocaleString(locale)} min</dd></div>)}
      </dl>

      <section className="space-y-2">
        <h2 className="font-display text-2xl text-ink">{t.recipe.history}</h2>
        <p lang={contentLocale} dir={localeDirection(contentLocale)} className="leading-relaxed text-ink-soft">{recipe.history}</p>
      </section>

      {recipe.nutrition && (
        <section className="rounded-[var(--radius-xl2)] border border-line bg-gradient-to-br from-agave/5 to-transparent p-5">
          <h2 className="font-display text-xl text-ink mb-3">📊 {t.recipe.nutrition}</h2>
          <p className="text-sm text-ink-soft mb-4">{t.recipe.nutritionPerServing}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-paper p-3 text-center">
              <div className="text-2xl font-bold text-terracota">{recipe.nutrition.calories}</div>
              <div className="text-xs text-ink-faint uppercase tracking-wide">{nutritionLabels[locale].calories}</div>
            </div>
            <div className="rounded-lg bg-paper p-3 text-center">
              <div className="text-2xl font-bold text-agave-deep">{recipe.nutrition.protein}g</div>
              <div className="text-xs text-ink-faint uppercase tracking-wide">{nutritionLabels[locale].protein}</div>
            </div>
            <div className="rounded-lg bg-paper p-3 text-center">
              <div className="text-2xl font-bold text-dorado-deep">{recipe.nutrition.carbohydrates}g</div>
              <div className="text-xs text-ink-faint uppercase tracking-wide">{nutritionLabels[locale].carbohydrates}</div>
            </div>
            <div className="rounded-lg bg-paper p-3 text-center">
              <div className="text-2xl font-bold text-terracota-soft">{recipe.nutrition.fat}g</div>
              <div className="text-xs text-ink-faint uppercase tracking-wide">{nutritionLabels[locale].fat}</div>
            </div>
            <div className="rounded-lg bg-paper p-3 text-center">
              <div className="text-2xl font-bold text-ink">{recipe.nutrition.fiber}g</div>
              <div className="text-xs text-ink-faint uppercase tracking-wide">{nutritionLabels[locale].fiber}</div>
            </div>
            <div className="rounded-lg bg-paper p-3 text-center">
              <div className="text-2xl font-bold text-ink-soft">{recipe.nutrition.sodium}mg</div>
              <div className="text-xs text-ink-faint uppercase tracking-wide">{nutritionLabels[locale].sodium}</div>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <RecipeIngredients key={recipe.id} ingredients={recipe.ingredients} servings={recipe.servings} locale={locale} contentLocale={contentLocale} />
        <div>
          <h2 className="font-display text-xl text-ink">{t.recipe.preparation}</h2>
          <ol className="mt-3 space-y-4">
            {recipe.steps.map((s, idx) => {
              const stepText = typeof s === 'string' ? s : s.text;
              return (
                <li key={idx} className="flex gap-3.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-agave font-display text-sm font-semibold text-white">
                    {idx + 1}
                  </span>
                  <p lang={contentLocale} dir={localeDirection(contentLocale)} className="pt-1 leading-relaxed text-ink-soft">{stepText}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {recipe.tips && <section className="rounded-[var(--radius-xl2)] border border-line bg-card p-5">
        <h2 className="font-display text-xl text-ink">{editorial.tips}</h2>
        <ul lang={contentLocale} dir={localeDirection(contentLocale)} className="mt-3 space-y-2 leading-relaxed text-ink-soft">{recipe.tips.map((tip, index) => <li key={index}>{tip}</li>)}</ul>
      </section>}

      {guide && <section className="space-y-5 rounded-[var(--radius-xl2)] border border-line bg-card p-5">
        {locale !== "es" && locale !== "en" && <p className="text-sm text-ink-faint">{guideUi.fallback}</p>}
        <h2 lang={guideLanguage} dir="ltr" className="font-display text-2xl text-ink">{guide.title}</h2>
        {guide.sections.map(section => <div key={section.title} className="space-y-2">
          <h3 lang={guideLanguage} dir="ltr" className="font-display text-xl text-ink">{section.title}</h3>
          <p lang={guideLanguage} dir="ltr" className="leading-relaxed text-ink-soft">{section.text}</p>
        </div>)}
      </section>}

      {references.length > 0 && <section className="recipe-references rounded-[var(--radius-xl2)] border border-line-soft bg-paper-2/50 p-5">
        <h2 className="eyebrow text-ink-faint">{guideUi.references}</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{guideUi.referenceNote}</p>
        <ul className="mt-3 space-y-3 text-sm text-ink-soft">
          {references.map(reference => <li key={reference.url}>
            <a href={reference.url} target="_blank" rel="noreferrer" className="break-words underline underline-offset-4"><span lang={reference.language} dir="ltr">{reference.title}</span></a>
            {reference.scope && <span className="ml-2 text-xs text-ink-faint">({reference.scope === "dish" ? guideUi.dish : reference.scope === "context" ? guideUi.context : guideUi.techniqueSource})</span>}
          </li>)}
        </ul>
      </section>}

      {related.length > 0 && (
        <section className="space-y-4 border-t border-line-soft pt-8">
          <div>
            <p className="eyebrow text-terracota">{t.recipe.relatedEyebrow}</p>
            <h2 className="font-display text-2xl text-ink">
              {place ? t.recipe.relatedTitle(translatePlaceName(breadcrumb[0] ?? place, locale)) : t.recipe.relatedTitleGeneric}
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
