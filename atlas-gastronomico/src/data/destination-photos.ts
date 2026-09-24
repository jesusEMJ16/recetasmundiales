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
  FR: { slug: "boeuf-bourguignon", dish: "Boeuf bourguignon" },
  DE: { slug: "kasespatzle", dish: "Käsespätzle" },
  GR: { slug: "souvlaki", dish: "Souvlaki" },
  PT: { slug: "pasteis-de-nata", dish: "Pastéis de nata" },
  AT: { slug: "wiener-schnitzel", dish: "Wiener Schnitzel" },
  BR: { slug: "feijoada-brasileira", dish: "Feijoada brasileña" },
  AR: { slug: "asado-argentino-a-la-parrilla", dish: "Asado argentino a la parrilla" },
  PE: { slug: "cebiche-de-pescado-peruano", dish: "Cebiche de pescado peruano" },
  CL: { slug: "pastel-de-choclo-chileno", dish: "Pastel de choclo chileno" },
  CO: { slug: "bandeja-paisa-colombiana", dish: "Bandeja paisa colombiana" },
  MA: { slug: "tajin-marroqui-pollo-limon-aceitunas", dish: "Tajín marroquí de pollo con limón y aceitunas" },
};

const COUNTRY_COVER_OVERRIDES: Partial<Record<string, RecipeImage>> = {
  MA: {
    url: "/images/country-covers/marruecos-tajin.webp",
    thumbnailUrl: "/images/country-covers/marruecos-tajin-480.webp",
    width: 1280,
    height: 720,
    thumbnailWidth: 480,
    thumbnailHeight: 270,
    author: "WorldBites",
    license: "WorldBites original image",
    source: "https://worldbitesapp.com/images/country-covers/marruecos-tajin.webp",
    licenseUrl: "https://worldbitesapp.com",
    provider: "WorldBites",
  },
};
export const DESTINATION_PHOTOS: Record<string, DestinationPhoto> = Object.fromEntries(
  Object.entries(COVERS).map(([code, cover]) => {
    const photo = COUNTRY_COVER_OVERRIDES[code] ?? getRecipeImage(cover.slug);
    if (!photo) throw new Error(`Missing destination photo: ${code}/${cover.slug}`);
    return [code, { ...photo, dish: cover.dish, recipeSlug: cover.slug }];
  })
);
