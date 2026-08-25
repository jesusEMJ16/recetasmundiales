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
}

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
  steps: string[];
  ratingAvg: number;      // 0-5
  ratingCount: number;
  popularityScore: number;// views+cooks+shares composite (seeded)
  publishedAt: string;    // ISO date
  image: string;          // /images/... or remote URL
  sources: string[];      // free-text citations for MVP 0
}

export type SortKey = "estrellas" | "recientes" | "populares" | "rapidas" | "alfabetico";

export interface RecipeFilters {
  momento?: Moment;
  maxTiempo?: number;     // total_time_min ceiling
  dieta?: Diet;
}
