// Dominio público del sitio. Defínelo con NEXT_PUBLIC_SITE_URL si cambia (p. ej. en un entorno de pruebas).
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://worldbitesapp.com").replace(/\/+$/, "");

// Convierte una ruta del sitio ("/es/receta/x") en URL absoluta, como exigen schema.org, hreflang y el sitemap.
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href;
}

// Identificadores de Google compartidos por el layout y los anuncios.
export const GA_MEASUREMENT_ID = "G-DMYV52GPVK";
export const ADSENSE_CLIENT = "ca-pub-7181603320952752";
// Keep ads off until both approval and the separate advertising consent setup are complete.
export const ADSENSE_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true"
  && process.env.NEXT_PUBLIC_ADSENSE_CONSENT_CONFIGURED === "true";
