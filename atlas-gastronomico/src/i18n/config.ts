// Configuración de idiomas - Los 12 idiomas más hablados del mundo
// Fuente: Ethnologue 2023 - Para máximo alcance SEO global
export const locales = [
  "es",  // Español - 559M hablantes
  "en",  // Inglés - 1.5B hablantes  
  "zh",  // Chino Mandarín - 1.1B hablantes
  "hi",  // Hindi - 602M hablantes
  "fr",  // Francés - 310M hablantes
  "ar",  // Árabe - 274M hablantes
  "bn",  // Bengalí - 273M hablantes
  "pt",  // Portugués - 264M hablantes
  "ru",  // Ruso - 255M hablantes
  "ur",  // Urdu - 232M hablantes
  "id",  // Indonesio - 199M hablantes
  "ja",  // Japonés - 123M hablantes (opcional pero importante para SEO)
] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

// Metadatos de cada idioma (para selector y hreflang)
export const localeMeta: Record<Locale, { label: string; flag: string; htmlLang: string; nativeName: string }> = {
  es: { label: "Español", flag: "🌎", htmlLang: "es", nativeName: "Español" },
  en: { label: "English", flag: "🌍", htmlLang: "en", nativeName: "English" },
  zh: { label: "中文", flag: "🇨🇳", htmlLang: "zh-CN", nativeName: "中文 (简体)" },
  hi: { label: "हिन्दी", flag: "🇮🇳", htmlLang: "hi", nativeName: "हिन्दी" },
  fr: { label: "Français", flag: "🇫🇷", htmlLang: "fr", nativeName: "Français" },
  ar: { label: "العربية", flag: "🌍", htmlLang: "ar", nativeName: "العربية" },
  bn: { label: "বাংলা", flag: "🇧🇩", htmlLang: "bn", nativeName: "বাংলা" },
  pt: { label: "Português", flag: "🇵🇹", htmlLang: "pt", nativeName: "Português" },
  ru: { label: "Русский", flag: "🇷🇺", htmlLang: "ru", nativeName: "Русский" },
  ur: { label: "اردو", flag: "🇵🇰", htmlLang: "ur", nativeName: "اردو" },
  id: { label: "Bahasa Indonesia", flag: "🇮🇩", htmlLang: "id", nativeName: "Bahasa Indonesia" },
  ja: { label: "日本語", flag: "🇯🇵", htmlLang: "ja", nativeName: "日本語" },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function resolveLocale(value: string | undefined): Locale {
  return value && isLocale(value) ? value : defaultLocale;
}
