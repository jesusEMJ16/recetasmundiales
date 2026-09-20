# Fotografías de WorldBites — 20 de septiembre de 2026

## Entrega guardada en GitHub

El catálogo conserva sus 198 recetas. Esta entrega contiene fotografías locales para 186 recetas: 22 asignaciones nuevas, 32 reemplazos y 132 fotografías existentes conservadas y optimizadas. Las 20 recetas que dependían de imágenes externas ahora usan fotografías locales del plato correspondiente.

Las portadas de los 11 países con recetas —México, Estados Unidos, Italia, España, Japón, Tailandia, Francia, Alemania, Grecia, Portugal y Austria— comparten fotografía, fuente y atribución con una receta de su país. No se modifican las recetas, cantidades, traducciones, identificadores, enlaces ni datos del mapa.

Se incluyen 372 archivos WebP: una imagen principal de hasta 1200 píxeles y una miniatura de hasta 480 píxeles por receta, sin ampliar imágenes pequeñas. Las tarjetas cargan imágenes bajo demanda; la imagen principal de una receta tiene prioridad. Las dimensiones y los tamaños alternativos están declarados. Un fallo de carga muestra un aviso accesible, no una imagen rota.

Los archivos reales están en `public/images/recipes-v2/`. Las descargas de investigación y los artefactos temporales de Actions NO son necesarios para ejecutar, compilar o desplegar la aplicación. Se conservaron los archivos públicos anteriores para no romper sus URL.

## Fuentes y licencias

`recipe-photo-audit.json` registra autores, fuentes originales, licencias, cambios de tamaño o recorte y verificaciones SHA-256. `src/data/recipe-photos.json` es el catálogo que utiliza la aplicación. Los enlaces de licencia se presentan mediante HTTPS, conservando la URL original recibida en los datos de procedencia.

Las imágenes ilustran el plato: su presentación, acompañamientos y variantes regionales pueden diferir de las instrucciones. La atribución no implica el respaldo de los fotógrafos. Las cinco fotografías de Flickr añadidas se contrastaron con la licencia indicada en sus respectivas páginas de origen.

## Doce fotografías aún pendientes

Estas recetas no se presentan como terminadas. No se encontró o seleccionó una fotografía del plato que pudiera verificarse visualmente y utilizarse con la licencia correspondiente. Los resultados de otros alimentos, locales, personas o paisajes se descartaron.

- Pollo de San Marcos (`pollo-de-san-marcos`).
- Pan de pulque de Saltillo (`pan-de-pulque-de-saltillo`).
- Ceviche de marlín ahumado (`ceviche-de-marlin-ahumado`).
- Churipo (`churipo-purepecha`).
- El bote de Mazamitla (`el-bote-de-mazamitla`).
- Fiambre estilo San Miguel de Allende (`fiambre-estilo-san-miguel-de-allende`).
- Lengua mechada de Tequisquiapan (`lengua-mechada-de-tequisquiapan`).
- Naranjete de Huasca de Ocampo (`naranjete-de-huasca-de-ocampo`).
- Tatemado de puerco estilo Comala (`tatemado-de-puerco-estilo-comala`).
- Sopa de pan coleta (`sopa-de-pan-coleta`).
- Comiteco (`comiteco`).
- Pámpano en escabeche (`pampano-en-escabeche-palizada`).

## Comprobaciones reproducibles

`npm test` comprueba cobertura, archivos, atribución, países, dimensiones, fuentes responsivas, hashes y estados de error. El flujo de solo lectura `recipe-photo-validation.yml` ejecuta pruebas, TypeScript, compilación de producción, decodificación de cada WebP y comprobaciones HTTP y de navegador en escritorio y móvil. No publica, modifica ramas ni consulta servicios externos de fotografías.

Para añadir una fotografía pendiente hay que guardar ambos tamaños, añadir su fuente y licencia al catálogo, actualizar la auditoría y retirar únicamente esa entrada de la lista de pendientes. No se debe ocultar un fallo desactivando las comprobaciones.

## Aviso fuera del alcance de las fotografías

Durante la instalación, `npm ci` informó de seis vulnerabilidades en las dependencias fijadas existentes: dos moderadas, dos altas y dos críticas. Este trabajo no modifica `package.json` ni `package-lock.json` ni realiza una auditoría de explotabilidad. La actualización y evaluación de esas dependencias requiere una revisión separada; la compilación correcta no equivale a una auditoría de seguridad.
