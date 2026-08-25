import type { Recipe } from "./types";

function countryOf(placeId: string): string {
  return placeId.split("-")[0];
}

function byPopularity(a: Recipe, b: Recipe): number {
  return b.popularityScore - a.popularityScore;
}

/**
 * Related recipes to keep the reader exploring. Priority:
 *  1) same place (state), 2) same moment elsewhere, 3) same country.
 * De-duplicated, excludes the current recipe, capped at `limit`.
 */
export function getRelatedRecipes(current: Recipe, all: Recipe[], limit = 6): Recipe[] {
  const others = all.filter((r) => r.id !== current.id);
  const sameState = others.filter((r) => r.placeId === current.placeId).sort(byPopularity);
  const sameMoment = others
    .filter((r) => r.placeId !== current.placeId && r.moment === current.moment)
    .sort(byPopularity);
  const sameCountry = others
    .filter((r) => countryOf(r.placeId) === countryOf(current.placeId))
    .sort(byPopularity);

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
