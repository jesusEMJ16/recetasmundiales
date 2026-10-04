import { describe, expect, it } from "vitest";
import { RECIPES } from "../data/recipes";
import { getRelatedRecipes } from "./related";
import { PLACES } from "../data/places";
import { getBreadcrumb } from "./places";
import { generateMetadata, generateStaticParams } from "../app/[locale]/recetas/[...slug]/page";
import { generateMetadata as informationMetadata } from "../app/[locale]/informacion/[slug]/page";
import sitemap from "../app/sitemap";

describe("publication and catalog trust", () => {
  it("does not expose seeded prototype votes as reader reviews", () => {
    expect(RECIPES.every(recipe => recipe.ratingCount === 0 && recipe.ratingAvg === 0 && recipe.popularityScore === 0)).toBe(true);
  });
  it("keeps actual recommendations in the recipe's country, including sparse countries", () => {
    const countryOf = (placeId: string) => getBreadcrumb(PLACES.find(place => place.id === placeId)!, PLACES)[0].id;
    for (const recipe of RECIPES) {
      for (const related of getRelatedRecipes(recipe, RECIPES)) expect(countryOf(related.placeId), recipe.slug).toBe(countryOf(recipe.placeId));
    }
    expect(getRelatedRecipes(RECIPES[0], RECIPES, 0)).toEqual([]);
  });
  it("keeps empty countries available but out of indexing and static catalog generation", async () => {
    const params = Promise.resolve({ locale: "es", slug: ["afganistan"] });
    expect((await generateMetadata({ params })).robots).toEqual({ index: false, follow: true });
    expect(generateStaticParams().some(p => p.slug[0] === "afganistan")).toBe(false);
    expect(sitemap().some(entry => entry.url.includes("/recetas/afganistan"))).toBe(false);
  });
  it("indexes published catalogs while canonicalizing filter variants", async () => {
    const params = Promise.resolve({ locale: "es", slug: ["mexico"] });
    expect((await generateMetadata({ params })).robots).toEqual({ index: true, follow: true });
    const filtered = await generateMetadata({ params, searchParams: Promise.resolve({ dieta: "vegano" }) });
    expect(filtered.robots).toEqual({ index: false, follow: true });
    expect(filtered.alternates?.canonical).toBe("https://worldbitesapp.com/es/recetas/mexico");
  });
  it("indexes original information pages and canonicalizes untranslated fallbacks", async () => {
    expect((await informationMetadata({ params: Promise.resolve({ locale: "es", slug: "privacidad" }) })).robots).toEqual({ index: true, follow: true });
    const fallback = await informationMetadata({ params: Promise.resolve({ locale: "fr", slug: "privacidad" }) });
    expect(fallback.robots).toEqual({ index: false, follow: true });
    expect(fallback.alternates?.canonical).toBe("https://worldbitesapp.com/en/informacion/privacidad");
    expect(sitemap().some(entry => entry.url.endsWith("/es/informacion/contacto"))).toBe(true);
    expect(sitemap().some(entry => entry.url.endsWith("/restaurantes"))).toBe(false);
  });
});
