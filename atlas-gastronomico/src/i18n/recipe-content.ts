import type { Recipe } from "../domain/types";
import type { Locale } from "./config";
import english from "./content/recipes-en.json";

export interface CompleteRecipeTranslation {
  dishName: string;
  summary: string;
  history: string;
  ingredients: string[];
  steps: string[];
  tips: string[];
  sources: string[];
}

// Add a locale only after its complete catalog passes the content audit.
export const availableRecipeLocales: Locale[] = ["es", "en"];
export const recipeTranslations: Partial<Record<Locale, Record<string, CompleteRecipeTranslation>>> = {
  en: english,
};

export function recipeContentLocale(locale: Locale): Locale {
  return availableRecipeLocales.includes(locale) ? locale : "es";
}

export function translateRecipe(recipe: Recipe, locale: Locale): Recipe {
  const translation = recipeTranslations[locale]?.[recipe.id];
  if (!translation) return recipe;
  return {
    ...recipe,
    ...translation,
    // Optional ingredient flags belong to the recipe, not its language.
    ingredients: translation.ingredients.map((text, index) => ({
      ...recipe.ingredients[index], text,
    })),
  };
}
