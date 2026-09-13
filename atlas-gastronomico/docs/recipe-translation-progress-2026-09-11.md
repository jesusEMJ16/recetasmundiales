# Recipe translations — completed 2026-09-13

The 198-recipe catalog is complete in all twelve site languages: Spanish,
English, Simplified Chinese, Hindi, French, Arabic, Bengali, Portuguese (Brazil),
Russian, Urdu, Indonesian and Japanese. Every recipe has its title, summary,
history, ingredients, steps and tips in each language. Source references retain
their original text. The sitemap now contains 2376 recipe-language URLs.

Work resumed from the saved checkpoint: 59 previously authored tail records were
integrated and 428 remaining translations were authored directly. French added
58 records; Portuguese added 124 plus 14 recovered; Russian added 123 plus 30
recovered; Indonesian added 123 plus 15 recovered. The original checkpoint files
remain unchanged as a historical snapshot.

All catalogs retain recipe IDs, geographic assignment, list order, ingredient
flags, cooking quantities, temperatures and durations. Numeric word forms were
aligned with the source where needed; no new numeric-equivalence exemptions were
added. Geographic totals still represent 198 distinct recipes, including Mexico
101 and the United States 68. Translation does not multiply recipe counts.

## Validation

The automated suite requires all 198 records in every catalog, validates content,
quantities, sources, language scripts, search titles, sitemap coverage and map
counts. Missing-translation behavior is tested with simulated future records,
so the production catalogs can stay complete. Sampled editorial checks also
reviewed regional ingredients, pasteurized eggs, refrigeration and cooking
instructions. Recipes have not been physically prepared as part of this review.

## Retained Netlify build repair

The saved checkpoint updated UniversalSearch to expect `names[locale]`, but its committed search index still used `dishName` and `en`. Netlify therefore failed TypeScript compilation. The checkpoint also threw for missing translations, which would prevent static generation after the type error was fixed.

- Regenerate and commit the lightweight title index in its new twelve-label schema.
- Run `npm run recipes:index` before `next build`; Netlify now calls `npm run build`.
- Resolve translation availability per recipe. Missing entries display the Spanish original, with Spanish language/direction attributes and a notice in the selected language.
- Include only available translations in recipe hreflang and the sitemap. All current recipes now have all twelve versions; future missing translations remain accessible but have `noindex`.
- Check every saved translation and preserve ingredient flags, recipe IDs, geographic counts, sources and quantities. Eleven Japanese word-to-digit equivalents remaining from the checkpoint were reviewed explicitly; recipe text was unchanged.

Run `npm test` and `npm run build` from `atlas-gastronomico` before delivery. No TypeScript error suppression is enabled.
