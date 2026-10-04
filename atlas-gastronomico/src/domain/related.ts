import type { Recipe } from "./types";

function countryOf(placeId: string): string {
  return placeId.split("-")[0];
}

function byName(a: Recipe, b: Recipe): number {
  return a.dishName.localeCompare(b.dishName, "es");
}

/**
 * Related recipes to keep the reader exploring. Priority:
 *  1) same place, 2) same moment within the country, 3) same country.
 * Never fill a geographic recommendation with dishes from another country.
 * De-duplicated, excludes the current recipe, capped at `limit`.
 */
export function getRelatedRecipes(current: Recipe, all: Recipe[], limit = 6): Recipe[] {
  if (limit <= 0) return [];
  const others = all.filter((r) => r.id !== current.id && countryOf(r.placeId) === countryOf(current.placeId));
  const sameState = others.filter((r) => r.placeId === current.placeId).sort(byName);
  const sameMoment = others
    .filter((r) => r.placeId !== current.placeId && r.moment === current.moment)
    .sort(byName);
  const sameCountry = others
    .filter((r) => countryOf(r.placeId) === countryOf(current.placeId))
    .sort(byName);

  const seen = new Set<string>();
  const out: Recipe[] = [];
  for (const r of [...sameState, ...sameMoment, ...sameCountry]) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
    if (out.length >= limit) break;
  }
  return out;
}
