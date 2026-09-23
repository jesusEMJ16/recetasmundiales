# Imágenes de WorldBites — 23 de septiembre de 2026

## Estado del catálogo

Las 198 recetas tienen imagen local, en versión principal y miniatura WebP: 179 fotografías con atribución y 19 ilustraciones generadas digitalmente: 12 para fichas sin foto y siete para sustituir fotos de presentación inadecuada. Las once portadas de países siguen usando sus fotografías atribuidas. No se presentan las ilustraciones nuevas como fotografías documentales: cada ficha muestra un aviso visible traducido al idioma de la página.

Se añadieron 12 ilustraciones específicas para Pollo de San Marcos, Pan de pulque de Saltillo, Ceviche de marlín ahumado, Churipo, El bote de Mazamitla, Fiambre de San Miguel de Allende, Lengua mechada de Tequisquiapan, Naranjete de Huasca, Tatemado de Comala, Sopa de pan coleta, Comiteco y Pámpano en escabeche. Las composiciones siguen los ingredientes y la preparación de cada ficha; son interpretaciones visuales y las variantes regionales pueden diferir.

Se reemplazaron además siete fotografías visualmente inadecuadas: Gumbo, Hotdish de tater tots, Coricos de Mocorito y Salsa de jumiles, Clam cakes de Rhode Island, Chislic de Dakota del Sur y Pan de cazón. Las fotos antiguas permanecen en sus URL previas; las ilustraciones usan rutas nuevas. La auditoría conserva los datos de atribución originales en `previousPhoto`.

Los archivos reales están en `public/images/recipes-v2/`. Se conservan las imágenes públicas antiguas para no romper URL. `src/data/recipe-photos.json` contiene dimensiones, fuentes y el indicador `generated`; `docs/recipe-photo-audit.json` contiene la procedencia y los hashes de cada WebP. Las fotografías previas conservan sus atribuciones y licencias.

## SEO y accesibilidad

Las tarjetas y fichas de recetas usan texto alternativo localizado con el nombre del plato y su descripción. Las portadas usan el nombre y la descripción de la receta que muestran. Las 19 ilustraciones incluyen un aviso visible en los doce idiomas. Open Graph, Twitter y Recipe JSON-LD usan el archivo local correcto. Se mantienen las miniaturas responsivas y el estado accesible de error de carga.

## Comprobaciones

`npm test` verifica cobertura de 198 recetas, 0 pendientes, 19 ilustraciones identificadas, tamaños, archivos locales, procedencia, hashes y textos de interfaz en 12 idiomas. El flujo de solo lectura `recipe-photo-validation.yml` incluye TypeScript, compilación de producción, decodificación de imágenes y navegación. El informe del 20 de septiembre en `recipe-photo-validation.md` corresponde a la entrega anterior de 186 fotografías y se conserva como registro histórico.
