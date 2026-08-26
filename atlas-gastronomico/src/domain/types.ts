export type PlaceType = "pais" | "estado" | "region" | "ciudad" | "pueblo";

export interface Place {
  id: string;
  type: PlaceType;
  name: string;
  slug: string;           // slug for this segment only, e.g. "oaxaca"
  parentId: string | null;
  countryCode: string;    // ISO-3166 alpha-2, e.g. "MX"
  lat: number;
  lng: number;
  recipeCount?: number;   // Optional count of recipes for this place
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  countryCode: string;
  placeId?: string;       // Relación opcional con Place
  lat: number;
  lng: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  cuisineType: string[];  // Ej: ['Mexicana', 'Mariscos']
  rating?: number;        // 1-5
  reviewCount?: number;
  imageUrl?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
  isFeatured?: boolean;   // Para monetización (destacados)
  tags?: string[];        // Ej: ['romántico', 'familiar', 'vista']
}

export type OriginConfidence =
  | "confirmed"
  | "commonly_associated"
  | "disputed"
  | "modern_variant";

export type Moment =
  | "desayuno" | "comida" | "cena" | "postre" | "bebida" | "street_food";

export type Diet =
  | "vegetariano" | "vegano" | "sin_gluten" | "sin_lacteos";

export interface RecipeIngredient {
  text: string;           // e.g. "2 tazas de masa"
  optional?: boolean;
  translations?: Record<string, string>; // Traducciones por idioma
}

export interface RecipeStep {
  text: string;
  translations?: Record<string, string>; // Traducciones por idioma
}

// Tipo utilitario para permitir tanto strings como objetos RecipeStep
export type RecipeStepInput = string | RecipeStep;

export interface Recipe {
  id: string;
  dishName: string;
  slug: string;           // unique recipe slug, e.g. "tlayudas-oaxaquenas"
  placeId: string;        // strongest origin place for the prototype
  summary: string;
  history: string;
  originConfidence: OriginConfidence;
  servings: number;
  prepTimeMin: number;
  cookTimeMin: number;
  totalTimeMin: number;
  difficulty: "facil" | "media" | "dificil";
  moment: Moment;
  diet: Diet[];
  ingredients: RecipeIngredient[];
  steps: RecipeStepInput[];  // Acepta tanto strings como RecipeStep objects
  ratingAvg: number;      // 0-5
  ratingCount: number;
  popularityScore: number;// views+cooks+shares composite (seeded)
  publishedAt: string;    // ISO date
  image: string;          // /images/... or remote URL
  sources: string[];      // free-text citations for MVP 0
  // Campos para traducciones completas
  translations?: {
    [lang: string]: {
      dishName: string;
      summary: string;
      history: string;
      difficulty: string;
      moment: string;
      diet: string[];
      ingredients: { text: string; optional?: boolean }[];
      steps: string[];
    };
  };
}

export type SortKey = "estrellas" | "recientes" | "populares" | "rapidas" | "alfabetico";

export interface RecipeFilters {
  momento?: Moment;
  maxTiempo?: number;     // total_time_min ceiling
  dieta?: Diet;
}
