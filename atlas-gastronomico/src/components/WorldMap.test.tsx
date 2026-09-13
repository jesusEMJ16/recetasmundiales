import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup, act } from "@testing-library/react";
import { WorldMap } from "./WorldMap";

const mocks=vi.hoisted(()=>({push:vi.fn(),zoom:vi.fn(),clicks:new Map<string,()=>void>(),icons:vi.fn(),markers:vi.fn(),tooltips:vi.fn()}));
const navigation={push:mocks.push};
vi.mock("next/navigation",()=>({usePathname:()=>"/es",useRouter:()=>navigation}));
vi.mock("leaflet",()=>{
  const layer=()=>{const l={addTo:vi.fn(()=>l),on:vi.fn((_event:string,_callback:()=>void)=>l),bindTooltip:vi.fn((text:HTMLElement)=>{mocks.tooltips(text.textContent);return l;}),remove:vi.fn(),clearLayers:vi.fn(),getElement:()=>undefined};return l;};
  const map={...layer(),fitBounds:vi.fn(),setMaxBounds:vi.fn(),flyToBounds:mocks.zoom,off:vi.fn(),fire:vi.fn(),invalidateSize:vi.fn(),getZoom:()=>3,getBounds:()=>({contains:()=>true}),getSize:()=>({x:1000,y:550}),latLngToContainerPoint:()=>({x:400,y:200}),containerPointToLatLng:()=>({lat:20,lng:-100})};
  return {map:()=>map,control:{zoom:layer},layerGroup:layer,marker:(...args:unknown[])=>{mocks.markers(...args);return layer();},circleMarker:layer,polyline:layer,divIcon:mocks.icons,geoJSON:(data:{features:{properties:{id?:string;code?:string}}[]},options:{onEachFeature?:(f:unknown,l:unknown)=>void})=>{
    for(const f of data.features){const l=layer();l.on=vi.fn((event:string,callback:()=>void)=>{if(event==="click")mocks.clicks.set(f.properties.id ?? f.properties.code!,callback);return l;});options.onEachFeature?.(f,l);}
    return layer();
  }};
});
const geography=(ids:string[],country=false)=>({type:"FeatureCollection",features:ids.map(id=>({type:"Feature",properties:country?{code:id}:{id,lat:20,lng:-100},geometry:{type:"Polygon",coordinates:[]}}))});
beforeEach(()=>{
  mocks.clicks.clear();mocks.zoom.mockClear();mocks.push.mockClear();mocks.icons.mockClear();mocks.markers.mockClear();mocks.tooltips.mockClear();
  vi.stubGlobal("ResizeObserver",class{observe(){}disconnect(){}});
  vi.stubGlobal("matchMedia",()=>({matches:true}));
  vi.stubGlobal("fetch",vi.fn(async(url:string)=>({ok:true,json:async()=>url.includes("world-countries")?geography(["MX","US","CA"],true):url.includes("MX")?geography(["mx-oax","mx-jal"]):geography([])})));
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();});
describe("country to regional recipe navigation",()=>{
  it("puts a compact code and total on land while keeping full counts in hover text",async()=>{
    render(<WorldMap/>);
    await waitFor(()=>expect(mocks.icons).toHaveBeenCalled());
    const icons=mocks.icons.mock.calls.map(([icon])=>icon);
    const mexico=icons.find(icon=>icon.html.querySelector("span")?.textContent==="MX");
    expect(mexico.className).toBe("map-country-label");
    expect(mexico.html.querySelector("small").textContent).toBe("101");
    expect(icons.every(icon=>icon.className==="map-country-label")).toBe(true);
    expect(mocks.tooltips).toHaveBeenCalledWith("México · 101 recetas");
    expect(mocks.tooltips).toHaveBeenCalledWith("Estados Unidos · 68 recetas");
    expect(mocks.tooltips).toHaveBeenCalledWith("Canadá · 0 recetas");
    // Labels never steal the click or hover from the underlying country.
    expect(mocks.markers.mock.calls.every(([,options])=>options.interactive===false && options.keyboard===false)).toBe(true);
  });
  it("a country polygon zooms and reveals 32 states; a state polygon opens its recipe page",async()=>{
    render(<WorldMap/>);
    await waitFor(()=>expect(mocks.clicks.has("MX")).toBe(true));
    await act(async()=>mocks.clicks.get("MX")!());
    await waitFor(()=>expect(mocks.clicks.has("mx-oax")).toBe(true));
    expect(mocks.zoom).toHaveBeenCalled();
    expect(screen.getByText(/32 divisiones/)).toBeTruthy();
    expect(screen.getByRole("link",{name:/Oaxaca/}).getAttribute("href")).toBe("/es/recetas/mexico/oaxaca");
    act(()=>mocks.clicks.get("mx-oax")!());
    expect(mocks.push).toHaveBeenCalledWith("/es/recetas/mexico/oaxaca");
  });
  it("countries and regions with no recipes remain selectable",async()=>{
    render(<WorldMap/>);
    await waitFor(()=>expect(mocks.clicks.has("CA")).toBe(true));
    fireEvent.change(screen.getByRole("textbox",{name:"Buscar país"}),{target:{value:"canada"}});
    fireEvent.click(screen.getByRole("button",{name:/Canadá/}));
    await screen.findByText(/13 divisiones/);
    expect(screen.getByRole("link",{name:/Ontario/}).textContent).toContain("0");
    fireEvent.click(screen.getByRole("button",{name:"Todos los países"}));
    expect(screen.getByText("195 países")).toBeTruthy();
  });
});
