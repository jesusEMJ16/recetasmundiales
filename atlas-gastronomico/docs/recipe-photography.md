# Imágenes de WorldBites — 23 de septiembre de 2026

## Catálogo

Las 198 recetas tienen archivos WebP locales en tamaño principal y miniatura: 179 fotografías atribuidas y 19 ilustraciones originales de WorldBites. Las fotografías conservan autoría, fuente y licencia en `src/data/recipe-photos.json` y `docs/recipe-photo-audit.json`.

Las ilustraciones cubren doce fichas que carecían de foto y sustituyen siete fotografías cuya presentación no resultaba adecuada: Gumbo, Hotdish de tater tots, Coricos de Mocorito, Salsa de jumiles, Clam cakes de Rhode Island, Chislic de Dakota del Sur y Pan de cazón. La auditoría conserva la procedencia de las fotos anteriores en `previousPhoto`. Las portadas de los once países destacados siguen usando fotografías atribuidas.

Los archivos están en `public/images/recipes-v2/`. Las URL anteriores continúan disponibles. La auditoría incluye los hashes de las imágenes actuales.

## SEO y accesibilidad

Las tarjetas y fichas usan texto alternativo localizado con el nombre del plato y su descripción. Las portadas describen la receta que muestran. Open Graph, Twitter y Recipe JSON-LD enlazan los archivos locales. Las imágenes usan tamaños responsivos y tienen un estado accesible si falla su carga.

## Comprobaciones

`npm test` verifica las 198 recetas, los archivos locales, dimensiones, procedencia y hashes. El flujo `recipe-photo-validation.yml` comprueba TypeScript, compilación, decodificación y navegación en el navegador.
