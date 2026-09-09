// Índice de recetas transformadas con aserción de tipos
import type { Recipe } from "../../domain/types";

// Función helper para importar y tipar recetas JSON
const importRecipes = (module: any): Recipe[] => {
  const recipes = module.default || module;
  return recipes.map((r: any) => ({
    ...r,
    originConfidence: r.originConfidence as "confirmed" | "commonly_associated" | "disputed" | "modern_variant",
    difficulty: r.difficulty as "facil" | "media" | "dificil",
    moment: r.moment as "desayuno" | "comida" | "cena" | "postre" | "bebida" | "street_food",
    diet: (r.diet || []) as Array<"vegetariano" | "vegano" | "sin_gluten" | "sin_lacteos">,
  }));
};

export { importRecipes };
