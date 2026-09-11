import type { Place, Recipe } from "./types";

/** Count each recipe once at its location and once at every ancestor. */
export function buildRecipeCounts(places: Place[], recipes: Recipe[]): Map<string, number> {
  const byId = new Map(places.map(p => [p.id, p]));
  const counts = new Map(places.map(p => [p.id, 0]));
  for (const recipe of recipes) {
    let id: string | null = recipe.placeId;
    const visited = new Set<string>();
    while (id && byId.has(id) && !visited.has(id)) {
      visited.add(id);
      counts.set(id, (counts.get(id) ?? 0) + 1);
      id = byId.get(id)!.parentId;
    }
  }
  return counts;
}
