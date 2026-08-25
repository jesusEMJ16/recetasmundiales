import type { Recipe } from "../domain/types";
import { RECIPES_MX_NORTE } from "./recipes-mx-norte";
import { RECIPES_MX_CENTRO } from "./recipes-mx-centro";
import { RECIPES_MX_SUR } from "./recipes-mx-sur";
import { RECIPES_PUEBLOS_MX_NORTE } from "./recipes-mx-pueblos-norte";
import { RECIPES_PUEBLOS_MX_CENTRO } from "./recipes-mx-pueblos-centro";
import { RECIPES_PUEBLOS_MX_SUR } from "./recipes-mx-pueblos-sur";
import { RECIPES_US_SUR } from "./recipes-us-sur";
import { RECIPES_US_NORESTE } from "./recipes-us-noreste";
import { RECIPES_US_MEDIO_OESTE } from "./recipes-us-medio-oeste";
import { RECIPES_US_OESTE } from "./recipes-us-oeste";

const RECIPES_BASE: Recipe[] = [
  {
    id: "r-tlayudas", dishName: "Tlayudas oaxaqueñas", slug: "tlayudas-oaxaquenas",
    placeId: "mx-oax", summary: "Tortilla grande y crujiente con asiento, frijol, quesillo y tasajo.",
    history: "Platillo emblemático de los valles centrales de Oaxaca, vendido en mercados y esquinas al anochecer.",
    originConfidence: "confirmed", servings: 4, prepTimeMin: 25, cookTimeMin: 15, totalTimeMin: 40,
    difficulty: "media", moment: "cena", diet: [],
    ingredients: [
      { text: "4 tlayudas grandes" }, { text: "1 taza de frijoles refritos" },
      { text: "200 g de quesillo deshebrado" }, { text: "200 g de tasajo" },
      { text: "Asiento de cerdo al gusto", optional: true }, { text: "Lechuga, aguacate y salsa" },
    ],
    steps: [
      "Unta la tlayuda con asiento y frijoles.", "Añade quesillo y calienta sobre comal o brasas hasta que dore.",
      "Asa el tasajo aparte y córtalo en tiras.", "Cubre con lechuga, aguacate y salsa; dobla y sirve.",
    ],
    ratingAvg: 4.8, ratingCount: 210, popularityScore: 95, publishedAt: "2026-05-10",
    image: "/images/tlayudas-oaxaquenas.jpg", sources: ["Cocina tradicional oaxaqueña, notas de mercado 20 de Noviembre"],
  },
  {
    id: "r-mole-negro", dishName: "Mole negro", slug: "mole-negro-oaxaqueno",
    placeId: "mx-oax", summary: "Salsa profunda y compleja con más de 20 ingredientes y chiles chilhuacle.",
    history: "Considerado el rey de los moles oaxaqueños; se sirve en bodas y celebraciones.",
    originConfidence: "confirmed", servings: 6, prepTimeMin: 45, cookTimeMin: 120, totalTimeMin: 165,
    difficulty: "dificil", moment: "comida", diet: [],
    ingredients: [
      { text: "Chiles chilhuacle, mulato y pasilla" }, { text: "Chocolate de metate" },
      { text: "Ajonjolí, almendras y cacahuates" }, { text: "Plátano macho y pan tostado" },
      { text: "Especias: canela, clavo, pimienta" }, { text: "Caldo de pollo" },
    ],
    steps: [
      "Tuesta los chiles sin quemarlos y remójalos.", "Fríe semillas, frutos secos y plátano.",
      "Muele todo por partes con especias y chocolate.", "Cuece la salsa a fuego lento hasta espesar y sazona.",
    ],
    ratingAvg: 4.9, ratingCount: 340, popularityScore: 99, publishedAt: "2026-03-01",
    image: "/images/mole-negro-oaxaqueno.jpg", sources: ["Recetario familiar de los Valles Centrales"],
  },
  {
    id: "r-chiles-nogada", dishName: "Chiles en nogada", slug: "chiles-en-nogada",
    placeId: "mx-pue", summary: "Chile poblano relleno de picadillo, bañado en nogada de nuez y granada.",
    history: "Asociado a Puebla y a las fiestas patrias de septiembre por sus colores.",
    originConfidence: "commonly_associated", servings: 4, prepTimeMin: 60, cookTimeMin: 30, totalTimeMin: 90,
    difficulty: "dificil", moment: "comida", diet: [],
    ingredients: [
      { text: "4 chiles poblanos" }, { text: "Picadillo de carne con fruta" },
      { text: "Nueces de Castilla" }, { text: "Queso de cabra y leche" }, { text: "Granada y perejil" },
    ],
    steps: [
      "Asa y pela los chiles; rellénalos con picadillo.", "Licúa las nueces con queso y leche para la nogada.",
      "Baña los chiles con la nogada.", "Decora con granada y perejil.",
    ],
    ratingAvg: 4.7, ratingCount: 150, popularityScore: 88, publishedAt: "2026-07-20",
    image: "/images/chiles-en-nogada.jpg", sources: ["Tradición poblana de temporada"],
  },
  {
    id: "r-birria", dishName: "Birria de res", slug: "birria-de-res",
    placeId: "mx-jal", summary: "Guiso de carne en adobo de chiles, servido con consomé y tortillas.",
    history: "Originaria de Jalisco; hoy popular en tacos dorados en caldo.",
    originConfidence: "confirmed", servings: 6, prepTimeMin: 30, cookTimeMin: 180, totalTimeMin: 210,
    difficulty: "media", moment: "comida", diet: [],
    ingredients: [
      { text: "1.5 kg de res para deshebrar" }, { text: "Chiles guajillo y ancho" },
      { text: "Ajo, comino y orégano" }, { text: "Vinagre y laurel" }, { text: "Tortillas de maíz" },
    ],
    steps: [
      "Licúa los chiles remojados con especias y vinagre.", "Marina la carne en el adobo.",
      "Cuece a fuego lento hasta que se deshebre.", "Sirve con consomé, cebolla y cilantro.",
    ],
    ratingAvg: 4.6, ratingCount: 260, popularityScore: 97, publishedAt: "2026-06-15",
    image: "/images/birria-de-res.jpg", sources: ["Cocina tapatía"],
  },
  {
    id: "r-gumbo", dishName: "Gumbo", slug: "gumbo-criollo",
    placeId: "us-la", summary: "Guiso criollo con roux oscuro, mariscos o pollo y salchicha andouille.",
    history: "Plato insignia de Luisiana con influencias africanas, francesas y criollas.",
    originConfidence: "confirmed", servings: 6, prepTimeMin: 30, cookTimeMin: 90, totalTimeMin: 120,
    difficulty: "media", moment: "cena", diet: [],
    ingredients: [
      { text: "Harina y aceite para el roux" }, { text: "Salchicha andouille" },
      { text: "Camarones o pollo" }, { text: "Trinidad criolla: cebolla, apio y pimiento" }, { text: "Arroz cocido" },
    ],
    steps: [
      "Cocina un roux oscuro removiendo constantemente.", "Sofríe la trinidad criolla.",
      "Añade caldo, salchicha y proteína; cuece.", "Sirve sobre arroz blanco.",
    ],
    ratingAvg: 4.5, ratingCount: 120, popularityScore: 70, publishedAt: "2026-02-11",
    image: "/images/gumbo-criollo.jpg", sources: ["Cocina cajún y criolla de Luisiana"],
  },
  {
    id: "r-brisket", dishName: "Brisket ahumado", slug: "brisket-ahumado-texano",
    placeId: "us-tx", summary: "Pecho de res ahumado lento con corteza de pimienta y sal.",
    history: "Pilar del BBQ texano, cocido durante horas a baja temperatura.",
    originConfidence: "confirmed", servings: 8, prepTimeMin: 20, cookTimeMin: 600, totalTimeMin: 620,
    difficulty: "dificil", moment: "comida", diet: [],
    ingredients: [
      { text: "1 brisket completo" }, { text: "Sal gruesa y pimienta negra" }, { text: "Leña de roble o nogal" },
    ],
    steps: [
      "Aplica sal y pimienta generosamente.", "Ahúma a 110 °C hasta ~70 °C internos.",
      "Envuelve en papel y sigue hasta ~93 °C.", "Reposa una hora antes de rebanar.",
    ],
    ratingAvg: 4.7, ratingCount: 95, popularityScore: 65, publishedAt: "2026-04-05",
    image: "/images/brisket-ahumado-texano.jpg", sources: ["Tradición del BBQ de Texas Hill Country"],
  },
  {
    id: "r-pizza", dishName: "Pizza napolitana", slug: "pizza-napolitana",
    placeId: "it-cam-nap", summary: "Masa fina fermentada, tomate San Marzano, mozzarella y albahaca.",
    history: "Nacida en Nápoles; la Margherita rinde homenaje a la bandera italiana.",
    originConfidence: "confirmed", servings: 2, prepTimeMin: 20, cookTimeMin: 5, totalTimeMin: 25,
    difficulty: "media", moment: "cena", diet: ["vegetariano"],
    ingredients: [
      { text: "Masa de fermentación larga" }, { text: "Tomate San Marzano" },
      { text: "Mozzarella fior di latte" }, { text: "Albahaca fresca y aceite de oliva" },
    ],
    steps: [
      "Estira la masa a mano sin rodillo.", "Añade tomate, mozzarella y albahaca.",
      "Hornea muy caliente (450 °C+) 60-90 s.", "Termina con aceite de oliva.",
    ],
    ratingAvg: 4.9, ratingCount: 500, popularityScore: 100, publishedAt: "2026-01-25",
    image: "/images/pizza-napolitana.jpg", sources: ["Disciplinare de la pizza napolitana"],
  },
  {
    id: "r-cacio", dishName: "Cacio e pepe", slug: "cacio-e-pepe",
    placeId: "it-laz", summary: "Pasta romana con pecorino y pimienta negra emulsionados.",
    history: "Clásico de la cocina romana por su sencillez y tres ingredientes.",
    originConfidence: "confirmed", servings: 2, prepTimeMin: 5, cookTimeMin: 12, totalTimeMin: 17,
    difficulty: "media", moment: "comida", diet: ["vegetariano"],
    ingredients: [
      { text: "200 g de tonnarelli o spaghetti" }, { text: "100 g de pecorino romano" },
      { text: "Pimienta negra en grano" },
    ],
    steps: [
      "Cuece la pasta y reserva agua de cocción.", "Tuesta la pimienta.",
      "Emulsiona pecorino con agua de pasta.", "Mezcla con la pasta fuera del fuego.",
    ],
    ratingAvg: 4.6, ratingCount: 180, popularityScore: 80, publishedAt: "2026-07-01",
    image: "/images/cacio-e-pepe.jpg", sources: ["Cocina tradicional romana"],
  },
  {
    id: "r-okonomiyaki", dishName: "Okonomiyaki", slug: "okonomiyaki-osaka",
    placeId: "jp-osk", summary: "Tortilla salada de col con salsa, mayonesa y katsuobushi.",
    history: "Comida callejera de Osaka; su nombre significa 'a la plancha como quieras'.",
    originConfidence: "confirmed", servings: 2, prepTimeMin: 15, cookTimeMin: 15, totalTimeMin: 30,
    difficulty: "facil", moment: "street_food", diet: [],
    ingredients: [
      { text: "Col picada" }, { text: "Harina y huevo" }, { text: "Panceta de cerdo" },
      { text: "Salsa okonomi y mayonesa japonesa" }, { text: "Katsuobushi y alga aonori" },
    ],
    steps: [
      "Mezcla col, harina, huevo y agua.", "Cocina la masa con panceta encima.",
      "Voltea y dora ambos lados.", "Cubre con salsa, mayonesa y katsuobushi.",
    ],
    ratingAvg: 4.5, ratingCount: 140, popularityScore: 78, publishedAt: "2026-06-28",
    image: "/images/okonomiyaki-osaka.jpg", sources: ["Cocina de Osaka"],
  },
  {
    id: "r-ramen", dishName: "Ramen shoyu", slug: "ramen-shoyu",
    placeId: "jp-tky", summary: "Fideos en caldo de soya con chashu, huevo marinado y negi.",
    history: "El estilo shoyu de Tokio popularizó el ramen en la posguerra.",
    originConfidence: "commonly_associated", servings: 2, prepTimeMin: 30, cookTimeMin: 60, totalTimeMin: 90,
    difficulty: "media", moment: "comida", diet: [],
    ingredients: [
      { text: "Fideos ramen" }, { text: "Caldo de pollo y dashi" },
      { text: "Tare de soya" }, { text: "Chashu de cerdo" }, { text: "Huevo marinado (ajitama)" },
    ],
    steps: [
      "Prepara el caldo y el tare.", "Cuece los fideos al dente.",
      "Monta el tazón con caldo y fideos.", "Corona con chashu, huevo y negi.",
    ],
    ratingAvg: 4.8, ratingCount: 320, popularityScore: 96, publishedAt: "2026-05-30",
    image: "/images/ramen-shoyu.jpg", sources: ["Cocina de Tokio"],
  },
  {
    id: "r-padthai", dishName: "Pad Thai", slug: "pad-thai",
    placeId: "th-bkk", summary: "Fideos de arroz salteados con tamarindo, huevo, tofu y cacahuate.",
    history: "Promovido como plato nacional tailandés a mediados del siglo XX.",
    originConfidence: "commonly_associated", servings: 2, prepTimeMin: 20, cookTimeMin: 10, totalTimeMin: 30,
    difficulty: "facil", moment: "comida", diet: ["vegetariano"],
    ingredients: [
      { text: "Fideos de arroz" }, { text: "Pasta de tamarindo" }, { text: "Tofu y huevo" },
      { text: "Germen de soya y cebollín" }, { text: "Cacahuate molido y limón" },
    ],
    steps: [
      "Remoja los fideos.", "Saltea tofu y huevo en wok caliente.",
      "Añade fideos y salsa de tamarindo.", "Termina con germen, cacahuate y limón.",
    ],
    ratingAvg: 4.6, ratingCount: 400, popularityScore: 98, publishedAt: "2026-04-18",
    image: "/images/pad-thai.jpg", sources: ["Cocina callejera de Bangkok"],
  },
  {
    id: "r-khaosoi", dishName: "Khao Soi", slug: "khao-soi",
    placeId: "th-cnx", summary: "Curry cremoso del norte con fideos, pollo y fideos fritos encima.",
    history: "Especialidad de Chiang Mai con influencia birmana y del comercio.",
    originConfidence: "confirmed", servings: 2, prepTimeMin: 20, cookTimeMin: 30, totalTimeMin: 50,
    difficulty: "media", moment: "comida", diet: [],
    ingredients: [
      { text: "Pasta de curry khao soi" }, { text: "Leche de coco" }, { text: "Fideos de huevo" },
      { text: "Pollo" }, { text: "Encurtidos y limón" },
    ],
    steps: [
      "Fríe la pasta de curry.", "Añade leche de coco y pollo; cuece.",
      "Sirve sobre fideos cocidos.", "Corona con fideos fritos y encurtidos.",
    ],
    ratingAvg: 4.7, ratingCount: 110, popularityScore: 72, publishedAt: "2026-07-12",
    image: "/images/khao-soi.jpg", sources: ["Cocina del norte de Tailandia"],
  },
  {
    id: "r-tacos-pastor", dishName: "Tacos al pastor", slug: "tacos-al-pastor",
    placeId: "mx-jal", summary: "Cerdo adobado al trompo con piña, cebolla y cilantro.",
    history: "Adaptación mexicana del shawarma libanés, popular en todo el país.",
    originConfidence: "commonly_associated", servings: 4, prepTimeMin: 40, cookTimeMin: 20, totalTimeMin: 60,
    difficulty: "media", moment: "street_food", diet: [],
    ingredients: [
      { text: "Cerdo en filetes finos" }, { text: "Adobo de chiles y achiote" },
      { text: "Piña" }, { text: "Tortillas de maíz" }, { text: "Cebolla y cilantro" },
    ],
    steps: [
      "Marina el cerdo en el adobo.", "Asa en trompo o sartén con piña.",
      "Pica la carne finamente.", "Sirve en tortillas con piña, cebolla y cilantro.",
    ],
    ratingAvg: 4.9, ratingCount: 620, popularityScore: 99, publishedAt: "2026-06-02",
    image: "/images/tacos-al-pastor.jpg", sources: ["Taquerías del centro de México"],
  },
  {
    id: "r-tiramisu", dishName: "Tiramisú", slug: "tiramisu",
    placeId: "it-laz", summary: "Postre de soletas empapadas en café, mascarpone y cacao.",
    history: "Postre italiano moderno difundido desde el Véneto y adoptado en toda Italia.",
    originConfidence: "modern_variant", servings: 6, prepTimeMin: 30, cookTimeMin: 0, totalTimeMin: 30,
    difficulty: "facil", moment: "postre", diet: ["vegetariano"],
    ingredients: [
      { text: "Soletas (savoiardi)" }, { text: "Café espresso" }, { text: "Mascarpone y huevo" },
      { text: "Azúcar" }, { text: "Cacao en polvo" },
    ],
    steps: [
      "Bate mascarpone con yemas y azúcar.", "Incorpora claras a punto de nieve.",
      "Empapa soletas en café y forma capas.", "Refrigera y espolvorea cacao.",
    ],
    ratingAvg: 4.7, ratingCount: 280, popularityScore: 85, publishedAt: "2026-03-22",
    image: "/images/tiramisu.jpg", sources: ["Repostería italiana contemporánea"],
  },
  {
    id: "r-pancakes", dishName: "Buttermilk pancakes", slug: "buttermilk-pancakes",
    placeId: "us-tx", summary: "Hotcakes esponjosos de suero de leche para el desayuno.",
    history: "Básico del desayuno estadounidense servido con mantequilla y jarabe de maple.",
    originConfidence: "commonly_associated", servings: 4, prepTimeMin: 10, cookTimeMin: 15, totalTimeMin: 25,
    difficulty: "facil", moment: "desayuno", diet: ["vegetariano"],
    ingredients: [
      { text: "Harina y polvo para hornear" }, { text: "Suero de leche (buttermilk)" },
      { text: "Huevo y mantequilla" }, { text: "Jarabe de maple" },
    ],
    steps: [
      "Mezcla secos y húmedos por separado.", "Une sin batir de más.",
      "Cocina en sartén hasta burbujear y voltea.", "Sirve con mantequilla y maple.",
    ],
    ratingAvg: 4.3, ratingCount: 90, popularityScore: 60, publishedAt: "2026-08-03",
    image: "/images/buttermilk-pancakes.jpg", sources: ["Desayuno estadounidense clásico"],
  },
  {
    id: "r-mochi", dishName: "Mochi de fresa (daifuku)", slug: "ichigo-daifuku",
    placeId: "jp-tky", summary: "Masa de arroz glutinoso rellena de anko y fresa.",
    history: "Dulce japonés (wagashi) popular en primavera.",
    originConfidence: "confirmed", servings: 6, prepTimeMin: 30, cookTimeMin: 10, totalTimeMin: 40,
    difficulty: "media", moment: "postre", diet: ["vegetariano", "vegano"],
    ingredients: [
      { text: "Harina de arroz glutinoso (shiratamako)" }, { text: "Azúcar" },
      { text: "Pasta de frijol rojo (anko)" }, { text: "Fresas" }, { text: "Fécula de maíz" },
    ],
    steps: [
      "Cuece la masa de mochi al vapor o microondas.", "Envuelve cada fresa con anko.",
      "Estira el mochi y encierra el relleno.", "Sella y espolvorea con fécula.",
    ],
    ratingAvg: 4.4, ratingCount: 70, popularityScore: 55, publishedAt: "2026-07-28",
    image: "/images/ichigo-daifuku.jpg", sources: ["Repostería wagashi"],
  },
  {
    id: "r-guacamole", dishName: "Guacamole", slug: "guacamole",
    placeId: "mx-oax-city", summary: "Aguacate machacado con cebolla, chile, cilantro y limón.",
    history: "De raíces prehispánicas; el nombre viene del náhuatl āhuacamōlli.",
    originConfidence: "confirmed", servings: 4, prepTimeMin: 10, cookTimeMin: 0, totalTimeMin: 10,
    difficulty: "facil", moment: "street_food", diet: ["vegetariano", "vegano", "sin_gluten"],
    ingredients: [
      { text: "3 aguacates maduros" }, { text: "Cebolla y chile serrano" },
      { text: "Cilantro y jitomate" }, { text: "Limón y sal" },
    ],
    steps: [
      "Machaca el aguacate.", "Incorpora cebolla, chile, cilantro y jitomate.",
      "Sazona con limón y sal.", "Sirve de inmediato con totopos.",
    ],
    ratingAvg: 4.5, ratingCount: 300, popularityScore: 90, publishedAt: "2026-05-05",
    image: "/images/guacamole.jpg", sources: ["Cocina mexicana tradicional"],
  },
  {
    id: "r-somtam", dishName: "Som tam", slug: "som-tam",
    placeId: "th-bkk", summary: "Ensalada picante de papaya verde con limón, chile y cacahuate.",
    history: "Ensalada del noreste tailandés popularizada en todo el país.",
    originConfidence: "commonly_associated", servings: 2, prepTimeMin: 15, cookTimeMin: 0, totalTimeMin: 15,
    difficulty: "facil", moment: "comida", diet: ["vegetariano", "vegano"],
    ingredients: [
      { text: "Papaya verde rallada" }, { text: "Chile y ajo" }, { text: "Limón y salsa de pescado" },
      { text: "Tomate cherry y ejotes" }, { text: "Cacahuate" },
    ],
    steps: [
      "Machaca ajo y chile en mortero.", "Añade papaya, tomate y ejotes.",
      "Sazona con limón y salsa de pescado.", "Sirve con cacahuate encima.",
    ],
    ratingAvg: 4.4, ratingCount: 130, popularityScore: 68, publishedAt: "2026-06-20",
    image: "/images/som-tam.jpg", sources: ["Cocina tailandesa isan"],
  },
  {
    id: "r-jambalaya", dishName: "Jambalaya", slug: "jambalaya",
    placeId: "us-la", summary: "Arroz criollo cocido con pollo, salchicha y camarón.",
    history: "Plato criollo de Luisiana emparentado con la paella y el jollof.",
    originConfidence: "confirmed", servings: 6, prepTimeMin: 20, cookTimeMin: 45, totalTimeMin: 65,
    difficulty: "media", moment: "cena", diet: [],
    ingredients: [
      { text: "Arroz de grano largo" }, { text: "Pollo y andouille" },
      { text: "Camarón" }, { text: "Trinidad criolla y tomate" }, { text: "Caldo y especias cajún" },
    ],
    steps: [
      "Dora pollo y salchicha.", "Sofríe la trinidad y añade tomate.",
      "Incorpora arroz y caldo; cuece tapado.", "Agrega camarón al final.",
    ],
    ratingAvg: 4.4, ratingCount: 85, popularityScore: 62, publishedAt: "2026-02-27",
    image: "/images/jambalaya.jpg", sources: ["Cocina criolla de Luisiana"],
  },
  {
    id: "r-cemita", dishName: "Cemita poblana", slug: "cemita-poblana",
    placeId: "mx-pue", summary: "Torta poblana con pan de ajonjolí, milanesa, quesillo y pápalo.",
    history: "Antojito clásico de Puebla vendido en mercados.",
    originConfidence: "confirmed", servings: 2, prepTimeMin: 20, cookTimeMin: 15, totalTimeMin: 35,
    difficulty: "facil", moment: "comida", diet: [],
    ingredients: [
      { text: "Pan de cemita con ajonjolí" }, { text: "Milanesa de res o pollo" },
      { text: "Quesillo" }, { text: "Aguacate y chipotle" }, { text: "Pápalo" },
    ],
    steps: [
      "Fríe la milanesa.", "Abre la cemita y unta aguacate.",
      "Rellena con milanesa, quesillo y chipotle.", "Termina con pápalo.",
    ],
    ratingAvg: 4.5, ratingCount: 75, popularityScore: 58, publishedAt: "2026-08-06",
    image: "/images/cemita-poblana.jpg", sources: ["Cocina poblana"],
  },
];

export const RECIPES: Recipe[] = [
  ...RECIPES_BASE,
  ...RECIPES_MX_NORTE,
  ...RECIPES_MX_CENTRO,
  ...RECIPES_MX_SUR,
  ...RECIPES_PUEBLOS_MX_NORTE,
  ...RECIPES_PUEBLOS_MX_CENTRO,
  ...RECIPES_PUEBLOS_MX_SUR,
  ...RECIPES_US_SUR,
  ...RECIPES_US_NORESTE,
  ...RECIPES_US_MEDIO_OESTE,
  ...RECIPES_US_OESTE,
];
