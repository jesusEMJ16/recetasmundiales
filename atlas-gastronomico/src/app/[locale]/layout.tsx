import { notFound } from "next/navigation";
import { SiteHeader } from "../../components/SiteHeader";
import { isLocale, locales } from "../../i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div className="min-h-screen">
      <SiteHeader locale={locale} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-6 text-center text-xs text-ink-faint">
        Atlas Gastronómico — recetas con procedencia. Fotos con licencia abierta (Wikimedia Commons).
      </footer>
    </div>
  );
}
