# Atlas Gastronómico Mundial — Documento de Diseño (Spec v1)

**Proyecto:** Atlas Gastronómico Mundial (marca global: *Atlas of Flavor*)
**Fecha:** 2026-08-07
**Estado:** Spec aprobado — pendiente de plan de implementación
**Autor:** Diseño consolidado a partir de *Atlas Gastronómico Mundial Interactivo* (concepto) y *Recetario Mundial — Plan Estratégico* (arquitectura/monetización).

> Este documento **reemplaza y consolida** los dos PDFs originales en un único spec accionable. Donde había duplicidad o contradicción entre ambos, aquí se resuelve con una sola decisión.

---

## 0. Resumen en una frase

Una plataforma web donde el usuario **explora un mapa del mundo**, baja por niveles geográficos (país → estado → región → ciudad) y en cada lugar encuentra sus **recetas ordenadas por estrellas u otros filtros** (recién publicadas, más rápidas, más populares), con ficha de receta cocinable, procedencia cultural verificable y un pasaporte gastronómico que premia la exploración.

---

## 1. Decisiones tomadas (fijadas en el brainstorming)

| Decisión | Elección | Nota |
|---|---|---|
| Primer entregable | **Spec/diseño mejorado** (este documento) | El código viene después, en el plan de implementación. |
| Tecnología de mapa | **MapLibre GL JS** (mapa geográfico real, sin API key, gratis) | Alternativa ligera: GeoJSON de fronteras. |
| Idioma de lanzamiento | **Español primero**, luego multi-idioma | Arquitectura de contenido traducible desde el día 1. |
| SEO multi-idioma | **Excelente SEO en cada idioma** vía `hreflang`, slugs por idioma, contenido revisado | El idioma de la marca NO afecta el SEO; lo define el idioma del contenido. |
| Marca | Ancla **"Atlas"** (igual en ES/EN/IT/PT/FR/DE) + descriptor traducible | ES: *Atlas Gastronómico Mundial* · EN: *Atlas of Flavor*. Revisable. |

---

## 2. Mejoras aplicadas frente a los PDFs originales

1. **Orden de navegación corregido.** El pedido original hablaba de "ciudad → estado → municipio". La gente navega de **arriba hacia abajo**: Mundo → País → Estado/Provincia → Región culinaria → Ciudad/Pueblo → Plato → Receta. El acceso rápido a cualquier nivel se resuelve con el **buscador universal**, no invirtiendo la jerarquía.
2. **MVP antes que stack pesado.** El Blueprint saltaba directo a Next.js + PostGIS + Supabase + Mapbox. El propio Atlas (pág. 13) recomienda primero un **prototipo navegable de 3 pantallas**. Se adopta esa secuencia: validar la experiencia antes de invertir en infraestructura.
3. **Ranking de estrellas definido con precisión.** "Ordenar por estrellas" con promedio simple es injusto (1 receta con 5★ ganaría a 200 con 4.8★). Se adopta **ranking bayesiano** (fórmula en §5.2).
4. **Mapa sin costes ni API keys para el MVP.** Se sustituye Mapbox (de pago) por **MapLibre + tiles/GeoJSON abiertos**.
5. **Campos de datos que faltaban** para soportar el orden por estrellas y "recién publicado": `rating_avg`, `rating_count`, `rating_bayesian`, `published_at`, `popularity_score`.
6. **Aclaración de SEO de marca:** el nombre puede ser en inglés y aun así rankear #1 en español. Lo que Google indexa es el idioma del *contenido* + `hreflang`.

---

## 3. Experiencia de usuario

### 3.1 El bucle principal
**Descubrir → Filtrar → Cocinar → Registrar → Desbloquear → Compartir.**

### 3.2 Pantalla inicial (Hero)
- Mapa mundial MapLibre (o globo 3D como experimento posterior).
- **Buscador universal**: "Busca un plato, país, ciudad o ingrediente".
- Accesos rápidos: *Explorar por continente*, *Sorpréndeme*, *Cocinar con lo que tengo*, *Reto de la semana*.

### 3.3 Navegación geográfica (jerárquica + buscador)
Dos caminos que conviven:

- **Explorar (mapa):**
  `Mundo → País → Estado/Provincia → Región culinaria → Ciudad/Pueblo → Plato → Receta`
- **Buscar (universal):** salta directo a cualquier nivel.

Cada nivel geográfico tiene **URL propia e indexable** (ver §7).

**Mejora conceptual (heredada del Atlas):** la *región culinaria* no siempre coincide con la división política. La base de datos permite regiones culturales que cruzan fronteras administrativas (zona costera, valle, comunidad indígena, corredor migratorio).

### 3.4 Las tres pantallas del MVP 0
1. **Mundo** — mapa + buscador + accesos rápidos.
2. **País/Región** — mapa acotado + **lista de recetas ordenable y filtrable** (el corazón del producto).
3. **Receta** — ficha cocinable con procedencia, variantes, ingredientes, pasos, tiempos, valoración y schema.

---

## 4. Lista de recetas por lugar — el corazón del pedido

En cada página de lugar (país, estado, región, ciudad) se muestra la lista de sus recetas con **orden y filtros**.

### 4.1 Órdenes disponibles
| Orden | Criterio | Campo |
|---|---|---|
| ⭐ Mejor valoradas | Ranking bayesiano (§5.2) | `rating_bayesian` desc |
| 🆕 Recién publicadas | Fecha de publicación | `published_at` desc |
| 🔥 Más populares | Vistas + cocinados + shares | `popularity_score` desc |
| ⏱️ Más rápidas | Tiempo total | `total_time_min` asc |
| 🔤 Alfabético | Nombre del plato | `dish.name` asc |

### 4.2 Filtros disponibles
- **Momento:** desayuno, comida, cena, postre, bebida, street food.
- **Tiempo:** <15 min, <30 min, <60 min, lento/fin de semana.
- **Costo:** económico, medio, especial.
- **Dieta:** vegetariano, vegano, sin gluten, etc. (etiquetado responsable).
- **Técnica:** sartén, horno, parrilla, air fryer, sin cocinar.
- **Perfil:** picante, dulce, ahumado, ácido, reconfortante, fresco.
- **Cocinar con lo que tengo:** el usuario marca ingredientes disponibles; el sistema calcula coincidencia ("12 recetas completas y 28 con 1-2 ingredientes faltantes").

---

## 5. Modelo de datos

### 5.1 Entidades (consolidación de ambos PDFs)

```
Place              id, type(pais|estado|region|ciudad|pueblo), name, slug,
                   parent_id, geometry(GEOMETRY 4326), country_code, aliases[]
CulinaryRegion     id, name, slug, description, geometry?(opcional), places[]
Dish               id, name, slug, summary, history, origin_confidence, status
DishOrigin         id, dish_id, place_id?|culinary_region_id?, relation_type, source_id
Recipe             id, dish_id, author, servings, prep_time_min, cook_time_min,
                   total_time_min, difficulty, instructions(JSONB), version_type,
                   rating_avg, rating_count, rating_bayesian, popularity_score,
                   published_at, metadata_seo(JSONB), locale
Ingredient         id, canonical_name, aliases[], category, dietary_flags[]
RecipeIngredient   id, recipe_id, ingredient_id, quantity, unit,
                   preparation_note, optional(bool), substitution
Source             id, title, publisher, url, date, reliability_status
UserCook           id, user_id, recipe_id, date, rating(1-5), note, photo_url
Contribution       id, user_id, payload, sources[], moderation_status, reviewer_id
```

`origin_confidence` ∈ `{confirmed, commonly_associated, disputed, modern_variant}`.

### 5.2 Fórmula de ranking bayesiano (⭐ mejor valoradas)

```
rating_bayesian = (v / (v + m)) * R  +  (m / (v + m)) * C

  R = rating_avg de la receta
  v = rating_count de la receta
  m = umbral mínimo de votos para "confiar" (arranque: m = 20)
  C = media global de rating de todas las recetas (recalculada periódicamente)
```

Esto evita que recetas con pocos votos dominen el ranking. `m` y `C` se ajustan a medida que crece el catálogo.

### 5.3 Relaciones importantes
- Un plato puede pertenecer a **múltiples** lugares/regiones (por eso `DishOrigin` es tabla propia, no un campo en `Dish`).
- Un plato puede tener **múltiples** recetas y variantes (`version_type`: tradicional, regional, casera, moderna, vegetariana, adaptación).
- Una receta puede tener sustituciones sin alterar la versión tradicional.
- Toda afirmación de origen sensible apunta a una `Source`.

---

## 6. Arquitectura técnica

| Capa | Recomendación | Por qué |
|---|---|---|
| Frontend | **Next.js + TypeScript** | SSR/SSG, rutas dinámicas, buen SEO. |
| Estilos | **Tailwind CSS** (+ shadcn/ui) | Interfaz limpia, accesible, móvil. |
| Mapa | **MapLibre GL JS** | Open source, WebGL, vectorial, soporte de globo, sin API key. |
| Base de datos | **PostgreSQL + PostGIS** (Supabase) | Consultas espaciales, relaciones, auth incluida. |
| Búsqueda | Postgres FTS al inicio → Typesense/Meilisearch | Autocompletado, aliases, filtros rápidos. |
| Media | Cloudflare R2 / S3 | Imágenes AVIF/WebP responsivas. |
| Analytics | GA4 + Search Console + eventos propios | Adquisición, retención, comportamiento. |
| Deploy | Vercel / Cloudflare + CDN | Rendimiento global. |

**Rendimiento (reglas):** clusterizar recetas por región (no marcadores individuales globales), geometrías simplificadas por zoom, páginas estáticas/cacheadas para destinos populares, imágenes AVIF/WebP, medir Core Web Vitals desde el MVP.

---

## 7. SEO y arquitectura de URLs

### 7.1 Estructura de URLs (indexable por nivel)
```
/es/recetas/mexico/
/es/recetas/mexico/oaxaca/
/es/recetas/mexico/oaxaca/tlayudas/
/es/recetas/italia/campania/napoles/
/es/ingredientes/garbanzos/
/es/colecciones/recetas-japonesas-30-minutos/
```
El prefijo de idioma (`/es/`, `/en/`) permite SEO independiente por idioma.

### 7.2 SEO multi-idioma (requisito del usuario: excelente SEO en cada idioma)
- **`hreflang`** entre versiones equivalentes de cada página.
- **Slugs traducidos** por idioma (no traducir con máquina sin revisión en contenido cultural sensible).
- **Metadatos y contenido revisados** por hablantes nativos.
- Sitemap por idioma.

### 7.3 Datos estructurados (Schema.org)
- `Recipe` (JSON-LD) con `name`, `image`, `author`, `prepTime`, `cookTime`, `recipeYield`, `recipeCuisine`, `recipeCategory`, `aggregateRating`, `nutrition` (cuando aplique) → estrellas, tiempos y fotos en las SERPs.
- `ItemList` para páginas de colección/listado.

### 7.4 Tipos de página con potencial SEO
País/región, plato, ingrediente, restricción dietética, tiempo/costo, comparativa/historia.

---

## 8. Precisión cultural (el *moat*)

Reputación de **"recetas con procedencia"**: cada ficha explica no solo cómo cocinar, sino por qué se asocia a un lugar, qué variantes existen y qué nivel de certeza tiene la atribución.

| Nivel (`origin_confidence`) | Tratamiento |
|---|---|
| `confirmed` | Fuentes sólidas y asociación ampliamente aceptada. |
| `commonly_associated` | Muy representativo del lugar, origen exacto incierto. |
| `disputed` | Mostrar las versiones principales con fuentes y lenguaje neutral. |
| `modern_variant` | Distinguir adaptación contemporánea de receta tradicional. |

**Política de contenido:** redacción propia (no copiar), citar fuentes de origen, derechos claros para fotos de colaboradores, etiquetar contenido asistido por IA + revisión humana. Contribuciones entran como **propuestas** (moderación antes de publicar).

---

## 9. Retención: Food Passport

Sistema de progreso: países probados, regiones completadas, platos cocinados, rachas opcionales, medallas temáticas, mapa personal coloreado. **Premia exploración, no uso compulsivo.**

Complementos: botón **Sorpréndeme** (el mapa elige receta según restricciones), **tarjetas compartibles** ("Hoy cociné X de Y").

---

## 10. Monetización (por capas, no dependiente de una sola fuente)

| Canal | Cuándo activarlo |
|---|---|
| Afiliados ligeros (Amazon Associates, tiendas locales) | Desde el MVP. |
| Publicidad (AdSense → Mediavine/Raptive al escalar) | Cuando haya volumen de tráfico. |
| Premium/Pro ($4.99/mes: sin ads, modo cocina, listas de compra, export PDF) | Cuando haya usuarios recurrentes. |
| Patrocinios de marca por región | Con audiencia demostrable. |
| Turismo/experiencias culinarias | Fase de expansión. |
| B2B/API (datos geográficos de platos) | Escala. |

**Regla de oro:** los anuncios nunca interrumpen ingredientes/pasos ni ralentizan la interacción. Velocidad y utilidad primero.

**Secuencia:** 0-6m afiliados + tráfico → 6-18m publicidad → 12-24m premium → 18m+ patrocinios/B2B.

---

## 11. Roadmap

| Fase | Alcance | Meta |
|---|---|---|
| **MVP 0** | Prototipo navegable de 3 pantallas (Mundo/País/Receta) + 10-25 recetas reales | Validar navegación y estética. |
| **MVP 1** | 5 países (México, EE.UU., Italia, Japón, Tailandia), ~100 recetas, búsqueda, filtros, URLs SEO | Validar adquisición y utilidad. |
| **MVP 2** | Cuenta, favoritos, "cocinado", Food Passport, Sorpréndeme | Validar retención. |
| **MVP 3** | "Cocinar con lo que tengo", listas, contribuciones + moderación | Aumentar frecuencia y catálogo. |
| **Escala** | 20+ países, traducciones, afiliados, ads, premium | Monetización diversificada. |

**Primeras 100 recetas:** 20 por país distribuidas entre regiones (no concentradas en una ciudad); mezcla de platos famosos (tráfico) + regionales (diferenciación); cada una con imagen, historia corta, ingredientes, pasos, tiempos, porciones, origen y fuentes.

---

## 12. Métricas

**North Star:** nº de recetas marcadas como *cocinadas* por usuarios activos al mes.

Otras: Mapa→receta, Search→receta, recetas por sesión, cooked rate, retención 7/30 días, share rate, SEO clicks/indexación, afiliado CTR/revenue.

---

## 13. Riesgos y mitigación

| Riesgo | Mitigación |
|---|---|
| Catálogo enorme y lento de producir | Empezar pequeño, priorizar calidad, contribuciones moderadas. |
| Atribuciones culturales incorrectas | Fuentes, `origin_confidence`, múltiples orígenes, revisores. |
| Contenido programático pobre | Cada URL necesita utilidad única; no páginas vacías. |
| Mapa pesado en móviles | Progressive loading, clusters, simplificación, fallback 2D/lista. |
| Dependencia de Google | Email, pasaporte, shares, tráfico directo, comunidad, PWA. |
| Ads dañando UX | Ubicaciones limitadas + pruebas de velocidad/retención. |

**Lo que NO se construye al inicio:** app móvil nativa, nutrición clínica, reservas de restaurantes, marketplace propio de ingredientes, IA conversacional cara, los 195 países de golpe.

---

## 14. Próximo paso

Convertir este spec en un **plan de implementación** (skill `writing-plans`), empezando por el **MVP 0**: el prototipo navegable de 3 pantallas con MapLibre y 10-25 recetas reales, ordenables por estrellas / recién publicado / tiempo.

### Decisiones abiertas (revisables sin bloquear el arranque)
- Nombre definitivo de marca (ancla "Atlas" confirmada; descriptor por confirmar).
- `m` inicial del ranking bayesiano (arranque sugerido: 20).

### Decisiones cerradas
- **Pantalla inicial: mapa 2D** (MapLibre). El globo 3D queda descartado para el MVP.
