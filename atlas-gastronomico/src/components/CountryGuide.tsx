import Link from "next/link";
import guides from "../data/country-guides.json";
import type { Locale } from "../i18n/config";
import { editorialGuidesUi } from "../i18n/editorial-guides-ui";
import { RECIPES } from "../data/recipes";
import { translateRecipe } from "../i18n/recipe-content";

export function CountryGuide({ countryCode, locale }: { countryCode: string; locale: Locale }) {
  const guide = (guides as Record<string, { es: string[]; en: string[]; recipes: string[] }>)[countryCode];
  if (!guide) return null;
  const language = locale === "es" ? "es" : "en";
  const copy = editorialGuidesUi[locale];
  const [intro, planning] = guide[language];
  return <section className="country-guide space-y-4 rounded-[var(--radius-xl2)] border border-line bg-card p-5 sm:p-7">
    <h2 className="font-display text-2xl text-ink">{copy.country}</h2>
    {locale !== "es" && locale !== "en" && <p className="text-sm text-ink-faint">{copy.fallback}</p>}
    <p lang={language} dir="ltr" className="leading-relaxed text-ink-soft">{intro}</p>
    <h3 className="font-display text-xl text-ink">{copy.planning}</h3>
    <p lang={language} dir="ltr" className="leading-relaxed text-ink-soft">{planning}</p>
    <h3 className="font-display text-xl text-ink">{copy.start}</h3>
    <ul className="flex flex-wrap gap-x-5 gap-y-2">
      {guide.recipes.map(slug => {
        const recipe = RECIPES.find(recipe => recipe.slug === slug);
        return recipe ? <li key={slug}><Link href={`/${locale}/receta/${slug}`} className="font-medium text-terracota underline underline-offset-4">{translateRecipe(recipe, locale).dishName}</Link></li> : null;
      })}
    </ul>
  </section>;
}
