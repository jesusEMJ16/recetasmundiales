import Link from "next/link";
import type { Locale } from "../i18n/config";
import { trustUi, informationHref } from "../i18n/trust-ui";
import { getDictionary } from "../i18n/dictionaries";
import { PrivacyPreferences } from "./PrivacyPreferences";

export function SiteFooter({ locale }: { locale: Locale }) {
  const ui = trustUi[locale];
  return <footer className="site-footer">
    <div><strong>WorldBites.</strong><p>{getDictionary(locale).header.tagline}</p></div>
    <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="WorldBites">
      <Link href={informationHref(locale, "acerca-de")}>{ui.about}</Link>
      <Link href={informationHref(locale, "politica-editorial")}>{ui.editorial}</Link>
      <Link href={informationHref(locale, "contacto")}>{ui.contact}</Link>
      <Link href={informationHref(locale, "privacidad")}>{ui.privacy}</Link>
    </nav>
    <PrivacyPreferences locale={locale} />
  </footer>;
}
