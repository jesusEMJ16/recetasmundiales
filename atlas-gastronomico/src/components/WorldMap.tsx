"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PLACES } from "../data/places";
import { getChildren, getRecipeCountForPlace } from "../domain/places";
import { RECIPES } from "../data/recipes";
import { useLocale } from "../i18n/useLocale";
import { getDictionary } from "../i18n/dictionaries";
import { placeHref } from "../i18n/routing";
import { translatePlaceName } from "../i18n/content";
import type { Place } from "../domain/types";

// Importaciones dinámicas de Leaflet (solo cliente)
let L: any = null;
let markerIcon2x: any = null;
let markerIcon: any = null;
let markerShadow: any = null;

async function loadLeaflet() {
  if (L) return L;
  const leafletModule = await import("leaflet");
  L = leafletModule.default || leafletModule;
  
  // Cargar CSS
  await import("leaflet/dist/leaflet.css");
  await import("leaflet.markercluster/dist/MarkerCluster.css");
  await import("leaflet.markercluster/dist/MarkerCluster.Default.css");
  
  // Cargar imágenes
  const icons = await Promise.all([
    import("leaflet/dist/images/marker-icon-2x.png"),
    import("leaflet/dist/images/marker-icon.png"),
    import("leaflet/dist/images/marker-shadow.png"),
  ]);
  [markerIcon2x, markerIcon, markerShadow] = icons;
  
  // Fix para iconos
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src,
    iconUrl: markerIcon.src,
    shadowUrl: markerShadow.src,
  });
  
  return L;
}

const COUNTRIES = PLACES.filter((p) => p.type === "pais");
const MX_STATES = PLACES.filter((p) => p.type === "estado" && p.countryCode === "MX");
const MX_CITIES = PLACES.filter((p) => p.type === "ciudad" && p.countryCode === "MX");
const MX_TOWNS = PLACES.filter((p) => p.type === "pueblo" && p.countryCode === "MX");

interface RecipeMarker {
  lat: number;
  lng: number;
  title: string;
  href: string;
  hasRecipes: boolean;
  recipeCount: number;
  place: Place;
}

type MarkerClusterGroup = any;
const MarkerClusterGroupImpl: any = (typeof window !== "undefined" && (window as any).Leaflet?.MarkerClusterGroup) || null;

function createCountryMarkerElement(name: string, featured: boolean, locale: string) {
  const el = document.createElement("div");
  el.className = "country-marker";
  el.innerHTML = `
    <div style="
      font-family: var(--font-body, system-ui, sans-serif);
      font-size: 13px;
      font-weight: 700;
      white-space: nowrap;
      padding: 6px 14px;
      border-radius: 9999px;
      cursor: pointer;
      background: ${featured ? "linear-gradient(135deg, #e11d74 0%, #c1440e 100%)" : "linear-gradient(135deg, #fffdf8 0%, #f5f0eb 100%)"};
      color: ${featured ? "#ffffff" : "#241b16"};
      border: 2px solid ${featured ? "#96330a" : "#c1440e"};
      box-shadow: 0 4px 16px -4px rgba(36,27,22,0.5), 0 2px 8px rgba(0,0,0,0.1);
      transition: all 0.2s ease;
      backdrop-filter: blur(8px);
    ">
      ${name}
    </div>
  `;
  
  const innerDiv = el.firstChild as HTMLElement;
  innerDiv.onmouseenter = () => {
    innerDiv.style.transform = "scale(1.1)";
    innerDiv.style.boxShadow = "0 6px 20px -4px rgba(36,27,22,0.6), 0 4px 12px rgba(0,0,0,0.15)";
  };
  innerDiv.onmouseleave = () => {
    innerDiv.style.transform = "scale(1)";
    innerDiv.style.boxShadow = "0 4px 16px -4px rgba(36,27,22,0.5), 0 2px 8px rgba(0,0,0,0.1)";
  };
  return el;
}

function createRecipeMarkerElement(place: Place, locale: string, hasRecipes: boolean, recipeCount: number) {
  const el = document.createElement("div");
  const name = translatePlaceName(place, locale as any);
  el.className = "recipe-marker";
  el.innerHTML = `
    <div style="
      font-family: var(--font-body, system-ui, sans-serif);
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      padding: 5px 10px;
      border-radius: 8px;
      cursor: pointer;
      background: ${hasRecipes 
        ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" 
        : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"};
      color: #ffffff;
      border: 2px solid ${hasRecipes ? "#047857" : "#b91c1c"};
      box-shadow: 0 3px 12px -3px rgba(0,0,0,0.4);
      transition: all 0.2s ease;
      backdrop-filter: blur(6px);
    ">
      🍽️ ${name}${hasRecipes ? ` (${recipeCount})` : ""}
    </div>
  `;
  
  const innerDiv = el.firstChild as HTMLElement;
  innerDiv.onmouseenter = () => {
    innerDiv.style.transform = "scale(1.08)";
    innerDiv.style.boxShadow = "0 5px 16px -3px rgba(0,0,0,0.5)";
  };
  innerDiv.onmouseleave = () => {
    innerDiv.style.transform = "scale(1)";
    innerDiv.style.boxShadow = "0 3px 12px -3px rgba(0,0,0,0.4)";
  };
  return el;
}

function createEmptyAreaMarkerElement() {
  const el = document.createElement("div");
  el.innerHTML = `
    <div style="
      font-family: var(--font-body, system-ui, sans-serif);
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      padding: 4px 8px;
      border-radius: 6px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: #ffffff;
      border: 2px solid #b91c1c;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      animation: pulse-red 2s infinite;
    ">
      ⚠️ Sin recetas - Click para agregar
    </div>
    <style>
      @keyframes pulse-red {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.05); }
      }
    </style>
  `;
  return el;
}

export function WorldMap() {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const clusterGroupRef = useRef<MarkerClusterGroup | null>(null);
  const countryMarkersRef = useRef<L.Marker[]>([]);
  const recipeMarkersRef = useRef<L.Marker[]>([]);
  const router = useRouter();
  const locale = useLocale();
  const t = getDictionary(locale).map;
  const [currentZoom, setCurrentZoom] = useState(4);

  // Generar marcadores de recetas basados en lugares disponibles
  const generateRecipeMarkers = useCallback((): RecipeMarker[] => {
    const markers: RecipeMarker[] = [];
    
    // Agregar marcadores para estados
    MX_STATES.forEach((state) => {
      const children = getChildren(state.id, PLACES);
      const childRecipeCounts = children.reduce((sum, child) => sum + getRecipeCountForPlace(child.id, RECIPES), 0);
      const stateRecipeCount = getRecipeCountForPlace(state.id, RECIPES);
      const totalRecipes = childRecipeCounts + stateRecipeCount;
      const hasRecipes = totalRecipes > 0;
      
      markers.push({
        lat: state.lat,
        lng: state.lng,
        title: translatePlaceName(state, locale as any),
        href: placeHref(locale as any, state),
        hasRecipes,
        recipeCount: totalRecipes,
        place: state,
      });
    });

    // Agregar marcadores para ciudades
    MX_CITIES.forEach((city) => {
      const recipeCount = getRecipeCountForPlace(city.id, RECIPES);
      const hasRecipes = recipeCount > 0;
      markers.push({
        lat: city.lat,
        lng: city.lng,
        title: translatePlaceName(city, locale as any),
        href: placeHref(locale as any, city),
        hasRecipes,
        recipeCount,
        place: city,
      });
    });

    // Agregar marcadores para pueblos
    MX_TOWNS.forEach((town) => {
      const recipeCount = getRecipeCountForPlace(town.id, RECIPES);
      const hasRecipes = recipeCount > 0;
      markers.push({
        lat: town.lat,
        lng: town.lng,
        title: translatePlaceName(town, locale as any),
        href: placeHref(locale as any, town),
        hasRecipes,
        recipeCount,
        place: town,
      });
    });

    return markers;
  }, [locale]);

  useEffect(() => {
    if (!ref.current) return;

    // Inicializar mapa con Leaflet
    const map = L.map(ref.current, {
      center: [23.5, -102],
      zoom: 4.2,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    });

    mapRef.current = map;
    setCurrentZoom(map.getZoom());

    // Agregar capa base de OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Agregar control de zoom personalizado
    L.control.zoom({
      position: "topright",
      zoomInText: "+",
      zoomOutText: "−",
      zoomInTitle: "Acercar",
      zoomOutTitle: "Alejar",
    }).addTo(map);

    // Grupo de clusters para marcadores de recetas
    const clusterGroup = new (L as any).MarkerClusterGroup({
      showCoverageOnHover: true,
      maxClusterRadius: 50,
      disableClusteringAtZoom: 14,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
    });
    clusterGroupRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    // Crear marcadores de países
    const countryMarkers: L.Marker[] = [];
    COUNTRIES.forEach((country) => {
      const cname = translatePlaceName(country, locale as any);
      const el = createCountryMarkerElement(cname, country.countryCode === "MX", locale);
      const marker = L.marker([country.lat, country.lng], {
        icon: L.divIcon({
          className: "custom-country-marker",
          html: el,
          iconSize: [120, 40],
          iconAnchor: [60, 20],
        }),
        zIndexOffset: 1000,
      });

      marker.on("click", () => {
        router.push(placeHref(locale as any, country));
      });

      countryMarkers.push(marker);
      if (map.getZoom() < 5) {
        marker.addTo(map);
      }
    });
    countryMarkersRef.current = countryMarkers;

    // Crear marcadores de recetas
    const recipeMarkersData = generateRecipeMarkers();
    const recipeMarkers: L.Marker[] = [];

    recipeMarkersData.forEach((markerData) => {
      const el = createRecipeMarkerElement(markerData.place, locale, markerData.hasRecipes, markerData.recipeCount);
      const marker = L.marker([markerData.lat, markerData.lng], {
        icon: L.divIcon({
          className: "custom-recipe-marker",
          html: el,
          iconSize: [100, 35],
          iconAnchor: [50, 18],
        }),
      });

      marker.on("click", () => {
        if (markerData.hasRecipes) {
          router.push(markerData.href);
        } else {
          // Marcar área sin recetas en rojo
          const emptyMarker = L.marker([markerData.lat, markerData.lng], {
            icon: L.divIcon({
              className: "empty-area-marker",
              html: createEmptyAreaMarkerElement(),
              iconSize: [180, 35],
              iconAnchor: [90, 18],
            }),
          });
          
          emptyMarker.addTo(map);
          setTimeout(() => {
            map.removeLayer(emptyMarker);
          }, 3000);
          
          // Opcional: abrir formulario para agregar receta
          console.log("Área sin recetas:", markerData.title);
        }
      });

      recipeMarkers.push(marker);
      clusterGroup.addLayer(marker);
    });
    recipeMarkersRef.current = recipeMarkers;

    // Actualizar visibilidad de marcadores según zoom
    const updateMarkerVisibility = () => {
      const zoom = map.getZoom();
      setCurrentZoom(zoom);

      // Mostrar/ocultar marcadores de países
      countryMarkers.forEach((marker) => {
        if (zoom < 5) {
          if (!map.hasLayer(marker)) marker.addTo(map);
        } else {
          if (map.hasLayer(marker)) map.removeLayer(marker);
        }
      });

      // Ajustar tamaño de marcadores de recetas según zoom
      recipeMarkers.forEach((marker) => {
        const element = marker.getElement();
        if (element) {
          const innerDiv = element.querySelector("div");
          if (innerDiv) {
            if (zoom >= 12) {
              innerDiv.style.fontSize = "14px";
              innerDiv.style.padding = "6px 12px";
            } else if (zoom >= 8) {
              innerDiv.style.fontSize = "12px";
              innerDiv.style.padding = "5px 10px";
            } else {
              innerDiv.style.fontSize = "11px";
              innerDiv.style.padding = "4px 8px";
            }
          }
        }
      });
    };

    map.on("zoomend", updateMarkerVisibility);
    updateMarkerVisibility();

    // Agregar leyenda informativa
    const legend = (L.control as any)({ position: "bottomleft" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "map-legend");
      div.style.cssText = `
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        font-family: var(--font-body, system-ui, sans-serif);
        font-size: 12px;
        line-height: 1.6;
        border: 1px solid rgba(0,0,0,0.1);
      `;
      div.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 8px; color: #241b16;">🗺️ Leyenda</div>
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
          <span style="display: inline-block; width: 16px; height: 16px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 4px;"></span>
          <span>Con recetas</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="display: inline-block; width: 16px; height: 16px; background: linear-gradient(135deg, #ef4444, #dc2626); border-radius: 4px;"></span>
          <span>Sin recetas</span>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    // Botones de acceso rápido
    const quickControls = (L.control as any)({ position: "topleft" });
    quickControls.onAdd = () => {
      const div = L.DomUtil.create("div", "quick-controls");
      div.style.cssText = `
        display: flex;
        gap: 8px;
        margin: 10px;
      `;
      div.innerHTML = `
        <button id="btn-mexico" style="
          font-family: var(--font-body, system-ui, sans-serif);
          font-size: 13px;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 9999px;
          border: 2px solid #c1440e;
          background: linear-gradient(135deg, #fffdf8, #f5f0eb);
          color: #241b16;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        ">🍽️ México</button>
        <button id="btn-world" style="
          font-family: var(--font-body, system-ui, sans-serif);
          font-size: 13px;
          font-weight: 700;
          padding: 8px 16px;
          border-radius: 9999px;
          border: 2px solid #c1440e;
          background: linear-gradient(135deg, #fffdf8, #f5f0eb);
          color: #241b16;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: all 0.2s ease;
        ">🌎 Ver mundo</button>
      `;
      
      setTimeout(() => {
        const btnMexico = document.getElementById("btn-mexico");
        const btnWorld = document.getElementById("btn-world");
        
        btnMexico?.addEventListener("click", () => {
          map.flyTo([23.5, -102], 6, { duration: 1.5 });
        });
        
        btnWorld?.addEventListener("click", () => {
          map.flyTo([23.5, -102], 4.2, { duration: 1.5 });
        });
      }, 100);
      
      return div;
    };
    quickControls.addTo(map);

    // Hint de uso
    const hint = (L.control as any)({ position: "bottomright" });
    hint.onAdd = () => {
      const div = L.DomUtil.create("div", "map-hint");
      div.style.cssText = `
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(8px);
        padding: 10px 14px;
        border-radius: 9999px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        font-family: var(--font-body, system-ui, sans-serif);
        font-size: 12px;
        color: #6b7280;
        margin: 10px;
        border: 1px solid rgba(0,0,0,0.05);
      `;
      div.innerHTML = `${t.hint}`;
      return div;
    };
    hint.addTo(map);

    return () => {
      map.remove();
    };
  }, [router, locale, generateRecipeMarkers, t.hint]);

  return (
    <div className="relative w-full">
      <div 
        ref={ref} 
        className="h-[520px] w-full overflow-hidden rounded-[var(--radius-xl2)] border border-line shadow-[var(--shadow-card)]"
        style={{ minHeight: "520px" }}
      />
      <style jsx global>{`
        .leaflet-container {
          font-family: var(--font-body, system-ui, sans-serif);
        }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15) !important;
        }
        .leaflet-control-zoom-in, .leaflet-control-zoom-out {
          background: rgba(255, 255, 255, 0.95) !important;
          color: #241b16 !important;
          border: 1px solid rgba(0,0,0,0.1) !important;
          font-weight: 700 !important;
          font-size: 18px !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
        }
        .leaflet-control-zoom-in:hover, .leaflet-control-zoom-out:hover {
          background: #f5f0eb !important;
        }
        .marker-cluster-small, .marker-cluster-medium, .marker-cluster-large {
          background: rgba(193, 68, 14, 0.4) !important;
        }
        .marker-cluster-small div, .marker-cluster-medium div, .marker-cluster-large div {
          background: rgba(193, 68, 14, 0.6) !important;
          color: #fff !important;
          font-weight: 700 !important;
        }
      `}</style>
    </div>
  );
}
