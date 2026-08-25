"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { PLACES } from "../data/places";
import { getChildren } from "../domain/places";
import { useLocale } from "../i18n/useLocale";
import { getDictionary } from "../i18n/dictionaries";
import { placeHref } from "../i18n/routing";
import { translatePlaceName } from "../i18n/content";

const COUNTRIES = PLACES.filter((p) => p.type === "pais");
const MX_STATES = PLACES.filter((p) => p.type === "estado" && p.countryCode === "MX");

function countryPill(name: string, featured: boolean) {
  const el = document.createElement("button");
  el.textContent = name;
  el.style.cssText = [
    "font-family:var(--font-body,sans-serif)", "font-size:13px", "font-weight:700", "white-space:nowrap",
    "padding:6px 12px", "border-radius:9999px", "cursor:pointer",
    `background:${featured ? "#e11d74" : "#fffdf8"}`, `color:${featured ? "#fff" : "#241b16"}`,
    `border:2px solid ${featured ? "#96330a" : "#c1440e"}`, "box-shadow:0 4px 12px -4px rgba(36,27,22,0.45)",
    "transition:transform .15s ease",
  ].join(";");
  el.onmouseenter = () => (el.style.transform = "scale(1.08)");
  el.onmouseleave = () => (el.style.transform = "scale(1)");
  return el;
}

export function WorldMap() {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const router = useRouter();
  const locale = useLocale();
  const t = getDictionary(locale).map;

  useEffect(() => {
    if (!ref.current) return;

    // nombre del estado (como viene en el GeoJSON) -> href de su página
    const nameToHref = new Map<string, string>();
    const nameToLabel = new Map<string, string>();
    for (const s of MX_STATES) {
      nameToHref.set(s.name, placeHref(locale, s));
      nameToLabel.set(s.name, translatePlaceName(s, locale));
    }
    const edomex = MX_STATES.find((s) => s.id === "mx-mex");
    if (edomex) {
      nameToHref.set("México", placeHref(locale, edomex)); // GeoJSON usa "México"
      nameToLabel.set("México", translatePlaceName(edomex, locale));
    }

    const map = new maplibregl.Map({
      container: ref.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [-102, 23.5],
      zoom: 4.2,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }));

    // Marcadores de país (para navegar a "todas las recetas" del país)
    const countryMarkers: maplibregl.Marker[] = [];
    COUNTRIES.forEach((c) => {
      const cname = translatePlaceName(c, locale);
      const el = countryPill(cname, c.countryCode === "MX");
      el.title = cname;
      el.onclick = () => router.push(placeHref(locale, c));
      countryMarkers.push(new maplibregl.Marker({ element: el }).setLngLat([c.lng, c.lat]).addTo(map));
    });

    function updateCountryMarkers() {
      const show = map.getZoom() < 3.8; // en vista mundial se ven los países
      countryMarkers.forEach((m) => (m.getElement().style.display = show ? "" : "none"));
    }

    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 8 });
    let hovered: string | number | undefined;

    function addStateBorders() {
      if (map.getSource("mx-estados")) return;
      map.addSource("mx-estados", {
        type: "geojson",
        data: "/geo/mexico-estados.geojson",
        generateId: true,
      });
      // Relleno (sutil, se ilumina al pasar el cursor)
      map.addLayer({
        id: "mx-fill",
        type: "fill",
        source: "mx-estados",
        paint: {
          "fill-color": "#c1440e",
          "fill-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 0.28, 0.08],
        },
      });
      // Líneas divisorias entre estados
      map.addLayer({
        id: "mx-line",
        type: "line",
        source: "mx-estados",
        paint: { "line-color": "#96330a", "line-width": ["case", ["boolean", ["feature-state", "hover"], false], 2.2, 1] },
      });

      map.on("mousemove", "mx-fill", (e) => {
        map.getCanvas().style.cursor = "pointer";
        const f = e.features?.[0];
        if (!f) return;
        if (hovered !== undefined) map.setFeatureState({ source: "mx-estados", id: hovered }, { hover: false });
        hovered = f.id;
        map.setFeatureState({ source: "mx-estados", id: hovered! }, { hover: true });
        const name = f.properties?.name as string;
        const label = nameToLabel.get(name) ?? name;
        popup.setLngLat(e.lngLat).setHTML(`<strong style="font-family:sans-serif">${label}</strong>`).addTo(map);
      });
      map.on("mouseleave", "mx-fill", () => {
        map.getCanvas().style.cursor = "";
        if (hovered !== undefined) map.setFeatureState({ source: "mx-estados", id: hovered }, { hover: false });
        hovered = undefined;
        popup.remove();
      });
      map.on("click", "mx-fill", (e) => {
        const name = e.features?.[0]?.properties?.name as string;
        const href = name && nameToHref.get(name);
        if (href) router.push(href);
      });

      updateCountryMarkers();
    }

    if (map.isStyleLoaded()) addStateBorders();
    else map.on("load", addStateBorders);

    map.on("zoom", updateCountryMarkers);

    return () => {
      popup.remove();
      map.remove();
    };
  }, [router, locale]);

  return (
    <div className="relative">
      <div ref={ref} className="h-[460px] w-full overflow-hidden rounded-[var(--radius-xl2)] border border-line shadow-[var(--shadow-card)]" />
      <div className="absolute left-3 top-3 flex gap-2">
        <button
          onClick={() => mapRef.current?.flyTo({ center: [-102, 23.5], zoom: 4.2, duration: 800 })}
          className="rounded-full border border-line bg-card/90 px-3 py-1.5 text-xs font-semibold text-ink-soft shadow-[var(--shadow-card)] backdrop-blur transition-colors hover:text-terracota"
        >
          🍽️ México
        </button>
        <button
          onClick={() => mapRef.current?.flyTo({ center: [-40, 25], zoom: 1.6, duration: 900 })}
          className="rounded-full border border-line bg-card/90 px-3 py-1.5 text-xs font-semibold text-ink-soft shadow-[var(--shadow-card)] backdrop-blur transition-colors hover:text-terracota"
        >
          {t.reset}
        </button>
      </div>
      <p className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1.5 text-xs text-ink-soft shadow-[var(--shadow-card)] backdrop-blur">
        {t.hint}
      </p>
    </div>
  );
}
