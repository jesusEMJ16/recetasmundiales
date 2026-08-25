import Link from "next/link";
import type { Moment, Recipe } from "../domain/types";
import type { Locale } from "../i18n/config";
import { getDictionary } from "../i18n/dictionaries";
import { recipeHref } from "../i18n/routing";
import { getRecipeImage } from "../data/recipe-images";
import { StarRating } from "./StarRating";

const MOMENT_EMOJI: Record<Moment, string> = {
  desayuno: "🥚", comida: "🍽️", cena: "🌙", postre: "🍮", bebida: "🥤", street_food: "🌮",
};

export function RecipeCard({ recipe, locale, index = 0 }: { recipe: Recipe; locale: Locale; index?: number }) {
  const t = getDictionary(locale);
  const emoji = MOMENT_EMOJI[recipe.moment];
  const photo = getRecipeImage(recipe.slug)?.url ?? null;
  return (
    <Link
      href={recipeHref(locale, recipe.slug)}
      style={{ animationDelay: `${Math.min(index, 12) * 55}ms` }}
      className="reveal-scale group relative flex flex-col overflow-hidden rounded-[var(--radius-xl2)] border border-line bg-card shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-terracota/40 hover:shadow-[var(--shadow-lift)]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={recipe.dishName}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="img-placeholder flex h-full w-full items-center justify-center">
            <span className="text-5xl opacity-70 transition-transform duration-500 group-hover:scale-110">{emoji}</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-soft backdrop-blur">
          {emoji} {t.moments[recipe.moment]}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-[0.68rem] font-semibold text-paper backdrop-blur">
          ⏱ {recipe.totalTimeMin}′
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg leading-snug text-ink transition-colors group-hover:text-terracota">
          {recipe.dishName}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-ink-soft">{recipe.summary}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <StarRating value={recipe.ratingAvg} count={recipe.ratingCount} />
          {recipe.diet.length > 0 && (
            <span className="text-[0.68rem] font-medium uppercase tracking-wide text-agave">{t.diets[recipe.diet[0]]}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
