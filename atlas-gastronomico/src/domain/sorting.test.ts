import { describe, it, expect } from "vitest";
import { sortRecipes } from "./sorting";
import type { Recipe } from "./types";

function make(partial: Partial<Recipe> & { id: string }): Recipe {
  return {
    dishName: partial.dishName ?? partial.id,
    slug: partial.id,
    placeId: "p",
    summary: "",
    history: "",
    originConfidence: "confirmed",
    servings: 2,
    prepTimeMin: 0,
    cookTimeMin: 0,
    totalTimeMin: partial.totalTimeMin ?? 30,
    difficulty: "facil",
    moment: "comida",
    diet: [],
    ingredients: [],
    steps: [],
    ratingAvg: partial.ratingAvg ?? 4,
    ratingCount: partial.ratingCount ?? 10,
    popularityScore: partial.popularityScore ?? 0,
    publishedAt: partial.publishedAt ?? "2026-01-01",
    image: "",
    sources: [],
    ...partial,
  };
}

const recipes: Recipe[] = [
  make({ id: "a", ratingAvg: 5.0, ratingCount: 1, popularityScore: 10, totalTimeMin: 45, publishedAt: "2026-02-01", dishName: "Zeta" }),
  make({ id: "b", ratingAvg: 4.8, ratingCount: 200, popularityScore: 99, totalTimeMin: 20, publishedAt: "2026-06-01", dishName: "Alfa" }),
  make({ id: "c", ratingAvg: 4.2, ratingCount: 50, popularityScore: 50, totalTimeMin: 10, publishedAt: "2026-08-01", dishName: "Medio" }),
];

describe("sortRecipes", () => {
  it("estrellas: bayesian, so the 200-vote 4.8 beats the 1-vote 5.0", () => {
    const out = sortRecipes(recipes, "estrellas");
    expect(out[0].id).toBe("b");
  });
  it("recientes: newest publishedAt first", () => {
    expect(sortRecipes(recipes, "recientes")[0].id).toBe("c");
  });
  it("populares: highest popularityScore first", () => {
    expect(sortRecipes(recipes, "populares")[0].id).toBe("b");
  });
  it("rapidas: lowest totalTimeMin first", () => {
    expect(sortRecipes(recipes, "rapidas")[0].id).toBe("c");
  });
  it("alfabetico: by dishName A→Z", () => {
    expect(sortRecipes(recipes, "alfabetico")[0].dishName).toBe("Alfa");
  });
  it("does not mutate the input array", () => {
    const copy = [...recipes];
    sortRecipes(recipes, "rapidas");
    expect(recipes).toEqual(copy);
  });
});
