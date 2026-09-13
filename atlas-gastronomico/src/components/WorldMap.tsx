"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, Globe2, Maximize2, Minimize2, ArrowUpRight, ArrowLeft, Search } from "lucide-react";
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

export function WorldMap() {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const worldMarkers = useRef<LayerGroup | null>(null);
  const regionCache = useRef(new Map<string, FeatureCollection>());
  const activeId = useRef<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
  const regionIds = selectedId ? INDEX.get(selectedId)?.regions ?? [] : [];
  const selectCountry = useCallback((id: string | null) => {
    activeId.current = id;
    setSelectedId(id);
    setQuery("");
  }, []);
  const items = useMemo(() => {
    const places = selectedId ? (INDEX.get(selectedId)?.regions ?? []).map(id => BY_ID.get(id)!) : COUNTRIES;
    return places.filter(p => normalize(translatePlaceName(p, locale)).includes(normalize(query)) || p.countryCode.toLowerCase() === query.toLowerCase())
      .sort((a,b) => selectedId ? translatePlaceName(a,locale).localeCompare(translatePlaceName(b,locale),locale) : (COUNTS.get(b.id)! - COUNTS.get(a.id)!) || translatePlaceName(a,locale).localeCompare(translatePlaceName(b,locale),locale));
  }, [selectedId, query, locale]);

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
        map.fitBounds(WORLD_BOUNDS, { padding: [20,20] });
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
  }, [locale, es, t, selectCountry, attempt]);

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
    map.flyToBounds(info.bounds as [[number,number],[number,number]], {padding:[32,32],maxZoom:10,duration:.65,animate:!window.matchMedia("(prefers-reduced-motion: reduce)").matches});
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
              if(element){element.setAttribute("tabindex","0");element.setAttribute("role","link");element.setAttribute("aria-label",text);element.addEventListener("keydown",event=>{if((event as KeyboardEvent).key==="Enter"){event.preventDefault();go(region);}});}
            });
          },
        }).addTo(map);
        labels=L.layerGroup().addTo(map);
        updateLabels=()=>{
          if(disposed || !labels) return;
          labels.clearLayers();
          const used:{x:number;y:number;w:number}[]=[];
          const size=map.getSize();
          const regionalPlaces=info.regions.map(id=>BY_ID.get(id)!).sort((a,b)=>COUNTS.get(b.id)!-COUNTS.get(a.id)!);
          for(const place of regionalPlaces){
            const f=data!.features.find(f=>f.properties?.id===place.id);
            const anchor:[number,number]=[f?.properties?.lat ?? place.lat,f?.properties?.lng ?? place.lng];
            if(!map.getBounds().contains(anchor))continue;
            const point=map.latLngToContainerPoint(anchor);
            const name=translatePlaceName(place,locale);
            const count=COUNTS.get(place.id) ?? 0;
            const w=Math.min(230,Math.max(110,name.length*7+String(count).length*9+25));
            const fits=(x:number,y:number)=>x>=w/2+6 && x<=size.x-w/2-6 && y>=24 && y<=size.y-24 && !(x>size.x-75&&y<120) && !used.some(p=>Math.abs(p.x-x)<(p.w+w)/2+6&&Math.abs(p.y-y)<39);
            let position:{x:number;y:number}|null=null;
            // Spread labels into nearby free space with leaders, so small states
            // such as CDMX and Tlaxcala remain readable at the country overview.
            for(let r=0;r<=(regionalPlaces.length<=60?240:0)&&!position;r+=20){
              for(let angle=0;angle<360;angle+=30){const x=point.x+Math.cos(angle*Math.PI/180)*r,y=point.y+Math.sin(angle*Math.PI/180)*r;if(fits(x,y)){position={x,y};break;}}
            }
            const tooltip=document.createElement("span");tooltip.textContent=`${name} · ${t.place.recipes(count)}`;
            if(!position){
              L.circleMarker(anchor,{radius:5,className:"map-country-dot",fillOpacity:1}).bindTooltip(tooltip).on("click",()=>go(place)).addTo(labels);
              continue;
            }
            used.push({...position,w});
            const target=map.containerPointToLatLng([position.x,position.y]);
            if(Math.hypot(position.x-point.x,position.y-point.y)>15)L.polyline([anchor,target],{className:"map-label-leader",weight:1,interactive:false}).addTo(labels);
            const el=document.createElement("div");el.className="map-pin-inner map-region-label";
            const title=document.createElement("span");title.textContent=name;el.append(title);
            const number=document.createElement("small");number.textContent=String(count);el.append(number);
            L.marker(target,{icon:L.divIcon({html:el,className:"map-pin",iconSize:[w,34],iconAnchor:[w/2,17]}),title:tooltip.textContent,alt:tooltip.textContent,keyboard:true})
              .on("click",()=>go(place)).addTo(labels);
          }
        };
        map.on("moveend zoomend resize",updateLabels);
        updateLabels();
        setRegionStatus("ready");
      }catch{if(!disposed)setRegionStatus("error");}
    }
    void showRegions();
    return ()=>{disposed=true;controller.abort();if(updateLabels)map.off("moveend zoomend resize",updateLabels);regions?.remove();labels?.remove();};
  }, [selectedId,version,locale,t,router,regionAttempt]);

  return (
    <section className={`atlas atlas-drilldown${expanded ? " atlas-expanded" : ""}`} aria-label={t.home.mapTitle}>
      <div className="atlas-toolbar">
        <div className="atlas-title"><Compass size={20} aria-hidden="true" />{selected ? translatePlaceName(selected,locale) : t.home.mapTitle}<span className="atlas-total">{selected ? t.place.recipes(COUNTS.get(selected.id) ?? 0) : `195 ${es?"países":"countries"}`}</span></div>
        <div className="atlas-actions">
          <button className="atlas-reset" type="button" onClick={()=>selectCountry(null)} disabled={status!=="ready"}><Globe2 size={16} aria-hidden="true" />{t.map.reset.replace(/^\S+\s/,"")}</button>
          <button className="icon-button" type="button" onClick={()=>setExpanded(v=>!v)} aria-pressed={expanded} aria-label={es?(expanded?"Reducir mapa":"Ampliar mapa"):(expanded?"Reduce map":"Expand map")}>{expanded?<Minimize2 size={17}/>:<Maximize2 size={17}/>}</button>
        </div>
      </div>
      <div className="atlas-content">
        <div className="atlas-viewport">
          <div ref={container} className="atlas-map" aria-label={es?"Mapa mundial. Selecciona un país para ver sus regiones y recetas.":"World map. Select a country to see its regions and recipes."}/>
          {status!=="ready" && <div className="map-status" role="status"><Globe2 size={32}/><p>{status==="error"?(es?"No pudimos cargar el mapa. Los destinos siguen disponibles en la lista.":"The map could not load. Destinations remain available in the list."):(es?"Preparando tu próxima parada…":"Preparing your next destination…")}</p>{status==="error"&&<button onClick={()=>{setStatus("loading");setAttempt(v=>v+1);}}>{es?"Reintentar":"Try again"}</button>}</div>}
          {selected && status==="ready" && regionStatus!=="ready" && <div className="atlas-region-status" role="status">{regionStatus==="loading"?(es?"Cargando regiones…":"Loading regions…"):<>{es?"No se cargaron los límites regionales. Usa la lista o reintenta.":"Regional boundaries could not load. Use the list or try again."}<button onClick={()=>setRegionAttempt(v=>v+1)}>{es?"Reintentar":"Try again"}</button></>}</div>}
        </div>
        <aside className="atlas-sidebar" aria-label={selected?(es?"Estados y regiones":"States and regions"):t.home.countriesTitle}>
          <div className="atlas-sidebar-heading">
            {selected&&<button className="atlas-back" onClick={()=>selectCountry(null)}><ArrowLeft size={15}/>{es?"Todos los países":"All countries"}</button>}
            <h3>{selected?(es?"Estados y regiones":"States and regions"):t.home.countriesEyebrow}</h3>
            <p>{selected?`${regionIds.length} ${es?"divisiones · selecciona una para ver recetas":"divisions · select one to see recipes"}`:(es?"195 países · con o sin recetas":"195 countries · with or without recipes")}</p>
            <label className="atlas-list-search"><Search size={16} aria-hidden="true"/><input value={query} onChange={e=>setQuery(e.target.value)} aria-label={selected?t.place.searchState:(es?"Buscar país":"Search country")} placeholder={selected?t.place.searchState:(es?"Buscar país…":"Search country…")}/></label>
          </div>
          <div className="atlas-country-list">
            {items.map(place=>{
              const content=<><span className="atlas-country-name">{translatePlaceName(place,locale)}</span><span className="atlas-country-count" aria-label={t.place.recipes(COUNTS.get(place.id) ?? 0)}>{COUNTS.get(place.id) ?? 0}</span></>;
              return selected?<Link key={place.id} href={placeHref(locale,place)} prefetch={false} className="atlas-country">{content}<ArrowUpRight size={15} aria-hidden="true"/></Link>:<button type="button" key={place.id} className="atlas-country" onClick={()=>selectCountry(place.id)}><span className="atlas-country-code" aria-hidden="true">{place.countryCode}</span>{content}</button>;
            })}
            {items.length===0&&<p className="atlas-list-empty">{query?t.place.empty:(es?"Esta cartografía no incluye divisiones internas para este país. Puedes ver sus recetas a continuación.":"This map has no internal divisions for this country. You can view its recipes below.")}</p>}
          </div>
          <div className="atlas-selection">
            {selected?<><strong>{translatePlaceName(selected,locale)}</strong><p>{t.place.recipes(COUNTS.get(selected.id) ?? 0)}</p><Link className="primary-button" href={placeHref(locale,selected)}>{es?"Ver todas las recetas":"See all recipes"}<ArrowUpRight size={17}/></Link></>:<><strong>{es?"Del mapa a tu mesa.":"From the map to your table."}</strong><p>{es?"Elige un país. Después, una región.":"Choose a country. Then a region."}</p></>}
          </div>
        </aside>
      </div>
      <div className="atlas-caption"><span>{selected?(es?"Pulsa un estado o su etiqueta para abrir sus recetas · El listado incluye todas las regiones":"Click a region or its label to open recipes · The list includes every region"):(es?"Selecciona cualquier país para acercarte y ver sus regiones":"Select any country to zoom in and see its regions")}</span><span><a href="https://www.naturalearthdata.com/" target="_blank" rel="noreferrer">Natural Earth</a>{selected && ["KI","TV"].includes(selected.countryCode) && <> · <a href="https://www.geoboundaries.org/" target="_blank" rel="noreferrer">geoBoundaries</a> / © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a></>} · <a href="/geo/world-countries.LICENSE.txt" target="_blank" rel="noreferrer">{es?"Fuentes":"Sources"}</a></span></div>
    </section>
  );
}
