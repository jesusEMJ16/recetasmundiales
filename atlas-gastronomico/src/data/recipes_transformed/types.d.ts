// Declaración de tipos para imports JSON
declare module "*.json" {
  import type { Recipe } from "../../domain/types";
  const value: Recipe[];
  export default value;
}
