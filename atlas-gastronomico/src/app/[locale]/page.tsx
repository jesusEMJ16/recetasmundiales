import Link from "next/link";
import { notFound } from "next/navigation";
import { WorldMap } from "../../components/WorldMap";
import { UniversalSearch } from "../../components/UniversalSearch";
import { PLACES } from "../../data/places";
import { RECIPES } from "../../data/recipes";
import { getRecipesForPlace } from "../../domain/places";
import { isLocale, locales } from "../../i18n/config";
import { getDictionary } from "../../i18n/dictionaries";
import { placeHref, placeHrefFromSlugs } from "../../i18n/routing";
import { translatePlaceName } from "../../i18n/content";

const ALL_COUNTRIES = PLACES.filter((p) => p.type === "pais");

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);

  return (
    <div className="space-y-14">
      {/* HERO */}
      <section className="reveal relative overflow-hidden rounded-[2rem] border border-line bg-card px-6 py-12 text-center shadow-[var(--shadow-card)] sm:px-10 sm:py-16 dark:bg-dark-bg-card dark:border-dark-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(600px 300px at 20% 0%, rgba(225,29,116,0.10), transparent 60%), radial-gradient(600px 300px at 90% 20%, rgba(217,154,0,0.14), transparent 60%)",
          }}
        />
        <div className="relative">
          <p className="eyebrow text-terracota">{t.home.eyebrow}</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-5xl leading-[1.05] text-ink sm:text-6xl dark:text-dark-text-primary">
            {t.home.titleLead} <span className="deco-underline">{t.home.titleAccent}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft dark:text-dark-text-secondary">{t.home.subtitle}</p>
          <div className="mx-auto mt-7 max-w-xl">
            <UniversalSearch />
          </div>
        </div>
      </section>

      {/* MAPA */}
      <section className="reveal space-y-3" style={{ animationDelay: "80ms" }}>
        <div>
          <p className="eyebrow text-terracota">{t.home.mapEyebrow}</p>
          <h2 className="font-display text-2xl text-ink dark:text-dark-text-primary">{t.home.mapTitle}</h2>
        </div>
        <WorldMap />
      </section>

      {/* PAÍSES - CARDS */}
      <section className="reveal space-y-6" style={{ animationDelay: "120ms" }}>
        <div>
          <p className="eyebrow text-terracota">{t.home.countriesEyebrow}</p>
          <h2 className="font-display text-2xl text-ink dark:text-dark-text-primary">{t.home.countriesTitle}</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_COUNTRIES.map((country) => {
            const recipeCount = getRecipesForPlace(country.id, PLACES, RECIPES).length;
            const stateCount = PLACES.filter((p) => p.type === "estado" && p.countryCode === country.countryCode).length;
            const flag = country.countryCode === "MX" ? "🇲🇽" : 
                        country.countryCode === "US" ? "🇺🇸" :
                        country.countryCode === "IT" ? "🇮🇹" :
                        country.countryCode === "FR" ? "🇫🇷" :
                        country.countryCode === "ES" ? "🇪🇸" :
                        country.countryCode === "DE" ? "🇩🇪" :
                        country.countryCode === "GR" ? "🇬🇷" :
                        country.countryCode === "PT" ? "🇵🇹" :
                        country.countryCode === "JP" ? "🇯🇵" :
                        country.countryCode === "TH" ? "🇹🇭" : "🌍";
            
            return (
              <Link
                key={country.id}
                href={placeHrefFromSlugs(locale, [country.slug])}
                className="group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-card to-card-hover p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] dark:from-dark-bg-card dark:to-dark-bg-tertiary dark:border-dark-border"
              >
                <div className="absolute top-4 right-4 text-3xl opacity-20 transition-transform duration-300 group-hover:scale-110" aria-hidden>
                  {flag}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{flag}</span>
                    <h3 className="font-display text-xl font-semibold text-ink dark:text-dark-text-primary">{translatePlaceName(country, locale)}</h3>
                  </div>
                  <p className="mt-2 text-sm text-ink-soft dark:text-dark-text-secondary">
                    {recipeCount > 0 
                      ? t.home.countryCardWithRecipes(recipeCount, stateCount)
                      : t.home.countryCardComingSoon(stateCount)
                    }
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-terracota transition-transform duration-300 group-hover:translate-x-1">
                  {recipeCount > 0 ? t.home.exploreCountry : t.home.notifyMe} →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* PRÓXIMAMENTE - Solo si hay países sin recetas */}
      {ALL_COUNTRIES.some(c => getRecipesForPlace(c.id, PLACES, RECIPES).length === 0) && (
        <section className="reveal space-y-3 border-t border-line-soft pt-8 dark:border-dark-border/50" style={{ animationDelay: "160ms" }}>
          <p className="eyebrow text-terracota">{t.home.upcomingEyebrow}</p>
          <h2 className="font-display text-xl text-ink dark:text-dark-text-primary">{t.home.upcomingTitle}</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_COUNTRIES.filter(c => getRecipesForPlace(c.id, PLACES, RECIPES).length === 0).map((c) => (
              <Link
                key={c.id}
                href={placeHref(locale, c)}
                className="rounded-full border border-line bg-card px-4 py-2 text-sm text-ink-soft transition-all hover:-translate-y-0.5 hover:border-terracota/50 hover:text-ink dark:bg-dark-bg-tertiary dark:border-dark-border dark:text-dark-text-secondary dark:hover:border-dark-primary"
              >
                {translatePlaceName(c, locale)}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
