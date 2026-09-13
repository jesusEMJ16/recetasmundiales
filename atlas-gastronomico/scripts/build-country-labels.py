"""Generate interior label anchors from the checked-in world geometry.

Run: python scripts/build-country-labels.py (requires shapely, like build-geography.py).
No network or build-time Python dependency. Coordinates use Leaflet's Mercator
projection so the clearance is useful at every map zoom, including high latitudes.
"""
import json
import math
from pathlib import Path

from shapely.geometry import Point, shape
from shapely.ops import polylabel, transform

ROOT = Path(__file__).resolve().parents[1]


def project(x, y, z=None):
    latitude = max(-85.05112878, min(85.05112878, y))
    return x, math.degrees(math.asinh(math.tan(math.radians(latitude))))


def build():
    countries = json.loads((ROOT / "public/geo/world-countries.geojson").read_text())
    codes = {country["code"] for country in json.loads((ROOT / "src/data/world-atlas.json").read_text())}
    labels = {}
    for feature in countries["features"]:
        code = feature["properties"]["code"]
        if code not in codes:
            continue
        geometry = shape(feature["geometry"])
        # Mainland, not the bounds midpoint (which can lie in the ocean).
        parts = list(geometry.geoms) if geometry.geom_type == "MultiPolygon" else [geometry]
        mainland = max(parts, key=lambda polygon: polygon.area)
        projected = transform(project, mainland)
        anchor = polylabel(projected, tolerance=0.00001)
        latitude = math.degrees(math.atan(math.sinh(math.radians(anchor.y))))
        # Keep full precision: microstates also need an anchor strictly on land.
        labels[code] = {
            "lat": latitude,
            "lng": anchor.x,
            "radius": anchor.distance(projected.boundary) * 256 / 360,
        }
        assert mainland.contains(Point(anchor.x, latitude)), code
    assert set(labels) == codes
    (ROOT / "src/data/country-labels.json").write_text(json.dumps(labels, ensure_ascii=False, indent=2) + "\n")
    print(f"Generated {len(labels)} interior country labels")


if __name__ == "__main__":
    build()
