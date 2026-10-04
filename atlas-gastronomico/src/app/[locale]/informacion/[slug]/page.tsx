import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteInformation, informationSlugs, informationUpdatedAt, correctionUrl, type InformationSlug } from "../../../../data/site-information";
import { isLocale, locales } from "../../../../i18n/config";
import { informationLocale, informationHref, trustUi } from "../../../../i18n/trust-ui";
import { translationPending } from "../../../../i18n/recipe-editorial-ui";
import { absoluteUrl } from "../../../../site";

type Props = { params: Promise<{ locale: string; slug: string }> };
function isInformationSlug(slug: string): slug is InformationSlug { return informationSlugs.includes(slug as InformationSlug); }

export function generateStaticParams() { return locales.flatMap(locale => informationSlugs.map(slug => ({ locale, slug }))); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isInformationSlug(slug)) return {};
  const page = siteInformation[informationLocale(locale)][slug];
  return {
    title: page.title, description: page.intro,
    robots: { index: locale === "es" || locale === "en", follow: true },
    alternates: { canonical: absoluteUrl(informationHref(locale, slug)), languages: {
      es: absoluteUrl(informationHref("es", slug)), en: absoluteUrl(informationHref("en", slug)),
    } },
  };
}

export default async function InformationPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isInformationSlug(slug)) notFound();
  const contentLocale = informationLocale(locale);
  const page = siteInformation[contentLocale][slug];
  return <article lang={contentLocale} dir="ltr" className="mx-auto max-w-3xl space-y-7 py-8">
    {locale !== contentLocale && <p lang={locale} className="text-sm text-ink-soft">{translationPending[locale]}</p>}
    <header className="space-y-3">
      <h1 className="font-display text-4xl text-ink">{page.title}</h1>
      <p className="text-lg leading-relaxed text-ink-soft">{page.intro}</p>
      <p className="text-sm text-ink-faint">{contentLocale === "es" ? "Actualizado" : "Updated"}: <time dateTime={informationUpdatedAt}>{informationUpdatedAt}</time></p>
    </header>
    {page.sections.map(section => <section key={section.title} className="space-y-3">
      <h2 className="font-display text-2xl text-ink">{section.title}</h2>
      {section.paragraphs.map(paragraph => <p key={paragraph} className="leading-relaxed text-ink-soft">{paragraph}</p>)}
    </section>)}
    {slug === "contacto" && <a href={correctionUrl} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full bg-agave px-5 py-3 text-white">{contentLocale === "es" ? "Abrir una incidencia en GitHub" : "Open an issue on GitHub"} ↗</a>}
    {slug === "privacidad" && <div className="flex flex-wrap gap-4 text-sm underline">
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google</a>
      <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer">Netlify</a>
      <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noopener noreferrer">GitHub</a>
    </div>}
    <nav className="flex flex-wrap gap-4 border-t border-line pt-5 text-sm underline">
      <Link href={informationHref(locale, "politica-editorial")}>{trustUi[contentLocale].editorial}</Link>
      <Link href={informationHref(locale, "contacto")}>{trustUi[contentLocale].contact}</Link>
    </nav>
  </article>;
}
