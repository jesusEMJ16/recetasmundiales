import type { Locale } from "./config";
import type { Place } from "../domain/types";
// Lightweight place localization. Recipe text lives in recipe-content.ts
// so interactive map/search components do not bundle full recipe translations.

export interface RecipeTranslation {
  dishName?: string;
  summary?: string;
  history?: string;
  ingredients?: string[];
  steps?: string[];
}
export type RecipeTranslations = Record<string, RecipeTranslation>; // key = recipe.id
export type PlaceTranslations = Record<string, string>; // key = place.id -> nombre

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

export function translatePlaceName(place: Place, locale: Locale): string {
  if (place.type === "pais") {
    return new Intl.DisplayNames([locale], { type: "region" }).of(place.countryCode) ?? place.name;
  }
  return placeOverlays[locale]?.[place.id] ?? place.name;
}
