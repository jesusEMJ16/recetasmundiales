import type { Locale } from "./config";
import type { Place, Recipe } from "../domain/types";
import { EN_BASE } from "./content/en-base";
import { EN_MX_NC } from "./content/en-mx-norte-centro";
import { EN_MX_SPN } from "./content/en-mx-sur-pn";
import { EN_MX_PCS } from "./content/en-mx-pcs";
import { EN_US_SNE } from "./content/en-us-s-ne";
import { EN_US_MWW } from "./content/en-us-mw-w";

// Traducción de CONTENIDO (recetas/lugares). El español es el idioma fuente.
// Otros idiomas se sobreponen por id (flujo: IA traduce -> humano revisa -> se pega aquí).

export interface RecipeTranslation {
  dishName?: string;
  summary?: string;
  history?: string;
  ingredients?: string[];
  steps?: string[];
}
export type RecipeTranslations = Record<string, RecipeTranslation>; // key = recipe.id
export type PlaceTranslations = Record<string, string>; // key = place.id -> nombre

// Cuando agregues inglés, por ejemplo:
//   en: { "r-tlayudas": { dishName: "Oaxacan tlayudas", summary: "...", steps: [...] } }
const recipeOverlays: Partial<Record<Locale, RecipeTranslations>> = {
  en: { ...EN_BASE, ...EN_MX_NC, ...EN_MX_SPN, ...EN_MX_PCS, ...EN_US_SNE, ...EN_US_MWW },
};

const placeOverlays: Partial<Record<Locale, PlaceTranslations>> = {
  en: {
    // Países
    mx: "Mexico", us: "United States", it: "Italy", jp: "Japan", th: "Thailand",
    // México (solo los que cambian; los nombres propios se quedan igual)
    "mx-cmx": "Mexico City", "mx-mex": "State of Mexico",
    // Italia / Japón
    "it-laz": "Lazio", "it-cam-nap": "Naples", "jp-tky": "Tokyo",
    // Estados de EE.UU. con nombre distinto en inglés
    "us-la": "Louisiana", "us-ny": "New York", "us-nj": "New Jersey", "us-nm": "New Mexico",
    "us-nc": "North Carolina", "us-sc": "South Carolina", "us-nd": "North Dakota", "us-sd": "South Dakota",
    "us-hi": "Hawaii", "us-mi": "Michigan", "us-ms": "Mississippi", "us-mo": "Missouri",
    "us-nh": "New Hampshire", "us-or": "Oregon", "us-pa": "Pennsylvania", "us-wv": "West Virginia",
  },
};

export function translateRecipe(recipe: Recipe, locale: Locale): Recipe {
  const t = recipeOverlays[locale]?.[recipe.id];
  if (!t) return recipe; // idioma fuente o sin traducción todavía
  return {
    ...recipe,
    dishName: t.dishName ?? recipe.dishName,
    summary: t.summary ?? recipe.summary,
    history: t.history ?? recipe.history,
    ingredients: t.ingredients ? t.ingredients.map((text) => ({ text })) : recipe.ingredients,
    steps: t.steps ?? recipe.steps,
  };
}

export function translatePlaceName(place: Place, locale: Locale): string {
  return placeOverlays[locale]?.[place.id] ?? place.name;
}
