"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { PLACES } from "../data/places";
import { RECIPES } from "../data/recipes";
import { useLocale } from "../i18n/useLocale";
import { getDictionary } from "../i18n/dictionaries";
import { recipeHref, placeHref } from "../i18n/routing";
import { translatePlaceName, translateRecipe } from "../i18n/content";

type Hit = { key: string; label: string; sub: string; href: string; icon: string };

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function UniversalSearch() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const locale = useLocale();
  const t = getDictionary(locale);

  const hits = useMemo<Hit[]>(() => {
    const term = normalize(q.trim());
    if (term.length < 2) return [];
    const placeHits: Hit[] = PLACES
      .map((p) => ({ p, label: translatePlaceName(p, locale) }))
      .filter(({ p, label }) => normalize(p.name).includes(term) || normalize(label).includes(term))
      .slice(0, 5)
      .map(({ p, label }) => ({ key: `p-${p.id}`, label, sub: t.place.kind[p.type], icon: "📍", href: placeHref(locale, p) }));
    const recipeHits: Hit[] = RECIPES
      .map((r) => ({ r, label: translateRecipe(r, locale).dishName }))
      .filter(({ r, label }) => normalize(r.dishName).includes(term) || normalize(label).includes(term))
      .slice(0, 6)
      .map(({ r, label }) => ({ key: `r-${r.id}`, label, sub: t.search.recipe, icon: "🍲", href: recipeHref(locale, r.slug) }));
    return [...placeHits, ...recipeHits];
  }, [q, locale, t]);

  const showList = focused && hits.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint">⌕</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={t.search.placeholder}
          className="w-full rounded-full border border-line bg-card py-3.5 pl-11 pr-4 text-base text-ink shadow-[var(--shadow-card)] outline-none transition-colors placeholder:text-ink-faint focus:border-terracota"
        />
      </div>
      {showList && (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-line bg-card text-left shadow-[var(--shadow-lift)]">
          {hits.map((h) => (
            <li key={h.key}>
              <Link href={h.href} className="flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-paper-2">
                <span className="flex items-center gap-2.5 text-ink"><span>{h.icon}</span>{h.label}</span>
                <span className="text-xs capitalize text-ink-faint">{h.sub}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
