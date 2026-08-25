"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "../i18n/useLocale";
import { getDictionary } from "../i18n/dictionaries";

export interface PlaceCardItem {
  id: string;
  name: string;
  href: string;
  count: number;
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function StatesGrid({ items, searchLabel = "Buscar…" }: { items: PlaceCardItem[]; searchLabel?: string }) {
  const [q, setQ] = useState("");
  const t = getDictionary(useLocale()).place;

  const filtered = useMemo(() => {
    const term = normalize(q.trim());
    const base = term ? items.filter((it) => normalize(it.name).includes(term)) : items;
    // Con recetas primero, luego alfabético
    return [...base].sort((a, b) => (b.count - a.count) || a.name.localeCompare(b.name, "es"));
  }, [q, items]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint">⌕</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchLabel}
          className="w-full rounded-full border border-line bg-card py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-terracota"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-ink-soft">Ningún estado coincide con “{q}”.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((it, i) => (
            <Link
              key={it.id}
              href={it.href}
              style={{ animationDelay: `${Math.min(i, 16) * 30}ms` }}
              className="reveal group flex items-center justify-between gap-2 rounded-xl border border-line bg-card px-3.5 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-terracota/50 hover:shadow-[var(--shadow-card)]"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink transition-colors group-hover:text-terracota">
                  {it.name}
                </span>
                <span className="text-xs text-ink-faint">
                  {it.count > 0 ? t.recipes(it.count) : "…"}
                </span>
              </span>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                  it.count > 0 ? "bg-terracota/10 text-terracota" : "bg-paper-2 text-ink-faint"
                }`}
              >
                {it.count}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
