import type { Recipe } from "../domain/types";
import type { Locale } from "../i18n/config";
import { getDictionary } from "../i18n/dictionaries";
import { RecipeCard } from "./RecipeCard";

export function RecipeList({ recipes, locale }: { recipes: Recipe[]; locale: Locale }) {
  const t = getDictionary(locale);
  if (recipes.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl2)] border border-dashed border-line bg-card/60 p-10 text-center">
        <div className="text-4xl">🫙</div>
        <p className="mt-3 font-display text-lg text-ink">{t.place.empty}</p>
        <p className="mt-1 text-sm text-ink-soft">{t.place.emptyHint}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((r, i) => (
        <RecipeCard key={r.id} recipe={r} index={i} locale={locale} />
      ))}
    </div>
  );
}
