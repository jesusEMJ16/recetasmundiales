import type { Recipe } from "../domain/types";
import reviewed from "./recipes-reviewed.json";

// Canonical catalog. IDs and slugs are stable across language versions.
export const RECIPES: Recipe[] = reviewed as Recipe[];
