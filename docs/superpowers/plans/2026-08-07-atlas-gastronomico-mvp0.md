# Atlas Gastronómico Mundial — MVP 0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a navigable 3-screen prototype (World map → Place with a sortable/filterable recipe list → Recipe detail) in Spanish, using real seed recipes across 5 countries, with the star-ranking/sort/filter logic fully unit-tested.

**Architecture:** Next.js (App Router) + TypeScript renders three route levels. All recipe/place data lives in typed static seed files (no database in MVP 0). A pure-function "domain" layer (bayesian ranking, sorting, filtering, place-tree traversal) is TDD'd with Vitest and consumed by server components. A 2D MapLibre GL JS map drives geographic navigation; every place also has a crawlable URL so content is not trapped in the map.

**Tech Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, MapLibre GL JS, Vitest + @testing-library, Node.js 18+.

**Scope (from spec §11, MVP 0):** 3 screens, ~20 real recipes across México, EE.UU., Italia, Japón, Tailandia; sort by ⭐bayesian / 🆕recent / 🔥popular / ⏱️fast / 🔤alpha; filters for momento, tiempo, dieta; Spanish only but i18n-ready `/es/` routing; Schema.org `Recipe` + `ItemList` JSON-LD. **Out of scope for MVP 0:** accounts, Food Passport, "cocinar con lo que tengo", contributions, database, ads. Those are later MVPs.

---

## File Structure

```
atlas-gastronomico/
├─ package.json
├─ next.config.mjs
├─ tsconfig.json
├─ vitest.config.ts
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ src/
│  ├─ domain/
│  │  ├─ types.ts               # Place, Recipe, SortKey, Filters types
│  │  ├─ ranking.ts             # computeBayesian()
│  │  ├─ ranking.test.ts
│  │  ├─ sorting.ts             # sortRecipes()
│  │  ├─ sorting.test.ts
│  │  ├─ filtering.ts           # filterRecipes()
│  │  ├─ filtering.test.ts
│  │  ├─ places.ts             # place-tree traversal + recipe lookup
│  │  └─ places.test.ts
│  ├─ data/
│  │  ├─ places.ts             # seed: hierarchical places (world→country→state→city)
│  │  └─ recipes.ts            # seed: ~20 real recipes
│  ├─ app/
│  │  ├─ layout.tsx            # root layout (redirect to /es)
│  │  ├─ globals.css
│  │  └─ es/
│  │     ├─ layout.tsx         # locale layout + <SiteHeader/>
│  │     ├─ page.tsx           # SCREEN 1: World (map + search + quick access)
│  │     ├─ recetas/
│  │     │  └─ [...slug]/
│  │     │     └─ page.tsx     # SCREEN 2: Place (recipe list, sort/filter)
│  │     └─ receta/
│  │        └─ [slug]/
│  │           └─ page.tsx     # SCREEN 3: Recipe detail + JSON-LD
│  └─ components/
│     ├─ SiteHeader.tsx
│     ├─ WorldMap.tsx          # MapLibre 2D map (client component)
│     ├─ UniversalSearch.tsx   # client search box → jumps to place/recipe
│     ├─ RecipeList.tsx        # renders list given already-sorted/filtered recipes
│     ├─ RecipeCard.tsx
│     ├─ SortControls.tsx      # client; updates ?sort= query
│     ├─ FilterControls.tsx    # client; updates ?momento=&tiempo=&dieta=
│     └─ StarRating.tsx
└─ docs/… (this plan)
```

**Responsibility boundaries:**
- `src/domain/*` — pure, framework-free logic. No React, no Next imports. 100% unit-testable.
- `src/data/*` — static typed seed data only.
- `src/app/*` — routing + server components that call the domain layer.
- `src/components/*` — presentational + small client components for interactivity.

All work happens inside a new `atlas-gastronomico/` folder in the project root (`C:\Users\jesus\OneDrive\Escritorio\recetas`).

---

## Task 0: Prerequisites & project scaffold

**Files:**
- Create: `atlas-gastronomico/` (whole project via create-next-app)

- [ ] **Step 1: Verify Node.js 18+ is installed**

Run: `node --version`
Expected: `v18.x` or higher. If missing, install from https://nodejs.org (LTS) before continuing.

- [ ] **Step 2: Scaffold the Next.js app**

Run from `C:\Users\jesus\OneDrive\Escritorio\recetas`:
```bash
npx create-next-app@latest atlas-gastronomico --typescript --tailwind --app --src-dir --eslint --no-import-alias --use-npm
```
Answer prompts with defaults (App Router: yes). This creates `atlas-gastronomico/` with `src/app`, Tailwind, and TypeScript configured.

- [ ] **Step 3: Install runtime + test dependencies**

Run from `atlas-gastronomico/`:
```bash
npm install maplibre-gl
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom
```

- [ ] **Step 4: Add Vitest config**

Create `atlas-gastronomico/vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

- [ ] **Step 5: Add the test script to package.json**

In `atlas-gastronomico/package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Verify the scaffold runs**

Run: `npm run dev`
Expected: dev server starts on http://localhost:3000 with the default Next.js page. Stop it with Ctrl+C.

- [ ] **Step 7: Initialize git and commit**

Run from `C:\Users\jesus\OneDrive\Escritorio\recetas`:
```bash
git init
git add docs atlas-gastronomico
git commit -m "chore: scaffold Next.js app + spec/plan docs for Atlas Gastronómico MVP 0"
```

---

## Task 1: Domain types

**Files:**
- Create: `src/domain/types.ts`

- [ ] **Step 1: Define the shared types**

Create `atlas-gastronomico/src/domain/types.ts`:
```typescript
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
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/domain/types.ts
git commit -m "feat(domain): add Place/Recipe/SortKey/Filters types"
```

---

## Task 2: Bayesian ranking (TDD)

**Files:**
- Create: `src/domain/ranking.ts`
- Test: `src/domain/ranking.test.ts`

- [ ] **Step 1: Write the failing test**

Create `atlas-gastronomico/src/domain/ranking.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { computeBayesian } from "./ranking";

describe("computeBayesian", () => {
  const m = 20;   // min votes threshold
  const C = 4.0;  // global mean

  it("pulls a low-vote perfect score toward the global mean", () => {
    // 1 vote of 5.0 should NOT beat a well-established 4.8
    const fewVotes = computeBayesian(5.0, 1, m, C);
    const manyVotes = computeBayesian(4.8, 200, m, C);
    expect(manyVotes).toBeGreaterThan(fewVotes);
  });

  it("approaches the raw average as vote count grows", () => {
    const score = computeBayesian(4.8, 100000, m, C);
    expect(score).toBeCloseTo(4.8, 2);
  });

  it("returns the global mean when there are zero votes", () => {
    expect(computeBayesian(0, 0, m, C)).toBeCloseTo(C, 5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ranking`
Expected: FAIL with "computeBayesian is not defined" / cannot find module `./ranking`.

- [ ] **Step 3: Write minimal implementation**

Create `atlas-gastronomico/src/domain/ranking.ts`:
```typescript
/**
 * Bayesian average rating.
 *   score = (v/(v+m))*R + (m/(v+m))*C
 * R = recipe average, v = recipe vote count,
 * m = min votes to "trust", C = global mean rating.
 */
export function computeBayesian(
  ratingAvg: number,
  ratingCount: number,
  m: number,
  C: number,
): number {
  const v = ratingCount;
  if (v + m === 0) return C;
  return (v / (v + m)) * ratingAvg + (m / (v + m)) * C;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ranking`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/domain/ranking.ts src/domain/ranking.test.ts
git commit -m "feat(domain): bayesian star ranking with tests"
```

---

## Task 3: Sorting (TDD)

**Files:**
- Create: `src/domain/sorting.ts`
- Test: `src/domain/sorting.test.ts`

- [ ] **Step 1: Write the failing test**

Create `atlas-gastronomico/src/domain/sorting.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { sortRecipes } from "./sorting";
import type { Recipe } from "./types";

function make(partial: Partial<Recipe> & { id: string }): Recipe {
  return {
    dishName: partial.dishName ?? partial.id,
    slug: partial.id,
    placeId: "p",
    summary: "",
    history: "",
    originConfidence: "confirmed",
    servings: 2,
    prepTimeMin: 0,
    cookTimeMin: 0,
    totalTimeMin: partial.totalTimeMin ?? 30,
    difficulty: "facil",
    moment: "comida",
    diet: [],
    ingredients: [],
    steps: [],
    ratingAvg: partial.ratingAvg ?? 4,
    ratingCount: partial.ratingCount ?? 10,
    popularityScore: partial.popularityScore ?? 0,
    publishedAt: partial.publishedAt ?? "2026-01-01",
    image: "",
    sources: [],
    ...partial,
  };
}

const recipes: Recipe[] = [
  make({ id: "a", ratingAvg: 5.0, ratingCount: 1, popularityScore: 10, totalTimeMin: 45, publishedAt: "2026-02-01", dishName: "Zeta" }),
  make({ id: "b", ratingAvg: 4.8, ratingCount: 200, popularityScore: 99, totalTimeMin: 20, publishedAt: "2026-06-01", dishName: "Alfa" }),
  make({ id: "c", ratingAvg: 4.2, ratingCount: 50, popularityScore: 50, totalTimeMin: 10, publishedAt: "2026-08-01", dishName: "Medio" }),
];

describe("sortRecipes", () => {
  it("estrellas: bayesian, so the 200-vote 4.8 beats the 1-vote 5.0", () => {
    const out = sortRecipes(recipes, "estrellas");
    expect(out[0].id).toBe("b");
  });
  it("recientes: newest publishedAt first", () => {
    expect(sortRecipes(recipes, "recientes")[0].id).toBe("c");
  });
  it("populares: highest popularityScore first", () => {
    expect(sortRecipes(recipes, "populares")[0].id).toBe("b");
  });
  it("rapidas: lowest totalTimeMin first", () => {
    expect(sortRecipes(recipes, "rapidas")[0].id).toBe("c");
  });
  it("alfabetico: by dishName A→Z", () => {
    expect(sortRecipes(recipes, "alfabetico")[0].dishName).toBe("Alfa");
  });
  it("does not mutate the input array", () => {
    const copy = [...recipes];
    sortRecipes(recipes, "rapidas");
    expect(recipes).toEqual(copy);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- sorting`
Expected: FAIL (cannot find module `./sorting`).

- [ ] **Step 3: Write minimal implementation**

Create `atlas-gastronomico/src/domain/sorting.ts`:
```typescript
import type { Recipe, SortKey } from "./types";
import { computeBayesian } from "./ranking";

const M = 20;

function globalMean(recipes: Recipe[]): number {
  const rated = recipes.filter((r) => r.ratingCount > 0);
  if (rated.length === 0) return 4.0;
  return rated.reduce((s, r) => s + r.ratingAvg, 0) / rated.length;
}

export function sortRecipes(recipes: Recipe[], sort: SortKey): Recipe[] {
  const copy = [...recipes];
  switch (sort) {
    case "estrellas": {
      const C = globalMean(copy);
      return copy.sort(
        (a, b) =>
          computeBayesian(b.ratingAvg, b.ratingCount, M, C) -
          computeBayesian(a.ratingAvg, a.ratingCount, M, C),
      );
    }
    case "recientes":
      return copy.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    case "populares":
      return copy.sort((a, b) => b.popularityScore - a.popularityScore);
    case "rapidas":
      return copy.sort((a, b) => a.totalTimeMin - b.totalTimeMin);
    case "alfabetico":
      return copy.sort((a, b) => a.dishName.localeCompare(b.dishName, "es"));
    default:
      return copy;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- sorting`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/domain/sorting.ts src/domain/sorting.test.ts
git commit -m "feat(domain): recipe sorting (stars/recent/popular/fast/alpha)"
```

---

## Task 4: Filtering (TDD)

**Files:**
- Create: `src/domain/filtering.ts`
- Test: `src/domain/filtering.test.ts`

- [ ] **Step 1: Write the failing test**

Create `atlas-gastronomico/src/domain/filtering.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { filterRecipes } from "./filtering";
import type { Recipe } from "./types";

const base: Omit<Recipe, "id" | "slug" | "dishName" | "moment" | "diet" | "totalTimeMin"> = {
  placeId: "p", summary: "", history: "", originConfidence: "confirmed",
  servings: 2, prepTimeMin: 0, cookTimeMin: 0, difficulty: "facil",
  ingredients: [], steps: [], ratingAvg: 4, ratingCount: 10,
  popularityScore: 0, publishedAt: "2026-01-01", image: "", sources: [],
};

const recipes: Recipe[] = [
  { ...base, id: "1", slug: "1", dishName: "Desayuno rápido veg", moment: "desayuno", diet: ["vegetariano"], totalTimeMin: 10 },
  { ...base, id: "2", slug: "2", dishName: "Cena lenta carne", moment: "cena", diet: [], totalTimeMin: 120 },
  { ...base, id: "3", slug: "3", dishName: "Postre vegano", moment: "postre", diet: ["vegano", "vegetariano"], totalTimeMin: 40 },
];

describe("filterRecipes", () => {
  it("returns all when filters are empty", () => {
    expect(filterRecipes(recipes, {}).length).toBe(3);
  });
  it("filters by momento", () => {
    const out = filterRecipes(recipes, { momento: "cena" });
    expect(out.map((r) => r.id)).toEqual(["2"]);
  });
  it("filters by maxTiempo (inclusive)", () => {
    const out = filterRecipes(recipes, { maxTiempo: 40 });
    expect(out.map((r) => r.id).sort()).toEqual(["1", "3"]);
  });
  it("filters by dieta membership", () => {
    const out = filterRecipes(recipes, { dieta: "vegano" });
    expect(out.map((r) => r.id)).toEqual(["3"]);
  });
  it("combines filters with AND", () => {
    const out = filterRecipes(recipes, { dieta: "vegetariano", maxTiempo: 15 });
    expect(out.map((r) => r.id)).toEqual(["1"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- filtering`
Expected: FAIL (cannot find module `./filtering`).

- [ ] **Step 3: Write minimal implementation**

Create `atlas-gastronomico/src/domain/filtering.ts`:
```typescript
import type { Recipe, RecipeFilters } from "./types";

export function filterRecipes(recipes: Recipe[], filters: RecipeFilters): Recipe[] {
  return recipes.filter((r) => {
    if (filters.momento && r.moment !== filters.momento) return false;
    if (filters.maxTiempo != null && r.totalTimeMin > filters.maxTiempo) return false;
    if (filters.dieta && !r.diet.includes(filters.dieta)) return false;
    return true;
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- filtering`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/domain/filtering.ts src/domain/filtering.test.ts
git commit -m "feat(domain): recipe filtering (momento/tiempo/dieta)"
```

---

## Task 5: Seed data — places

**Files:**
- Create: `src/data/places.ts`

- [ ] **Step 1: Write the seed places**

Create `atlas-gastronomico/src/data/places.ts`. Hierarchy: 5 countries, each with 1-2 states and 1-2 cities used by the seed recipes.
```typescript
import type { Place } from "../domain/types";

export const PLACES: Place[] = [
  // ── México ──
  { id: "mx", type: "pais", name: "México", slug: "mexico", parentId: null, countryCode: "MX", lat: 23.63, lng: -102.55 },
  { id: "mx-oax", type: "estado", name: "Oaxaca", slug: "oaxaca", parentId: "mx", countryCode: "MX", lat: 17.07, lng: -96.72 },
  { id: "mx-oax-city", type: "ciudad", name: "Oaxaca de Juárez", slug: "oaxaca-de-juarez", parentId: "mx-oax", countryCode: "MX", lat: 17.06, lng: -96.72 },
  { id: "mx-pue", type: "estado", name: "Puebla", slug: "puebla", parentId: "mx", countryCode: "MX", lat: 19.04, lng: -98.21 },
  { id: "mx-jal", type: "estado", name: "Jalisco", slug: "jalisco", parentId: "mx", countryCode: "MX", lat: 20.66, lng: -103.35 },

  // ── Estados Unidos ──
  { id: "us", type: "pais", name: "Estados Unidos", slug: "estados-unidos", parentId: null, countryCode: "US", lat: 39.83, lng: -98.58 },
  { id: "us-la", type: "estado", name: "Luisiana", slug: "luisiana", parentId: "us", countryCode: "US", lat: 30.98, lng: -91.96 },
  { id: "us-tx", type: "estado", name: "Texas", slug: "texas", parentId: "us", countryCode: "US", lat: 31.0, lng: -100.0 },

  // ── Italia ──
  { id: "it", type: "pais", name: "Italia", slug: "italia", parentId: null, countryCode: "IT", lat: 41.87, lng: 12.57 },
  { id: "it-cam", type: "estado", name: "Campania", slug: "campania", parentId: "it", countryCode: "IT", lat: 40.83, lng: 14.25 },
  { id: "it-cam-nap", type: "ciudad", name: "Nápoles", slug: "napoles", parentId: "it-cam", countryCode: "IT", lat: 40.85, lng: 14.27 },
  { id: "it-laz", type: "estado", name: "Lacio", slug: "lacio", parentId: "it", countryCode: "IT", lat: 41.9, lng: 12.5 },

  // ── Japón ──
  { id: "jp", type: "pais", name: "Japón", slug: "japon", parentId: null, countryCode: "JP", lat: 36.2, lng: 138.25 },
  { id: "jp-osk", type: "estado", name: "Osaka", slug: "osaka", parentId: "jp", countryCode: "JP", lat: 34.69, lng: 135.5 },
  { id: "jp-tky", type: "estado", name: "Tokio", slug: "tokio", parentId: "jp", countryCode: "JP", lat: 35.68, lng: 139.69 },

  // ── Tailandia ──
  { id: "th", type: "pais", name: "Tailandia", slug: "tailandia", parentId: null, countryCode: "TH", lat: 15.87, lng: 100.99 },
  { id: "th-bkk", type: "estado", name: "Bangkok", slug: "bangkok", parentId: "th", countryCode: "TH", lat: 13.75, lng: 100.5 },
  { id: "th-cnx", type: "estado", name: "Chiang Mai", slug: "chiang-mai", parentId: "th", countryCode: "TH", lat: 18.79, lng: 98.99 },
];
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/places.ts
git commit -m "feat(data): seed hierarchical places for 5 countries"
```

---

## Task 6: Seed data — recipes

**Files:**
- Create: `src/data/recipes.ts`

- [ ] **Step 1: Write the seed recipes**

Create `atlas-gastronomico/src/data/recipes.ts` with ~20 recipes distributed across the seed places. Each entry is real and self-authored (short summaries; no copied instructions). Image paths point to `/images/<slug>.jpg` placeholders (added in Task 12).
```typescript
import type { Recipe } from "../domain/types";

export const RECIPES: Recipe[] = [
  {
    id: "r-tlayudas", dishName: "Tlayudas oaxaqueñas", slug: "tlayudas-oaxaquenas",
    placeId: "mx-oax", summary: "Tortilla grande y crujiente con asiento, frijol, quesillo y tasajo.",
    history: "Platillo emblemático de los valles centrales de Oaxaca, vendido en mercados y esquinas al anochecer.",
    originConfidence: "confirmed", servings: 4, prepTimeMin: 25, cookTimeMin: 15, totalTimeMin: 40,
    difficulty: "media", moment: "cena", diet: [],
    ingredients: [
      { text: "4 tlayudas grandes" }, { text: "1 taza de frijoles refritos" },
      { text: "200 g de quesillo deshebrado" }, { text: "200 g de tasajo" },
      { text: "Asiento de cerdo al gusto", optional: true }, { text: "Lechuga, aguacate y salsa" },
    ],
    steps: [
      "Unta la tlayuda con asiento y frijoles.", "Añade quesillo y calienta sobre comal o brasas hasta que dore.",
      "Asa el tasajo aparte y córtalo en tiras.", "Cubre con lechuga, aguacate y salsa; dobla y sirve.",
    ],
    ratingAvg: 4.8, ratingCount: 210, popularityScore: 95, publishedAt: "2026-05-10",
    image: "/images/tlayudas-oaxaquenas.jpg", sources: ["Cocina tradicional oaxaqueña, notas de mercado 20 de Noviembre"],
  },
  {
    id: "r-mole-negro", dishName: "Mole negro", slug: "mole-negro-oaxaqueno",
    placeId: "mx-oax", summary: "Salsa profunda y compleja con más de 20 ingredientes y chiles chilhuacle.",
    history: "Considerado el rey de los moles oaxaqueños; se sirve en bodas y celebraciones.",
    originConfidence: "confirmed", servings: 6, prepTimeMin: 45, cookTimeMin: 120, totalTimeMin: 165,
    difficulty: "dificil", moment: "comida", diet: [],
    ingredients: [
      { text: "Chiles chilhuacle, mulato y pasilla" }, { text: "Chocolate de metate" },
      { text: "Ajonjolí, almendras y cacahuates" }, { text: "Plátano macho y pan tostado" },
      { text: "Especias: canela, clavo, pimienta" }, { text: "Caldo de pollo" },
    ],
    steps: [
      "Tuesta los chiles sin quemarlos y remójalos.", "Fríe semillas, frutos secos y plátano.",
      "Muele todo por partes con especias y chocolate.", "Cuece la salsa a fuego lento hasta espesar y sazona.",
    ],
    ratingAvg: 4.9, ratingCount: 340, popularityScore: 99, publishedAt: "2026-03-01",
    image: "/images/mole-negro-oaxaqueno.jpg", sources: ["Recetario familiar de los Valles Centrales"],
  },
  {
    id: "r-chiles-nogada", dishName: "Chiles en nogada", slug: "chiles-en-nogada",
    placeId: "mx-pue", summary: "Chile poblano relleno de picadillo, bañado en nogada de nuez y granada.",
    history: "Asociado a Puebla y a las fiestas patrias de septiembre por sus colores.",
    originConfidence: "commonly_associated", servings: 4, prepTimeMin: 60, cookTimeMin: 30, totalTimeMin: 90,
    difficulty: "dificil", moment: "comida", diet: [],
    ingredients: [
      { text: "4 chiles poblanos" }, { text: "Picadillo de carne con fruta" },
      { text: "Nueces de Castilla" }, { text: "Queso de cabra y leche" }, { text: "Granada y perejil" },
    ],
    steps: [
      "Asa y pela los chiles; rellénalos con picadillo.", "Licúa las nueces con queso y leche para la nogada.",
      "Baña los chiles con la nogada.", "Decora con granada y perejil.",
    ],
    ratingAvg: 4.7, ratingCount: 150, popularityScore: 88, publishedAt: "2026-07-20",
    image: "/images/chiles-en-nogada.jpg", sources: ["Tradición poblana de temporada"],
  },
  {
    id: "r-birria", dishName: "Birria de res", slug: "birria-de-res",
    placeId: "mx-jal", summary: "Guiso de carne en adobo de chiles, servido con consomé y tortillas.",
    history: "Originaria de Jalisco; hoy popular en tacos dorados en caldo.",
    originConfidence: "confirmed", servings: 6, prepTimeMin: 30, cookTimeMin: 180, totalTimeMin: 210,
    difficulty: "media", moment: "comida", diet: [],
    ingredients: [
      { text: "1.5 kg de res para deshebrar" }, { text: "Chiles guajillo y ancho" },
      { text: "Ajo, comino y orégano" }, { text: "Vinagre y laurel" }, { text: "Tortillas de maíz" },
    ],
    steps: [
      "Licúa los chiles remojados con especias y vinagre.", "Marina la carne en el adobo.",
      "Cuece a fuego lento hasta que se deshebre.", "Sirve con consomé, cebolla y cilantro.",
    ],
    ratingAvg: 4.6, ratingCount: 260, popularityScore: 97, publishedAt: "2026-06-15",
    image: "/images/birria-de-res.jpg", sources: ["Cocina tapatía"],
  },
  {
    id: "r-gumbo", dishName: "Gumbo", slug: "gumbo-criollo",
    placeId: "us-la", summary: "Guiso criollo con roux oscuro, mariscos o pollo y salchicha andouille.",
    history: "Plato insignia de Luisiana con influencias africanas, francesas y criollas.",
    originConfidence: "confirmed", servings: 6, prepTimeMin: 30, cookTimeMin: 90, totalTimeMin: 120,
    difficulty: "media", moment: "cena", diet: [],
    ingredients: [
      { text: "Harina y aceite para el roux" }, { text: "Salchicha andouille" },
      { text: "Camarones o pollo" }, { text: "Trinidad criolla: cebolla, apio y pimiento" }, { text: "Arroz cocido" },
    ],
    steps: [
      "Cocina un roux oscuro removiendo constantemente.", "Sofríe la trinidad criolla.",
      "Añade caldo, salchicha y proteína; cuece.", "Sirve sobre arroz blanco.",
    ],
    ratingAvg: 4.5, ratingCount: 120, popularityScore: 70, publishedAt: "2026-02-11",
    image: "/images/gumbo-criollo.jpg", sources: ["Cocina cajún y criolla de Luisiana"],
  },
  {
    id: "r-brisket", dishName: "Brisket ahumado", slug: "brisket-ahumado-texano",
    placeId: "us-tx", summary: "Pecho de res ahumado lento con corteza de pimienta y sal.",
    history: "Pilar del BBQ texano, cocido durante horas a baja temperatura.",
    originConfidence: "confirmed", servings: 8, prepTimeMin: 20, cookTimeMin: 600, totalTimeMin: 620,
    difficulty: "dificil", moment: "comida", diet: [],
    ingredients: [
      { text: "1 brisket completo" }, { text: "Sal gruesa y pimienta negra" }, { text: "Leña de roble o nogal" },
    ],
    steps: [
      "Aplica sal y pimienta generosamente.", "Ahúma a 110 °C hasta ~70 °C internos.",
      "Envuelve en papel y sigue hasta ~93 °C.", "Reposa una hora antes de rebanar.",
    ],
    ratingAvg: 4.7, ratingCount: 95, popularityScore: 65, publishedAt: "2026-04-05",
    image: "/images/brisket-ahumado-texano.jpg", sources: ["Tradición del BBQ de Texas Hill Country"],
  },
  {
    id: "r-pizza", dishName: "Pizza napolitana", slug: "pizza-napolitana",
    placeId: "it-cam-nap", summary: "Masa fina fermentada, tomate San Marzano, mozzarella y albahaca.",
    history: "Nacida en Nápoles; la Margherita rinde homenaje a la bandera italiana.",
    originConfidence: "confirmed", servings: 2, prepTimeMin: 20, cookTimeMin: 5, totalTimeMin: 25,
    difficulty: "media", moment: "cena", diet: ["vegetariano"],
    ingredients: [
      { text: "Masa de fermentación larga" }, { text: "Tomate San Marzano" },
      { text: "Mozzarella fior di latte" }, { text: "Albahaca fresca y aceite de oliva" },
    ],
    steps: [
      "Estira la masa a mano sin rodillo.", "Añade tomate, mozzarella y albahaca.",
      "Hornea muy caliente (450 °C+) 60-90 s.", "Termina con aceite de oliva.",
    ],
    ratingAvg: 4.9, ratingCount: 500, popularityScore: 100, publishedAt: "2026-01-25",
    image: "/images/pizza-napolitana.jpg", sources: ["Disciplinare de la pizza napolitana"],
  },
  {
    id: "r-cacio", dishName: "Cacio e pepe", slug: "cacio-e-pepe",
    placeId: "it-laz", summary: "Pasta romana con pecorino y pimienta negra emulsionados.",
    history: "Clásico de la cocina romana por su sencillez y tres ingredientes.",
    originConfidence: "confirmed", servings: 2, prepTimeMin: 5, cookTimeMin: 12, totalTimeMin: 17,
    difficulty: "media", moment: "comida", diet: ["vegetariano"],
    ingredients: [
      { text: "200 g de tonnarelli o spaghetti" }, { text: "100 g de pecorino romano" },
      { text: "Pimienta negra en grano" },
    ],
    steps: [
      "Cuece la pasta y reserva agua de cocción.", "Tuesta la pimienta.",
      "Emulsiona pecorino con agua de pasta.", "Mezcla con la pasta fuera del fuego.",
    ],
    ratingAvg: 4.6, ratingCount: 180, popularityScore: 80, publishedAt: "2026-07-01",
    image: "/images/cacio-e-pepe.jpg", sources: ["Cocina tradicional romana"],
  },
  {
    id: "r-okonomiyaki", dishName: "Okonomiyaki", slug: "okonomiyaki-osaka",
    placeId: "jp-osk", summary: "Tortilla salada de col con salsa, mayonesa y katsuobushi.",
    history: "Comida callejera de Osaka; su nombre significa 'a la plancha como quieras'.",
    originConfidence: "confirmed", servings: 2, prepTimeMin: 15, cookTimeMin: 15, totalTimeMin: 30,
    difficulty: "facil", moment: "street_food", diet: [],
    ingredients: [
      { text: "Col picada" }, { text: "Harina y huevo" }, { text: "Panceta de cerdo" },
      { text: "Salsa okonomi y mayonesa japonesa" }, { text: "Katsuobushi y alga aonori" },
    ],
    steps: [
      "Mezcla col, harina, huevo y agua.", "Cocina la masa con panceta encima.",
      "Voltea y dora ambos lados.", "Cubre con salsa, mayonesa y katsuobushi.",
    ],
    ratingAvg: 4.5, ratingCount: 140, popularityScore: 78, publishedAt: "2026-06-28",
    image: "/images/okonomiyaki-osaka.jpg", sources: ["Cocina de Osaka"],
  },
  {
    id: "r-ramen", dishName: "Ramen shoyu", slug: "ramen-shoyu",
    placeId: "jp-tky", summary: "Fideos en caldo de soya con chashu, huevo marinado y negi.",
    history: "El estilo shoyu de Tokio popularizó el ramen en la posguerra.",
    originConfidence: "commonly_associated", servings: 2, prepTimeMin: 30, cookTimeMin: 60, totalTimeMin: 90,
    difficulty: "media", moment: "comida", diet: [],
    ingredients: [
      { text: "Fideos ramen" }, { text: "Caldo de pollo y dashi" },
      { text: "Tare de soya" }, { text: "Chashu de cerdo" }, { text: "Huevo marinado (ajitama)" },
    ],
    steps: [
      "Prepara el caldo y el tare.", "Cuece los fideos al dente.",
      "Monta el tazón con caldo y fideos.", "Corona con chashu, huevo y negi.",
    ],
    ratingAvg: 4.8, ratingCount: 320, popularityScore: 96, publishedAt: "2026-05-30",
    image: "/images/ramen-shoyu.jpg", sources: ["Cocina de Tokio"],
  },
  {
    id: "r-padthai", dishName: "Pad Thai", slug: "pad-thai",
    placeId: "th-bkk", summary: "Fideos de arroz salteados con tamarindo, huevo, tofu y cacahuate.",
    history: "Promovido como plato nacional tailandés a mediados del siglo XX.",
    originConfidence: "commonly_associated", servings: 2, prepTimeMin: 20, cookTimeMin: 10, totalTimeMin: 30,
    difficulty: "facil", moment: "comida", diet: ["vegetariano"],
    ingredients: [
      { text: "Fideos de arroz" }, { text: "Pasta de tamarindo" }, { text: "Tofu y huevo" },
      { text: "Germen de soya y cebollín" }, { text: "Cacahuate molido y limón" },
    ],
    steps: [
      "Remoja los fideos.", "Saltea tofu y huevo en wok caliente.",
      "Añade fideos y salsa de tamarindo.", "Termina con germen, cacahuate y limón.",
    ],
    ratingAvg: 4.6, ratingCount: 400, popularityScore: 98, publishedAt: "2026-04-18",
    image: "/images/pad-thai.jpg", sources: ["Cocina callejera de Bangkok"],
  },
  {
    id: "r-khaosoi", dishName: "Khao Soi", slug: "khao-soi",
    placeId: "th-cnx", summary: "Curry cremoso del norte con fideos, pollo y fideos fritos encima.",
    history: "Especialidad de Chiang Mai con influencia birmana y del comercio.",
    originConfidence: "confirmed", servings: 2, prepTimeMin: 20, cookTimeMin: 30, totalTimeMin: 50,
    difficulty: "media", moment: "comida", diet: [],
    ingredients: [
      { text: "Pasta de curry khao soi" }, { text: "Leche de coco" }, { text: "Fideos de huevo" },
      { text: "Pollo" }, { text: "Encurtidos y limón" },
    ],
    steps: [
      "Fríe la pasta de curry.", "Añade leche de coco y pollo; cuece.",
      "Sirve sobre fideos cocidos.", "Corona con fideos fritos y encurtidos.",
    ],
    ratingAvg: 4.7, ratingCount: 110, popularityScore: 72, publishedAt: "2026-07-12",
    image: "/images/khao-soi.jpg", sources: ["Cocina del norte de Tailandia"],
  },
  {
    id: "r-tacos-pastor", dishName: "Tacos al pastor", slug: "tacos-al-pastor",
    placeId: "mx-jal", summary: "Cerdo adobado al trompo con piña, cebolla y cilantro.",
    history: "Adaptación mexicana del shawarma libanés, popular en todo el país.",
    originConfidence: "commonly_associated", servings: 4, prepTimeMin: 40, cookTimeMin: 20, totalTimeMin: 60,
    difficulty: "media", moment: "street_food", diet: [],
    ingredients: [
      { text: "Cerdo en filetes finos" }, { text: "Adobo de chiles y achiote" },
      { text: "Piña" }, { text: "Tortillas de maíz" }, { text: "Cebolla y cilantro" },
    ],
    steps: [
      "Marina el cerdo en el adobo.", "Asa en trompo o sartén con piña.",
      "Pica la carne finamente.", "Sirve en tortillas con piña, cebolla y cilantro.",
    ],
    ratingAvg: 4.9, ratingCount: 620, popularityScore: 99, publishedAt: "2026-06-02",
    image: "/images/tacos-al-pastor.jpg", sources: ["Taquerías del centro de México"],
  },
  {
    id: "r-tiramisu", dishName: "Tiramisú", slug: "tiramisu",
    placeId: "it-laz", summary: "Postre de soletas empapadas en café, mascarpone y cacao.",
    history: "Postre italiano moderno difundido desde el Véneto y adoptado en toda Italia.",
    originConfidence: "modern_variant", servings: 6, prepTimeMin: 30, cookTimeMin: 0, totalTimeMin: 30,
    difficulty: "facil", moment: "postre", diet: ["vegetariano"],
    ingredients: [
      { text: "Soletas (savoiardi)" }, { text: "Café espresso" }, { text: "Mascarpone y huevo" },
      { text: "Azúcar" }, { text: "Cacao en polvo" },
    ],
    steps: [
      "Bate mascarpone con yemas y azúcar.", "Incorpora claras a punto de nieve.",
      "Empapa soletas en café y forma capas.", "Refrigera y espolvorea cacao.",
    ],
    ratingAvg: 4.7, ratingCount: 280, popularityScore: 85, publishedAt: "2026-03-22",
    image: "/images/tiramisu.jpg", sources: ["Repostería italiana contemporánea"],
  },
  {
    id: "r-pancakes", dishName: "Buttermilk pancakes", slug: "buttermilk-pancakes",
    placeId: "us-tx", summary: "Hotcakes esponjosos de suero de leche para el desayuno.",
    history: "Básico del desayuno estadounidense servido con mantequilla y jarabe de maple.",
    originConfidence: "commonly_associated", servings: 4, prepTimeMin: 10, cookTimeMin: 15, totalTimeMin: 25,
    difficulty: "facil", moment: "desayuno", diet: ["vegetariano"],
    ingredients: [
      { text: "Harina y polvo para hornear" }, { text: "Suero de leche (buttermilk)" },
      { text: "Huevo y mantequilla" }, { text: "Jarabe de maple" },
    ],
    steps: [
      "Mezcla secos y húmedos por separado.", "Une sin batir de más.",
      "Cocina en sartén hasta burbujear y voltea.", "Sirve con mantequilla y maple.",
    ],
    ratingAvg: 4.3, ratingCount: 90, popularityScore: 60, publishedAt: "2026-08-03",
    image: "/images/buttermilk-pancakes.jpg", sources: ["Desayuno estadounidense clásico"],
  },
  {
    id: "r-mochi", dishName: "Mochi de fresa (daifuku)", slug: "ichigo-daifuku",
    placeId: "jp-tky", summary: "Masa de arroz glutinoso rellena de anko y fresa.",
    history: "Dulce japonés (wagashi) popular en primavera.",
    originConfidence: "confirmed", servings: 6, prepTimeMin: 30, cookTimeMin: 10, totalTimeMin: 40,
    difficulty: "media", moment: "postre", diet: ["vegetariano", "vegano"],
    ingredients: [
      { text: "Harina de arroz glutinoso (shiratamako)" }, { text: "Azúcar" },
      { text: "Pasta de frijol rojo (anko)" }, { text: "Fresas" }, { text: "Fécula de maíz" },
    ],
    steps: [
      "Cuece la masa de mochi al vapor o microondas.", "Envuelve cada fresa con anko.",
      "Estira el mochi y encierra el relleno.", "Sella y espolvorea con fécula.",
    ],
    ratingAvg: 4.4, ratingCount: 70, popularityScore: 55, publishedAt: "2026-07-28",
    image: "/images/ichigo-daifuku.jpg", sources: ["Repostería wagashi"],
  },
  {
    id: "r-guacamole", dishName: "Guacamole", slug: "guacamole",
    placeId: "mx-oax-city", summary: "Aguacate machacado con cebolla, chile, cilantro y limón.",
    history: "De raíces prehispánicas; el nombre viene del náhuatl āhuacamōlli.",
    originConfidence: "confirmed", servings: 4, prepTimeMin: 10, cookTimeMin: 0, totalTimeMin: 10,
    difficulty: "facil", moment: "street_food", diet: ["vegetariano", "vegano", "sin_gluten"],
    ingredients: [
      { text: "3 aguacates maduros" }, { text: "Cebolla y chile serrano" },
      { text: "Cilantro y jitomate" }, { text: "Limón y sal" },
    ],
    steps: [
      "Machaca el aguacate.", "Incorpora cebolla, chile, cilantro y jitomate.",
      "Sazona con limón y sal.", "Sirve de inmediato con totopos.",
    ],
    ratingAvg: 4.5, ratingCount: 300, popularityScore: 90, publishedAt: "2026-05-05",
    image: "/images/guacamole.jpg", sources: ["Cocina mexicana tradicional"],
  },
  {
    id: "r-somtam", dishName: "Som tam", slug: "som-tam",
    placeId: "th-bkk", summary: "Ensalada picante de papaya verde con limón, chile y cacahuate.",
    history: "Ensalada del noreste tailandés popularizada en todo el país.",
    originConfidence: "commonly_associated", servings: 2, prepTimeMin: 15, cookTimeMin: 0, totalTimeMin: 15,
    difficulty: "facil", moment: "comida", diet: ["vegetariano", "vegano"],
    ingredients: [
      { text: "Papaya verde rallada" }, { text: "Chile y ajo" }, { text: "Limón y salsa de pescado" },
      { text: "Tomate cherry y ejotes" }, { text: "Cacahuate" },
    ],
    steps: [
      "Machaca ajo y chile en mortero.", "Añade papaya, tomate y ejotes.",
      "Sazona con limón y salsa de pescado.", "Sirve con cacahuate encima.",
    ],
    ratingAvg: 4.4, ratingCount: 130, popularityScore: 68, publishedAt: "2026-06-20",
    image: "/images/som-tam.jpg", sources: ["Cocina tailandesa isan"],
  },
  {
    id: "r-jambalaya", dishName: "Jambalaya", slug: "jambalaya",
    placeId: "us-la", summary: "Arroz criollo cocido con pollo, salchicha y camarón.",
    history: "Plato criollo de Luisiana emparentado con la paella y el jollof.",
    originConfidence: "confirmed", servings: 6, prepTimeMin: 20, cookTimeMin: 45, totalTimeMin: 65,
    difficulty: "media", moment: "cena", diet: [],
    ingredients: [
      { text: "Arroz de grano largo" }, { text: "Pollo y andouille" },
      { text: "Camarón" }, { text: "Trinidad criolla y tomate" }, { text: "Caldo y especias cajún" },
    ],
    steps: [
      "Dora pollo y salchicha.", "Sofríe la trinidad y añade tomate.",
      "Incorpora arroz y caldo; cuece tapado.", "Agrega camarón al final.",
    ],
    ratingAvg: 4.4, ratingCount: 85, popularityScore: 62, publishedAt: "2026-02-27",
    image: "/images/jambalaya.jpg", sources: ["Cocina criolla de Luisiana"],
  },
  {
    id: "r-cemita", dishName: "Cemita poblana", slug: "cemita-poblana",
    placeId: "mx-pue", summary: "Torta poblana con pan de ajonjolí, milanesa, quesillo y pápalo.",
    history: "Antojito clásico de Puebla vendido en mercados.",
    originConfidence: "confirmed", servings: 2, prepTimeMin: 20, cookTimeMin: 15, totalTimeMin: 35,
    difficulty: "facil", moment: "comida", diet: [],
    ingredients: [
      { text: "Pan de cemita con ajonjolí" }, { text: "Milanesa de res o pollo" },
      { text: "Quesillo" }, { text: "Aguacate y chipotle" }, { text: "Pápalo" },
    ],
    steps: [
      "Fríe la milanesa.", "Abre la cemita y unta aguacate.",
      "Rellena con milanesa, quesillo y chipotle.", "Termina con pápalo.",
    ],
    ratingAvg: 4.5, ratingCount: 75, popularityScore: 58, publishedAt: "2026-08-06",
    image: "/images/cemita-poblana.jpg", sources: ["Cocina poblana"],
  },
];
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/data/recipes.ts
git commit -m "feat(data): seed ~20 real recipes across 5 countries"
```

---

## Task 7: Place-tree traversal + recipe lookup (TDD)

**Files:**
- Create: `src/domain/places.ts`
- Test: `src/domain/places.test.ts`

- [ ] **Step 1: Write the failing test**

Create `atlas-gastronomico/src/domain/places.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { PLACES } from "../data/places";
import { RECIPES } from "../data/recipes";
import {
  resolvePlacePath, getChildren, getBreadcrumb, getRecipesForPlace,
} from "./places";

describe("resolvePlacePath", () => {
  it("resolves a country slug", () => {
    expect(resolvePlacePath(["mexico"], PLACES)?.id).toBe("mx");
  });
  it("resolves a nested state under its country", () => {
    expect(resolvePlacePath(["mexico", "oaxaca"], PLACES)?.id).toBe("mx-oax");
  });
  it("returns null for a wrong parent chain", () => {
    // 'oaxaca' is not a child of 'italia'
    expect(resolvePlacePath(["italia", "oaxaca"], PLACES)).toBeNull();
  });
});

describe("getChildren", () => {
  it("returns the direct children of a place", () => {
    const kids = getChildren("mx", PLACES).map((p) => p.id).sort();
    expect(kids).toEqual(["mx-jal", "mx-oax", "mx-pue"]);
  });
});

describe("getBreadcrumb", () => {
  it("returns root→...→place", () => {
    const place = PLACES.find((p) => p.id === "mx-oax-city")!;
    expect(getBreadcrumb(place, PLACES).map((p) => p.id)).toEqual(["mx", "mx-oax", "mx-oax-city"]);
  });
});

describe("getRecipesForPlace", () => {
  it("includes recipes of descendant places (country rolls up its states)", () => {
    const ids = getRecipesForPlace("mx", PLACES, RECIPES).map((r) => r.id);
    expect(ids).toContain("r-tlayudas"); // placeId mx-oax, a descendant of mx
    expect(ids).toContain("r-birria");   // placeId mx-jal
    expect(ids).not.toContain("r-pizza"); // Italy
  });
  it("a leaf state returns only its own recipes", () => {
    const ids = getRecipesForPlace("mx-jal", PLACES, RECIPES).map((r) => r.id).sort();
    expect(ids).toEqual(["r-birria", "r-tacos-pastor"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- places`
Expected: FAIL (cannot find module `./places`).

- [ ] **Step 3: Write minimal implementation**

Create `atlas-gastronomico/src/domain/places.ts`:
```typescript
import type { Place, Recipe } from "./types";

export function getChildren(parentId: string, places: Place[]): Place[] {
  return places.filter((p) => p.parentId === parentId);
}

export function resolvePlacePath(slugs: string[], places: Place[]): Place | null {
  let parentId: string | null = null;
  let current: Place | null = null;
  for (const slug of slugs) {
    current = places.find((p) => p.slug === slug && p.parentId === parentId) ?? null;
    if (!current) return null;
    parentId = current.id;
  }
  return current;
}

export function getBreadcrumb(place: Place, places: Place[]): Place[] {
  const chain: Place[] = [];
  let node: Place | undefined = place;
  while (node) {
    chain.unshift(node);
    node = node.parentId
      ? places.find((p) => p.id === node!.parentId)
      : undefined;
  }
  return chain;
}

function collectDescendantIds(rootId: string, places: Place[]): Set<string> {
  const ids = new Set<string>([rootId]);
  let added = true;
  while (added) {
    added = false;
    for (const p of places) {
      if (p.parentId && ids.has(p.parentId) && !ids.has(p.id)) {
        ids.add(p.id);
        added = true;
      }
    }
  }
  return ids;
}

export function getRecipesForPlace(
  placeId: string,
  places: Place[],
  recipes: Recipe[],
): Recipe[] {
  const ids = collectDescendantIds(placeId, places);
  return recipes.filter((r) => ids.has(r.placeId));
}

/** Build the full URL path segments for a place, e.g. ["mexico","oaxaca"]. */
export function placePathSlugs(place: Place, places: Place[]): string[] {
  return getBreadcrumb(place, places).map((p) => p.slug);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- places`
Expected: PASS (7 tests).

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: all suites PASS (ranking, sorting, filtering, places).

- [ ] **Step 6: Commit**

```bash
git add src/domain/places.ts src/domain/places.test.ts
git commit -m "feat(domain): place-tree traversal + recipe roll-up with tests"
```

---

## Task 8: Locale routing shell + root redirect

**Files:**
- Modify/Create: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `src/app/es/layout.tsx`
- Create: `src/components/SiteHeader.tsx`

- [ ] **Step 1: Root redirect to /es**

Replace `atlas-gastronomico/src/app/page.tsx` with:
```typescript
import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/es");
}
```

- [ ] **Step 2: Keep the root layout minimal**

Ensure `atlas-gastronomico/src/app/layout.tsx` sets `lang="es"`:
```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Atlas Gastronómico Mundial",
  description: "Explora el mundo cocinando: recetas por origen geográfico.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Create the site header**

Create `atlas-gastronomico/src/components/SiteHeader.tsx`:
```tsx
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/es" className="text-lg font-bold tracking-tight">
          🌍 Atlas Gastronómico
        </Link>
        <nav className="text-sm text-neutral-500">Explora el mundo cocinando</nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Create the locale layout**

Create `atlas-gastronomico/src/app/es/layout.tsx`:
```tsx
import { SiteHeader } from "../../components/SiteHeader";

export default function EsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 5: Verify redirect works**

Run: `npm run dev`, open http://localhost:3000 → should redirect to `/es` (will 404 on the page body until Task 10; the header/layout should render). Stop the server.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx src/app/es/layout.tsx src/components/SiteHeader.tsx
git commit -m "feat(app): locale routing shell + root redirect to /es"
```

---

## Task 9: StarRating + RecipeCard + RecipeList components

**Files:**
- Create: `src/components/StarRating.tsx`, `src/components/RecipeCard.tsx`, `src/components/RecipeList.tsx`

- [ ] **Step 1: StarRating**

Create `atlas-gastronomico/src/components/StarRating.tsx`:
```tsx
export function StarRating({ value, count }: { value: number; count: number }) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1 text-sm" aria-label={`${value} de 5 estrellas`}>
      <span className="text-amber-500">{"★".repeat(full)}{"☆".repeat(5 - full)}</span>
      <span className="text-neutral-500">{value.toFixed(1)} ({count})</span>
    </span>
  );
}
```

- [ ] **Step 2: RecipeCard**

Create `atlas-gastronomico/src/components/RecipeCard.tsx`:
```tsx
import Link from "next/link";
import type { Recipe } from "../domain/types";
import { StarRating } from "./StarRating";

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/es/receta/${recipe.slug}`}
      className="block rounded-xl border border-neutral-200 bg-white p-4 transition hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{recipe.dishName}</h3>
        <span className="whitespace-nowrap text-xs text-neutral-500">⏱️ {recipe.totalTimeMin} min</span>
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{recipe.summary}</p>
      <div className="mt-3 flex items-center justify-between">
        <StarRating value={recipe.ratingAvg} count={recipe.ratingCount} />
        <span className="text-xs capitalize text-neutral-500">{recipe.moment.replace("_", " ")}</span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: RecipeList**

Create `atlas-gastronomico/src/components/RecipeList.tsx`:
```tsx
import type { Recipe } from "../domain/types";
import { RecipeCard } from "./RecipeCard";

export function RecipeList({ recipes }: { recipes: Recipe[] }) {
  if (recipes.length === 0) {
    return <p className="text-neutral-500">No hay recetas que coincidan con estos filtros.</p>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/StarRating.tsx src/components/RecipeCard.tsx src/components/RecipeList.tsx
git commit -m "feat(ui): StarRating, RecipeCard and RecipeList components"
```

---

## Task 10: Sort + Filter controls (client, URL-driven)

**Files:**
- Create: `src/components/SortControls.tsx`, `src/components/FilterControls.tsx`

- [ ] **Step 1: SortControls**

Create `atlas-gastronomico/src/components/SortControls.tsx`:
```tsx
"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SortKey } from "../domain/types";

const OPTIONS: { key: SortKey; label: string }[] = [
  { key: "estrellas", label: "⭐ Mejor valoradas" },
  { key: "recientes", label: "🆕 Recientes" },
  { key: "populares", label: "🔥 Populares" },
  { key: "rapidas", label: "⏱️ Más rápidas" },
  { key: "alfabetico", label: "🔤 A-Z" },
];

export function SortControls({ current }: { current: SortKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setSort(key: SortKey) {
    const next = new URLSearchParams(params.toString());
    next.set("sort", key);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((o) => (
        <button
          key={o.key}
          onClick={() => setSort(o.key)}
          className={`rounded-full border px-3 py-1 text-sm transition ${
            current === o.key
              ? "border-amber-500 bg-amber-50 text-amber-700"
              : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: FilterControls**

Create `atlas-gastronomico/src/components/FilterControls.tsx`:
```tsx
"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const MOMENTOS = ["desayuno", "comida", "cena", "postre", "bebida", "street_food"];
const DIETAS = ["vegetariano", "vegano", "sin_gluten", "sin_lacteos"];
const TIEMPOS = [
  { label: "≤15 min", value: "15" },
  { label: "≤30 min", value: "30" },
  { label: "≤60 min", value: "60" },
];

export function FilterControls() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "" || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`);
  }

  const active = (k: string, v: string) => params.get(k) === v;
  const chip = (on: boolean) =>
    `rounded-full border px-3 py-1 text-sm transition ${
      on ? "border-emerald-500 bg-emerald-50 text-emerald-700"
         : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
    }`;

  return (
    <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-neutral-500">Momento:</span>
        {MOMENTOS.map((m) => (
          <button key={m} onClick={() => setParam("momento", m)} className={chip(active("momento", m))}>
            {m.replace("_", " ")}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-neutral-500">Tiempo:</span>
        {TIEMPOS.map((t) => (
          <button key={t.value} onClick={() => setParam("tiempo", t.value)} className={chip(active("tiempo", t.value))}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-neutral-500">Dieta:</span>
        {DIETAS.map((d) => (
          <button key={d} onClick={() => setParam("dieta", d)} className={chip(active("dieta", d))}>
            {d.replace("_", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/SortControls.tsx src/components/FilterControls.tsx
git commit -m "feat(ui): URL-driven sort and filter controls"
```

---

## Task 11: SCREEN 2 — Place page (recipe list, sortable/filterable)

**Files:**
- Create: `src/app/es/recetas/[...slug]/page.tsx`

This is the core of the user's request. It resolves a place from the URL, rolls up its recipes, applies filters + sort from query params, lists child places for drill-down, and emits `ItemList` JSON-LD.

- [ ] **Step 1: Build the page**

Create `atlas-gastronomico/src/app/es/recetas/[...slug]/page.tsx`:
```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { PLACES } from "../../../../data/places";
import { RECIPES } from "../../../../data/recipes";
import {
  resolvePlacePath, getChildren, getBreadcrumb, getRecipesForPlace, placePathSlugs,
} from "../../../../domain/places";
import { sortRecipes } from "../../../../domain/sorting";
import { filterRecipes } from "../../../../domain/filtering";
import type { Diet, Moment, SortKey } from "../../../../domain/types";
import { RecipeList } from "../../../../components/RecipeList";
import { SortControls } from "../../../../components/SortControls";
import { FilterControls } from "../../../../components/FilterControls";

const VALID_SORTS: SortKey[] = ["estrellas", "recientes", "populares", "rapidas", "alfabetico"];

export function generateStaticParams() {
  return PLACES.map((p) => ({ slug: placePathSlugs(p, PLACES) }));
}

export default function PlacePage({
  params, searchParams,
}: {
  params: { slug: string[] };
  searchParams: { sort?: string; momento?: string; tiempo?: string; dieta?: string };
}) {
  const place = resolvePlacePath(params.slug, PLACES);
  if (!place) notFound();

  const sort: SortKey = VALID_SORTS.includes(searchParams.sort as SortKey)
    ? (searchParams.sort as SortKey) : "estrellas";

  const filtered = filterRecipes(getRecipesForPlace(place.id, PLACES, RECIPES), {
    momento: searchParams.momento as Moment | undefined,
    dieta: searchParams.dieta as Diet | undefined,
    maxTiempo: searchParams.tiempo ? Number(searchParams.tiempo) : undefined,
  });
  const recipes = sortRecipes(filtered, sort);

  const breadcrumb = getBreadcrumb(place, PLACES);
  const children = getChildren(place.id, PLACES);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Recetas de ${place.name}`,
    itemListElement: recipes.map((r, i) => ({
      "@type": "ListItem", position: i + 1, name: r.dishName,
      url: `/es/receta/${r.slug}`,
    })),
  };

  return (
    <div className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-sm text-neutral-500">
        <Link href="/es" className="hover:underline">Mundo</Link>
        {breadcrumb.map((p, i) => (
          <span key={p.id}>
            {" / "}
            <Link href={`/es/recetas/${placePathSlugs(p, PLACES).join("/")}`} className="hover:underline">
              {p.name}
            </Link>
          </span>
        ))}
      </nav>

      <h1 className="text-3xl font-bold">Recetas de {place.name}</h1>

      {children.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {children.map((c) => (
            <Link
              key={c.id}
              href={`/es/recetas/${placePathSlugs(c, PLACES).join("/")}`}
              className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm hover:border-neutral-400"
            >
              📍 {c.name}
            </Link>
          ))}
        </div>
      )}

      <FilterControls />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">{recipes.length} recetas</p>
        <SortControls current={sort} />
      </div>

      <RecipeList recipes={recipes} />
    </div>
  );
}
```

- [ ] **Step 2: Verify it renders and sorting/filtering work**

Run: `npm run dev`. Visit:
- http://localhost:3000/es/recetas/mexico → shows all Mexican recipes + child chips (Oaxaca, Puebla, Jalisco).
- Add `?sort=recientes` → order changes (cemita-poblana near top, publishedAt 2026-08-06).
- Add `?sort=estrellas` → mole-negro / tacos-pastor near top (high bayesian).
- Add `?dieta=vegano` → only vegan recipes remain.
- http://localhost:3000/es/recetas/mexico/oaxaca → only Oaxaca recipes.

Expected: all behaviors correct. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add "src/app/es/recetas/[...slug]/page.tsx"
git commit -m "feat(app): place page with sortable/filterable recipe list + ItemList JSON-LD"
```

---

## Task 12: SCREEN 3 — Recipe detail + Recipe JSON-LD

**Files:**
- Create: `src/app/es/receta/[slug]/page.tsx`
- Create: `atlas-gastronomico/public/images/.gitkeep` (placeholder images optional)

- [ ] **Step 1: Build the recipe page**

Create `atlas-gastronomico/src/app/es/receta/[slug]/page.tsx`:
```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { RECIPES } from "../../../../data/recipes";
import { PLACES } from "../../../../data/places";
import { getBreadcrumb, placePathSlugs } from "../../../../domain/places";
import { StarRating } from "../../../../components/StarRating";

const CONFIDENCE_LABEL: Record<string, string> = {
  confirmed: "Origen confirmado",
  commonly_associated: "Comúnmente asociado",
  disputed: "Origen disputado",
  modern_variant: "Variante moderna",
};

export function generateStaticParams() {
  return RECIPES.map((r) => ({ slug: r.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const r = RECIPES.find((x) => x.slug === params.slug);
  if (!r) return {};
  return { title: `${r.dishName} — Atlas Gastronómico`, description: r.summary };
}

function iso(min: number) {
  return `PT${min}M`;
}

export default function RecipePage({ params }: { params: { slug: string } }) {
  const recipe = RECIPES.find((r) => r.slug === params.slug);
  if (!recipe) notFound();

  const place = PLACES.find((p) => p.id === recipe.placeId);
  const breadcrumb = place ? getBreadcrumb(place, PLACES) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.dishName,
    description: recipe.summary,
    image: [recipe.image],
    author: { "@type": "Organization", name: "Atlas Gastronómico Mundial" },
    prepTime: iso(recipe.prepTimeMin),
    cookTime: iso(recipe.cookTimeMin),
    totalTime: iso(recipe.totalTimeMin),
    recipeYield: `${recipe.servings} porciones`,
    recipeIngredient: recipe.ingredients.map((i) => i.text),
    recipeInstructions: recipe.steps.map((s) => ({ "@type": "HowToStep", text: s })),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: recipe.ratingAvg, reviewCount: recipe.ratingCount,
    },
  };

  return (
    <article className="space-y-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="text-sm text-neutral-500">
        <Link href="/es" className="hover:underline">Mundo</Link>
        {breadcrumb.map((p) => (
          <span key={p.id}>
            {" / "}
            <Link href={`/es/recetas/${placePathSlugs(p, PLACES).join("/")}`} className="hover:underline">
              {p.name}
            </Link>
          </span>
        ))}
      </nav>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{recipe.dishName}</h1>
        <StarRating value={recipe.ratingAvg} count={recipe.ratingCount} />
        <p className="text-neutral-600">{recipe.summary}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-neutral-200 px-2 py-1">⏱️ {recipe.totalTimeMin} min</span>
          <span className="rounded-full bg-neutral-200 px-2 py-1">🍽️ {recipe.servings} porciones</span>
          <span className="rounded-full bg-neutral-200 px-2 py-1 capitalize">📊 {recipe.difficulty}</span>
          <span className="rounded-full bg-amber-100 px-2 py-1">🏷️ {CONFIDENCE_LABEL[recipe.originConfidence]}</span>
        </div>
      </header>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Historia</h2>
        <p className="text-neutral-700">{recipe.history}</p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-2 text-xl font-semibold">Ingredientes</h2>
          <ul className="list-inside list-disc space-y-1 text-neutral-700">
            {recipe.ingredients.map((i, idx) => (
              <li key={idx}>{i.text}{i.optional ? " (opcional)" : ""}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-2 text-xl font-semibold">Preparación</h2>
          <ol className="list-inside list-decimal space-y-2 text-neutral-700">
            {recipe.steps.map((s, idx) => <li key={idx}>{s}</li>)}
          </ol>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Fuentes</h2>
        <ul className="list-inside list-disc text-sm text-neutral-500">
          {recipe.sources.map((s, idx) => <li key={idx}>{s}</li>)}
        </ul>
      </section>
    </article>
  );
}
```

- [ ] **Step 2: Create the images placeholder folder**

Run from `atlas-gastronomico/`:
```bash
mkdir -p public/images && touch public/images/.gitkeep
```
(Real photos come later; missing images degrade gracefully — the `<img>` is not rendered in MVP 0, only referenced in JSON-LD.)

- [ ] **Step 3: Verify recipe pages render**

Run: `npm run dev`. Visit http://localhost:3000/es/receta/mole-negro-oaxaqueno → full detail with breadcrumb, rating, history, ingredients, steps, sources. View source → confirm `<script type="application/ld+json">` with `@type: Recipe`. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add "src/app/es/receta/[slug]/page.tsx" public/images/.gitkeep
git commit -m "feat(app): recipe detail page with Recipe JSON-LD"
```

---

## Task 13: SCREEN 1 — World map + universal search

**Files:**
- Create: `src/components/WorldMap.tsx`, `src/components/UniversalSearch.tsx`
- Create: `src/app/es/page.tsx`

- [ ] **Step 1: WorldMap (MapLibre 2D, country markers)**

Create `atlas-gastronomico/src/components/WorldMap.tsx`:
```tsx
"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { PLACES } from "../data/places";
import { placePathSlugs } from "../domain/places";

const COUNTRIES = PLACES.filter((p) => p.type === "pais");

export function WorldMap() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!ref.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://demotiles.maplibre.org/style.json", // free demo vector style, no API key
      center: [0, 20],
      zoom: 1.3,
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    COUNTRIES.forEach((c) => {
      const el = document.createElement("button");
      el.textContent = "🍽️";
      el.title = c.name;
      el.style.cssText = "font-size:22px;cursor:pointer;background:none;border:none;";
      el.onclick = () => router.push(`/es/recetas/${placePathSlugs(c, PLACES).join("/")}`);
      new maplibregl.Marker({ element: el }).setLngLat([c.lng, c.lat]).addTo(map);
    });

    return () => map.remove();
  }, [router]);

  return <div ref={ref} className="h-[420px] w-full overflow-hidden rounded-xl border border-neutral-200" />;
}
```

- [ ] **Step 2: UniversalSearch (jump to place or recipe)**

Create `atlas-gastronomico/src/components/UniversalSearch.tsx`:
```tsx
"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PLACES } from "../data/places";
import { RECIPES } from "../data/recipes";
import { placePathSlugs } from "../domain/places";

type Hit = { label: string; sub: string; href: string };

export function UniversalSearch() {
  const [q, setQ] = useState("");

  const hits = useMemo<Hit[]>(() => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const placeHits: Hit[] = PLACES
      .filter((p) => p.name.toLowerCase().includes(term))
      .slice(0, 5)
      .map((p) => ({ label: p.name, sub: p.type, href: `/es/recetas/${placePathSlugs(p, PLACES).join("/")}` }));
    const recipeHits: Hit[] = RECIPES
      .filter((r) => r.dishName.toLowerCase().includes(term))
      .slice(0, 5)
      .map((r) => ({ label: r.dishName, sub: "receta", href: `/es/receta/${r.slug}` }));
    return [...placeHits, ...recipeHits];
  }, [q]);

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Busca un plato, país, ciudad o ingrediente…"
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base outline-none focus:border-amber-500"
      />
      {hits.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
          {hits.map((h) => (
            <li key={h.href}>
              <Link href={h.href} className="flex items-center justify-between px-4 py-2 hover:bg-neutral-50">
                <span>{h.label}</span>
                <span className="text-xs capitalize text-neutral-400">{h.sub}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 3: World page (hero)**

Create `atlas-gastronomico/src/app/es/page.tsx`:
```tsx
import Link from "next/link";
import { WorldMap } from "../../components/WorldMap";
import { UniversalSearch } from "../../components/UniversalSearch";
import { PLACES } from "../../data/places";
import { placePathSlugs } from "../../domain/places";

const COUNTRIES = PLACES.filter((p) => p.type === "pais");

export default function WorldPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-3 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Explora el mundo cocinando</h1>
        <p className="text-neutral-600">
          Del mapa mundial a la cocina de cualquier pueblo, ciudad o región.
        </p>
        <div className="mx-auto max-w-xl"><UniversalSearch /></div>
      </section>

      <WorldMap />

      <section>
        <h2 className="mb-3 text-lg font-semibold">Explorar por país</h2>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => (
            <Link
              key={c.id}
              href={`/es/recetas/${placePathSlugs(c, PLACES).join("/")}`}
              className="rounded-full border border-neutral-300 bg-white px-4 py-2 hover:border-amber-500"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Verify the full flow**

Run: `npm run dev`. At http://localhost:3000/es:
- The MapLibre map renders with 🍽️ markers on the 5 countries; clicking a marker navigates to its place page.
- Typing "mole" or "italia" in the search shows hits that navigate correctly.
- Country chips navigate to place pages.

Expected: end-to-end navigation Mundo → País → Receta works. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add src/components/WorldMap.tsx src/components/UniversalSearch.tsx src/app/es/page.tsx
git commit -m "feat(app): world screen with MapLibre 2D map + universal search"
```

---

## Task 14: Final verification & build

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all domain suites PASS (ranking, sorting, filtering, places).

- [ ] **Step 2: Typecheck the whole project**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: build succeeds; place and recipe routes are statically generated (from `generateStaticParams`).

- [ ] **Step 4: Smoke-test the production build**

Run: `npm run start`, then verify http://localhost:3000/es, a place page, and a recipe page all render. Stop the server.

- [ ] **Step 5: Commit any config touch-ups**

```bash
git add -A
git commit -m "chore: MVP 0 verified — tests, typecheck and production build green" || echo "nothing to commit"
```

---

## Self-Review (completed during authoring)

**Spec coverage:**
- §3.3 hierarchical navigation → Tasks 7, 11, 13 ✅
- §3.4 three screens → Tasks 11 (place), 12 (recipe), 13 (world) ✅
- §4.1 sorting (stars/recent/popular/fast/alpha) → Task 3 + SortControls (Task 10) ✅
- §4.2 filters (momento/tiempo/dieta subset for MVP 0) → Task 4 + FilterControls (Task 10) ✅
- §5.2 bayesian ranking → Task 2 ✅
- §6 stack (Next.js/TS/Tailwind/MapLibre) → Tasks 0, 13 ✅
- §7.1 indexable URLs `/es/recetas/...` → Tasks 8, 11 ✅
- §7.3 Schema.org Recipe + ItemList → Tasks 11, 12 ✅
- §8 origin_confidence surfaced in UI → Task 12 ✅
- Spanish-first i18n-ready routing → Task 8 ✅

**Deliberately deferred to later MVPs (per spec §11, not gaps):** accounts, Food Passport, "cocinar con lo que tengo", contributions/moderation, database (Supabase/PostGIS), ads, full filter set (costo/técnica/perfil), multi-language content + hreflang.

**Placeholder scan:** no TBD/TODO; every code step contains complete code. ✅

**Type consistency:** `SortKey`, `RecipeFilters`, `Place`, `Recipe` used identically across domain, components, and pages; `placePathSlugs`, `resolvePlacePath`, `getRecipesForPlace` signatures match between definition (Task 7) and callers (Tasks 11–13). ✅

---

## Next steps after MVP 0
1. Real photography (AVIF/WebP) + `next/image`.
2. Migrate seed data → Supabase/PostGIS; keep the domain layer unchanged (swap the data source behind `getRecipesForPlace`).
3. MVP 1: expand to ~100 recipes, add full filter set, Postgres FTS search.
4. MVP 2: accounts, favorites, "cooked", Food Passport, Surprise Me.
5. i18n: add `/en/` locale + `hreflang`, translated slugs.
