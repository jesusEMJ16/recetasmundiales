import { describe, expect, it } from "vitest";
import { RECIPES } from "../data/recipes";
import { PLACES } from "../data/places";
import { locales, localeDirection } from "../i18n/config";
import { availableRecipeLocales, recipeContentLocale, recipeTranslations, translateRecipe } from "../i18n/recipe-content";
import { buildRecipeCounts } from "./atlas";
import { getRecipesForPlace } from "./places";
import atlas from "../data/world-atlas.json";

describe("reviewed recipe catalog", () => {
  it("uses RTL for Arabic and Urdu while preserving the Spanish fallback direction", () => {
    for (const locale of locales) {
      expect(localeDirection(locale)).toBe(locale === "ar" || locale === "ur" ? "rtl" : "ltr");
      expect(localeDirection(recipeContentLocale(locale))).toBe("ltr");
    }
  });

  it("retains 198 distinct recipes with consistent timing and usable content", () => {
    expect(RECIPES).toHaveLength(198);
    expect(new Set(RECIPES.map(r => r.id)).size).toBe(198);
    expect(new Set(RECIPES.map(r => r.slug)).size).toBe(198);
    for (const recipe of RECIPES) {
      expect(recipe.totalTimeMin, recipe.id).toBe(recipe.prepTimeMin + recipe.cookTimeMin + (recipe.restTimeMin ?? 0));
      expect(recipe.ingredients.length, recipe.id).toBeGreaterThan(1);
      expect(recipe.steps.length, recipe.id).toBeGreaterThan(2);
      expect(recipe.tips?.length, recipe.id).toBeGreaterThan(0);
      expect(recipe.updatedAt, recipe.id).toBe("2026-09-11");
    }
  });

  it("maps every recipe to one country and matches all geographic listing totals", () => {
    const counts = buildRecipeCounts(PLACES, RECIPES);
    expect(PLACES.filter(p => p.type === "pais").reduce((sum, p) => sum + (counts.get(p.id) ?? 0), 0)).toBe(RECIPES.length);
    for (const recipe of RECIPES) {
      const place = PLACES.find(p => p.id === recipe.placeId);
      expect(place, recipe.id).toBeDefined();
      expect(atlas.some(country => country.code === place?.countryCode), recipe.id).toBe(true);
    }
    for (const place of PLACES.filter(p => (counts.get(p.id) ?? 0) > 0)) {
      expect(counts.get(place.id), place.id).toBe(getRecipesForPlace(place.id, PLACES, RECIPES).length);
    }
    expect(RECIPES.find(r => r.id === "r-de-schnitzel")?.placeId).toBe("at-9");
    expect(RECIPES.find(r => r.id === "r-tacos-pastor")?.placeId).toBe("mx-cmx");
  });

  it("requires complete content and preserves quantities in every completed translation", () => {
    const numbers = (text: string) => text.match(/\d+(?:\.\d+)?/g) ?? [];
    for (const locale of availableRecipeLocales.filter(l => l !== "es")) {
      expect(Object.keys(recipeTranslations[locale] ?? {})).toHaveLength(RECIPES.length);
      for (const recipe of RECIPES) {
        const translated = translateRecipe(recipe, locale);
        expect(translated.ingredients, recipe.id).toHaveLength(recipe.ingredients.length);
        expect(translated.steps, recipe.id).toHaveLength(recipe.steps.length);
        expect(translated.tips, recipe.id).toHaveLength(recipe.tips!.length);
        expect(translated.placeId).toBe(recipe.placeId);
        expect(translated.slug).toBe(recipe.slug);
        recipe.ingredients.forEach((ingredient, index) => {
          expect(numbers(translated.ingredients[index].text), `${locale}/${recipe.id}/${index}`).toEqual(numbers(ingredient.text));
          expect(translated.ingredients[index].optional).toBe(ingredient.optional);
        });
        for (const field of ["dishName", "summary", "history"] as const) expect(translated[field].trim(), `${locale}/${recipe.id}/${field}`).not.toBe("");
      }
    }
  });

  it("does not report untranslated languages as completed", () => {
    expect(locales).toHaveLength(12);
    expect(availableRecipeLocales).toEqual(["es", "en"]);
    for (const locale of locales.filter(l => !availableRecipeLocales.includes(l))) {
      expect(recipeContentLocale(locale)).toBe("es");
      expect(recipeTranslations[locale]).toBeUndefined();
    }
  });

  it("corrects dietary claims contradicted by the actual ingredients", () => {
    expect(RECIPES.find(r => r.id === "r-mxc-carnitas")?.diet).not.toContain("sin_lacteos");
    expect(RECIPES.find(r => r.id === "r-mxs-tamales-chipilin")?.diet).not.toContain("vegetariano");
    expect(RECIPES.find(r => r.id === "r-us-w-green-chile-stew")?.diet).not.toContain("sin_gluten");
    expect(RECIPES.find(r => r.id === "r-pm-s-comiteco")?.diet).not.toContain("vegano");
  });
});
