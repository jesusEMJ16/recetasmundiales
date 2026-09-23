import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { RECIPES } from "./recipes";
import { PLACES } from "./places";
import { RECIPE_IMAGES, getRecipeImage, photoSrcSet, absolutePhotoUrl } from "./recipe-images";
import { DESTINATION_PHOTOS } from "./destination-photos";
import audit from "../../docs/recipe-photo-audit.json";
import { photoUi } from "../i18n/photo-ui";
import { locales } from "../i18n/config";

const file = (url: string) => readFileSync(resolve(process.cwd(), "public", url.slice(1)));

describe("reviewed recipe photography", () => {
  it("accounts for every recipe without disguising pending photographs as completed", () => {
    const photographed = Object.keys(RECIPE_IMAGES);
    const pending = (audit.pending as Array<{ slug: string }>).map(p => p.slug);
    expect(new Set([...photographed, ...pending]).size).toBe(photographed.length + pending.length);
    expect([...photographed, ...pending].sort()).toEqual(RECIPES.map(r => r.slug).sort());
    expect(photographed.length).toBe(audit.photoCount);
    expect(pending.length).toBe(audit.pendingCount);
    expect(RECIPES.length).toBe(audit.totalRecipes);
    expect(audit.photoCount).toBe(198);
    expect(audit.pendingCount).toBe(0);
    expect(Object.values(RECIPE_IMAGES).filter(photo => photo.generated)).toHaveLength(16);
  });
  it("ships actual local WebP bytes for both sizes without external image requests", () => {
    for (const photo of Object.values(RECIPE_IMAGES)) {
      for (const url of [photo.url, photo.thumbnailUrl]) {
        expect(url).toMatch(/^\/images\/recipes-v2\/[a-z0-9-]+\.webp$/);
        const bytes = file(url);
        expect(bytes.subarray(0, 4).toString()).toBe("RIFF");
        expect(bytes.subarray(8, 12).toString()).toBe("WEBP");
        expect(bytes.length).toBeGreaterThan(100);
        expect(bytes.length).toBeLessThan(600000);
      }
    }
  });
  it("preserves author, source, license and correct provider for every photograph", () => {
    for (const photo of Object.values(RECIPE_IMAGES)) {
      expect(photo.author.trim()).not.toBe("");
      if (photo.generated) {
        expect(photo.author).toBe("WorldBites");
        expect(photo.license).toBe("Original AI-generated illustration");
        expect(photo.source).toBe("AI-generated for WorldBites");
        expect(photo.provider).toBe("WorldBites");
        continue;
      }
      expect(photo.license).toMatch(/^(CC BY(?:-SA)? [0-9]|CC0|Public domain)/);
      expect(new URL(photo.licenseUrl).protocol).toBe("https:");
      expect(new URL(photo.source).protocol).toBe("https:");
      const host = new URL(photo.source).hostname;
      expect(["commons.wikimedia.org", "www.flickr.com"]).toContain(host);
      expect(photo.provider).toBe(host === "www.flickr.com" ? "Flickr" : "Wikimedia Commons");
    }
  });
  it("uses a recipe from the correct country for all destination covers", () => {
    const recipeCountries = new Set(RECIPES.map(r => PLACES.find(p => p.id === r.placeId)?.countryCode));
    expect(Object.keys(DESTINATION_PHOTOS).sort()).toEqual([...recipeCountries].sort());
    for (const [code, cover] of Object.entries(DESTINATION_PHOTOS)) {
      const recipe = RECIPES.find(r => r.slug === cover.recipeSlug);
      expect(recipe).toBeDefined();
      expect(PLACES.find(p => p.id === recipe!.placeId)?.countryCode).toBe(code);
      expect(cover.url).toBe(getRecipeImage(cover.recipeSlug)?.url);
      expect(cover.source).toBe(getRecipeImage(cover.recipeSlug)?.source);
    }
  });
  it("uses truthful responsive width descriptors and never upscales thumbnails", () => {
    for (const photo of Object.values(RECIPE_IMAGES)) {
      expect(photo.width).toBeGreaterThan(0);
      expect(photo.height).toBeGreaterThan(0);
      expect(Math.max(photo.width, photo.height)).toBeLessThanOrEqual(1200);
      expect(Math.max(photo.thumbnailWidth, photo.thumbnailHeight)).toBeLessThanOrEqual(480);
      expect(photo.thumbnailWidth).toBeLessThanOrEqual(photo.width);
      expect(photo.thumbnailHeight).toBeLessThanOrEqual(photo.height);
      expect(photoSrcSet(photo)).toBe(photo.thumbnailWidth < photo.width
        ? `${photo.thumbnailUrl} ${photo.thumbnailWidth}w, ${photo.url} ${photo.width}w` : undefined);
    }
  });
  it("resolves public metadata to the same local photo and leaves unknown slugs empty", () => {
    for (const photo of Object.values(RECIPE_IMAGES)) {
      expect(absolutePhotoUrl(photo)).toBe(`https://worldbitesapp.com${photo.url}`);
    }
    expect(getRecipeImage("not-a-recipe")).toBeUndefined();
  });
  it("matches the provenance audit and immutable SHA-256 checksums", () => {
    expect(audit.photos.map(p => p.slug).sort()).toEqual(Object.keys(RECIPE_IMAGES).sort());
    for (const entry of audit.photos) {
      const photo = RECIPE_IMAGES[entry.slug];
      expect(createHash("sha256").update(file(photo.url)).digest("hex")).toBe(entry.webpSha256);
      expect(photo.source).toBe(entry.source);
      expect(photo.author).toBe(entry.author);
      expect(photo.license).toBe(entry.license);
    }
  });
  it("provides pending-image and modification notices in all twelve locales", () => {
    expect(Object.keys(photoUi).sort()).toEqual([...locales].sort());
    for (const locale of locales) {
      expect(photoUi[locale].pending.trim().length).toBeGreaterThan(3);
      expect(photoUi[locale].transformed.trim().length).toBeGreaterThan(3);
      expect(photoUi[locale].generated.trim().length).toBeGreaterThan(3);
    }
  });
});
