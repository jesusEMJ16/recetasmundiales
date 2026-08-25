import type { Locale } from "./config";
import type { Place } from "../domain/types";
import { placePathSlugs } from "../domain/places";
import { PLACES } from "../data/places";

// Constructores de URL conscientes del idioma. Úsalos SIEMPRE en vez de
// escribir "/es/..." a mano, para que sumar idiomas no rompa enlaces.

export function homeHref(locale: Locale): string {
  return `/${locale}`;
}

export function recipeHref(locale: Locale, slug: string): string {
  return `/${locale}/receta/${slug}`;
}

export function placeHref(locale: Locale, place: Place): string {
  return `/${locale}/recetas/${placePathSlugs(place, PLACES).join("/")}`;
}

export function placeHrefFromSlugs(locale: Locale, slugs: string[]): string {
  return `/${locale}/recetas/${slugs.join("/")}`;
}
