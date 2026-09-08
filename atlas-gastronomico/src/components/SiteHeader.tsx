"use client";
import Link from "next/link";
import type { Locale } from "../i18n/config";
import { getDictionary } from "../i18n/dictionaries";
import { homeHref, placeHrefFromSlugs } from "../i18n/routing";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { useState, useEffect } from "react";

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).header;
  const [isDark, setIsDark] = useState(false);

  // Cargar preferencia de tema al montar
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(shouldUseDark);
    if (shouldUseDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Cambiar tema
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
    if (newIsDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur-md dark:bg-dark-bg-secondary/80 dark:border-dark-border/70" role="banner">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link 
          href={homeHref(locale)} 
          className="group flex items-center gap-2.5"
          aria-label={`${t.brand} - ${t.tagline}`}
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-terracota text-lg text-paper shadow-[var(--shadow-card)] transition-transform duration-300 group-hover:rotate-12" aria-hidden>
            🌶️
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-ink dark:text-dark-text-primary">{t.brand}</span>
            <span className="eyebrow text-[0.6rem] text-terracota">{t.tagline}</span>
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm text-ink-soft sm:gap-4 dark:text-dark-text-secondary" role="navigation" aria-label={t.navHome}>
          <Link href={homeHref(locale)} className="hidden transition-colors hover:text-terracota sm:inline dark:hover:text-dark-primary" aria-label={t.navHome}>
            {t.navHome}
          </Link>
          <Link href={placeHrefFromSlugs(locale, ["mexico"])} className="hidden transition-colors hover:text-terracota sm:inline dark:hover:text-dark-primary" aria-label={t.navStates}>
            {t.navStates}
          </Link>
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-line bg-card p-2 text-ink transition-colors hover:border-terracota hover:text-terracota dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-secondary dark:hover:border-dark-primary dark:hover:text-dark-primary"
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDark ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
