import { describe, it, expect } from "vitest";
import { PLACES } from "../data/places";
import { RECIPES } from "../data/recipes";
import {
  resolvePlacePath, getChildren, getBreadcrumb, getRecipesForPlace,
} from "./places";

describe("resolvePlacePath", () => {
  it("resolves a country slug", () => {
    expect(resolvePlacePath(["mexico"], PLACES)?.id).toBe("mx");
  });
  it("resolves a nested state under its country", () => {
    expect(resolvePlacePath(["mexico", "oaxaca"], PLACES)?.id).toBe("mx-oax");
  });
  it("returns null for a wrong parent chain", () => {
    // 'oaxaca' is not a child of 'italia'
    expect(resolvePlacePath(["italia", "oaxaca"], PLACES)).toBeNull();
  });
});

describe("getChildren", () => {
  it("returns the direct children of a place (the 32 Mexican states)", () => {
    const kids = getChildren("mx", PLACES);
    expect(kids.length).toBe(32);
    const ids = kids.map((p) => p.id);
    expect(ids).toContain("mx-oax");
    expect(ids).toContain("mx-jal");
    expect(ids).toContain("mx-yuc");
    // every child's parent is mx
    expect(kids.every((p) => p.parentId === "mx")).toBe(true);
  });
});

describe("getBreadcrumb", () => {
  it("returns root→...→place", () => {
    const place = PLACES.find((p) => p.id === "mx-oax-city")!;
    expect(getBreadcrumb(place, PLACES).map((p) => p.id)).toEqual(["mx", "mx-oax", "mx-oax-city"]);
  });
});

describe("getRecipesForPlace", () => {
  it("includes recipes of descendant places (country rolls up its states)", () => {
    const ids = getRecipesForPlace("mx", PLACES, RECIPES).map((r) => r.id);
    expect(ids).toContain("r-tlayudas"); // placeId mx-oax, a descendant of mx
    expect(ids).toContain("r-birria");   // placeId mx-jal
    expect(ids).not.toContain("r-pizza"); // Italy
  });
  it("a state rolls up its own recipes plus those of its sub-places", () => {
    const rows = getRecipesForPlace("mx-jal", PLACES, RECIPES);
    const ids = rows.map((r) => r.id);
    expect(ids).toContain("r-birria");
    expect(ids).toContain("r-tacos-pastor");
    // every recipe belongs to the Jalisco subtree (the state or one of its sub-places)
    expect(rows.every((r) => r.placeId === "mx-jal" || r.placeId.startsWith("mx-jal-"))).toBe(true);
  });
});
