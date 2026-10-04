import type { Recipe } from "../domain/types";
import reviewed from "./recipes-reviewed.json";

// Canonical catalog. IDs and slugs are stable across language versions.
// Prototype ratings were never collected from readers. Do not publish them as votes.
export const RECIPES: Recipe[] = (reviewed as Recipe[]).map(recipe => ({
  ...recipe, ratingAvg: 0, ratingCount: 0, popularityScore: 0,
}));
