// Archivo principal de recetas - Carga dinámica desde JSON transformados
// Elimina hardcodeo y usa datos dinámicos

import type { Recipe } from "../domain/types";
import { RECIPES_MX_NORTE } from "./recipes-mx-norte";
import { RECIPES_MX_CENTRO } from "./recipes-mx-centro";
import { RECIPES_MX_SUR } from "./recipes-mx-sur";
import { RECIPES_PUEBLOS_MX_NORTE } from "./recipes-mx-pueblos-norte";
import { RECIPES_PUEBLOS_MX_CENTRO } from "./recipes-mx-pueblos-centro";
import { RECIPES_PUEBLOS_MX_SUR } from "./recipes-mx-pueblos-sur";
import { RECIPES_US_SUR } from "./recipes-us-sur";
import { RECIPES_US_NORESTE } from "./recipes-us-noreste";
import { RECIPES_US_MEDIO_OESTE } from "./recipes-us-medio-oeste";
import { RECIPES_US_OESTE } from "./recipes-us-oeste";
import { RECIPES_EUROPE } from "./recipes-europe";

// Importar recetas internacionales transformadas (formato Recipe)
import ALEMANIA_JSON from "./recipes_transformed/alemania.json";
import ARGENTINA_JSON from "./recipes_transformed/argentina.json";
import BRASIL_JSON from "./recipes_transformed/brasil.json";
import CANADA_JSON from "./recipes_transformed/canadá.json";
import CHILE_JSON from "./recipes_transformed/chile.json";
import CHINA_JSON from "./recipes_transformed/china.json";
import COLOMBIA_JSON from "./recipes_transformed/colombia.json";
import COREA_JSON from "./recipes_transformed/corea-del-sur.json";
import COSTA_RICA_JSON from "./recipes_transformed/costa-rica.json";
import CUBA_JSON from "./recipes_transformed/cuba.json";
import ECUADOR_JSON from "./recipes_transformed/ecuador.json";
import EGIPTO_JSON from "./recipes_transformed/egipto.json";
import ESPANA_JSON from "./recipes_transformed/españa.json";
import ESTADOS_UNIDOS_JSON from "./recipes_transformed/estados-unidos.json";
import ETIOPIA_JSON from "./recipes_transformed/etiopía.json";
import FILIPINAS_JSON from "./recipes_transformed/filipinas.json";
import FRANCIA_JSON from "./recipes_transformed/francia.json";
import GRECIA_JSON from "./recipes_transformed/grecia.json";
import HUNGRIA_JSON from "./recipes_transformed/hungría.json";
import INDIA_JSON from "./recipes_transformed/india.json";
import INDONESIA_JSON from "./recipes_transformed/indonesia.json";
import ITALIA_JSON from "./recipes_transformed/italia.json";
import JAPON_JSON from "./recipes_transformed/japón.json";
import MALASIA_JSON from "./recipes_transformed/malasia.json";
import MEXICO_JSON from "./recipes_transformed/méxico.json";
import NUEVA_ZELANDA_JSON from "./recipes_transformed/nueva-zelanda.json";
import PANAMA_JSON from "./recipes_transformed/panamá.json";
import PAISES_BAJOS_JSON from "./recipes_transformed/países-bajos.json";
import PERU_JSON from "./recipes_transformed/perú.json";
import POLONIA_JSON from "./recipes_transformed/polonia.json";
import PORTUGAL_JSON from "./recipes_transformed/portugal.json";
import REINO_UNIDO_JSON from "./recipes_transformed/reino-unido.json";
import SINGAPUR_JSON from "./recipes_transformed/singapur.json";
import TAILANDIA_JSON from "./recipes_transformed/tailandia.json";
import TURQUIA_JSON from "./recipes_transformed/turquía.json";
import UCRANIA_JSON from "./recipes_transformed/ucrania.json";
import VENEZUELA_JSON from "./recipes_transformed/venezuela.json";
import VIETNAM_JSON from "./recipes_transformed/vietnam.json";

// Función helper para convertir JSON a Recipe con tipos correctos
const toRecipes = (json: any): Recipe[] => {
  const recipes = Array.isArray(json) ? json : (json.default || json);
  return recipes.map((r: any) => ({
    ...r,
    originConfidence: "confirmed" as const,
    difficulty: (r.difficulty || "media") as "facil" | "media" | "dificil",
    moment: (r.moment || "comida") as "desayuno" | "comida" | "cena" | "postre" | "bebida" | "street_food",
    diet: (r.diet || []) as Array<"vegetariano" | "vegano" | "sin_gluten" | "sin_lacteos">,
  }));
};

// Consolidar todas las recetas internacionales
const INTERNATIONAL_RECIPES: Recipe[] = [
  ...toRecipes(ALEMANIA_JSON),
  ...toRecipes(ARGENTINA_JSON),
  ...toRecipes(BRASIL_JSON),
  ...toRecipes(CANADA_JSON),
  ...toRecipes(CHILE_JSON),
  ...toRecipes(CHINA_JSON),
  ...toRecipes(COLOMBIA_JSON),
  ...toRecipes(COREA_JSON),
  ...toRecipes(COSTA_RICA_JSON),
  ...toRecipes(CUBA_JSON),
  ...toRecipes(ECUADOR_JSON),
  ...toRecipes(EGIPTO_JSON),
  ...toRecipes(ESPANA_JSON),
  ...toRecipes(ESTADOS_UNIDOS_JSON),
  ...toRecipes(ETIOPIA_JSON),
  ...toRecipes(FILIPINAS_JSON),
  ...toRecipes(FRANCIA_JSON),
  ...toRecipes(GRECIA_JSON),
  ...toRecipes(HUNGRIA_JSON),
  ...toRecipes(INDIA_JSON),
  ...toRecipes(INDONESIA_JSON),
  ...toRecipes(ITALIA_JSON),
  ...toRecipes(JAPON_JSON),
  ...toRecipes(MALASIA_JSON),
  ...toRecipes(MEXICO_JSON),
  ...toRecipes(NUEVA_ZELANDA_JSON),
  ...toRecipes(PANAMA_JSON),
  ...toRecipes(PAISES_BAJOS_JSON),
  ...toRecipes(PERU_JSON),
  ...toRecipes(POLONIA_JSON),
  ...toRecipes(PORTUGAL_JSON),
  ...toRecipes(REINO_UNIDO_JSON),
  ...toRecipes(SINGAPUR_JSON),
  ...toRecipes(TAILANDIA_JSON),
  ...toRecipes(TURQUIA_JSON),
  ...toRecipes(UCRANIA_JSON),
  ...toRecipes(VENEZUELA_JSON),
  ...toRecipes(VIETNAM_JSON),
];

// Exportar todas las recetas consolidadas
export const RECIPES: Recipe[] = [
  // Recetas legacy (México y US)
  ...RECIPES_MX_NORTE,
  ...RECIPES_MX_CENTRO,
  ...RECIPES_MX_SUR,
  ...RECIPES_PUEBLOS_MX_NORTE,
  ...RECIPES_PUEBLOS_MX_CENTRO,
  ...RECIPES_PUEBLOS_MX_SUR,
  ...RECIPES_US_SUR,
  ...RECIPES_US_NORESTE,
  ...RECIPES_US_MEDIO_OESTE,
  ...RECIPES_US_OESTE,
  ...RECIPES_EUROPE,
  // Recetas internacionales transformadas (38 países, 235 recetas)
  ...INTERNATIONAL_RECIPES,
];

// Funciones utilitarias para búsqueda y filtrado
export const getRecipeBySlug = (slug: string): Recipe | undefined => {
  return RECIPES.find(r => r.slug === slug);
};

export const getRecipesByPlaceId = (placeId: string): Recipe[] => {
  return RECIPES.filter(r => r.placeId === placeId);
};

export const getRecipesByCountry = (countrySlug: string): Recipe[] => {
  const countryToPlaceMap: Record<string, string> = {
    'alemania': 'de-bav', 'argentina': 'ar-ba', 'brasil': 'br-sp',
    'canada': 'ca-qc', 'chile': 'ca-rm', 'china': 'cn-bej',
    'colombia': 'co-dc', 'corea-del-sur': 'kr-sel', 'costa-rica': 'cr-sj',
    'cuba': 'cu-hab', 'ecuador': 'ec-pich', 'egipto': 'eg-cai',
    'espana': 'es-mad', 'estados-unidos': 'us-ny', 'etiopia': 'et-add',
    'filipinas': 'ph-man', 'francia': 'es-idf', 'grecia': 'gr-att',
    'hungria': 'hu-bud', 'india': 'in-del', 'indonesia': 'id-jak',
    'italia': 'it-laz', 'japon': 'jp-tok', 'malasia': 'my-kl',
    'mexico': 'mx-cdmx', 'nueva-zelanda': 'nz-auc', 'panama': 'pa-pan',
    'paises-bajos': 'nl-nh', 'peru': 'pe-lim', 'polonia': 'pl-maz',
    'portugal': 'pt-lis', 'reino-unido': 'gb-lon', 'singapur': 'sg-01',
    'tailandia': 'th-bkk', 'turquia': 'tr-ist', 'ucrania': 'ua-kyv',
    'venezuela': 've-dc', 'vietnam': 'vn-han',
  };
  
  const placeId = countryToPlaceMap[countrySlug.replace('ñ', 'n')];
  if (!placeId) return [];
  return getRecipesByPlaceId(placeId);
};

export const getAllRecipes = (): Recipe[] => RECIPES;
export const getTotalRecipeCount = (): number => RECIPES.length;
