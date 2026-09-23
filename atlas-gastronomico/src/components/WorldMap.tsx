"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Globe2, Maximize2, Minimize2, ArrowUpRight, Search } from "lucide-react";
import type { Map as LeafletMap, LayerGroup, GeoJSON as GeoJSONLayer, Path } from "leaflet";
import type { FeatureCollection } from "geojson";
import { PLACES } from "../data/places";
import ATLAS from "../data/world-atlas.json";
import COUNTRY_LABELS from "../data/country-labels.json";
import { RECIPES } from "../data/recipes";
import { buildRecipeCounts } from "../domain/atlas";
import { useLocale } from "../i18n/useLocale";
import { getDictionary } from "../i18n/dictionaries";
import { placeHref } from "../i18n/routing";
import { translatePlaceName } from "../i18n/content";
import type { Place } from "../domain/types";

const BY_ID = new Map(PLACES.map(p => [p.id, p]));
const COUNTRIES = ATLAS.map(c => BY_ID.get(c.id)!);
const COUNTS = buildRecipeCounts(PLACES, RECIPES);
const INDEX = new Map(ATLAS.map(c => [c.id, c]));
const LABELS: Record<string, { lat: number; lng: number; radius: number }> = COUNTRY_LABELS;
const WORLD_BOUNDS: [[number, number], [number, number]] = [[-53, -170], [74, 179]];
const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export function WorldMap({ initialCountryCode }: { initialCountryCode?: string } = {}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const worldMarkers = useRef<LayerGroup | null>(null);
  const regionCache = useRef(new Map<string, FeatureCollection>());
  const initialCountry = ATLAS.find(c => c.code === initialCountryCode)?.id ?? null;
  const activeId = useRef<string | null>(initialCountry);
  const initialRegionView = useRef(Boolean(initialCountry));
  const [selectedId, setSelectedId] = useState<string | null>(initialCountry);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [regionStatus, setRegionStatus] = useState<"loading" | "ready" | "error">("ready");
  const [version, setVersion] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [regionAttempt, setRegionAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const locale = useLocale();
  const router = useRouter();
  const t = getDictionary(locale);
  const es = locale === "es";
  const selected = selectedId ? BY_ID.get(selectedId)! : null;
    const selectCountry = useCallback((id: string | null) => {
    activeId.current = id;
    setSelectedId(id);
    setQuery("");
  }, []);
  const items = useMemo(() => {
    const places = COUNTRIES;
    return places.filter(p => normalize(translatePlaceName(p, locale)).includes(normalize(query)) || p.countryCode.toLowerCase() === query.toLowerCase())
      .sort((a,b) => (COUNTS.get(b.id)! - COUNTS.get(a.id)!) || translatePlaceName(a,locale).localeCompare(translatePlaceName(b,locale),locale));
  }, [query, locale]);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    let map: LeafletMap | undefined;
    let resize: ResizeObserver | undefined;
    async function initialize() {
      try {
        const [L, response] = await Promise.all([import("leaflet"), fetch("/geo/world-countries.geojson", { signal: controller.signal })]);
        if (!response.ok) throw new Error("Map data unavailable");
        const data: FeatureCollection = await response.json();
        if (disposed || !container.current) return;
        map = L.map(container.current, { zoomControl: false, attributionControl: false, minZoom: 0, maxZoom: 14, zoomSnap: .25, scrollWheelZoom: false, maxBounds: [[-80,-200],[86,200]], maxBoundsViscosity: 1 });
        mapRef.current = map;
        map.fitBounds(initialCountry ? INDEX.get(initialCountry)!.bounds as [[number,number],[number,number]] : WORLD_BOUNDS, { padding: [20,20], maxZoom: initialCountry ? 10 : undefined });
        L.control.zoom({ position: "topright", zoomInTitle: es ? "Acercar" : "Zoom in", zoomOutTitle: es ? "Alejar" : "Zoom out" }).addTo(map);
        L.geoJSON(data, {
          style: feature => ({ className: `map-land${feature?.properties.selectable === false ? "" : " map-land-available"}`, weight: 1, fillOpacity: 1 }),
          onEachFeature: (feature, layer) => {
            const country = COUNTRIES.find(c => c.countryCode === feature.properties.code);
            if (!country) return;
            const label = document.createElement("span");
            label.textContent = `${translatePlaceName(country,locale)} · ${t.place.recipes(COUNTS.get(country.id) ?? 0)}`;
            layer.bindTooltip(label, { sticky: true });
            layer.on("click", () => selectCountry(country.id));
            layer.on("add", () => {
              const element = (layer as Path).getElement();
              if (!element) return;
              element.setAttribute("tabindex", "0");
              element.setAttribute("role", "button");
              element.setAttribute("aria-label", label.textContent!);
              element.setAttribute("data-country", country.countryCode);
              element.addEventListener("keydown", event => {
                if (["Enter", " "].includes((event as KeyboardEvent).key)) {
                  event.preventDefault();
                  selectCountry(country.id);
                }
              });
              element.addEventListener("focus", () => layer.openTooltip());
              element.addEventListener("blur", () => layer.closeTooltip());
            });
          },
        }).addTo(map);
        const markers = L.layerGroup().addTo(map);
        worldMarkers.current = markers;
        const renderWorld = () => {
          markers.clearLayers();
          if (!map || activeId.current) return;
          for (const country of COUNTRIES) {
            const anchor = LABELS[country.countryCode];
            if (!anchor || !map.getBounds().contains([anchor.lat, anchor.lng])) continue;
            // The entire two-line label fits inside an inscribed land circle.
            // Small countries reveal their labels on zoom instead of pushing
            // text into their neighbours or replacing it with floating dots.
            const scale = Math.min(1, anchor.radius * 2 ** map.getZoom() / 15);
            if (scale < .73) continue;
            const el = document.createElement("div");
            el.className = "map-country-text";
            el.style.setProperty("--label-scale", String(scale));
            el.setAttribute("aria-hidden", "true");
            const code = document.createElement("span");
            code.textContent = country.countryCode;
            const total = document.createElement("small");
            total.textContent = String(COUNTS.get(country.id) ?? 0);
            el.append(code, total);
            L.marker([anchor.lat, anchor.lng], {
              icon: L.divIcon({ html: el, className: "map-country-label", iconSize: [20, 22], iconAnchor: [10, 11] }),
              interactive: false,
              keyboard: false,
            }).addTo(markers);
          }
        };
        map.on("moveend zoomend resize", renderWorld);
        renderWorld();
        resize = new ResizeObserver(() => map?.invalidateSize({pan:false}));
        resize.observe(container.current);
        setStatus("ready");
        setVersion(v => v+1);
      } catch { if (!disposed) setStatus("error"); }
    }
    void initialize();
    return () => { disposed=true; controller.abort(); resize?.disconnect(); map?.remove(); mapRef.current=null; worldMarkers.current=null; };
  }, [locale, es, t, selectCountry, attempt, initialCountry]);

  useEffect(() => {
    const currentMap=mapRef.current;
    if (!currentMap) return;
    const map: LeafletMap = currentMap;
    const controller=new AbortController();
    let disposed=false;
    let regions: GeoJSONLayer | undefined;
    let labels: LayerGroup | undefined;
    let updateLabels: (()=>void) | undefined;
    map.setMaxBounds([[-80,-200],[86,selectedId === "ki" ? 240 : 200]]);
    if (!selectedId) {
      map.fitBounds(WORLD_BOUNDS,{padding:[20,20],animate:false});
      map.fire("moveend");
      return;
    }
    const country=BY_ID.get(selectedId)!;
    const info=INDEX.get(selectedId)!;
    worldMarkers.current?.clearLayers();
    if (initialRegionView.current) initialRegionView.current = false;
    else map.flyToBounds(info.bounds as [[number,number],[number,number]], {padding:[32,32],maxZoom:10,duration:.65,animate:!window.matchMedia("(prefers-reduced-motion: reduce)").matches});
    async function showRegions() {
      try {
        const L=await import("leaflet");
        if (disposed) return;
        setRegionStatus("loading");
        let data=regionCache.current.get(country.countryCode);
        if (!data) {
          const response=await fetch(`/geo/regions/${country.countryCode}.geojson`,{signal:controller.signal});
          if (!response.ok) throw new Error("Region geography unavailable");
          data=await response.json() as FeatureCollection;
          regionCache.current.set(country.countryCode,data);
        }
        if (disposed) return;
        const go=(place:Place) => router.push(placeHref(locale,place));
        regions=L.geoJSON(data, {
          style:{className:"map-region",weight:1.3,fillOpacity:.8},
          onEachFeature:(feature,layer) => {
            const region=BY_ID.get(feature.properties.id);
            if (!region) return;
            const text=`${translatePlaceName(region,locale)} · ${t.place.recipes(COUNTS.get(region.id) ?? 0)}`;
            const tooltip=document.createElement("span");tooltip.textContent=text;
            layer.bindTooltip(tooltip,{sticky:true});
            layer.on("click",()=>go(region));
            layer.on("add",()=>{
              const element=(layer as Path).getElement();
              if(element){element.setAttribute("tabindex","0");element.setAttribute("role","link");element.setAttribute("aria-label",text);element.addEventListener("keydown",event=>{if((event as KeyboardEvent).key==="Enter"){event.preventDefault();go(region);}});element.addEventListener("focus",()=>layer.openTooltip());element.addEventListener("blur",()=>layer.closeTooltip());}
            });
          },
        }).addTo(map);
        labels=L.layerGroup().addTo(map);
        updateLabels=()=>{
          if(disposed || !labels) return;
          labels.clearLayers();
          const used:{x:number;y:number}[]=[];
          const size=map.getSize();
          const regionalPlaces=info.regions.map(id=>BY_ID.get(id)!).sort((a,b)=>(COUNTS.get(b.id) ?? 0)-(COUNTS.get(a.id) ?? 0));
          for(const place of regionalPlaces){
            const feature=data!.features.find(f=>f.properties?.id===place.id);
            const anchor:[number,number]=[feature?.properties?.lat ?? place.lat,feature?.properties?.lng ?? place.lng];
            if(!map.getBounds().contains(anchor))continue;
            const point=map.latLngToContainerPoint(anchor);
            // Keep each label at its geographic anchor; tight regions reveal
            // their full name and count through the polygon tooltip and focus.
            if(point.x<20 || point.x>size.x-20 || point.y<20 || point.y>size.y-20
              || (point.x>size.x-72 && point.y<115)
              || used.some(p=>Math.abs(p.x-point.x)<34 && Math.abs(p.y-point.y)<30))continue;
            used.push(point);
            const el=document.createElement("div");
            el.className="map-region-inline";
            el.setAttribute("aria-hidden","true");
            const code=document.createElement("span");
            code.textContent=place.id.split("-").slice(1).join("-").toUpperCase().slice(0,5);
            const number=document.createElement("small");
            number.textContent=String(COUNTS.get(place.id) ?? 0);
            el.append(code,number);
            L.marker(anchor,{icon:L.divIcon({html:el,className:"map-region-marker",iconSize:[40,30],iconAnchor:[20,15]}),interactive:false,keyboard:false}).addTo(labels);
          }
        };
        map.on("moveend zoomend resize",updateLabels);
        updateLabels();
        setRegionStatus("ready");
      }catch{if(!disposed)setRegionStatus("error");}
    }
    void showRegions();
    return ()=>{disposed=true;controller.abort();if(updateLabels)map.off("moveend zoomend resize",updateLabels);regions?.remove();labels?.remove();};
  }, [selectedId,version,locale,t,router,regionAttempt,initialCountry]);

  return (
    <section className={`atlas atlas-drilldown${selected ? " atlas-has-selection" : ""}${expanded ? " atlas-expanded" : ""}`} aria-label={t.home.mapTitle}>
      <div className="atlas-toolbar">
        <div className="atlas-title"><Compass size={20} aria-hidden="true" />{selected ? translatePlaceName(selected,locale) : t.home.mapTitle}<span className="atlas-total">{selected ? t.place.recipes(COUNTS.get(selected.id) ?? 0) : `195 ${es?"países":"countries"}`}</span></div>
        <div className="atlas-actions">
          {selected && <Link className="atlas-recipes-link" href={placeHref(locale,selected)}>{es?"Todas las recetas":"All recipes"}<ArrowUpRight size={15} aria-hidden="true"/></Link>}
          <button className="atlas-reset" type="button" onClick={()=>selectCountry(null)} disabled={status!=="ready"}><Globe2 size={16} aria-hidden="true" />{t.map.reset.replace(/^\S+\s/,"")}</button>
          <button className="icon-button" type="button" onClick={()=>setExpanded(v=>!v)} aria-pressed={expanded} aria-label={es?(expanded?"Reducir mapa":"Ampliar mapa"):(expanded?"Reduce map":"Expand map")}>{expanded?<Minimize2 size={17}/>:<Maximize2 size={17}/>}</button>
        </div>
      </div>
      <div className="atlas-content">
        <div className="atlas-viewport">
          <div ref={container} className="atlas-map" aria-label={es?"Mapa mundial. Selecciona un país para ver sus regiones y recetas.":"World map. Select a country to see its regions and recipes."}/>
          {status!=="ready" && <div className="map-status" role="status"><Globe2 size={32}/><p>{status==="error"?(es?"No pudimos cargar el mapa. Los destinos siguen disponibles en la lista.":"The map could not load. Destinations remain available in the list."):(es?"Preparando tu próxima parada…":"Preparing your next destination…")}</p>{status==="error"&&<button onClick={()=>{setStatus("loading");setAttempt(v=>v+1);}}>{es?"Reintentar":"Try again"}</button>}</div>}
          {selected && status==="ready" && regionStatus!=="ready" && <div className="atlas-region-status" role="status">{regionStatus==="loading"?(es?"Cargando regiones…":"Loading regions…"):<>{es?"No se cargaron los límites regionales. Reintenta.":"Regional boundaries could not load. Try again."}<button onClick={()=>setRegionAttempt(v=>v+1)}>{es?"Reintentar":"Try again"}</button></>}</div>}
        </div>
        {!selected && <aside className="atlas-sidebar" aria-label={t.home.countriesTitle}>
          <div className="atlas-sidebar-heading">
            <h3>{t.home.countriesEyebrow}</h3>
            <p>{es?"195 países · con o sin recetas":"195 countries · with or without recipes"}</p>
            <label className="atlas-list-search"><Search size={16} aria-hidden="true"/><input value={query} onChange={e=>setQuery(e.target.value)} aria-label={es?"Buscar país":"Search country"} placeholder={es?"Buscar país…":"Search country…"}/></label>
          </div>
          <div className="atlas-country-list">
            {items.map(place=><button type="button" key={place.id} className="atlas-country" onClick={()=>selectCountry(place.id)}>
              <span className="atlas-country-code" aria-hidden="true">{place.countryCode}</span>
              <span className="atlas-country-name">{translatePlaceName(place,locale)}</span>
              <span className="atlas-country-count" aria-label={t.place.recipes(COUNTS.get(place.id) ?? 0)}>{COUNTS.get(place.id) ?? 0}</span>
            </button>)}
            {items.length===0&&<p className="atlas-list-empty">{t.place.empty}</p>}
          </div>
          <div className="atlas-selection"><strong>{es?"Del mapa a tu mesa.":"From the map to your table."}</strong><p>{es?"Elige un país. Después, una región.":"Choose a country. Then a region."}</p></div>
        </aside>
      </div>
      <div className="atlas-caption"><span>{selected?(es?"Pulsa una región del mapa para abrir sus recetas; acerca el mapa para ver más abreviaturas":"Select a region on the map to open its recipes; zoom in for more abbreviations"):(es?"Selecciona cualquier país para acercarte y ver sus regiones":"Select any country to zoom in and see its regions")}</span><span><a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a>{selected && ["KI","TV"].includes(selected.countryCode) && <> · <a href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer">geoBoundaries</a> / © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a></>} · <a href="/geo/world-countries.LICENSE.txt" target="_blank" rel="noreferrer">{es?"Fuentes":"Sources"}</a></span></div>
    </section>
  );
}
