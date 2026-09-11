"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Globe2, Moon, Sun } from "lucide-react";
import { localeMeta, type Locale } from "../i18n/config";
import { getDictionary } from "../i18n/dictionaries";
import { homeHref, placeHrefFromSlugs } from "../i18n/routing";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function SiteHeader({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = localeMeta[locale].htmlLang;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem("theme"); } catch { /* Storage may be disabled. */ }
      document.documentElement.classList.toggle("dark", saved === "dark" || (saved !== "light" && media.matches));
    };
    sync();
    media.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => { media.removeEventListener("change", sync); window.removeEventListener("storage", sync); };
  }, [locale]);

  function toggleTheme() {
    const dark = document.documentElement.classList.toggle("dark");
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch { /* The current page still switches. */ }
  }
  const links = [
    { href: homeHref(locale), label: t.header.navHome },
    { href: `${homeHref(locale)}#destinations`, label: t.home.countriesEyebrow },
    { href: placeHrefFromSlugs(locale, ["mexico"]), label: t.header.navStates },
  ];
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href={homeHref(locale)} className="brand-lockup" aria-label={`WorldBites · ${t.header.brand}`}>
          <span className="brand-icon" aria-hidden="true"><Globe2 size={25} strokeWidth={1.6} /></span>
          <span><span className="brand-name">WorldBites<span className="text-terracota">.</span></span><span className="brand-tagline">{t.header.tagline}</span></span>
        </Link>
        <nav className="header-nav" aria-label={t.header.navHome}>
          {links.map(link => <Link key={link.href} href={link.href} className="nav-link" aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}
          <button type="button" onClick={toggleTheme} className="icon-button" aria-label={locale === "es" ? "Cambiar tema claro / oscuro" : "Switch light / dark theme"} title={locale === "es" ? "Cambiar tema" : "Switch theme"}>
            <Moon className="theme-moon" size={19} aria-hidden="true" /><Sun className="theme-sun" size={19} aria-hidden="true" />
          </button>
          <LocaleSwitcher />
        </nav>
      </div>
      <nav className="nav-mobile" aria-label={t.home.countriesTitle}>
        {links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined}>{link.label}</Link>)}
      </nav>
    </header>
  );
}
