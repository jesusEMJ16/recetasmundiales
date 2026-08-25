"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeMeta, defaultLocale, isLocale } from "../i18n/config";

// Cambia de idioma conservando la misma página (los slugs son iguales en todos los idiomas).
export function LocaleSwitcher() {
  const pathname = usePathname();
  const parts = pathname.split("/");
  const current = isLocale(parts[1]) ? parts[1] : defaultLocale;

  function hrefFor(loc: string) {
    const p = [...parts];
    if (isLocale(p[1])) p[1] = loc;
    else p.splice(1, 0, loc);
    return p.join("/") || `/${loc}`;
  }

  return (
    <div className="flex items-center gap-1 text-xs font-semibold">
      {locales.map((loc, i) => (
        <span key={loc} className="flex items-center gap-1">
          {i > 0 && <span className="text-line">|</span>}
          <Link
            href={hrefFor(loc)}
            aria-current={loc === current ? "true" : undefined}
            className={loc === current ? "text-terracota" : "text-ink-faint transition-colors hover:text-ink"}
            title={localeMeta[loc].label}
          >
            {loc.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
