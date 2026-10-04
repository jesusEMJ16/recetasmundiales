export const informationSlugs = ["acerca-de", "contacto", "politica-editorial", "privacidad"] as const;
export type InformationSlug = (typeof informationSlugs)[number];
export type InformationPage = { title: string; intro: string; sections: { title: string; paragraphs: string[] }[] };
export const informationUpdatedAt = "2026-10-04";
export const correctionUrl = "https://github.com/jesusEMJ16/recetasmundiales/issues/new";

export const siteInformation: Record<"es" | "en", Record<InformationSlug, InformationPage>> = {
  es: {
    "acerca-de": {
      title: "Acerca de WorldBites",
      intro: "WorldBites es un proyecto independiente de Jesús Enrique Moncada Jiménez para explorar la cocina del mundo a través de sus lugares y preparar recetas en casa.",
      sections: [
        { title: "Del lugar al plato", paragraphs: ["El atlas conecta cada receta con un país, una región o una localidad. Puedes buscar un plato, explorar el mapa y consultar ingredientes, pasos, tiempos y consejos. Los países sin recetas permanecen en el mapa como referencias geográficas; no significan que el catálogo de ese país esté completo.", "Una preparación puede tener distintas versiones familiares o regionales. Cuando su origen es discutido, comúnmente asociado o corresponde a una variante moderna, la ficha lo indica en lugar de presentar una única versión como definitiva."] },
        { title: "Quién está detrás", paragraphs: ["Jesús Enrique Moncada Jiménez mantiene el proyecto WorldBites. El catálogo es una recopilación editorial para uso doméstico; no se presenta como un registro de recetas probadas personalmente en una cocina profesional.", "Las fotografías de terceros conservan sus atribuciones y licencias. Las imágenes de WorldBites ilustran el plato y no documentan una prueba de cocina. La selección de imágenes y la información culinaria son elementos distintos de cada ficha."] },
        { title: "Un catálogo en desarrollo", paragraphs: ["Publicamos recetas en doce idiomas. El número de recetas disponible se muestra en cada destino, y el catálogo se amplía de forma gradual. Agradecemos correcciones de cantidades, traducciones, procedencia y navegación mediante la página de contacto."] },
      ],
    },
    contacto: {
      title: "Contacto y correcciones",
      intro: "Puedes comunicar errores o sugerencias al proyecto WorldBites mediante las incidencias de su repositorio en GitHub.",
      sections: [
        { title: "Cómo enviar una corrección", paragraphs: ["Incluye el enlace de la página, el idioma y el detalle que debe revisarse. Para cantidades, técnicas o procedencia, añade una referencia verificable cuando la tengas. Si el problema es visual, indica el dispositivo y el navegador.", "El enlace de abajo abre un formulario de GitHub; necesitarás una cuenta de GitHub para enviarlo. Abrir el formulario no envía ninguna comunicación automáticamente."] },
        { title: "Privacidad de tu mensaje", paragraphs: ["Las incidencias del repositorio son públicas. No publiques contraseñas, documentos personales, datos de pago ni información que no quieras hacer pública. WorldBites no necesita esos datos para revisar una receta o un error del sitio."] },
        { title: "Qué podemos revisar", paragraphs: ["Puedes informar sobre ingredientes, tiempos, atribuciones de fotografías, traducciones, accesibilidad o enlaces rotos. No ofrecemos reservas de restaurantes ni asesoramiento nutricional personalizado a través de este canal, y no prometemos un plazo de respuesta."] },
      ],
    },
    "politica-editorial": {
      title: "Política editorial",
      intro: "WorldBites organiza información culinaria para que cada receta sea comprensible, tenga una procedencia identificable y resulte útil al cocinar.",
      sections: [
        { title: "Recetas y fuentes", paragraphs: ["Cada ficha incluye ingredientes y cantidades, preparación, porciones, tiempos y referencias consultables. Las nuevas referencias distinguen información del platillo, contexto y técnica. Un diccionario de un ingrediente o una guía de temperatura no demuestra el origen de una receta ni valida todas sus cantidades. La versión publicada puede diferir de las de las fuentes.", "El catálogo combina recopilación y redacción editorial. No afirmamos que todas las recetas hayan sido cocinadas o probadas personalmente. Los consejos describen técnicas y resultados esperados; los tiempos pueden variar con el equipo, el tamaño de los ingredientes y la temperatura. No publicamos valores nutricionales sin un cálculo o una fuente documentados."] },
        { title: "Origen, variantes y traducciones", paragraphs: ["Las asociaciones geográficas no siempre describen una invención exclusiva. Las fichas actuales presentan asociaciones habituales, orígenes disputados y variantes modernas. Una referencia regional por sí sola no convierte una asociación en un origen confirmado. Las sustituciones deben presentarse como adaptaciones y no como ingredientes obligatorios de todas las versiones.", "Las traducciones de las recetas conservan las cantidades, el orden de los pasos y los tiempos. Las guías complementarias y las introducciones de países están redactadas en español e inglés; en los demás idiomas se identifica expresamente el contenido adicional en inglés. Si encuentras una diferencia o una expresión confusa, puedes comunicarla con el enlace y el idioma de la ficha."] },
        { title: "Valoraciones e imágenes", paragraphs: ["No mostramos como opiniones reales las estrellas, los votos ni las cifras de popularidad usadas durante el prototipo. El orden alfabético, la fecha y el tiempo de preparación permiten explorar el catálogo sin atribuir actividad ficticia a los lectores.", "Las imágenes externas se publican con sus créditos y licencias. Una imagen ilustrativa no demuestra que la receta se haya probado. No se presentan las selecciones editoriales como publicidad pagada."] },
        { title: "Correcciones", paragraphs: ["Las correcciones se revisan en el catálogo y sus traducciones. La fecha de actualización de una ficha indica una modificación editorial; no certifica una prueba de cocina. Puedes solicitar una revisión desde Contacto."] },
      ],
    },
    privacidad: {
      title: "Privacidad y almacenamiento",
      intro: "Esta página explica qué almacenamiento y servicios utiliza WorldBites y cómo controlar las estadísticas opcionales. El responsable del proyecto es Jesús Enrique Moncada Jiménez.",
      sections: [
        { title: "Preferencias necesarias", paragraphs: ["El navegador guarda la elección de tema claro u oscuro con la clave theme y la preferencia de estadísticas con worldbites-analytics-v1 en almacenamiento local. Estas preferencias permanecen hasta que las cambies o borres los datos del sitio. No se necesita una cuenta para consultar recetas."] },
        { title: "Estadísticas opcionales", paragraphs: ["Google Analytics solo se carga después de elegir Aceptar estadísticas. Puede procesar datos técnicos y de navegación, como páginas consultadas, dispositivo e interacciones, y utilizar cookies _ga para medir visitas. Google actúa como proveedor de este servicio y su política de privacidad explica su tratamiento de datos.", "Puedes elegir Solo lo necesario o cambiar tu elección en Preferencias de privacidad, al pie de cualquier página. Al retirar el permiso, WorldBites desactiva la medición, elimina las cookies de Analytics accesibles desde este dominio y recarga la página. Retirar el permiso evita nuevas mediciones; no elimina automáticamente datos ya enviados a Google."] },
        { title: "Alojamiento, imágenes y enlaces", paragraphs: ["El sitio se aloja en Netlify. Como parte de la entrega y seguridad del sitio, el alojamiento puede procesar datos de conexión, incluida la dirección IP. Las imágenes y los archivos del mapa se sirven principalmente desde WorldBites; las banderas del mapa pueden solicitarse a flagcdn.com, que recibe los datos técnicos necesarios para responder.", "Los enlaces a fuentes, licencias, Google o GitHub abren servicios externos con sus propias políticas. Si envías una corrección por GitHub, el mensaje se publica en el repositorio y se gestiona dentro de ese servicio."] },
        { title: "Publicidad y contacto", paragraphs: ["El sitio conserva un identificador de verificación de AdSense. La carga de publicidad está desactivada por defecto en esta versión. Si se habilita, se limita a fichas de recetas completas; su activación requiere configurar por separado las opciones de privacidad publicitaria correspondientes.", "Para consultas sobre esta página puedes usar el canal descrito en Contacto. No incluyas información personal sensible en incidencias públicas. También puedes borrar las cookies y el almacenamiento local desde la configuración de tu navegador."] },
      ],
    },
  },
  en: {
    "acerca-de": {
      title: "About WorldBites",
      intro: "WorldBites is an independent project by Jesús Enrique Moncada Jiménez for exploring world cuisine through its places and preparing recipes at home.",
      sections: [
        { title: "From place to plate", paragraphs: ["The atlas connects recipes to a country, region or town. Search for a dish, explore the map and find ingredients, steps, timings and cooking tips. Countries without recipes remain on the map as geographic references; their presence does not mean their recipe catalog is complete.", "Dishes often have different family or regional versions. Recipe pages distinguish disputed origins, common associations and modern variants instead of treating one version as definitive."] },
        { title: "Who runs the project", paragraphs: ["Jesús Enrique Moncada Jiménez maintains WorldBites. The catalog is an editorial collection for home cooking, rather than a record of recipes personally tested in a professional kitchen.", "Third-party photographs retain their credits and licenses. WorldBites images illustrate dishes and do not document kitchen testing. Image selection and culinary information are distinct parts of each recipe page."] },
        { title: "A growing catalog", paragraphs: ["Recipes are published in twelve languages. Each destination shows the number of available recipes, and the catalog grows gradually. Corrections to quantities, translations, provenance and navigation are welcome through the contact page."] },
      ],
    },
    contacto: {
      title: "Contact and corrections",
      intro: "Report errors or suggest improvements to WorldBites through issues in the project's GitHub repository.",
      sections: [
        { title: "Submitting a correction", paragraphs: ["Include the page URL, language and the detail that needs review. For quantities, techniques or provenance, add a verifiable reference if you have one. For display problems, mention your device and browser.", "The link below opens a GitHub form. You need a GitHub account to submit it. Opening the form does not send a message automatically."] },
        { title: "Your message is public", paragraphs: ["Repository issues are public. Do not post passwords, personal documents, payment details or information you do not want to make public. WorldBites does not need those details to review a recipe or site error."] },
        { title: "What can be reviewed", paragraphs: ["Report ingredients, timings, photo credits, translations, accessibility or broken links. This channel does not offer restaurant reservations or personalized nutrition advice, and no response deadline is promised."] },
      ],
    },
    "politica-editorial": {
      title: "Editorial policy",
      intro: "WorldBites organizes culinary information so recipes are understandable, have identifiable provenance and help readers cook.",
      sections: [
        { title: "Recipes and references", paragraphs: ["Each page includes ingredients and quantities, preparation, servings, timings and consultable references. New references distinguish dish information, context and technique. An ingredient dictionary or temperature guide does not establish a recipe's origin or validate every quantity. The published version may differ from source versions.", "The catalog combines research and editorial writing. We do not claim that every recipe has been personally cooked or tested. Tips describe techniques and expected results; timings vary with equipment, ingredient size and temperature. We do not publish nutrition values without a documented calculation or source."] },
        { title: "Origins, variants and translations", paragraphs: ["Geographic associations do not always indicate an exclusive invention. Current entries show common associations, disputed origins and modern variants. A regional reference alone does not turn an association into a confirmed origin. Substitutions should be described as adaptations rather than requirements of every version.", "Recipe translations preserve ingredient quantities, step order and timings. Additional cooking guides and country introductions are written in Spanish and English; other languages explicitly identify the additional English content. Report differences or unclear wording with the page URL and language."] },
        { title: "Ratings and images", paragraphs: ["Prototype stars, vote counts and popularity numbers are not displayed as real reader opinions. Alphabetical order, publication date and preparation time let readers explore without attributing fictional activity to users.", "External images retain credits and licenses. An illustrative image is not evidence of kitchen testing. Editorial selections are not presented as paid advertising."] },
        { title: "Corrections", paragraphs: ["Corrections are reviewed in the catalog and its translations. A recipe's update date records an editorial change rather than certifying a cooking test. Request a review through Contact."] },
      ],
    },
    privacidad: {
      title: "Privacy and storage",
      intro: "This page explains WorldBites storage and services and how to control optional statistics. The project is operated by Jesús Enrique Moncada Jiménez.",
      sections: [
        { title: "Necessary preferences", paragraphs: ["Your browser stores the light or dark theme under theme and your statistics choice under worldbites-analytics-v1 in local storage. These preferences remain until you change them or clear site data. No account is required to read recipes."] },
        { title: "Optional statistics", paragraphs: ["Google Analytics loads only after you choose Accept statistics. It may process technical and browsing data, such as viewed pages, devices and interactions, and use _ga cookies to measure visits. Google provides this service; its privacy policy explains its data processing.", "Choose Necessary only or change your choice under Privacy preferences in any page footer. Withdrawing permission disables measurement, deletes Analytics cookies accessible on this domain and reloads the page. This prevents new measurements but does not automatically delete data previously sent to Google."] },
        { title: "Hosting, images and links", paragraphs: ["Netlify hosts the site and may process connection data, including IP addresses, to deliver and secure it. Images and map files are primarily served by WorldBites; map flags may be requested from flagcdn.com, which receives technical data needed to respond.", "Links to sources, licenses, Google and GitHub open external services with their own policies. Corrections submitted through GitHub are public repository messages managed by that service."] },
        { title: "Advertising and contact", paragraphs: ["The site retains an AdSense verification identifier. Advertising loading is disabled by default in this version. If enabled, it is limited to complete recipe pages and requires advertising privacy options to be configured separately.", "For questions about this page, use the channel described under Contact. Do not include sensitive personal information in public issues. You can also clear cookies and local storage through your browser settings."] },
      ],
    },
  },
};
