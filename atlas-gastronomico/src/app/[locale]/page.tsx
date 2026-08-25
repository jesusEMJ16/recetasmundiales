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

const MX = PLACES.find((p) => p.id === "mx")!;
const OTHER_COUNTRIES = PLACES.filter((p) => p.type === "pais" && p.countryCode !== "MX");
const MX_RECIPES = getRecipesForPlace("mx", PLACES, RECIPES).length;
const MX_STATES = PLACES.filter((p) => p.type === "estado" && p.countryCode === "MX").length;

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
      <section className="reveal relative overflow-hidden rounded-[2rem] border border-line bg-card px-6 py-12 text-center shadow-[var(--shadow-card)] sm:px-10 sm:py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(600px 300px at 20% 0%, rgba(225,29,116,0.10), transparent 60%), radial-gradient(600px 300px at 90% 20%, rgba(217,154,0,0.14), transparent 60%)",
          }}
        />
        <div className="relative">
          <p className="eyebrow text-terracota">{t.home.eyebrow}</p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-5xl leading-[1.05] text-ink sm:text-6xl">
            {t.home.titleLead} <span className="deco-underline">{t.home.titleAccent}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink-soft">{t.home.subtitle}</p>
          <div className="mx-auto mt-7 max-w-xl">
            <UniversalSearch />
          </div>
          <p className="mt-6 text-sm text-ink-soft">{t.home.startingWith}</p>
        </div>
      </section>

      {/* MAPA */}
      <section className="reveal space-y-3" style={{ animationDelay: "80ms" }}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-terracota">{t.home.mapEyebrow}</p>
            <h2 className="font-display text-2xl text-ink">{t.home.mapTitle}</h2>
          </div>
          <Link href={placeHrefFromSlugs(locale, ["mexico"])} className="hidden text-sm font-medium text-terracota hover:underline sm:block">
            {t.home.mapDirect}
          </Link>
        </div>
        <WorldMap />
      </section>

      {/* MÉXICO DESTACADO */}
      <section className="reveal" style={{ animationDelay: "120ms" }}>
        <Link
          href={placeHrefFromSlugs(locale, ["mexico"])}
          className="group relative flex flex-col justify-between gap-6 overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-terracota to-terracota-deep p-8 text-paper shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-lift)] sm:flex-row sm:items-center sm:p-10"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{ background: "radial-gradient(400px 200px at 90% 10%, #fff, transparent 60%)" }}
          />
          <div className="relative">
            <p className="eyebrow text-paper/80">{t.home.mxEyebrow}</p>
            <h2 className="mt-2 font-display text-4xl leading-none">🇲🇽 {translatePlaceName(MX, locale)}</h2>
            <p className="mt-3 max-w-md text-paper/85">{t.home.mxBody(MX_RECIPES, MX_STATES)}</p>
          </div>
          <span className="relative inline-flex shrink-0 items-center gap-2 rounded-full bg-paper px-5 py-2.5 font-semibold text-terracota transition-transform duration-300 group-hover:translate-x-1">
            {t.home.mxCta}
          </span>
        </Link>
      </section>

      {/* PRÓXIMAMENTE */}
      {OTHER_COUNTRIES.length > 0 && (
        <section className="reveal space-y-3 border-t border-line-soft pt-8" style={{ animationDelay: "160ms" }}>
          <p className="eyebrow text-terracota">{t.home.upcomingEyebrow}</p>
          <h2 className="font-display text-xl text-ink">{t.home.upcomingTitle}</h2>
          <div className="flex flex-wrap gap-2">
            {OTHER_COUNTRIES.map((c) => (
              <Link
                key={c.id}
                href={placeHref(locale, c)}
                className="rounded-full border border-line bg-card px-4 py-2 text-sm text-ink-soft transition-all hover:-translate-y-0.5 hover:border-terracota/50 hover:text-ink"
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
