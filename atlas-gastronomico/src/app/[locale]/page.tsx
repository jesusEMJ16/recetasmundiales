import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Utensils } from "lucide-react";
import { WorldMap } from "../../components/WorldMap";
import { UniversalSearch } from "../../components/UniversalSearch";
import { PLACES } from "../../data/places";
import { RECIPES } from "../../data/recipes";
import { DESTINATION_PHOTOS } from "../../data/destination-photos";
import { FoodPhoto } from "../../components/FoodPhoto";
import { getRecipesForPlace } from "../../domain/places";
import { isLocale, locales } from "../../i18n/config";
import { getDictionary } from "../../i18n/dictionaries";
import { placeHref } from "../../i18n/routing";
import { translatePlaceName } from "../../i18n/content";

const ALL_COUNTRIES = PLACES.filter(p => p.type === "pais" && DESTINATION_PHOTOS[p.countryCode]);
export function generateStaticParams() { return locales.map(locale => ({ locale })); }

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  const countries = ALL_COUNTRIES.map(country => {
    const recipes = getRecipesForPlace(country.id, PLACES, RECIPES);
    return { country, recipes, photo: DESTINATION_PHOTOS[country.countryCode] };
  });
  return (
    <div>
      <section className="home-intro">
        <div>
          <p className="eyebrow text-agave-deep">{t.home.eyebrow}</p>
          <h1>{t.home.titleLead}<br /><em>{t.home.titleAccent}.</em></h1>
        </div>
        <div className="intro-search">
          <p>{locale === "es" ? "Un lugar, una historia, un sabor. Encuentra tu próxima receta en cualquier rincón del mundo." : locale === "en" ? "A place, a story, a flavor. Find your next recipe in any corner of the world." : t.home.subtitle}</p>
          <UniversalSearch />
        </div>
      </section>
      <WorldMap />
      <section className="destinations-section" id="destinations">
        <div className="section-heading">
          <div><p className="eyebrow">{t.home.countriesEyebrow}</p><h2>{t.home.countriesTitle}</h2></div>
          <span className="count-label">{t.place.recipes(RECIPES.length)}</span>
        </div>
        <div className="destination-grid">
          {countries.map(({ country, recipes, photo }) => (
            <Link key={country.id} href={placeHref(locale, country)} className="destination-card">
              <div className="destination-photo">
                {photo ? (
                  <FoodPhoto src={photo.url} alt={photo.dish} width={480} height={300} />
                ) : <div className="destination-placeholder"><Utensils size={42} strokeWidth={1.2} aria-hidden="true" /></div>}
                <span className="country-code" aria-hidden="true">{country.countryCode}</span>
              </div>
              <div className="destination-info">
                <h3>{translatePlaceName(country, locale)}</h3>
                <p>{recipes.length ? t.place.recipes(recipes.length) : t.home.upcomingEyebrow}</p>
                <span className="destination-action">{t.home.exploreCountry}<ArrowUpRight size={19} aria-hidden="true" /></span>
              </div>
            </Link>
          ))}
        </div>
        <details className="photo-credits">
          <summary>{t.recipe.photoCredit} · {t.recipe.sources}</summary>
          <p className="mt-2">{locale === "es" ? "Fotografías redimensionadas y recortadas para su presentación." : "Photographs resized and cropped for display."}</p>
          <ul>{countries.filter(c => c.photo).map(({ country, photo }) => <li key={country.id}>{translatePlaceName(country, locale)}: {photo!.author} · <a href={photo!.licenseUrl} target="_blank" rel="noreferrer">{photo!.license}</a> · <a href={photo!.source} target="_blank" rel="noreferrer">{t.recipe.sources}</a></li>)}</ul>
        </details>
      </section>
    </div>
  );
}
