# Interior country labels

The world overview now displays a small ISO country code with the actual recipe
total on the next line. Permanent white cards and crowded-country dots are
removed from the world overview. Hovering or focusing a country shows its full
localized name and total; clicking still zooms to its administrative regions.
State links, filters and recipe counts are unchanged.

`src/data/country-labels.json` contains 195 anchors generated from the checked-in
country polygons. Each anchor is inside the main landmass, outside holes and
lakes. Mercator clearance determines when a complete two-line label fits on land.
Labels appear as the map is enlarged or zoomed; small countries are still
selectable through their polygons and the complete country list at every zoom.
No label is displaced into a neighbouring country or the sea.

Regenerate anchors after changing world geometry:

```sh
# Shapely is also used by the existing geography generator.
python scripts/build-country-labels.py
npx vitest run src/domain/country-labels.test.ts src/components/WorldMap.test.tsx
```

Python is only needed to regenerate this checked-in data. Netlify builds continue
using `npm run build`. Automated checks cover all 195 anchor locations, map
counts and hover labels, country zoom and state recipe navigation.
