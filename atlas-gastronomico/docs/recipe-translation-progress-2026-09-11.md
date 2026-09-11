# Recipe translation progress — 2026-09-11

The catalog contains 198 recipes. Spanish and English remain the only fully available recipe-content languages. The requested Chinese, Hindi, French, Arabic, Bengali, Portuguese, Russian, Urdu, Indonesian and Japanese catalogs are **not complete**.

## Completed in this change

- Recipe-page direction follows Arabic and Urdu; untranslated Spanish body text keeps its own left-to-right direction.
- Recipe cards can use the correct direction as additional catalogs become available.
- The six nutrition labels use the selected language in all 12 locales.
- The 198 recipe records, geographic origins, map counts and existing Spanish/English translations are unchanged.

## Translation validation

Public local-model samples were evaluated before attempting full-catalog generation. M2M100, MADLAD-400 and Qwen3.5-4B samples were rejected because of substantive ingredient/technique errors, especially in Arabic, Bengali and Urdu. None of those generated samples is imported by the app or included in this repository. A structural or numeric check alone would not establish semantic translation quality.

Hugging Face authentication succeeded, but the minimal translation preflight job was rejected by the service with HTTP 402 Payment Required. No cloud job was created. Current Jobs documentation permits accounts with positive compute credits; a Pro subscription is not itself mandatory.

## Remaining work

Translate all six editorial fields (dish name, summary, history, ingredients, steps, tips) for all 198 recipes in each pending language. Preserve bibliographic source titles/URLs, recipe IDs, routes, quantities, temperatures, timings, optional flags and geographic origins. Review culinary meaning as well as complete field coverage; register a locale only after all 198 entries pass. Then update localized search titles, sitemap/hreflang coverage and the catalog audit, and run tests plus the production build.

This is a preparation change, not completion of the twelve-language request.
