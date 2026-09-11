# Recipe translations and Netlify build repair

The 198-recipe catalog is complete in Spanish, English, Chinese, Hindi, Arabic, Bengali, Urdu and Japanese. Saved application catalogs are partial in French (140), Portuguese (60), Russian (45) and Indonesian (60). Translation work remains paused; this repair does not add or rewrite recipe translations.

## Build repair

The saved checkpoint updated UniversalSearch to expect `names[locale]`, but its committed search index still used `dishName` and `en`. Netlify therefore failed TypeScript compilation. The checkpoint also threw for missing translations, which would prevent static generation after the type error was fixed.

- Regenerate and commit the lightweight title index in its new twelve-label schema.
- Run `npm run recipes:index` before `next build`; Netlify now calls `npm run build`.
- Resolve translation availability per recipe. Missing entries display the Spanish original, with Spanish language/direction attributes and a notice in the selected language.
- Include only available translations in recipe hreflang and the sitemap (1889 recipe-language URLs). Missing translations remain accessible but have `noindex`.
- Check every saved translation and preserve ingredient flags, recipe IDs, geographic counts, sources and quantities. Eleven Japanese word-to-digit equivalents remaining from the checkpoint were reviewed explicitly; recipe text was unchanged.

## Resuming translations

The original snapshot and its exact counts remain in `translation-checkpoint-2026-09-11/`. It includes separate tail fragments for Portuguese, Russian and Indonesian; those fragments are still preserved without merging. Complete remaining records, merge fragments by ID, regenerate the index and update coverage assertions when translation work resumes.

Run `npm test` and `npm run build` from `atlas-gastronomico` before delivery. No TypeScript error suppression is enabled.
