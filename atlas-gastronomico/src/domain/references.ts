import references from "../data/editorial-references.json";
import type { Recipe } from "./types";

export type RecipeReference = {
  title: string;
  url: string;
  scope?: "dish" | "context" | "technique";
  language?: string;
  checkedAt?: string;
};
export const editorialReferences = references as Record<string, RecipeReference[]>;

export function getRecipeReferences(recipe: Recipe): RecipeReference[] {
  const result = [...(editorialReferences[recipe.slug] ?? [])];
  // Free-text tradition notes are not identifiable publications. Publish links
  // only, without inventing authors, books, or documentary origin evidence.
  for (const source of recipe.sources) {
    try {
      const parsed = new URL(source);
      if (!["https:", "http:"].includes(parsed.protocol)) continue;
      if (result.some(reference => reference.url === source)) continue;
      result.push({ title: parsed.hostname.replace(/^www\./, ""), url: source });
    } catch { /* Plain-text catalog context is not a consultable reference. */ }
  }
  return result;
}
