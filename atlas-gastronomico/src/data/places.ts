import type { Place } from "../domain/types";
import { SUBPLACES_MX_NORTE } from "./places-mx-pueblos-norte";
import { SUBPLACES_MX_CENTRO } from "./places-mx-pueblos-centro";
import { SUBPLACES_MX_SUR } from "./places-mx-pueblos-sur";
import { US_STATES } from "./places-us-states";

export const PLACES: Place[] = [
  // ── México (país) ──
  { id: "mx", type: "pais", name: "México", slug: "mexico", parentId: null, countryCode: "MX", lat: 23.63, lng: -102.55 },

  // ── Los 32 estados de México ──
  { id: "mx-agu", type: "estado", name: "Aguascalientes", slug: "aguascalientes", parentId: "mx", countryCode: "MX", lat: 21.88, lng: -102.29 },
  { id: "mx-bcn", type: "estado", name: "Baja California", slug: "baja-california", parentId: "mx", countryCode: "MX", lat: 30.84, lng: -115.28 },
  { id: "mx-bcs", type: "estado", name: "Baja California Sur", slug: "baja-california-sur", parentId: "mx", countryCode: "MX", lat: 25.0, lng: -111.66 },
  { id: "mx-cam", type: "estado", name: "Campeche", slug: "campeche", parentId: "mx", countryCode: "MX", lat: 18.83, lng: -90.29 },
  { id: "mx-chp", type: "estado", name: "Chiapas", slug: "chiapas", parentId: "mx", countryCode: "MX", lat: 16.75, lng: -92.63 },
  { id: "mx-chh", type: "estado", name: "Chihuahua", slug: "chihuahua", parentId: "mx", countryCode: "MX", lat: 28.63, lng: -106.07 },
  { id: "mx-cmx", type: "estado", name: "Ciudad de México", slug: "ciudad-de-mexico", parentId: "mx", countryCode: "MX", lat: 19.43, lng: -99.13 },
  { id: "mx-coa", type: "estado", name: "Coahuila", slug: "coahuila", parentId: "mx", countryCode: "MX", lat: 27.06, lng: -101.71 },
  { id: "mx-col", type: "estado", name: "Colima", slug: "colima", parentId: "mx", countryCode: "MX", lat: 19.24, lng: -103.72 },
  { id: "mx-dur", type: "estado", name: "Durango", slug: "durango", parentId: "mx", countryCode: "MX", lat: 24.02, lng: -104.65 },
  { id: "mx-gua", type: "estado", name: "Guanajuato", slug: "guanajuato", parentId: "mx", countryCode: "MX", lat: 21.02, lng: -101.26 },
  { id: "mx-gro", type: "estado", name: "Guerrero", slug: "guerrero", parentId: "mx", countryCode: "MX", lat: 17.44, lng: -99.55 },
  { id: "mx-hid", type: "estado", name: "Hidalgo", slug: "hidalgo", parentId: "mx", countryCode: "MX", lat: 20.09, lng: -98.76 },
  { id: "mx-jal", type: "estado", name: "Jalisco", slug: "jalisco", parentId: "mx", countryCode: "MX", lat: 20.66, lng: -103.35 },
  { id: "mx-mex", type: "estado", name: "Estado de México", slug: "estado-de-mexico", parentId: "mx", countryCode: "MX", lat: 19.36, lng: -99.75 },
  { id: "mx-mic", type: "estado", name: "Michoacán", slug: "michoacan", parentId: "mx", countryCode: "MX", lat: 19.57, lng: -101.71 },
  { id: "mx-mor", type: "estado", name: "Morelos", slug: "morelos", parentId: "mx", countryCode: "MX", lat: 18.68, lng: -99.1 },
  { id: "mx-nay", type: "estado", name: "Nayarit", slug: "nayarit", parentId: "mx", countryCode: "MX", lat: 21.75, lng: -104.85 },
  { id: "mx-nle", type: "estado", name: "Nuevo León", slug: "nuevo-leon", parentId: "mx", countryCode: "MX", lat: 25.59, lng: -99.99 },
  { id: "mx-oax", type: "estado", name: "Oaxaca", slug: "oaxaca", parentId: "mx", countryCode: "MX", lat: 17.07, lng: -96.72 },
  { id: "mx-pue", type: "estado", name: "Puebla", slug: "puebla", parentId: "mx", countryCode: "MX", lat: 19.04, lng: -98.21 },
  { id: "mx-que", type: "estado", name: "Querétaro", slug: "queretaro", parentId: "mx", countryCode: "MX", lat: 20.59, lng: -100.39 },
  { id: "mx-roo", type: "estado", name: "Quintana Roo", slug: "quintana-roo", parentId: "mx", countryCode: "MX", lat: 19.6, lng: -88.05 },
  { id: "mx-slp", type: "estado", name: "San Luis Potosí", slug: "san-luis-potosi", parentId: "mx", countryCode: "MX", lat: 22.16, lng: -100.98 },
  { id: "mx-sin", type: "estado", name: "Sinaloa", slug: "sinaloa", parentId: "mx", countryCode: "MX", lat: 24.8, lng: -107.4 },
  { id: "mx-son", type: "estado", name: "Sonora", slug: "sonora", parentId: "mx", countryCode: "MX", lat: 29.3, lng: -110.33 },
  { id: "mx-tab", type: "estado", name: "Tabasco", slug: "tabasco", parentId: "mx", countryCode: "MX", lat: 17.84, lng: -92.62 },
  { id: "mx-tam", type: "estado", name: "Tamaulipas", slug: "tamaulipas", parentId: "mx", countryCode: "MX", lat: 24.27, lng: -98.84 },
  { id: "mx-tla", type: "estado", name: "Tlaxcala", slug: "tlaxcala", parentId: "mx", countryCode: "MX", lat: 19.32, lng: -98.24 },
  { id: "mx-ver", type: "estado", name: "Veracruz", slug: "veracruz", parentId: "mx", countryCode: "MX", lat: 19.17, lng: -96.13 },
  { id: "mx-yuc", type: "estado", name: "Yucatán", slug: "yucatan", parentId: "mx", countryCode: "MX", lat: 20.71, lng: -89.09 },
  { id: "mx-zac", type: "estado", name: "Zacatecas", slug: "zacatecas", parentId: "mx", countryCode: "MX", lat: 22.77, lng: -102.58 },

  // Sub-lugares notables (ciudad/pueblo) — se amplían donde hay platillo notable
  { id: "mx-oax-city", type: "ciudad", name: "Oaxaca de Juárez", slug: "oaxaca-de-juarez", parentId: "mx-oax", countryCode: "MX", lat: 17.06, lng: -96.72 },

  // ── Estados Unidos ──
  { id: "us", type: "pais", name: "Estados Unidos", slug: "estados-unidos", parentId: null, countryCode: "US", lat: 39.83, lng: -98.58 },
  { id: "us-la", type: "estado", name: "Luisiana", slug: "luisiana", parentId: "us", countryCode: "US", lat: 30.98, lng: -91.96 },
  { id: "us-tx", type: "estado", name: "Texas", slug: "texas", parentId: "us", countryCode: "US", lat: 31.0, lng: -100.0 },

  // ── Italia ──
  { id: "it", type: "pais", name: "Italia", slug: "italia", parentId: null, countryCode: "IT", lat: 41.87, lng: 12.57 },
  { id: "it-cam", type: "estado", name: "Campania", slug: "campania", parentId: "it", countryCode: "IT", lat: 40.83, lng: 14.25 },
  { id: "it-cam-nap", type: "ciudad", name: "Nápoles", slug: "napoles", parentId: "it-cam", countryCode: "IT", lat: 40.85, lng: 14.27 },
  { id: "it-laz", type: "estado", name: "Lacio", slug: "lacio", parentId: "it", countryCode: "IT", lat: 41.9, lng: 12.5 },

  // ── Japón ──
  { id: "jp", type: "pais", name: "Japón", slug: "japon", parentId: null, countryCode: "JP", lat: 36.2, lng: 138.25 },
  { id: "jp-osk", type: "estado", name: "Osaka", slug: "osaka", parentId: "jp", countryCode: "JP", lat: 34.69, lng: 135.5 },
  { id: "jp-tky", type: "estado", name: "Tokio", slug: "tokio", parentId: "jp", countryCode: "JP", lat: 35.68, lng: 139.69 },

  // ── Tailandia ──
  { id: "th", type: "pais", name: "Tailandia", slug: "tailandia", parentId: null, countryCode: "TH", lat: 15.87, lng: 100.99 },
  { id: "th-bkk", type: "estado", name: "Bangkok", slug: "bangkok", parentId: "th", countryCode: "TH", lat: 13.75, lng: 100.5 },
  { id: "th-cnx", type: "estado", name: "Chiang Mai", slug: "chiang-mai", parentId: "th", countryCode: "TH", lat: 18.79, lng: 98.99 },

  // Sub-lugares México (Pueblos Mágicos y ciudades con platillo propio)
  ...SUBPLACES_MX_NORTE,
  ...SUBPLACES_MX_CENTRO,
  ...SUBPLACES_MX_SUR,

  // Estados de EE.UU. (los 48 restantes; Luisiana y Texas ya están arriba)
  ...US_STATES,
];
