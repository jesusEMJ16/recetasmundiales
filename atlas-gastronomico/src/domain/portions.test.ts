import { describe, expect, it } from "vitest";
import { scaleIngredient } from "./portions";

describe("ingredient portion adjustment", () => {
  it("scales whole, decimal, fraction and mixed quantities without changing the ingredient", () => {
    expect(scaleIngredient("250 g de mascarpone", 2, "es")).toBe("500 g de mascarpone");
    expect(scaleIngredient("1/4 de cebolla", 2, "es")).toBe("0,5 de cebolla");
    expect(scaleIngredient("1 1/2 cups flour", 2, "en")).toBe("3 cups flour");
    expect(scaleIngredient("1,5 litros de leche", 2, "es")).toBe("3 litros de leche");
    expect(scaleIngredient("250g mascarpone", 2, "en")).toBe("500g mascarpone");
  });
  it("preserves the original text and does not guess ranges or descriptive quantities", () => {
    for (const text of ["1/4 de cebolla", "Jugo de 1 limón y sal al gusto", "2–3 chiles", "2 a 3 chiles", "2 to 3 peppers", "1/0 cups"]) {
      expect(scaleIngredient(text, 1, "es")).toBe(text);
    }
    for (const text of ["Jugo de 1 limón y sal al gusto", "2–3 chiles", "2 a 3 chiles", "2 to 3 peppers", "1/0 cups"]) {
      expect(scaleIngredient(text, 2, "es")).toBe(text);
    }
    expect(scaleIngredient("3 aguacates", NaN, "es")).toBe("3 aguacates");
  });
});
