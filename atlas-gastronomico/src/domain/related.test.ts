import { describe, it, expect } from "vitest";
import { getRelatedRecipes } from "./related";
import type { Recipe } from "./types";

function make(id: string, placeId: string, moment: Recipe["moment"], pop: number): Recipe {
  return {
    id, dishName: id, slug: id, placeId, summary: "", history: "",
    originConfidence: "confirmed", servings: 2, prepTimeMin: 0, cookTimeMin: 0,
    totalTimeMin: 10, difficulty: "facil", moment, diet: [], ingredients: [], steps: [],
    ratingAvg: 4, ratingCount: 10, popularityScore: pop, publishedAt: "2026-01-01",
    image: "", sources: [],
  };
}

const current = make("cur", "mx-oax", "comida", 50);
const all: Recipe[] = [
  current,
  make("oax1", "mx-oax", "cena", 90),      // same state
  make("oax2", "mx-oax", "comida", 40),    // same state
  make("jal1", "mx-jal", "comida", 80),    // same moment, same country
  make("it1", "it-laz", "comida", 99),     // same moment, other country
  make("jp1", "jp-tky", "postre", 70),     // same country? no (jp) — filler via country only if mx
];

describe("getRelatedRecipes", () => {
  it("excludes the current recipe", () => {
    expect(getRelatedRecipes(current, all).some((r) => r.id === "cur")).toBe(false);
  });
  it("prioritizes same-state recipes (by popularity) first", () => {
    const out = getRelatedRecipes(current, all, 6);
    expect(out[0].id).toBe("oax1"); // same state, highest pop among state
    expect(out.slice(0, 2).map((r) => r.id).sort()).toEqual(["oax1", "oax2"]);
  });
  it("does not duplicate a recipe that matches multiple buckets", () => {
    const out = getRelatedRecipes(current, all, 6);
    expect(new Set(out.map((r) => r.id)).size).toBe(out.length);
  });
  it("respects the limit", () => {
    expect(getRelatedRecipes(current, all, 2).length).toBe(2);
  });
});
