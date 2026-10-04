# WorldBites: publication quality and AdSense review

The reported rejection is **low-value content**. Site ownership was already verified. These changes improve the site's usefulness and transparency; approval remains Google's decision.

## Implemented

- Empty geographic catalogs remain accessible through the complete 195-country map, but return `noindex, follow` and are not included in the sitemap or pre-generated catalog list.
- The map sidebar defaults to countries with recipes. Its checkbox and search retain access to all countries. Empty selections do not offer an “all recipes” link.
- Filtered catalog variants return `noindex, follow` and canonicalize to the unfiltered catalog.
- Related recipes stay within the country. Their heading names the country rather than a town when recommendations include other regions.
- Seeded recipe ratings, vote counts and popularity scores are normalized to zero at the catalog boundary; only alphabetical, date and preparation-time ordering are offered. Restaurant prototype ratings and unsupported registration/promotional buttons are removed.
- Every recipe has an ingredient checklist and a portion adjuster in all twelve interface languages. Only an unambiguous leading numeric quantity is adjusted. Descriptive quantities and timing remain unchanged; the UI explains this limitation. Original quantities remain in structured data.
- Guacamole and tiramisu have expanded Spanish and English cooking guides and consultable sources. These sources provide context and technique/safety references; the site's own ingredient quantities are not represented as identical copies of the cited versions.
- All recipes identify WorldBites as the editorial publisher and link to its policy and contact channel. No personal kitchen-testing claims are introduced.
- About, contact, editorial and privacy pages are published in Spanish and English. Footer labels and privacy controls are translated into all twelve languages. Other-language information routes explicitly display English fallback text, are `noindex`, and canonicalize to English.
- Contact opens the repository's public GitHub issue form, as selected by the owner. It does not send messages automatically. Readers are told not to post sensitive information.
- Analytics is off until optional statistics are accepted. Preferences can be reopened in the footer. Revoking permission disables measurement and removes accessible Analytics cookies; the accepting tab reloads on withdrawal. Storage events also disable measurement in other open tabs.
- The example restaurant directory is clearly labeled as a prototype, `noindex`, and excluded from the sitemap.
- Domain verification through `google-adsense-account` and the existing `ads.txt` is retained. Advertising scripts are off by default, with a recipe-only loader available after separate advertising setup.

## Validation

Run from `atlas-gastronomico`:

```sh
npm ci
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Tests cover cross-country recommendation regressions, empty and filtered catalog indexing, information canonical URLs, removal of seeded votes, portion scaling and the statistics preference flow. Existing translation, catalog, map and image tests remain in place.

## After publishing

1. Verify the live `/es` homepage, `/es/receta/guacamole`, `/es/receta/tiramisu`, `/es/informacion/privacidad`, and `/es/recetas/afganistan`. The last page should be accessible with `noindex, follow` and no ads.
2. In Search Console, inspect representative updated pages and ensure `https://worldbitesapp.com/sitemap.xml` is submitted. The presence of a sitemap does not establish the number of indexed pages; only Search Console can confirm that.
3. Continue reviewing recipes individually for useful techniques, accurate quantities and specific references. The two expanded guides are the first additions; this change does **not** claim that all 239 recipes have received a new documentary or personal cooking review.
4. After checking the live changes, use AdSense's “I confirm I have fixed the issues” and “Request review” controls. These repository changes do not submit the review automatically.
5. Once approved, configure the advertising privacy messages and any Google-required certified CMP in AdSense. The site's statistics preference panel is **not** an advertising CMP.
6. Only after that setup, configure both `NEXT_PUBLIC_ADSENSE_ENABLED=true` and `NEXT_PUBLIC_ADSENSE_CONSENT_CONFIGURED=true` in Netlify and rebuild. Google Auto ads can persist across client-side navigation: configure page exclusions in AdSense for home/map-only screens, `/recetas/`, `/informacion/`, `/restaurantes`, empty states and errors before enabling them. Setting the flags is an operator confirmation, not automatic verification of AdSense approval or consent configuration.

Official references:

- https://support.google.com/adsense/answer/7299563
- https://support.google.com/publisherpolicies/answer/11112688
- https://support.google.com/adsense/answer/13554116

No traffic counts, reader reviews, test results from a kitchen or guaranteed approval are invented.
