"use client";
import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, MapPin, Utensils, X } from "lucide-react";
import { PLACES } from "../data/places";
import { RECIPES } from "../data/recipes";
import { useLocale } from "../i18n/useLocale";
import { getDictionary } from "../i18n/dictionaries";
import { recipeHref, placeHref } from "../i18n/routing";
import { translatePlaceName, translateRecipe } from "../i18n/content";

type Hit = { key: string; label: string; sub: string; href: string; place: boolean };
const normalize = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export function UniversalSearch() {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const router = useRouter();
  const locale = useLocale();
  const t = getDictionary(locale);
  const hits = useMemo<Hit[]>(() => {
    const term = normalize(q.trim());
    if (term.length < 2) return [];
    const places = PLACES.map(p => ({ p, label: translatePlaceName(p, locale) }))
      .filter(({ p, label }) => normalize(p.name).includes(term) || normalize(label).includes(term)).slice(0, 5)
      .map(({ p, label }) => ({ key: `p-${p.id}`, label, sub: t.place.kind[p.type], place: true, href: placeHref(locale, p) }));
    const recipes = RECIPES.map(r => ({ r, label: translateRecipe(r, locale).dishName }))
      .filter(({ r, label }) => normalize(r.dishName).includes(term) || normalize(label).includes(term)).slice(0, 6)
      .map(({ r, label }) => ({ key: `r-${r.id}`, label, sub: t.search.recipe, place: false, href: recipeHref(locale, r.slug) }));
    return [...places, ...recipes];
  }, [q, locale, t]);
  const showList = focused && q.trim().length >= 2;
  return (
    <div className="search-box" role="search" onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false); }}>
      <div className="search-field">
        <Search size={20} className="shrink-0 text-agave-deep" aria-hidden="true" />
        <input ref={input} value={q} onChange={e => { setQ(e.target.value); setActive(-1); setFocused(true); }} onFocus={() => setFocused(true)} placeholder={t.search.placeholder} aria-label={t.search.placeholder}
          role="combobox" aria-autocomplete="list" aria-expanded={showList} aria-controls={showList ? id : undefined} aria-activedescendant={showList && active >= 0 ? `${id}-${active}` : undefined}
          onKeyDown={e => {
            if (e.key === "Escape") { setFocused(false); setActive(-1); }
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault(); setFocused(true);
              const next = !hits.length ? -1 : active < 0
                ? (e.key === "ArrowDown" ? 0 : hits.length - 1)
                : (active + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length;
              setActive(next);
              document.getElementById(`${id}-${next}`)?.scrollIntoView({ block: "nearest" });
            }
            if (e.key === "Enter" && showList && hits.length) { e.preventDefault(); setFocused(false); router.push(hits[Math.max(0, active)].href); }
          }} />
        {q && <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center text-ink-soft" aria-label={t.filters.clear} onClick={() => { setQ(""); setActive(-1); input.current?.focus(); }}><X size={17} /></button>}
      </div>
      {showList && <div className="search-results">
        {hits.length > 0 ? <ul id={id} role="listbox" aria-label={t.search.results ?? t.search.placeholder}>
          {hits.map((h, i) => <li key={h.key} role="presentation"><Link id={`${id}-${i}`} role="option" aria-selected={active === i} href={h.href} className="search-result" onClick={() => setFocused(false)}>
            <span className="flex items-center gap-3">{h.place ? <MapPin size={17} aria-hidden="true" /> : <Utensils size={17} aria-hidden="true" />}{h.label}</span><span className="text-xs text-ink-faint">{h.sub}</span>
          </Link></li>)}
        </ul> : <p id={id} role="status" className="px-3 py-4 text-sm text-ink-soft">{t.place.empty}: “{q}”</p>}
      </div>}
    </div>
  );
}
