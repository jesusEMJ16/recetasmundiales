import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { PLACES } from "../data/places";
import { RECIPES } from "../data/recipes";
import ATLAS from "../data/world-atlas.json";
import { buildRecipeCounts } from "./atlas";
import { getRecipesForPlace, placePathSlugs, resolvePlacePath } from "./places";

const counts=buildRecipeCounts(PLACES,RECIPES);
describe("world atlas integrity",()=>{
  it("has exactly 195 selectable countries with geometry and unique place IDs",()=>{
    expect(ATLAS).toHaveLength(195);
    expect(new Set(ATLAS.map(c=>c.code)).size).toBe(195);
    expect(new Set(PLACES.map(p=>p.id)).size).toBe(PLACES.length);
    const world=JSON.parse(readFileSync("public/geo/world-countries.geojson","utf8"));
    expect(new Set(world.features.filter((f:{properties:{selectable?:boolean}})=>f.properties.selectable !== false).map((f:{properties:{code:string}})=>f.properties.code))).toEqual(new Set(ATLAS.map(c=>c.code)));
  });
  it("preserves 32 Mexican entities, 50 US states plus DC, and 13 Canadian divisions",()=>{
    expect(ATLAS.find(c=>c.code==="MX")!.regions).toHaveLength(32);
    expect(ATLAS.find(c=>c.code==="US")!.regions).toHaveLength(51);
    expect(ATLAS.find(c=>c.code==="US")!.regions).toContain("us-dc");
    expect(ATLAS.find(c=>c.code==="CA")!.regions).toHaveLength(13);
    expect(resolvePlacePath(["mexico","oaxaca"],PLACES)?.id).toBe("mx-oax");
    expect(resolvePlacePath(["estados-unidos","texas"],PLACES)?.id).toBe("us-tx");
  });
  it("every regional polygon and link resolves to a place in the selected country",()=>{
    const byId=new Map(PLACES.map(p=>[p.id,p]));
    for(const country of ATLAS){
      expect(new Set(country.regions).size).toBe(country.regions.length);
      const geo=JSON.parse(readFileSync(`public/geo/regions/${country.code}.geojson`,"utf8"));
      for(const f of geo.features){expect(country.regions).toContain(f.properties.id);}
      for(const id of country.regions){
        const place=byId.get(id)!;
        expect(place,`${country.code}: ${id}`).toBeDefined();
        expect(place.countryCode).toBe(country.code);
        expect(resolvePlacePath(placePathSlugs(place,PLACES),PLACES)?.id).toBe(id);
      }
    }
  });
  it("uses real recursive totals, includes zeros and never double counts a recipe",()=>{
    for(const country of ATLAS){expect(counts.get(country.id)).toBe(getRecipesForPlace(country.id,PLACES,RECIPES).length);}
    expect(ATLAS.reduce((n,c)=>n+counts.get(c.id)!,0)).toBe(RECIPES.length);
    expect(counts.get("ca")).toBe(0);
    for(const id of [...ATLAS.find(c=>c.code==="MX")!.regions,...ATLAS.find(c=>c.code==="US")!.regions]){
      expect(counts.get(id)).toBe(getRecipesForPlace(id,PLACES,RECIPES).length);
    }
  });
});
