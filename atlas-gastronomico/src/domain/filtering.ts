import type { Recipe, RecipeFilters } from "./types";

export function filterRecipes(recipes: Recipe[], filters: RecipeFilters): Recipe[] {
  return recipes.filter((r) => {
    if (filters.momento && r.moment !== filters.momento) return false;
    if (filters.maxTiempo != null && r.totalTimeMin > filters.maxTiempo) return false;
    if (filters.dieta && !r.diet.includes(filters.dieta)) return false;
    return true;
  });
}
