import { writeFileSync } from "node:fs";
import { RECIPES } from "../src/data/recipes";
import { locales } from "../src/i18n/config";
import { translateRecipe } from "../src/i18n/recipe-content";

// Keep full recipe text on the server; the search client only needs titles.
const index = RECIPES.map(recipe => ({
  id: recipe.id,
  slug: recipe.slug,
  names: Object.fromEntries(locales.map(locale => [locale, translateRecipe(recipe, locale).dishName])),
}));
writeFileSync(new URL("../src/data/recipe-search.json", import.meta.url), JSON.stringify(index, null, 2) + "\n");
console.log(`Indexed ${index.length} recipes in ${locales.length} languages.`);
