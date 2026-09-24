import photos from "./recipe-photos.json";
import { absoluteUrl } from "../site";

/** Reviewed recipe photography and dimensions, with per-file provenance in docs/recipe-photo-audit.json. */
export interface RecipeImage {
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  thumbnailWidth: number;
  thumbnailHeight: number;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
  provider: string;
}
// Some source metadata still contains historical HTTP Creative Commons URLs.
// Preserve that evidence in JSON but send readers to the same license over HTTPS.
export const RECIPE_IMAGES: Readonly<Record<string, RecipeImage>> = Object.fromEntries(
  Object.entries(photos).map(([slug, photo]) => [slug, {
    ...photo,
    licenseUrl: photo.licenseUrl.replace(/^http:\/\//, "https://"),
  }])
);
export function getRecipeImage(slug: string): RecipeImage | undefined {
  return RECIPE_IMAGES[slug];
}
export function photoSrcSet(photo: RecipeImage): string | undefined {
  return photo.thumbnailWidth < photo.width
    ? `${photo.thumbnailUrl} ${photo.thumbnailWidth}w, ${photo.url} ${photo.width}w`
    : undefined;
}
export function absolutePhotoUrl(photo: RecipeImage): string {
  return absoluteUrl(photo.url);
}
