// Presentation-only photos. Recipe records, provenance and rankings are unchanged.
// Originals from Wikimedia Commons; converted to WebP and resized, cropped in CSS.
export interface DestinationPhoto {
  url: string;
  dish: string;
  author: string;
  license: string;
  licenseUrl: string;
  source: string;
}
export const DESTINATION_PHOTOS: Record<string, DestinationPhoto> = {
  MX: { url: "/images/recetas/tlayudas-oaxaquenas.jpg", dish: "Tlayuda oaxaqueña", author: "Jj saezdeo", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", source: "https://commons.wikimedia.org/wiki/File:Oaxacan_tlayuda.jpg" },
  US: { url: "/images/recetas/gumbo-criollo.jpg", dish: "Gumbo", author: "Jun OHWADA", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/", source: "https://commons.wikimedia.org/wiki/File:シーフードガンボ_(3848172512).jpg" },
  IT: { url: "/images/destinations/italy.webp", dish: "Pizza napoletana", author: "Valerio Capello / Rainer Zenz", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/", source: "https://commons.wikimedia.org/wiki/File:Eq_it-na_pizza-margherita_sep2005_sml.jpg" },
  ES: { url: "/images/destinations/spain.webp", dish: "Paella valenciana", author: "Francesc Fort", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", source: "https://commons.wikimedia.org/wiki/File:Paella_valenciana_-_Casa_Diego.jpg" },
  JP: { url: "/images/destinations/japan.webp", dish: "Okonomiyaki", author: "Hajime NAKANO", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/", source: "https://commons.wikimedia.org/wiki/File:Okonomiyaki_(1).jpg" },
  TH: { url: "/images/destinations/thailand.webp", dish: "Pad thai", author: "Mack Male", license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/", source: "https://commons.wikimedia.org/wiki/File:Pad_Thai_(2433385864).jpg" },
  FR: { url: "/images/destinations/france.webp", dish: "Coq au vin", author: "Ewan Munro", license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/", source: "https://commons.wikimedia.org/wiki/File:Coq_au_vin_(4549972665).jpg" },
  DE: { url: "/images/destinations/germany.webp", dish: "Sauerbraten", author: "Jameres", license: "Public domain", licenseUrl: "https://commons.wikimedia.org/wiki/File:Sauerbraten_with_potato_dumplings.jpg#Licensing", source: "https://commons.wikimedia.org/wiki/File:Sauerbraten_with_potato_dumplings.jpg" },
  GR: { url: "/images/destinations/greece.webp", dish: "Moussaka", author: "Cifo Buscemi", license: "CC BY 3.0", licenseUrl: "https://creativecommons.org/licenses/by/3.0/", source: "https://commons.wikimedia.org/wiki/File:Moussaka.jpg" },
  PT: { url: "/images/destinations/portugal.webp", dish: "Bacalhau à Brás", author: "Fpenteado", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/", source: "https://commons.wikimedia.org/wiki/File:Bacalhau_a_Bras.jpg" },
};
