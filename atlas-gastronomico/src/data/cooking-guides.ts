import additions from "./editorial-guidance.json";
import translations from "./cooking-guide-translations.json";
import longTranslations from "./long-cooking-guide-translations.json";
import type { Locale } from "../i18n/config";
import { editorialGuidesUi, preparationChecks } from "../i18n/editorial-guides-ui";

type Guide = { title: string; sections: { title: string; text: string }[] };

// Additional editorial guidance, without claiming a personal cooking test.
const existingGuides: Record<string, Partial<Record<"es" | "en", Guide>>> = {
  guacamole: {
    es: { title: "Cómo conseguir un guacamole equilibrado", sections: [
      { title: "Elegir y preparar el aguacate", text: "Busca un aguacate que ceda suavemente a la presión, sin estar hundido ni excesivamente blando. Si la pulpa está dura, no se machacará bien y el resultado tendrá trozos correosos. Prepara la cebolla, el chile y el cilantro antes de abrir los aguacates: así puedes mezclar y servir sin dejar la pulpa expuesta durante toda la preparación." },
      { title: "Textura y humedad", text: "Machaca con un tenedor y detente cuando queden pequeños trozos suaves. Una licuadora produce una textura distinta, más parecida a una salsa. Pica finamente los complementos para distribuirlos sin que dominen cada bocado. Si el jitomate está muy jugoso, retira parte de las semillas y deja escurrir los cubos antes de añadirlos; no hace falta compensar el exceso de agua agregando más limón." },
      { title: "Ajustar el picante y la acidez", text: "Añade el serrano poco a poco y prueba la mezcla antes de incorporar el resto. Un jalapeño puede sustituirlo, aunque la intensidad cambia de una pieza a otra. Si necesitas una versión sin picante, omite el chile. La cantidad de jugo de un limón depende de su tamaño: incorpóralo gradualmente para que el aguacate siga siendo el sabor principal y ajusta la sal al final." },
      { title: "Prepararlo para servir", text: "Guarda los totopos por separado para que no absorban humedad. Para una espera breve, pasa el guacamole a un recipiente, alisa la superficie, cubre en contacto y refrigera. El contacto con el aire favorece que la superficie se oscurezca; el limón no sustituye la refrigeración ni garantiza que conserve su color. Prepararlo cerca del momento de servir da el mejor control sobre textura y frescura." },
    ] },
    en: { title: "How to balance your guacamole", sections: [
      { title: "Choosing and preparing avocados", text: "Choose an avocado that yields gently to pressure without feeling sunken or very soft. Hard flesh does not mash smoothly and leaves tough pieces. Prepare the onion, chile and cilantro before opening the avocados so you can mix and serve without leaving the flesh exposed throughout preparation." },
      { title: "Texture and moisture", text: "Mash with a fork and stop while small, soft pieces remain. A blender gives a different, sauce-like texture. Finely chop the additions so they are distributed rather than dominating each bite. If your tomato is very juicy, remove some seeds and drain the diced flesh before adding it; extra lime juice does not correct excess water." },
      { title: "Adjusting heat and acidity", text: "Add serrano gradually, tasting before using the remainder. Jalapeño can replace it, although heat varies between individual peppers. Omit chile for a mild adaptation. The amount of juice in a lime depends on its size: add it gradually so avocado remains the main flavor, and adjust salt at the end." },
      { title: "Preparing to serve", text: "Keep tortilla chips separate so they do not absorb moisture. For a short wait, transfer the guacamole to a container, smooth its surface, cover in direct contact and refrigerate. Air exposure encourages surface browning; lime juice does not replace refrigeration or guarantee that the color will remain unchanged. Preparing it close to serving gives better control over texture and freshness." },
    ] },
  },
  tiramisu: {
    es: { title: "Claves para un tiramisú con capas definidas", sections: [
      { title: "Preparar la crema", text: "La base debe verse uniforme antes de incorporar las claras. Si el mascarpone presenta grumos, intégralo suavemente a las yemas en pequeñas adiciones; batir con fuerza durante mucho tiempo puede volver la mezcla demasiado blanda. Utiliza un recipiente limpio y sin grasa para montar las claras. Después, incorpóralas con movimientos amplios desde el fondo, conservando el aire en lugar de seguir batiendo." },
      { title: "Controlar el café de las soletas", text: "Deja enfriar el café antes del montaje. Sumerge cada soleta brevemente y comprueba que se humedezca sin deshacerse. El tiempo depende de la marca y de lo secas que estén: no necesitas agotarlas de café. Si aparece líquido en el fondo de la fuente, las siguientes deben mojarse menos. Alterna capas regulares de soletas y crema para distribuir el café y que cada porción conserve su estructura." },
      { title: "Reposo y presentación", text: "Las cuatro horas indicadas son tiempo de refrigeración, no de trabajo activo. El reposo permite que las soletas se hidraten y la crema gane consistencia. Si la mezcla todavía está muy blanda, espera más antes de cortar. Para servirla sin depender de un corte limpio, puedes montarla en vasos individuales. Tamiza el cacao al final para que no se humedezca durante todo el reposo." },
      { title: "Huevos y refrigeración", text: "Esta versión no cocina los huevos: utiliza huevos o productos de huevo etiquetados como pasteurizados, siguiendo las instrucciones del fabricante. Las claras pasteurizadas pueden montar de forma diferente; comprueba que el producto sea adecuado para ello. Mantén el postre refrigerado hasta servir y devuelve el resto al frío. La FDA recomienda productos pasteurizados para preparaciones servidas con huevo crudo o poco cocido; el café y el reposo no sustituyen ese tratamiento." },
    ] },
    en: { title: "Making tiramisu with distinct layers", sections: [
      { title: "Preparing the cream", text: "The base should look uniform before adding egg whites. If the mascarpone is lumpy, gently incorporate small additions into the yolks; prolonged vigorous beating can make the mixture too soft. Use a clean, grease-free bowl for the whites, then fold them in with broad movements from the bottom to retain air rather than continuing to beat." },
      { title: "Controlling the coffee soak", text: "Let coffee cool before assembling. Briefly dip each ladyfinger and check that it is moist without falling apart. The time depends on the brand and dryness: the biscuits do not need to become saturated. If liquid collects at the bottom, dip the next biscuits less. Alternate even biscuit and cream layers to distribute the coffee and help each serving hold its shape." },
      { title: "Resting and presentation", text: "The four hours listed are refrigeration time rather than active work. Resting lets the biscuits hydrate and the cream become firmer. If the mixture remains very soft, allow more time before slicing. Individual glasses are another serving option that does not depend on a clean slice. Sift cocoa over the top just before serving so it does not become damp throughout the rest." },
      { title: "Eggs and refrigeration", text: "This version does not cook the eggs: use eggs or egg products labeled pasteurized, following the manufacturer's directions. Pasteurized whites may whip differently, so check that the product is suitable. Keep the dessert refrigerated until serving and return the remainder to the refrigerator. FDA recommends pasteurized products for dishes served with raw or undercooked eggs; coffee and resting do not replace that treatment." },
    ] },
  },
};

const additionalGuidance: Record<string, Partial<Record<Locale, string>>> = Object.fromEntries(
  Object.entries(additions).map(([slug, text]) => [slug, { ...text, ...translations[slug as keyof typeof translations] }]),
);

const translatedLongGuides: Record<string, Partial<Record<Locale, Guide>>> = longTranslations;

export const cookingGuides: Record<string, Partial<Record<Locale, Guide>>> = {
  ...Object.fromEntries(Object.entries(existingGuides).map(([slug, guide]) => [slug,
    { ...guide, ...translatedLongGuides[slug] },
  ])),
  ...Object.fromEntries(Object.entries(additionalGuidance).map(([slug, text]) => [slug,
    Object.fromEntries(Object.entries(text).map(([language, paragraph]) => {
      const locale = language as Locale;
      return [locale, { title: editorialGuidesUi[locale].technique, sections: [{ title: preparationChecks[locale], text: paragraph }] }];
    })),
  ])),
};

export function cookingGuideLocale(slug: string, locale: Locale): Locale {
  return cookingGuides[slug]?.[locale] ? locale : "en";
}
