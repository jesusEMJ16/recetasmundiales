import { describe, expect, it } from "vitest";
import { RECIPES } from "../data/recipes";
import { PLACES } from "../data/places";
import guidance from "../data/editorial-guidance.json";
import countryGuides from "../data/country-guides.json";
import { cookingGuides, cookingGuideLocale } from "../data/cooking-guides";
import guideTranslations from "../data/cooking-guide-translations.json";
import { editorialReferences, getRecipeReferences } from "./references";
import { locales } from "../i18n/config";
import { translateRecipe } from "../i18n/recipe-content";

describe("editorial review integrity", () => {
  it("gives every published recipe a consultable reference, without opaque tradition notes", () => {
    for (const recipe of RECIPES) {
      const references = getRecipeReferences(recipe);
      expect(references.length, recipe.slug).toBeGreaterThan(0);
      expect(new Set(references.map(reference => reference.url)).size, recipe.slug).toBe(references.length);
      for (const reference of references) {
        expect(["https:", "http:"]).toContain(new URL(reference.url).protocol);
        expect(reference.title.trim()).not.toBe("");
      }
    }
    const sample = { ...RECIPES[0], sources: ["Recetario familiar", "javascript:alert(1)", "not a URL"] };
    expect(getRecipeReferences(sample).some(reference => /Recetario familiar|javascript:/.test(reference.url))).toBe(false);
  });

  it("keeps reference scope, language and checked date separate from origin certainty", () => {
    for (const [slug, references] of Object.entries(editorialReferences)) {
      expect(RECIPES.some(recipe => recipe.slug === slug), slug).toBe(true);
      for (const reference of references) {
        expect(["dish", "context", "technique"]).toContain(reference.scope);
        expect(reference.language).toMatch(/^[a-z]{2}$/);
        expect(reference.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
    expect(RECIPES.find(recipe => recipe.slug === "almejas-tatemadas")?.originConfidence).toBe("modern_variant");
    expect(RECIPES.find(recipe => recipe.slug === "enchiladas-mineras")?.originConfidence).toBe("commonly_associated");
  });

  it("supplies additional Spanish and English guidance for every short preparation", () => {
    expect(Object.keys(guidance)).toHaveLength(56);
    for (const recipe of RECIPES) {
      const words = recipe.steps.reduce((total, step) => total + (typeof step === "string" ? step : step.text).split(/\s+/).length, 0);
      if (words < 60) {
        expect(cookingGuides[recipe.slug]?.es, recipe.slug).toBeDefined();
        expect(cookingGuides[recipe.slug]?.en, recipe.slug).toBeDefined();
      }
    }
    for (const slug of Object.keys(guidance)) {
      expect(RECIPES.some(recipe => recipe.slug === slug), slug).toBe(true);
      expect(getRecipeReferences(RECIPES.find(recipe => recipe.slug === slug)!).length).toBeGreaterThan(0);
    }
  });

  it("serves the completed guide translation batches in all twelve languages", () => {
    expect(Object.keys(guideTranslations).sort()).toEqual(Object.keys(guidance).slice(0, 50).sort());
    for (const slug of Object.keys(guideTranslations)) {
      expect(Object.keys(cookingGuides[slug]).sort(), slug).toEqual([...locales].sort());
      for (const locale of locales) {
        expect(cookingGuideLocale(slug, locale), `${slug}/${locale}`).toBe(locale);
        const guide = cookingGuides[slug][locale]!;
        expect(guide.title.trim()).not.toBe("");
        expect(guide.sections).toHaveLength(1);
        expect(guide.sections[0].title.trim()).not.toBe("");
        expect(guide.sections[0].text.length).toBeGreaterThan(100);
        if (locale !== "es" && locale !== "en") {
          expect(guide.sections[0].text).not.toBe(cookingGuides[slug].en!.sections[0].text);
          expect(guide.sections[0].text).not.toBe(cookingGuides[slug].es!.sections[0].text);
        }
      }
    }
  });

  it("retains an honest English fallback for guides outside the translated batch", () => {
    expect(cookingGuideLocale("hot-dog-estilo-chicago", "fr")).toBe("en");
    expect(cookingGuideLocale("hot-dog-estilo-chicago", "ar")).toBe("en");
    expect(cookingGuideLocale("hot-dog-estilo-chicago", "es")).toBe("es");
  });

  it("links country reading suggestions to recipes in that same country", () => {
    const populated = new Set(RECIPES.map(recipe => PLACES.find(place => place.id === recipe.placeId)!.countryCode));
    expect(Object.keys(countryGuides).sort()).toEqual([...populated].sort());
    for (const [code, guide] of Object.entries(countryGuides)) {
      expect(guide.es).toHaveLength(2);
      expect(guide.en).toHaveLength(2);
      expect(guide.es.every(text => text.trim().length > 0)).toBe(true);
      expect(guide.en.every(text => text.trim().length > 0)).toBe(true);
      for (const slug of guide.recipes) {
        const recipe = RECIPES.find(recipe => recipe.slug === slug);
        expect(recipe, slug).toBeDefined();
        expect(PLACES.find(place => place.id === recipe!.placeId)!.countryCode, slug).toBe(code);
      }
    }
  });

  it("keeps the clam adaptation and cecina corrections consistent across all twelve languages", () => {
    const clam = RECIPES.find(recipe => recipe.slug === "almejas-tatemadas")!;
    expect(clam.ingredients).toHaveLength(4);
    expect(clam.cookTimeMin).toBe(15);
    expect(clam.totalTimeMin).toBe(30);
    for (const locale of locales) {
      const translated = translateRecipe(clam, locale);
      expect(translated.ingredients).toHaveLength(4);
      expect(translated.steps).toHaveLength(5);
      expect(translated.steps.map(step => typeof step === "string" ? step : step.text).join(" ")).not.toContain("40");
      expect(translated.totalTimeMin).toBe(30);
    }
  });
});
