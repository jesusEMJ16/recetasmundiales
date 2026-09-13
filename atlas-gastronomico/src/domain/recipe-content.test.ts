import { describe, expect, it } from "vitest";
import { RECIPES } from "../data/recipes";
import { PLACES } from "../data/places";
import { locales, localeDirection } from "../i18n/config";
import { getRecipeLocales, recipeContentLocale, recipeTranslations, translateRecipe } from "../i18n/recipe-content";
import { buildRecipeCounts } from "./atlas";
import { getRecipesForPlace } from "./places";
import atlas from "../data/world-atlas.json";
import recipeSearch from "../data/recipe-search.json";
import sitemap from "../app/sitemap";
import { generateMetadata } from "../app/[locale]/receta/[slug]/page";
import reviewedNumbers from "../../docs/recipe-number-equivalences.json";

describe("reviewed recipe catalog", () => {
  it("uses the selected language and the correct reading direction", () => {
    for (const locale of locales) {
      expect(localeDirection(locale)).toBe(locale === "ar" || locale === "ur" ? "rtl" : "ltr");
      for (const recipe of RECIPES) {
        const expected = locale === "es" || recipeTranslations[locale][recipe.id] ? locale : "es";
        expect(recipeContentLocale(locale, recipe.id)).toBe(expected);
        expect(localeDirection(recipeContentLocale(locale, recipe.id))).toBe(localeDirection(expected));
      }
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
    const numbers = (text: string) => (text.replace(/(\d),(\d)/g, "$1.$2").match(/\d+(?:\.\d+)?/g) ?? []).sort();
    const equivalences: Record<string, { sourceText: string; translatedText: string; reason: string }> = reviewedNumbers;
    const expectQuantities = (key: string, text: string, sourceText: string, numericSource = sourceText) => {
      const reviewed = equivalences[key];
      if (reviewed) {
        expect(sourceText, key).toBe(reviewed.sourceText);
        expect(text, key).toBe(reviewed.translatedText);
      } else {
        expect(numbers(text), key).toEqual(numbers(numericSource));
      }
    };
    for (const locale of locales.filter(l => l !== "es")) {
      const translatedIds = Object.keys(recipeTranslations[locale]);
      expect(translatedIds, locale).toHaveLength(198);
      expect(translatedIds.every(id => RECIPES.some(recipe => recipe.id === id))).toBe(true);
      for (const recipe of RECIPES.filter(recipe => recipeTranslations[locale][recipe.id])) {
        const translated = translateRecipe(recipe, locale);
        expect(translated.ingredients, recipe.id).toHaveLength(recipe.ingredients.length);
        expect(translated.steps, recipe.id).toHaveLength(recipe.steps.length);
        expect(translated.tips, recipe.id).toHaveLength(recipe.tips!.length);
        expect(translated.placeId).toBe(recipe.placeId);
        expect(translated.slug).toBe(recipe.slug);
        expect(translated.sources).toEqual(recipeTranslations.en[recipe.id].sources);
        expect(translated.totalTimeMin).toBe(recipe.totalTimeMin);
        expect(translated.diet).toEqual(recipe.diet);
        for (const field of ["steps", "tips"] as const) {
          const texts = recipeTranslations[locale][recipe.id][field];
          texts.forEach((text, index) => {
            expect(text.trim(), `${locale}/${recipe.id}/${field}/${index}`).not.toBe("");
            expectQuantities(`${locale}/${recipe.id}/${field}/${index}`, text, recipeTranslations.en[recipe.id][field][index]);
          });
        }
        recipe.ingredients.forEach((ingredient, index) => {
          expectQuantities(`${locale}/${recipe.id}/ingredients/${index}`, translated.ingredients[index].text, recipeTranslations.en[recipe.id].ingredients[index], ingredient.text);
          expect(translated.ingredients[index].optional).toBe(ingredient.optional);
        });
        for (const field of ["dishName", "summary", "history"] as const) expect(translated[field].trim(), `${locale}/${recipe.id}/${field}`).not.toBe("");
      }
    }
  });

  it("keeps every saved translation in its actual language", () => {
    const scripts = { zh: /\p{Script=Han}/u, hi: /\p{Script=Devanagari}/u, ar: /\p{Script=Arabic}/u, bn: /\p{Script=Bengali}/u, ru: /\p{Script=Cyrillic}/u, ur: /\p{Script=Arabic}/u, ja: /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u };
    for (const locale of locales.filter(l => l !== "es" && l !== "en")) {
      for (const recipe of RECIPES) {
        const translated = recipeTranslations[locale][recipe.id];
        if (!translated) continue;
        for (const field of ["summary", "history"] as const) {
          expect(translated[field], `${locale}/${recipe.id}/${field}`).not.toBe(recipe[field]);
          expect(translated[field], `${locale}/${recipe.id}/${field}`).not.toBe(recipeTranslations.en[recipe.id][field]);
          if (locale in scripts) expect(translated[field], `${locale}/${recipe.id}/${field}`).toMatch(scripts[locale as keyof typeof scripts]);
        }
      }
    }
  });

  it("uses twelve search labels and indexes all 2376 recipe translations", () => {
    expect(recipeSearch).toHaveLength(198);
    const recipeEntries = sitemap().filter(entry => /\/receta\//.test(entry.url));
    expect(recipeEntries).toHaveLength(2376);
    expect(new Set(recipeEntries.map(entry => entry.url)).size).toBe(2376);
    for (const locale of locales) {
      for (const recipe of RECIPES) {
        expect(getRecipeLocales(recipe.id), recipe.id).toEqual(locales);
        const search = recipeSearch.find(entry => entry.id === recipe.id);
        expect(search?.slug).toBe(recipe.slug);
        const url = `https://worldbitesapp.com/${locale}/receta/${recipe.slug}`;
        expect(recipeEntries.some(entry => entry.url === url), url).toBe(getRecipeLocales(recipe.id).includes(locale));
        expect(search?.names[locale], `${locale}/${recipe.id}`).toBe(translateRecipe(recipe, locale).dishName);
      }
      const translated = RECIPES.map(recipe => translateRecipe(recipe, locale));
      expect(buildRecipeCounts(PLACES, translated)).toEqual(buildRecipeCounts(PLACES, RECIPES));
    }
  });


  it("renders missing translations from the original without altering recipe data", () => {
    for (const locale of ["fr", "pt", "ru", "id"] as const) {
      // Exercise the fallback with a future recipe, without requiring an
      // intentionally incomplete production catalog.
      const missing = { ...RECIPES[0], id: "r-future-untranslated-recipe" };
      expect(translateRecipe(missing, locale)).toBe(missing);
      expect(recipeContentLocale(locale, missing.id)).toBe("es");
      expect(getRecipeLocales(missing.id)).not.toContain(locale);
      const present = RECIPES.find(recipe => recipeTranslations[locale][recipe.id])!;
      expect(recipeContentLocale(locale, present.id)).toBe(locale);
      expect(translateRecipe(present, locale).summary).toBe(recipeTranslations[locale][present.id].summary);
    }
  });

  it("excludes fallback pages from indexing and hreflang while keeping translated pages available", async () => {
    const recipe = RECIPES[0];
    const saved = recipeTranslations.fr[recipe.id];
    try {
      delete recipeTranslations.fr[recipe.id];
      const fallback = await generateMetadata({ params: Promise.resolve({ locale: "fr", slug: recipe.slug }) });
      expect(fallback.robots).toEqual({ index: false, follow: true });
      expect(fallback.alternates?.languages).not.toHaveProperty("fr");
      expect(fallback.openGraph).toMatchObject({ locale: "es" });
    } finally {
      recipeTranslations.fr[recipe.id] = saved;
    }
    const translated = await generateMetadata({ params: Promise.resolve({ locale: "fr", slug: RECIPES[0].slug }) });
    expect(translated.robots).toEqual({ index: true, follow: true });
    expect(translated.alternates?.languages).toHaveProperty("fr");
    expect(translated.title).toBe(recipeTranslations.fr[RECIPES[0].id].dishName);
  });

  it("corrects dietary claims contradicted by the actual ingredients", () => {
    expect(RECIPES.find(r => r.id === "r-mxc-carnitas")?.diet).not.toContain("sin_lacteos");
    expect(RECIPES.find(r => r.id === "r-mxs-tamales-chipilin")?.diet).not.toContain("vegetariano");
    expect(RECIPES.find(r => r.id === "r-us-w-green-chile-stew")?.diet).not.toContain("sin_gluten");
    expect(RECIPES.find(r => r.id === "r-pm-s-comiteco")?.diet).not.toContain("vegano");
  });
});
