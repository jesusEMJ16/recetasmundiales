// Configuración de idiomas. Para agregar un idioma nuevo:
//  1) añádelo aquí,  2) crea su diccionario en dictionaries.ts,
//  3) (opcional) añade traducciones de contenido en content/<locale>.ts
export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

// Metadatos de cada idioma (para selector y hreflang)
export const localeMeta: Record<Locale, { label: string; flag: string; htmlLang: string }> = {
  es: { label: "Español", flag: "🇲🇽", htmlLang: "es" },
  en: { label: "English", flag: "🇺🇸", htmlLang: "en" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function resolveLocale(value: string | undefined): Locale {
  return value && isLocale(value) ? value : defaultLocale;
}
