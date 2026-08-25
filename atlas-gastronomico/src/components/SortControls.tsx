"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SortKey } from "../domain/types";
import { useLocale } from "../i18n/useLocale";
import { getDictionary } from "../i18n/dictionaries";

const ICONS: Record<SortKey, string> = {
  estrellas: "★", recientes: "✦", populares: "🔥", rapidas: "⏱", alfabetico: "🔤",
};
const ORDER: SortKey[] = ["estrellas", "recientes", "populares", "rapidas", "alfabetico"];

export function SortControls({ current }: { current: SortKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const t = getDictionary(useLocale()).sort;

  function setSort(key: SortKey) {
    const next = new URLSearchParams(params.toString());
    next.set("sort", key);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {ORDER.map((key) => {
        const on = current === key;
        return (
          <button
            key={key}
            onClick={() => setSort(key)}
            aria-pressed={on}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
              on
                ? "bg-ink text-paper shadow-[var(--shadow-card)]"
                : "bg-card text-ink-soft ring-1 ring-line hover:ring-terracota/50 hover:text-ink"
            }`}
          >
            <span className={on ? "text-dorado" : "text-ink-faint"}>{ICONS[key]}</span>
            {t[key]}
          </button>
        );
      })}
    </div>
  );
}
