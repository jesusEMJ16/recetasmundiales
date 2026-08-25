import Link from "next/link";
import type { Locale } from "../i18n/config";
import { getDictionary } from "../i18n/dictionaries";
import { homeHref, placeHrefFromSlugs } from "../i18n/routing";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).header;
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={homeHref(locale)} className="group flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-terracota text-lg text-paper shadow-[var(--shadow-card)] transition-transform duration-300 group-hover:rotate-12">
            🌶️
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-tight text-ink">{t.brand}</span>
            <span className="eyebrow text-[0.6rem] text-terracota">{t.tagline}</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-ink-soft sm:gap-6">
          <Link href={homeHref(locale)} className="hidden transition-colors hover:text-terracota sm:inline">
            {t.navHome}
          </Link>
          <Link href={placeHrefFromSlugs(locale, ["mexico"])} className="hidden transition-colors hover:text-terracota sm:inline">
            {t.navStates}
          </Link>
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}
