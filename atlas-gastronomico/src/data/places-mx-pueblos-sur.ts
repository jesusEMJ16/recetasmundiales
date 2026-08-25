import type { Place } from "../domain/types";

export const SUBPLACES_MX_SUR: Place[] = [
  // Chiapas
  { id: "mx-chp-sancristobal", type: "ciudad", name: "San Cristóbal de las Casas", slug: "san-cristobal-de-las-casas", parentId: "mx-chp", countryCode: "MX", lat: 16.74, lng: -92.64 },
  { id: "mx-chp-chiapadecorzo", type: "pueblo", name: "Chiapa de Corzo", slug: "chiapa-de-corzo", parentId: "mx-chp", countryCode: "MX", lat: 16.71, lng: -93.01 },
  { id: "mx-chp-comitan", type: "ciudad", name: "Comitán de Domínguez", slug: "comitan-de-dominguez", parentId: "mx-chp", countryCode: "MX", lat: 16.25, lng: -92.13 },
  // Puebla
  { id: "mx-pue-cuetzalan", type: "pueblo", name: "Cuetzalan del Progreso", slug: "cuetzalan-del-progreso", parentId: "mx-pue", countryCode: "MX", lat: 20.02, lng: -97.52 },
  { id: "mx-pue-zacatlan", type: "pueblo", name: "Zacatlán de las Manzanas", slug: "zacatlan-de-las-manzanas", parentId: "mx-pue", countryCode: "MX", lat: 19.93, lng: -97.96 },
  { id: "mx-pue-atlixco", type: "ciudad", name: "Atlixco", slug: "atlixco", parentId: "mx-pue", countryCode: "MX", lat: 18.91, lng: -98.43 },
  // Veracruz
  { id: "mx-ver-coatepec", type: "pueblo", name: "Coatepec", slug: "coatepec", parentId: "mx-ver", countryCode: "MX", lat: 19.45, lng: -96.96 },
  { id: "mx-ver-xico", type: "pueblo", name: "Xico", slug: "xico", parentId: "mx-ver", countryCode: "MX", lat: 19.42, lng: -97.00 },
  { id: "mx-ver-papantla", type: "ciudad", name: "Papantla de Olarte", slug: "papantla-de-olarte", parentId: "mx-ver", countryCode: "MX", lat: 20.45, lng: -97.32 },
  { id: "mx-ver-tlacotalpan", type: "pueblo", name: "Tlacotalpan", slug: "tlacotalpan", parentId: "mx-ver", countryCode: "MX", lat: 18.61, lng: -95.66 },
  // Yucatán
  { id: "mx-yuc-valladolid", type: "ciudad", name: "Valladolid", slug: "valladolid", parentId: "mx-yuc", countryCode: "MX", lat: 20.69, lng: -88.20 },
  { id: "mx-yuc-izamal", type: "pueblo", name: "Izamal", slug: "izamal", parentId: "mx-yuc", countryCode: "MX", lat: 20.93, lng: -89.02 },
  // Guerrero
  { id: "mx-gro-taxco", type: "ciudad", name: "Taxco de Alarcón", slug: "taxco-de-alarcon", parentId: "mx-gro", countryCode: "MX", lat: 18.56, lng: -99.60 },
  // Oaxaca
  { id: "mx-oax-capulalpam", type: "pueblo", name: "Capulálpam de Méndez", slug: "capulalpam-de-mendez", parentId: "mx-oax", countryCode: "MX", lat: 17.30, lng: -96.45 },
  // Quintana Roo
  { id: "mx-roo-bacalar", type: "pueblo", name: "Bacalar", slug: "bacalar", parentId: "mx-roo", countryCode: "MX", lat: 18.68, lng: -88.39 },
  // Campeche
  { id: "mx-cam-palizada", type: "pueblo", name: "Palizada", slug: "palizada", parentId: "mx-cam", countryCode: "MX", lat: 18.25, lng: -92.09 },
];
