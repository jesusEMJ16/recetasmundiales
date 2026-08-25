import type { Place, Recipe } from "./types";

export function getChildren(parentId: string, places: Place[]): Place[] {
  return places.filter((p) => p.parentId === parentId);
}

export function getRecipeCountForPlace(placeId: string, recipes: Recipe[]): number {
  return recipes.filter((r) => r.placeId === placeId).length;
}

export function resolvePlacePath(slugs: string[], places: Place[]): Place | null {
  let parentId: string | null = null;
  let current: Place | null = null;
  for (const slug of slugs) {
    current = places.find((p) => p.slug === slug && p.parentId === parentId) ?? null;
    if (!current) return null;
    parentId = current.id;
  }
  return current;
}

export function getBreadcrumb(place: Place, places: Place[]): Place[] {
  const chain: Place[] = [];
  let node: Place | undefined = place;
  while (node) {
    chain.unshift(node);
    node = node.parentId
      ? places.find((p) => p.id === node!.parentId)
      : undefined;
  }
  return chain;
}

function collectDescendantIds(rootId: string, places: Place[]): Set<string> {
  const ids = new Set<string>([rootId]);
  let added = true;
  while (added) {
    added = false;
    for (const p of places) {
      if (p.parentId && ids.has(p.parentId) && !ids.has(p.id)) {
        ids.add(p.id);
        added = true;
      }
    }
  }
  return ids;
}

export function getRecipesForPlace(
  placeId: string,
  places: Place[],
  recipes: Recipe[],
): Recipe[] {
  const ids = collectDescendantIds(placeId, places);
  return recipes.filter((r) => ids.has(r.placeId));
}

/** Build the full URL path segments for a place, e.g. ["mexico","oaxaca"]. */
export function placePathSlugs(place: Place, places: Place[]): string[] {
  return getBreadcrumb(place, places).map((p) => p.slug);
}
