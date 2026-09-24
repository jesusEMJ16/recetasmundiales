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

// Regiones de la India con recetas: el nombre base está en español.
const indiaRegions: Record<Exclude<Locale, "es">, PlaceTranslations> = {
  en: { "in-dl": "Delhi", "in-pb": "Punjab", "in-ka": "Karnataka", "in-tg": "Telangana" },
  zh: { "in-dl": "德里", "in-pb": "旁遮普", "in-ka": "卡纳塔克", "in-tg": "特伦甘纳" },
  hi: { "in-dl": "दिल्ली", "in-pb": "पंजाब", "in-ka": "कर्नाटक", "in-tg": "तेलंगाना" },
  fr: { "in-dl": "Delhi", "in-pb": "Pendjab", "in-ka": "Karnataka", "in-tg": "Telangana" },
  ar: { "in-dl": "دلهي", "in-pb": "البنجاب", "in-ka": "كارناتاكا", "in-tg": "تيلانغانا" },
  bn: { "in-dl": "দিল্লি", "in-pb": "পাঞ্জাব", "in-ka": "কর্ণাটক", "in-tg": "তেলেঙ্গানা" },
  pt: { "in-dl": "Délhi", "in-pb": "Punjab", "in-ka": "Karnataka", "in-tg": "Telangana" },
  ru: { "in-dl": "Дели", "in-pb": "Пенджаб", "in-ka": "Карнатака", "in-tg": "Телангана" },
  ur: { "in-dl": "دہلی", "in-pb": "پنجاب", "in-ka": "کرناٹک", "in-tg": "تلنگانہ" },
  id: { "in-dl": "Delhi", "in-pb": "Punjab", "in-ka": "Karnataka", "in-tg": "Telangana" },
  ja: { "in-dl": "デリー", "in-pb": "パンジャーブ", "in-ka": "カルナータカ", "in-tg": "テランガーナ" },
};
for (const [locale, names] of Object.entries(indiaRegions) as [Exclude<Locale, "es">, PlaceTranslations][]) {
  placeOverlays[locale] = { ...placeOverlays[locale], ...names };
}

export function translatePlaceName(place: Place, locale: Locale): string {
  if (place.type === "pais") {
    return new Intl.DisplayNames([locale], { type: "region" }).of(place.countryCode) ?? place.name;
  }
  return placeOverlays[locale]?.[place.id] ?? place.name;
}
