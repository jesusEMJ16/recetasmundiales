"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Compass, Globe2, Maximize2, Minimize2, ArrowUpRight } from "lucide-react";
import type { Map as LeafletMap, LayerGroup, GeoJSON as GeoJSONLayer } from "leaflet";
import type { FeatureCollection } from "geojson";
import { PLACES } from "../data/places";
import { RECIPES } from "../data/recipes";
import { getRecipesForPlace } from "../domain/places";
import { useLocale } from "../i18n/useLocale";
import { getDictionary } from "../i18n/dictionaries";
import { placeHref } from "../i18n/routing";
import { translatePlaceName } from "../i18n/content";
import type { Place } from "../domain/types";

const COUNTRIES = PLACES.filter(p => p.type === "pais");
const COUNTS = new Map(PLACES.map(p => [p.id, getRecipesForPlace(p.id, PLACES, RECIPES).length]));
// Load the base geography from this deployment: no tile service, API key or
// theme-dependent third-party request is needed to make the map visible.
const WORLD_BOUNDS: [[number, number], [number, number]] = [[-53, -170], [72, 179]];

export function WorldMap() {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const selectRef = useRef<(place: Place) => void>(() => {});
  const [selected, setSelected] = useState<Place | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const locale = useLocale();
  const t = getDictionary(locale);
  const es = locale === "es";
  const reset = useCallback(() => {
    setSelected(null);
    mapRef.current?.fitBounds(WORLD_BOUNDS, { padding: [24, 24], animate: false });
  }, []);
  const select = useCallback((place: Place) => {
    setSelected(place);
    const map = mapRef.current;
    if (map) {
      const zoom = place.type === "pais" ? (place.countryCode === "US" ? 3.5 : 4.5) : 7;
      map.setView([place.lat, place.lng], zoom, { animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches });
    }
  }, []);
  useEffect(() => { selectRef.current = select; }, [select]);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    let map: LeafletMap | undefined;
    let resize: ResizeObserver | undefined;
    async function initialize() {
      try {
        const [L, response] = await Promise.all([
          import("leaflet"),
          fetch("/geo/world-countries.geojson", { signal: controller.signal }),
        ]);
        if (!response.ok) throw new Error("Map data unavailable");
        const geography: FeatureCollection = await response.json();
        if (disposed || !container.current) return;
        map = L.map(container.current, {
          zoomControl: false, attributionControl: false,
          minZoom: 0, maxZoom: 9, zoomSnap: .25,
          scrollWheelZoom: false, maxBounds: [[-75, -200], [85, 200]],
          maxBoundsViscosity: 1,
        });
        mapRef.current = map;
        map.fitBounds(WORLD_BOUNDS, { padding: [24, 24] });
        L.control.zoom({ position: "topright", zoomInTitle: es ? "Acercar" : "Zoom in", zoomOutTitle: es ? "Alejar" : "Zoom out" }).addTo(map);
        L.geoJSON(geography, {
          style: feature => ({
            className: `map-land${COUNTRIES.some(c => c.countryCode === feature?.properties.code) ? " map-land-available" : ""}`,
            weight: 1, fillOpacity: 1,
          }),
          onEachFeature: (feature, layer) => {
            const place = COUNTRIES.find(c => c.countryCode === feature.properties.code);
            if (place) {
              const label = document.createElement("span");
              label.textContent = `${translatePlaceName(place, locale)} · ${t.place.recipes(COUNTS.get(place.id) ?? 0)}`;
              layer.bindTooltip(label, { sticky: true });
              layer.on("click", () => selectRef.current(place));
            }
          },
        }).addTo(map);

        const markers: LayerGroup = L.layerGroup().addTo(map);
        let mexico: GeoJSONLayer | null = null;
        const addMarker = (place: Place) => {
          const count = COUNTS.get(place.id) ?? 0;
          const name = translatePlaceName(place, locale);
          const el = document.createElement("div");
          el.className = "map-pin-inner";
          const code = document.createElement("span");
          code.textContent = place.type === "pais" ? place.countryCode : name;
          el.append(code);
          const total = document.createElement("small");
          total.textContent = String(count);
          el.append(total);
          const marker = L.marker([place.lat, place.lng], {
            icon: L.divIcon({ html: el, className: "map-pin", iconSize: [place.type === "pais" ? 64 : 135, 36], iconAnchor: [place.type === "pais" ? 32 : 67, 18] }),
            title: `${name} · ${t.place.recipes(count)}`, alt: name, keyboard: true,
          });
          marker.on("click", () => selectRef.current(place));
          markers.addLayer(marker);
        };
        const renderMarkers = () => {
          if (!map) return;
          markers.clearLayers();
          const zoom = map.getZoom();
          const candidates = zoom < 4.8 ? COUNTRIES : PLACES.filter(p => zoom < 6.8 ? p.type === "estado" || p.type === "region" : p.type !== "pais");
          // Keep a single marker per screen position; overlapping labels are
          // revealed as users zoom in. Every destination remains in the list.
          const occupied: { x: number; y: number }[] = [];
          candidates.filter(p => (COUNTS.get(p.id) ?? 0) > 0)
            .sort((a, b) => (COUNTS.get(b.id) ?? 0) - (COUNTS.get(a.id) ?? 0))
            .forEach(place => {
              if (!map!.getBounds().contains([place.lat, place.lng])) return;
              const point = map!.latLngToContainerPoint([place.lat, place.lng]);
              if (occupied.some(p => Math.abs(p.x - point.x) < (zoom < 4.8 ? 72 : 145) && Math.abs(p.y - point.y) < 42)) return;
              occupied.push(point);
              addMarker(place);
            });
          if (mexico) {
            if (zoom >= 4.8 && !map.hasLayer(mexico)) mexico.addTo(map);
            if (zoom < 4.8 && map.hasLayer(mexico)) map.removeLayer(mexico);
          }
        };
        map.on("moveend zoomend", renderMarkers);
        renderMarkers();
        resize = new ResizeObserver(() => { map?.invalidateSize({ pan: false }); });
        resize.observe(container.current);
        setStatus("ready");
        // Optional regional detail must not prevent the world map from loading.
        fetch("/geo/mexico-estados.geojson", { signal: controller.signal })
          .then(r => { if (!r.ok) throw new Error("No regional geography"); return r.json(); })
          .then(data => {
            if (disposed || !map) return;
            mexico = L.geoJSON(data, { interactive: false, style: { className: "map-state", weight: 1, fillOpacity: 0 } });
            renderMarkers();
          }).catch(() => { /* Country geometry and recipe markers remain usable. */ });
      } catch {
        if (!disposed) setStatus("error");
      }
    }
    void initialize();
    return () => {
      disposed = true;
      controller.abort();
      resize?.disconnect();
      map?.remove();
      mapRef.current = null;
    };
  }, [locale, es, t, attempt]);

  return (
    <section className={`atlas${expanded ? " atlas-expanded" : ""}`} aria-label={t.home.mapTitle}>
      <div className="atlas-toolbar">
        <div className="atlas-title"><Compass size={20} aria-hidden="true" />{t.home.mapTitle}</div>
        <div className="atlas-actions">
          <button className="atlas-reset" type="button" onClick={reset} disabled={status !== "ready"}><Globe2 size={16} aria-hidden="true" />{t.map.reset.replace(/^\S+\s/, "")}</button>
          <button className="icon-button" type="button" onClick={() => setExpanded(v => !v)} aria-pressed={expanded} aria-label={es ? (expanded ? "Reducir mapa" : "Ampliar mapa") : (expanded ? "Reduce map" : "Expand map")}>
            {expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </div>
      </div>
      <div className="atlas-content">
        <div className="atlas-viewport">
          <div ref={container} className="atlas-map" aria-label={es ? "Mapa mundial. Usa las flechas para moverte y los controles para acercar." : "World map. Use arrow keys to pan and the controls to zoom."} />
          {status !== "ready" && <div className="map-status" role="status">
            <Globe2 size={32} aria-hidden="true" />
            <p>{status === "error" ? (es ? "No pudimos cargar el mapa. Puedes explorar los destinos de la lista." : "The map could not load. You can still explore the destination list.") : (es ? "Preparando tu próxima parada…" : "Preparing your next destination…")}</p>
            {status === "error" && <button type="button" onClick={() => { setStatus("loading"); setAttempt(v => v + 1); }}>{es ? "Reintentar" : "Try again"}</button>}
          </div>}
        </div>
        <aside className="atlas-sidebar" aria-label={t.home.countriesTitle}>
          <div className="atlas-sidebar-heading"><h3>{t.home.countriesEyebrow}</h3><p>{es ? "Elige dónde empieza tu viaje" : "Choose where your journey begins"}</p></div>
          <div className="atlas-country-list">
            {COUNTRIES.map(country => <button type="button" key={country.id} className="atlas-country" aria-pressed={selected?.countryCode === country.countryCode} onClick={() => select(country)}>
              <span className="atlas-country-code" aria-hidden="true">{country.countryCode}</span>
              <span className="atlas-country-name">{translatePlaceName(country, locale)}</span>
              <span className="atlas-country-count" aria-label={t.place.recipes(COUNTS.get(country.id) ?? 0)}>{COUNTS.get(country.id) ?? 0}</span>
            </button>)}
          </div>
          <div className="atlas-selection" aria-live="polite">
            {selected ? <>
              <strong>{translatePlaceName(selected, locale)}</strong>
              <p>{t.place.recipes(COUNTS.get(selected.id) ?? 0)}</p>
              <Link className="primary-button" href={placeHref(locale, selected)}>{t.home.exploreCountry}<ArrowUpRight size={17} aria-hidden="true" /></Link>
            </> : <><strong>{es ? "Del mapa a tu mesa." : "From the map to your table."}</strong><p>{es ? "Selecciona un destino y descubre sus sabores." : "Select a destination and discover its flavors."}</p></>}
          </div>
        </aside>
      </div>
      <div className="atlas-caption"><span>{es ? "Arrastra para explorar · Acerca para descubrir regiones" : "Drag to explore · Zoom in to discover regions"}</span><span>© <a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a></span></div>
    </section>
  );
}
