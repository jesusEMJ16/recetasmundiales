"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { locales, localeMeta, defaultLocale, isLocale } from "../i18n/config";

// Cambia de idioma conservando la misma página (los slugs son iguales en todos los idiomas).
export function LocaleSwitcher() {
  const pathname = usePathname();
  const parts = pathname.split("/");
  const current = isLocale(parts[1]) ? parts[1] : defaultLocale;
  const [isOpen, setIsOpen] = useState(false);

  function hrefFor(loc: string) {
    const p = [...parts];
    if (isLocale(p[1])) p[1] = loc;
    else p.splice(1, 0, loc);
    return p.join("/") || `/${loc}`;
  }

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex min-h-11 items-center gap-1.5 rounded-xl border border-line bg-card px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-terracota hover:text-terracota"
        aria-label="Cambiar idioma / Change language"
        onKeyDown={(e) => { if (e.key === "Escape") setIsOpen(false); }}
        aria-expanded={isOpen}
      >

        <span>{current.toUpperCase()}</span>
        <svg className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-line bg-card py-2 shadow-[var(--shadow-lg)] backdrop-blur-sm z-50"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => { if (e.key === "Escape") { setIsOpen(false); (e.currentTarget.previousElementSibling as HTMLButtonElement)?.focus(); } }}
        >
          {locales.map((loc) => (
            <Link
              key={loc}
              href={hrefFor(loc)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                loc === current
                  ? "bg-terracota/10 text-terracota font-semibold"
                  : "text-ink-soft hover:bg-card-hover hover:text-ink"
              }`}
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg">{localeMeta[loc].flag}</span>
              <span>{localeMeta[loc].label}</span>
              {loc === current && (
                <svg className="ml-auto h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
