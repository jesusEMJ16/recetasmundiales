import { getRecipeImage, type RecipeImage } from "./recipe-images";

export interface DestinationPhoto extends RecipeImage {
  dish: string;
  recipeSlug: string;
}
// Menu cards and recipe pages share the same local image and attribution.
const COVERS: Record<string, { slug: string; dish: string }> = {
  MX: { slug: "tacos-al-pastor", dish: "Tacos al pastor" },
  US: { slug: "brisket-ahumado-texano", dish: "Brisket ahumado texano" },
  IT: { slug: "pizza-napoletana", dish: "Pizza napoletana" },
  ES: { slug: "paella-valenciana", dish: "Paella valenciana" },
  JP: { slug: "okonomiyaki-osaka", dish: "Okonomiyaki" },
  TH: { slug: "khao-soi", dish: "Khao soi" },
  FR: { slug: "coq-au-vin", dish: "Coq au vin" },
  DE: { slug: "sauerbraten", dish: "Sauerbraten" },
  GR: { slug: "moussaka", dish: "Moussaka" },
  PT: { slug: "pasteis-de-nata", dish: "Pastéis de nata" },
  AT: { slug: "wiener-schnitzel", dish: "Wiener Schnitzel" },
};
export const DESTINATION_PHOTOS: Record<string, DestinationPhoto> = Object.fromEntries(
  Object.entries(COVERS).map(([code, cover]) => {
    const photo = getRecipeImage(cover.slug);
    if (!photo) throw new Error(`Missing destination photo: ${code}/${cover.slug}`);
    return [code, { ...photo, dish: cover.dish, recipeSlug: cover.slug }];
  })
);
