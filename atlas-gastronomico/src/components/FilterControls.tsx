"use client";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Moment, Diet } from "../domain/types";
import { useLocale } from "../i18n/useLocale";
import { getDictionary } from "../i18n/dictionaries";

const MOMENTOS: Moment[] = ["desayuno", "comida", "cena", "postre", "bebida", "street_food"];
const DIETAS: Diet[] = ["vegetariano", "vegano", "sin_gluten", "sin_lacteos"];
const TIEMPOS = ["15", "30", "60"];
const KEYS = ["momento", "tiempo", "dieta"];

export function FilterControls() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const t = getDictionary(useLocale());

  const activeCount = KEYS.filter((k) => params.get(k)).length;

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (next.get(key) === value) next.delete(key);
    else next.set(key, value);
    router.push(next.toString() ? `${pathname}?${next.toString()}` : pathname, { scroll: false });
  }
  function clearAll() {
    const next = new URLSearchParams(params.toString());
    KEYS.forEach((k) => next.delete(k));
    router.push(next.toString() ? `${pathname}?${next.toString()}` : pathname, { scroll: false });
  }

  const active = (k: string, v: string) => params.get(k) === v;
  const chip = (on: boolean) =>
    `rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
      on
        ? "bg-agave text-white shadow-[var(--shadow-card)]"
        : "bg-paper text-ink-soft ring-1 ring-line hover:ring-agave/50 hover:text-ink"
    }`;

  return (
    <div className="overflow-hidden rounded-[var(--radius-xl2)] border border-line bg-card shadow-[var(--shadow-card)]">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
        <span className="flex items-center gap-2.5">
          <span className="text-lg">⚗️</span>
          <span className="font-display text-base text-ink">{t.filters.title}</span>
          {activeCount > 0 && <span className="rounded-full bg-terracota px-2 py-0.5 text-xs font-bold text-white">{activeCount}</span>}
        </span>
        <span className="flex items-center gap-3">
          {activeCount > 0 && (
            <span
              role="button" tabIndex={0}
              onClick={(e) => { e.stopPropagation(); clearAll(); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); clearAll(); } }}
              className="text-xs font-medium text-ink-faint underline-offset-2 hover:text-terracota hover:underline"
            >
              {t.filters.clear}
            </span>
          )}
          <span className={`text-ink-soft transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden>▾</span>
        </span>
      </button>

      <div className="grid transition-all duration-300 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <div className="space-y-4 border-t border-line-soft px-4 py-4">
            <div>
              <p className="eyebrow mb-2 text-ink-faint">{t.filters.momento}</p>
              <div className="flex flex-wrap gap-2">
                {MOMENTOS.map((m) => (
                  <button key={m} onClick={() => setParam("momento", m)} className={chip(active("momento", m))}>{t.moments[m]}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-2 text-ink-faint">{t.filters.tiempo}</p>
              <div className="flex flex-wrap gap-2">
                {TIEMPOS.map((v) => (
                  <button key={v} onClick={() => setParam("tiempo", v)} className={chip(active("tiempo", v))}>{t.filters.tiempos[v]}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="eyebrow mb-2 text-ink-faint">{t.filters.dieta}</p>
              <div className="flex flex-wrap gap-2">
                {DIETAS.map((d) => (
                  <button key={d} onClick={() => setParam("dieta", d)} className={chip(active("dieta", d))}>{t.diets[d]}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
