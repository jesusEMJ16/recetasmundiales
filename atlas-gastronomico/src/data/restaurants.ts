import { Restaurant } from "../domain/types";

// Datos de ejemplo para restaurantes - Se expandirá con más datos reales
export const restaurants: Restaurant[] = [
  // México - Ciudad de México
  {
    id: "rest-cdmx-001",
    name: "Pujol",
    slug: "pujol-cdmx",
    description: "Restaurante de alta cocina mexicana contemporánea dirigido por el chef Enrique Olvera.",
    address: "Tennyson 133, Polanco",
    city: "Ciudad de México",
    state: "CDMX",
    country: "México",
    countryCode: "MX",
    lat: 19.4326,
    lng: -99.1332,
    priceRange: "$$$$",
    cuisineType: ["Mexicana", "Contemporánea"],
    rating: 4.8,
    reviewCount: 2543,
    imageUrl: "/images/restaurants/pujol.jpg",
    phone: "+52 55 5545 4111",
    website: "https://pujol.com.mx",
    openingHours: "Mar-Sab 13:30-22:00",
    isFeatured: true,
    tags: ["romántico", "alta cocina", "reserva requerida"],
  },
  {
    id: "rest-cdmx-002",
    name: "Contramar",
    slug: "contramar-cdmx",
    description: "Famoso por sus tostadas de atún y pescados frescos en un ambiente casual y vibrante.",
    address: "Calle Durango 200, Roma Norte",
    city: "Ciudad de México",
    state: "CDMX",
    country: "México",
    countryCode: "MX",
    lat: 19.4185,
    lng: -99.1640,
    priceRange: "$$$",
    cuisineType: ["Mariscos", "Mexicana"],
    rating: 4.6,
    reviewCount: 1876,
    imageUrl: "/images/restaurants/contramar.jpg",
    phone: "+52 55 5514 9217",
    openingHours: "Lun-Dom 13:00-18:00",
    isFeatured: true,
    tags: ["mariscos", "popular", "reserva recomendada"],
  },
  
  // México - Oaxaca
  {
    id: "rest-oax-001",
    name: "Casa Oaxaca",
    slug: "casa-oaxaca-oaxaca",
    description: "Cocina oaxaqueña contemporánea en un hermoso edificio colonial con terraza.",
    address: "Constitución 104A, Centro Histórico",
    city: "Oaxaca de Juárez",
    state: "Oaxaca",
    country: "México",
    countryCode: "MX",
    lat: 17.0654,
    lng: -96.7236,
    priceRange: "$$$",
    cuisineType: ["Oaxaqueña", "Mexicana", "Contemporánea"],
    rating: 4.7,
    reviewCount: 1234,
    imageUrl: "/images/restaurants/casa-oaxaca.jpg",
    phone: "+52 951 501 1919",
    website: "https://casaoaxaca.com.mx",
    openingHours: "Mié-Lun 13:00-22:00",
    isFeatured: true,
    tags: ["terraza", "colonial", "mole"],
  },
  {
    id: "rest-oax-002",
    name: "Los Danzantes",
    slug: "los-danzantes-oaxaca",
    description: "Restaurante icónico frente al zócalo, conocido por su mezcal y cocina tradicional.",
    address: "Macedonio Alcalá s/n, Centro",
    city: "Oaxaca de Juárez",
    state: "Oaxaca",
    country: "México",
    countryCode: "MX",
    lat: 17.0642,
    lng: -96.7225,
    priceRange: "$$",
    cuisineType: ["Oaxaqueña", "Mexicana"],
    rating: 4.5,
    reviewCount: 2100,
    imageUrl: "/images/restaurants/los-danzantes.jpg",
    phone: "+52 951 501 2815",
    openingHours: "Lun-Dom 09:00-23:00",
    isFeatured: false,
    tags: ["zócalo", "mezcal", "tradicional"],
  },
  
  // México - Sonora
  {
    id: "rest-son-001",
    name: "El Güero Caborqueño",
    slug: "el-guero-caborqueno",
    description: "Famoso por sus tortillas de harina hechas a mano y carne asada sonorense.",
    address: "Blvd. Luis Encinas 305, Hermosillo",
    city: "Hermosillo",
    state: "Sonora",
    country: "México",
    countryCode: "MX",
    lat: 29.0729,
    lng: -110.9559,
    priceRange: "$$",
    cuisineType: ["Sonorense", "Mexicana", "Carne Asada"],
    rating: 4.6,
    reviewCount: 987,
    imageUrl: "/images/restaurants/el-guero.jpg",
    phone: "+52 662 213 0101",
    openingHours: "Lun-Dom 07:00-22:00",
    isFeatured: false,
    tags: ["tortillas de harina", "carne asada", "familiar"],
  },
  
  // Estados Unidos - Nueva York
  {
    id: "rest-ny-001",
    name: "Le Bernardin",
    slug: "le-bernardin-nyc",
    description: "Restaurante francés de mariscos con tres estrellas Michelin.",
    address: "155 W 51st St, Manhattan",
    city: "New York",
    state: "NY",
    country: "United States",
    countryCode: "US",
    lat: 40.7614,
    lng: -73.9776,
    priceRange: "$$$$",
    cuisineType: ["Francesa", "Mariscos", "Contemporánea"],
    rating: 4.9,
    reviewCount: 3421,
    imageUrl: "/images/restaurants/le-bernardin.jpg",
    phone: "+1 212-554-1515",
    website: "https://le-bernardin.com",
    openingHours: "Lun-Vie 12:00-14:30, 17:15-22:30",
    isFeatured: true,
    tags: ["michelin", "alta cocina", "elegante"],
  },
  {
    id: "rest-ny-002",
    name: "Joe's Pizza",
    slug: "joes-pizza-nyc",
    description: "Pizzería clásica de Nueva York, favorita de locales y turistas desde 1975.",
    address: "7 Carmine St, Greenwich Village",
    city: "New York",
    state: "NY",
    country: "United States",
    countryCode: "US",
    lat: 40.7305,
    lng: -74.0025,
    priceRange: "$",
    cuisineType: ["Pizza", "Italiana", "Americana"],
    rating: 4.4,
    reviewCount: 5678,
    imageUrl: "/images/restaurants/joes-pizza.jpg",
    phone: "+1 212-366-1182",
    openingHours: "Lun-Dom 10:00-04:00",
    isFeatured: false,
    tags: ["pizza", "económico", "clásico"],
  },
  
  // Estados Unidos - California
  {
    id: "rest-ca-001",
    name: "The French Laundry",
    slug: "french-laundry-napa",
    description: "Restaurante icónico de Thomas Keller con menú degustación de 9 tiempos.",
    address: "6640 Washington St, Yountville",
    city: "Yountville",
    state: "CA",
    country: "United States",
    countryCode: "US",
    lat: 38.4016,
    lng: -122.3619,
    priceRange: "$$$$",
    cuisineType: ["Francesa", "Contemporánea", "Californiana"],
    rating: 4.8,
    reviewCount: 2890,
    imageUrl: "/images/restaurants/french-laundry.jpg",
    phone: "+1 707-944-2380",
    website: "https://thomaskeller.com/tfl",
    openingHours: "Jue-Mar 11:00-13:00, 17:30-21:00",
    isFeatured: true,
    tags: ["michelin", "degustación", "reserva anticipada"],
  },
];

export function getRestaurantBySlug(slug: string): Restaurant | undefined {
  return restaurants.find(r => r.slug === slug);
}

export function getFeaturedRestaurants(): Restaurant[] {
  return restaurants.filter(r => r.isFeatured);
}

export function getRestaurantsByCountry(countryCode: string): Restaurant[] {
  return restaurants.filter(r => r.countryCode === countryCode);
}

export function getRestaurantsByCity(city: string, state?: string): Restaurant[] {
  return restaurants.filter(r => 
    r.city.toLowerCase() === city.toLowerCase() && 
    (!state || r.state?.toLowerCase() === state.toLowerCase())
  );
}

export function searchRestaurants(query: string): Restaurant[] {
  const q = query.toLowerCase();
  return restaurants.filter(r => 
    r.name.toLowerCase().includes(q) ||
    r.cuisineType.some(c => c.toLowerCase().includes(q)) ||
    r.city.toLowerCase().includes(q) ||
    r.tags?.some(t => t.toLowerCase().includes(q))
  );
}
