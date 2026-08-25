"use client";
import { usePathname } from "next/navigation";
import { defaultLocale, isLocale, type Locale } from "./config";

/** Lee el idioma actual del primer segmento de la URL (para componentes cliente). */
export function useLocale(): Locale {
  const pathname = usePathname();
  const seg = pathname.split("/")[1];
  return isLocale(seg) ? seg : defaultLocale;
}
