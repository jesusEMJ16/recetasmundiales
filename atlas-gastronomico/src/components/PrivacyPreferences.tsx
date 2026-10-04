"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Locale } from "../i18n/config";
import { trustUi, informationHref } from "../i18n/trust-ui";
import { GA_MEASUREMENT_ID } from "../site";

const KEY = "worldbites-analytics-v1";
const EVENT = "worldbites-privacy-change";
type Choice = "accepted" | "declined" | null;

function readChoice(): Choice {
  try {
    const value = localStorage.getItem(KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch { return null; }
}
function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(EVENT, callback); window.removeEventListener("storage", callback); };
}
export function useAnalyticsChoice() { return useSyncExternalStore(subscribe, readChoice, () => null); }

export function forgetAnalyticsCookies() {
  const domains = ["", location.hostname, `.${location.hostname}`];
  if (location.hostname.endsWith(".worldbitesapp.com")) domains.push(".worldbitesapp.com");
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!name.startsWith("_ga")) continue;
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${domain};` : ""}`;
  }
}

export function PrivacyPreferences({ locale }: { locale: Locale }) {
  const choice = useAnalyticsChoice();
  const [editing, setEditing] = useState(false);
  const ui = trustUi[locale];

  function choose(value: Exclude<Choice, null>) {
    const wasAccepted = choice === "accepted";
    try { localStorage.setItem(KEY, value); } catch { /* Optional tracking stays off if storage is unavailable. */ }
    window.dispatchEvent(new Event(EVENT));
    setEditing(false);
    if (value === "declined") {
      (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = true;
      forgetAnalyticsCookies();
      if (wasAccepted) window.location.reload();
    } else {
      (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] = false;
    }
  }

  return <div className="privacy-preferences">
    <button type="button" className="text-sm underline" onClick={() => setEditing(value => !value)} aria-expanded={choice === null || editing}>{ui.preferences}</button>
    {(choice === null || editing) && <section className="privacy-choice" aria-label={ui.preferences}>
      <p className="text-sm leading-relaxed">{ui.analyticsNotice} <Link href={informationHref(locale, "privacidad")} className="underline">{ui.privacy}</Link></p>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" onClick={() => choose("declined")} className="rounded-full border border-line px-4 py-2 text-sm">{ui.decline}</button>
        <button type="button" onClick={() => choose("accepted")} className="rounded-full border border-line px-4 py-2 text-sm">{ui.accept}</button>
      </div>
    </section>}
  </div>;
}
