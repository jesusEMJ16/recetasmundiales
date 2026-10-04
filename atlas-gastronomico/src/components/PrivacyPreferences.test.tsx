import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, act } from "@testing-library/react";
import { PrivacyPreferences } from "./PrivacyPreferences";
import { Analytics } from "./Analytics";
import { RecipeIngredients } from "./RecipeIngredients";
import { GA_MEASUREMENT_ID } from "../site";
vi.mock("next/script", () => ({ default: (props: { src?: string; id?: string }) => <span data-testid="third-party-script">{props.src ?? props.id}</span> }));
beforeEach(() => { localStorage.clear(); vi.stubEnv("NODE_ENV", "production"); });
afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

describe("optional statistics", () => {
  it("loads no Analytics before acceptance or after choosing necessary only", () => {
    render(<><PrivacyPreferences locale="es" /><Analytics /></>);
    expect(screen.queryByTestId("third-party-script")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Solo lo necesario" }));
    expect(localStorage.getItem("worldbites-analytics-v1")).toBe("declined");
    expect(screen.queryByTestId("third-party-script")).toBeNull();
    expect((window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`]).toBe(true);
  });
  it("enables Analytics only after acceptance and exposes a way to change the choice", () => {
    render(<><PrivacyPreferences locale="es" /><Analytics /></>);
    fireEvent.click(screen.getByRole("button", { name: "Aceptar estadísticas" }));
    expect(screen.getAllByTestId("third-party-script")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Preferencias de privacidad" }));
    expect(screen.getByRole("button", { name: "Solo lo necesario" })).toBeTruthy();
    act(() => { localStorage.setItem("worldbites-analytics-v1", "declined"); window.dispatchEvent(new StorageEvent("storage")); });
    expect(screen.queryByTestId("third-party-script")).toBeNull();
  });
});

it("adjusts ingredient quantities and lets the cook mark items", () => {
  render(<RecipeIngredients ingredients={[{ text: "3 aguacates" }, { text: "1/4 de cebolla" }, { text: "Jugo de 1 limón" }]} servings={4} locale="es" contentLocale="es" />);
  fireEvent.change(screen.getByRole("spinbutton", { name: "Porciones" }), { target: { value: "8" } });
  expect(screen.getByText("6 aguacates")).toBeTruthy();
  expect(screen.getByText("0,5 de cebolla")).toBeTruthy();
  expect(screen.getByText("Jugo de 1 limón")).toBeTruthy();
  const ingredient = screen.getByRole("checkbox", { name: "6 aguacates" }) as HTMLInputElement;
  fireEvent.click(ingredient);
  expect(ingredient.checked).toBe(true);
});
