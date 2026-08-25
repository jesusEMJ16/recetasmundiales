import { describe, it, expect } from "vitest";
import { filterRecipes } from "./filtering";
import type { Recipe } from "./types";

const base: Omit<Recipe, "id" | "slug" | "dishName" | "moment" | "diet" | "totalTimeMin"> = {
  placeId: "p", summary: "", history: "", originConfidence: "confirmed",
  servings: 2, prepTimeMin: 0, cookTimeMin: 0, difficulty: "facil",
  ingredients: [], steps: [], ratingAvg: 4, ratingCount: 10,
  popularityScore: 0, publishedAt: "2026-01-01", image: "", sources: [],
};

const recipes: Recipe[] = [
  { ...base, id: "1", slug: "1", dishName: "Desayuno rápido veg", moment: "desayuno", diet: ["vegetariano"], totalTimeMin: 10 },
  { ...base, id: "2", slug: "2", dishName: "Cena lenta carne", moment: "cena", diet: [], totalTimeMin: 120 },
  { ...base, id: "3", slug: "3", dishName: "Postre vegano", moment: "postre", diet: ["vegano", "vegetariano"], totalTimeMin: 40 },
];

describe("filterRecipes", () => {
  it("returns all when filters are empty", () => {
    expect(filterRecipes(recipes, {}).length).toBe(3);
  });
  it("filters by momento", () => {
    const out = filterRecipes(recipes, { momento: "cena" });
    expect(out.map((r) => r.id)).toEqual(["2"]);
  });
  it("filters by maxTiempo (inclusive)", () => {
    const out = filterRecipes(recipes, { maxTiempo: 40 });
    expect(out.map((r) => r.id).sort()).toEqual(["1", "3"]);
  });
  it("filters by dieta membership", () => {
    const out = filterRecipes(recipes, { dieta: "vegano" });
    expect(out.map((r) => r.id)).toEqual(["3"]);
  });
  it("combines filters with AND", () => {
    const out = filterRecipes(recipes, { dieta: "vegetariano", maxTiempo: 15 });
    expect(out.map((r) => r.id)).toEqual(["1"]);
  });
});
