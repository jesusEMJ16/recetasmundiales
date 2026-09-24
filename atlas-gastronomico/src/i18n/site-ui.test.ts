import { describe, expect, it } from "vitest";
import { locales } from "./config";
import { siteUi } from "./site-ui";
import { getDictionary } from "./dictionaries";
import { restaurantTranslationKeys, translateRestaurant } from "./content/restaurants";
import { restaurants } from "../data/restaurants";

const strings = (value: unknown): string[] =>
  typeof value === "string" ? [value]
    : typeof value === "function" ? [String((value as (...args: unknown[]) => string)("4.5", 12))]
    : value && typeof value === "object" ? Object.values(value).flatMap(strings) : [];

// Words spelled the same in English and the target language.
const SHARED_WORDS = new Set(["Sources"]);

describe("interface translations", () => {
  it("provides every site string in all twelve locales, translated beyond English", () => {
    expect(Object.keys(siteUi).sort()).toEqual([...locales].sort());
    const english = strings(siteUi.en);
    for (const locale of locales) {
      const texts = strings(siteUi[locale]);
      expect(texts, locale).toHaveLength(english.length);
      for (const text of texts) expect(text.trim(), locale).not.toBe("");
      if (locale !== "en") expect(texts.filter((text, i) => text === english[i] && /[a-z]{4}/i.test(text) && !SHARED_WORDS.has(text)), locale).toEqual([]);
    }
  });

  it("does not leave nutrition labels in English", () => {
    for (const locale of locales.filter(l => l !== "en")) {
      expect(getDictionary(locale).recipe.nutrition, locale).not.toBe(getDictionary("en").recipe.nutrition);
      expect(getDictionary(locale).recipe.nutritionPerServing, locale).not.toBe(getDictionary("en").recipe.nutritionPerServing);
    }
  });

  it("translates every restaurant description, cuisine, tag and city", () => {
    const { descriptions, terms } = restaurantTranslationKeys;
    for (const restaurant of restaurants) {
      expect(descriptions[restaurant.id], restaurant.id).toBeDefined();
      for (const value of [restaurant.city, ...restaurant.cuisineType, ...(restaurant.tags ?? [])]) {
        expect(terms[value.toLocaleLowerCase("es")], `${restaurant.id}: ${value}`).toBeDefined();
      }
    }
    for (const locale of locales.filter(l => l !== "es")) {
      for (const restaurant of restaurants) {
        const translated = translateRestaurant(restaurant, locale);
        expect(translated.description, `${locale}/${restaurant.id}`).not.toBe(restaurant.description);
        expect(translated.name).toBe(restaurant.name);
      }
    }
    expect(translateRestaurant(restaurants[0], "es")).toBe(restaurants[0]);
  });
});
