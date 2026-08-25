import type { Recipe, SortKey } from "./types";
import { computeBayesian } from "./ranking";

const M = 20;

function globalMean(recipes: Recipe[]): number {
  const rated = recipes.filter((r) => r.ratingCount > 0);
  if (rated.length === 0) return 4.0;
  return rated.reduce((s, r) => s + r.ratingAvg, 0) / rated.length;
}

export function sortRecipes(recipes: Recipe[], sort: SortKey): Recipe[] {
  const copy = [...recipes];
  switch (sort) {
    case "estrellas": {
      const C = globalMean(copy);
      return copy.sort(
        (a, b) =>
          computeBayesian(b.ratingAvg, b.ratingCount, M, C) -
          computeBayesian(a.ratingAvg, a.ratingCount, M, C),
      );
    }
    case "recientes":
      return copy.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    case "populares":
      return copy.sort((a, b) => b.popularityScore - a.popularityScore);
    case "rapidas":
      return copy.sort((a, b) => a.totalTimeMin - b.totalTimeMin);
    case "alfabetico":
      return copy.sort((a, b) => a.dishName.localeCompare(b.dishName, "es"));
    default:
      return copy;
  }
}
