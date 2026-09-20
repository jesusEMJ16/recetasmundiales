# Validación de fotografías — 20 de septiembre de 2026

Código validado: `f7b47194c79a47fac4594e38f4e399e524b121f9`.
Ejecución: https://github.com/jesusEMJ16/recetasmundiales/actions/runs/35536231820
Los commits posteriores de documentación no modifican ese código ni las imágenes.

## Resultados ejecutados

- `npm test`: 61 pruebas correctas en 12 archivos.
- `npx tsc --noEmit`: sin errores.
- `npm run build`: correcto; 6545 páginas generadas.
- 372 archivos WebP decodificados: 186 imágenes principales y 186 miniaturas. Ninguna discrepancia entre las dimensiones reales y las declaradas.
- 372 URL locales solicitadas al servidor de producción de prueba: todas respondieron HTTP 200, con contenido `image/webp` no vacío.
- Navegador Chromium, escritorio: 11 portadas de países cargadas; cuatro tarjetas de recetas de Francia cargadas; fotografía principal de Coq au Vin cargada con prioridad y URL coincidente en Open Graph y JSON-LD.
- Navegador Chromium, móvil de 390 píxeles: fotografía cargada, sin desbordamiento horizontal en la receta revisada.
- Receta en árabe: fotografía cargada y dirección de lectura RTL presente.
- Receta pendiente de Pollo de San Marcos: aviso explícito y ningún elemento de imagen roto.
- Cero respuestas HTTP de error para imágenes locales durante la navegación comprobada.

Se inspeccionaron las capturas generadas de las portadas, el listado de Francia y la receta en móvil. Las capturas completas hechas después de desplazarse pueden mostrar la barra fija a la altura del desplazamiento; las comprobaciones funcionales se realizaron en el navegador, no sobre un montaje de imágenes.

## Alcance y límites

Las pruebas se ejecutaron sobre una compilación de producción en un servidor de prueba, no en el sitio público de Netlify. No se fusionó `main` ni se publicó manualmente. Las 12 fotografías pendientes siguen identificadas en `recipe-photography.md` y `recipe-photo-audit.json`.

La revisión de fotografías no constituye una auditoría de seguridad ni una comprobación de cada página en todos los navegadores. Los avisos de dependencias existentes están documentados en `recipe-photography.md`.
