import photos from "./recipe-photos.json";

/** Local photos and dimensions, with per-file provenance in docs/recipe-photo-audit.json. */
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
export const RECIPE_IMAGES: Readonly<Record<string, RecipeImage>> = photos;
export function getRecipeImage(slug: string): RecipeImage | undefined {
  return RECIPE_IMAGES[slug];
}
export function photoSrcSet(photo: RecipeImage): string | undefined {
  return photo.thumbnailWidth < photo.width
    ? `${photo.thumbnailUrl} ${photo.thumbnailWidth}w, ${photo.url} ${photo.width}w`
    : undefined;
}
export function absolutePhotoUrl(photo: RecipeImage): string {
  return new URL(photo.url, "https://worldbitesapp.com").href;
}
