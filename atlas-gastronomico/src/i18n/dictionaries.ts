import type { Locale } from "./config";
import type { Moment, OriginConfidence, PlaceType, SortKey, Diet } from "../domain/types";

// Diccionario de textos de interfaz. Agregar un idioma = traducir este objeto.
export interface Dictionary {
  header: { brand: string; tagline: string; navHome: string; navStates: string };
  home: {
    eyebrow: string; titleLead: string; titleAccent: string; subtitle: string;
    searchPlaceholder: string; startingWith: string;
    mapEyebrow: string; mapTitle: string; mapDirect: string;
    mxEyebrow: string; mxBody: (recipes: number, states: number) => string; mxCta: string;
    upcomingEyebrow: string; upcomingTitle: string;
  };
  map: { reset: string; hint: string };
  place: {
    kind: Record<PlaceType, string>;
    recipes: (n: number) => string;
    exploreByState: string; exploreByPlace: string;
    searchState: string; searchPlace: string;
    title: (name: string) => string;
    empty: string; emptyHint: string;
  };
  sort: { label: string } & Record<SortKey, string>;
  filters: {
    title: string; clear: string;
    momento: string; tiempo: string; dieta: string;
    tiempos: Record<string, string>;
  };
  moments: Record<Moment, string>;
  diets: Record<Diet, string>;
  recipe: {
    history: string; ingredients: string; preparation: string; sources: string;
    optional: string; servings: (n: number) => string;
    confidence: Record<OriginConfidence, string>;
    relatedEyebrow: string; relatedTitle: (name: string) => string; relatedTitleGeneric: string;
    seeAll: (name: string) => string; photoCredit: string; via: string;
  };
  search: { placeholder: string; recipe: string };
}

const es: Dictionary = {
  header: { brand: "Atlas Gastronómico", tagline: "El mundo, plato por plato", navHome: "Inicio", navStates: "Estados" },
  home: {
    eyebrow: "Atlas Gastronómico Mundial",
    titleLead: "Explora el mundo",
    titleAccent: "cocinando",
    subtitle:
      "Del mapa a la cocina de cualquier país, estado, pueblo o ciudad. Recetas con procedencia, ordenadas por estrellas, novedad o tiempo.",
    searchPlaceholder: "Busca un platillo, estado o ciudad…",
    startingWith: "Comenzamos por 🇲🇽 México — más países en camino.",
    mapEyebrow: "El mapa",
    mapTitle: "Toca un estado para explorar",
    mapDirect: "Ir directo a México →",
    mxEyebrow: "Empezamos aquí",
    mxBody: (r, s) =>
      `${r} recetas con procedencia en los ${s} estados. De las tlayudas de Oaxaca a la machaca del norte.`,
    mxCta: "Explorar México →",
    upcomingEyebrow: "Próximamente",
    upcomingTitle: "El atlas seguirá viajando a",
  },
  map: { reset: "🌎 Ver mundo", hint: "Toca un estado para ver sus recetas · «Ver mundo» para otros países" },
  place: {
    kind: { pais: "País", estado: "Estado", region: "Región", ciudad: "Ciudad", pueblo: "Pueblo" },
    recipes: (n) => (n === 1 ? "1 receta" : `${n} recetas`),
    exploreByState: "Explora por estado",
    exploreByPlace: "Explora por lugar",
    searchState: "Buscar estado…",
    searchPlace: "Buscar lugar…",
    title: (name) => `Recetas de ${name}`,
    empty: "Sin coincidencias",
    emptyHint: "Ninguna receta coincide con estos filtros. Prueba quitar alguno.",
  },
  sort: {
    label: "Ordenar",
    estrellas: "Mejor valoradas",
    recientes: "Recientes",
    populares: "Populares",
    rapidas: "Más rápidas",
    alfabetico: "A–Z",
  },
  filters: {
    title: "Filtros", clear: "limpiar",
    momento: "Momento", tiempo: "Tiempo", dieta: "Dieta",
    tiempos: { "15": "≤ 15 min", "30": "≤ 30 min", "60": "≤ 60 min" },
  },
  moments: {
    desayuno: "Desayuno", comida: "Comida", cena: "Cena",
    postre: "Postre", bebida: "Bebida", street_food: "Street food",
  },
  diets: {
    vegetariano: "Vegetariano", vegano: "Vegano",
    sin_gluten: "Sin gluten", sin_lacteos: "Sin lácteos",
  },
  recipe: {
    history: "Historia", ingredients: "Ingredientes", preparation: "Preparación", sources: "Fuentes y procedencia",
    optional: "opcional", servings: (n) => `${n} porciones`,
    confidence: {
      confirmed: "Origen confirmado",
      commonly_associated: "Comúnmente asociado",
      disputed: "Origen disputado",
      modern_variant: "Variante moderna",
    },
    relatedEyebrow: "Sigue explorando",
    relatedTitle: (name) => `Más sabores de ${name}`,
    relatedTitleGeneric: "Te puede interesar",
    seeAll: (name) => `Ver todas las recetas de ${name} →`,
    photoCredit: "Foto",
    via: "vía",
  },
  search: { placeholder: "Busca un platillo, estado o ciudad…", recipe: "receta" },
};

const en: Dictionary = {
  header: { brand: "Gastronomic Atlas", tagline: "The world, dish by dish", navHome: "Home", navStates: "States" },
  home: {
    eyebrow: "World Gastronomic Atlas",
    titleLead: "Explore the world",
    titleAccent: "by cooking",
    subtitle:
      "From the map to the kitchen of any country, state, town or city. Recipes with provenance, sorted by stars, newest or time.",
    searchPlaceholder: "Search a dish, state or city…",
    startingWith: "We're starting with 🇲🇽 Mexico — more countries on the way.",
    mapEyebrow: "The map",
    mapTitle: "Tap a state to explore",
    mapDirect: "Go straight to Mexico →",
    mxEyebrow: "We start here",
    mxBody: (r, s) =>
      `${r} recipes with provenance across ${s} states. From Oaxaca's tlayudas to northern machaca.`,
    mxCta: "Explore Mexico →",
    upcomingEyebrow: "Coming soon",
    upcomingTitle: "The atlas will keep traveling to",
  },
  map: { reset: "🌎 View world", hint: "Tap a state to see its recipes · “View world” for other countries" },
  place: {
    kind: { pais: "Country", estado: "State", region: "Region", ciudad: "City", pueblo: "Town" },
    recipes: (n) => (n === 1 ? "1 recipe" : `${n} recipes`),
    exploreByState: "Explore by state",
    exploreByPlace: "Explore by place",
    searchState: "Search a state…",
    searchPlace: "Search a place…",
    title: (name) => `Recipes from ${name}`,
    empty: "No matches",
    emptyHint: "No recipe matches these filters. Try removing one.",
  },
  sort: {
    label: "Sort",
    estrellas: "Top rated",
    recientes: "Newest",
    populares: "Popular",
    rapidas: "Fastest",
    alfabetico: "A–Z",
  },
  filters: {
    title: "Filters", clear: "clear",
    momento: "Meal", tiempo: "Time", dieta: "Diet",
    tiempos: { "15": "≤ 15 min", "30": "≤ 30 min", "60": "≤ 60 min" },
  },
  moments: {
    desayuno: "Breakfast", comida: "Lunch", cena: "Dinner",
    postre: "Dessert", bebida: "Drink", street_food: "Street food",
  },
  diets: {
    vegetariano: "Vegetarian", vegano: "Vegan",
    sin_gluten: "Gluten-free", sin_lacteos: "Dairy-free",
  },
  recipe: {
    history: "History", ingredients: "Ingredients", preparation: "Preparation", sources: "Sources & provenance",
    optional: "optional", servings: (n) => `${n} servings`,
    confidence: {
      confirmed: "Confirmed origin",
      commonly_associated: "Commonly associated",
      disputed: "Disputed origin",
      modern_variant: "Modern variant",
    },
    relatedEyebrow: "Keep exploring",
    relatedTitle: (name) => `More flavors from ${name}`,
    relatedTitleGeneric: "You might like",
    seeAll: (name) => `See all recipes from ${name} →`,
    photoCredit: "Photo",
    via: "via",
  },
  search: { placeholder: "Search a dish, state or city…", recipe: "recipe" },
};

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.es;
}
