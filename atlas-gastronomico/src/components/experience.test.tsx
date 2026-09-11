import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SiteHeader } from "./SiteHeader";
import { UniversalSearch } from "./UniversalSearch";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/es",
  useRouter: () => ({ push }),
}));

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
  push.mockClear();
  vi.stubGlobal("matchMedia", vi.fn(() => ({
    matches: true,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })));
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("theme preference", () => {
  it("keeps an explicit light choice even when the operating system is dark", () => {
    localStorage.setItem("theme", "light");
    document.documentElement.classList.add("dark");
    render(<SiteHeader locale="es" />);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
  it("toggles both ways and retains the choice after remounting", () => {
    const { unmount } = render(<SiteHeader locale="es" />);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Cambiar tema claro / oscuro" }));
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Cambiar tema claro / oscuro" }));
    expect(localStorage.getItem("theme")).toBe("dark");
    unmount();
    render(<SiteHeader locale="es" />);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});

describe("recipe and place search", () => {
  it("supports accent-insensitive search and keyboard navigation to a result", () => {
    render(<UniversalSearch />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "mexico" } });
    const result = screen.getAllByRole("option")[0];
    expect(result.textContent).toContain("México");
    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getAllByRole("option").at(-1)?.id);
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-activedescendant")).toBe(result.id);
    fireEvent.keyDown(input, { key: "Enter" });
    expect(push).toHaveBeenCalledWith(result.getAttribute("href"));
  });
  it("shows an empty state, clears the query and closes with Escape", () => {
    render(<UniversalSearch />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "zzzz-no-recipe" } });
    expect(screen.getByRole("status").textContent).toContain("Sin coincidencias");
    fireEvent.click(screen.getByRole("button", { name: "limpiar" }));
    expect(input.value).toBe("");
    fireEvent.change(input, { target: { value: "tacos" } });
    expect(screen.getAllByRole("option").length).toBeGreaterThan(0);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });
});
