import type { Recipe } from "../domain/types";
import { locales, type Locale } from "./config";
import english from "./content/recipes-en.json";
import zh from "./content/recipes-zh.json";
import hi from "./content/recipes-hi.json";
import fr from "./content/recipes-fr.json";
import ar from "./content/recipes-ar.json";
import bn from "./content/recipes-bn.json";
import pt from "./content/recipes-pt.json";
import ru from "./content/recipes-ru.json";
import ur from "./content/recipes-ur.json";
import id from "./content/recipes-id.json";
import ja from "./content/recipes-ja.json";

export interface CompleteRecipeTranslation {
  dishName: string;
  summary: string;
  history: string;
  ingredients: string[];
  steps: string[];
  tips: string[];
  sources: string[];
}

// Every configured locale has a complete, audited catalog.
export const availableRecipeLocales: readonly Locale[] = locales;
export const recipeTranslations: Record<Exclude<Locale, "es">, Record<string, CompleteRecipeTranslation>> = {
  en: english,
  zh,
  hi,
  fr,
  ar,
  bn,
  pt,
  ru,
  ur,
  id,
  ja,
};

export function recipeContentLocale(locale: Locale): Locale {
  return locale;
}

export function translateRecipe(recipe: Recipe, locale: Locale): Recipe {
  if (locale === "es") return recipe;
  const translation = recipeTranslations[locale][recipe.id];
  if (!translation) throw new Error(`Missing recipe translation: ${locale}/${recipe.id}`);
  return {
    ...recipe,
    ...translation,
    // Optional ingredient flags belong to the recipe, not its language.
    ingredients: translation.ingredients.map((text, index) => ({
      ...recipe.ingredients[index], text,
    })),
  };
}
