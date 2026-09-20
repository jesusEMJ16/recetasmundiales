import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { FoodPhoto } from "./FoodPhoto";

afterEach(cleanup);

describe("FoodPhoto", () => {
  it("loads cards lazily with intrinsic dimensions and a responsive source set", () => {
    render(<FoodPhoto src="/food.webp" srcSet="/small.webp 480w, /food.webp 960w" sizes="50vw" alt="Paella" width={960} height={640} />);
    const image = screen.getByRole("img", { name: "Paella" });
    expect(image.getAttribute("loading")).toBe("lazy");
    expect(image.getAttribute("decoding")).toBe("async");
    expect(image.getAttribute("width")).toBe("960");
    expect(image.getAttribute("height")).toBe("640");
    expect(image.getAttribute("srcset")).toContain("480w");
    expect(image.getAttribute("sizes")).toBe("50vw");
  });
  it("prioritizes the recipe hero instead of lazy-loading the largest image", () => {
    render(<FoodPhoto src="/hero.webp" alt="Ramen" priority />);
    const image = screen.getByRole("img");
    expect(image.getAttribute("loading")).toBe("eager");
    expect(image.getAttribute("fetchpriority")).toBe("high");
  });
  it("keeps the intended layout and accessible description after a load error", () => {
    render(<FoodPhoto src="/failed.webp" alt="Gumbo" className="aspect-[16/9]" fallbackLabel="Fotografía del plato pendiente" />);
    fireEvent.error(screen.getByRole("img"));
    const fallback = screen.getByRole("img", { name: "Gumbo: Fotografía del plato pendiente" });
    expect(fallback.tagName).toBe("DIV");
    expect(fallback.className).toContain("aspect-[16/9]");
    expect(document.querySelector("img")).toBeNull();
  });
  it("can render another source after the previous one failed", () => {
    const { rerender } = render(<FoodPhoto src="/failed.webp" alt="Plato" />);
    fireEvent.error(screen.getByRole("img"));
    rerender(<FoodPhoto src="/new.webp" alt="Plato" />);
    expect(screen.getByRole("img").getAttribute("src")).toBe("/new.webp");
  });
  it("does not send empty-image requests when no photograph has been selected", () => {
    render(<FoodPhoto alt="Guacamayas" fallbackLabel="Fotografía del plato pendiente" />);
    expect(screen.getByRole("img").tagName).toBe("DIV");
    expect(document.querySelector("img")).toBeNull();
  });
  it("does not attach a sizes attribute without width-descriptor candidates", () => {
    render(<FoodPhoto src="/food.webp" alt="Plato" sizes="50vw" />);
    expect(screen.getByRole("img").getAttribute("sizes")).toBeNull();
  });
});
