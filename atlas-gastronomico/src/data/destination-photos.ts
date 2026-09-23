import { getRecipeImage, type RecipeImage } from "./recipe-images";

export interface DestinationPhoto extends RecipeImage {
  dish: string;
  recipeSlug: string;
}
// Menu cards and recipe pages share the same local image and attribution.
const COVERS: Record<string, { slug: string; dish: string }> = {
  MX: { slug: "tacos-de-pescado-estilo-baja", dish: "Tacos de pescado estilo Baja" },
  US: { slug: "buffalo-wings", dish: "Buffalo wings" },
  IT: { slug: "tiramisu", dish: "Tiramisú" },
  ES: { slug: "pulpo-a-la-gallega", dish: "Pulpo a la gallega" },
  JP: { slug: "ramen-shoyu", dish: "Ramen shoyu" },
  TH: { slug: "pad-thai", dish: "Pad Thai" },
  FR: { slug: "bouillabaisse", dish: "Bouillabaisse" },
  DE: { slug: "kasespatzle", dish: "Käsespätzle" },
  GR: { slug: "souvlaki", dish: "Souvlaki" },
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
