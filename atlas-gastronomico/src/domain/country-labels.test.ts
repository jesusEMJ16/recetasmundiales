import { readFileSync } from "node:fs";
import type { FeatureCollection, Position } from "geojson";
import { describe, expect, it } from "vitest";
import anchors from "../data/country-labels.json";
import atlas from "../data/world-atlas.json";

const geography: FeatureCollection = JSON.parse(readFileSync("public/geo/world-countries.geojson", "utf8"));

function insideRing(x: number, y: number, ring: Position[]) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

describe("country label geography", () => {
  it("anchors all 195 labels inside their own territory, outside holes and lakes", () => {
    expect(Object.keys(anchors).sort()).toEqual(atlas.map(country => country.code).sort());
    for (const [code, anchor] of Object.entries(anchors)) {
      const geometry = geography.features.find(feature => feature.properties?.code === code)!.geometry;
      const polygons = geometry.type === "MultiPolygon" ? geometry.coordinates : geometry.type === "Polygon" ? [geometry.coordinates] : [];
      expect(polygons.some(rings => insideRing(anchor.lng, anchor.lat, rings[0]) && !rings.slice(1).some(hole => insideRing(anchor.lng, anchor.lat, hole))), code).toBe(true);
      expect(anchor.radius, code).toBeGreaterThan(0);
      expect(Number.isFinite(anchor.radius), code).toBe(true);
    }
  });

  it("keeps core labels on the mainland and lets microstates become readable on zoom", () => {
    expect(anchors.MX.lng).toBeGreaterThan(-110);
    expect(anchors.MX.lng).toBeLessThan(-95);
    expect(anchors.US.lat).toBeLessThan(49);
    expect(anchors.US.lng).toBeGreaterThan(-125);
    for (const code of ["MX", "US", "CA"] as const) expect(anchors[code].radius * 2 ** 3).toBeGreaterThan(15);
    // No off-shore substitutes for Vatican City or Monaco.
    for (const code of ["VA", "MC"] as const) {
      expect(anchors[code].radius * 2 ** 2).toBeLessThan(15 * .73);
      expect(anchors[code].radius * 2 ** 14).toBeGreaterThan(15 * .73);
    }
  });
});
