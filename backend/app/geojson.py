"""
Helpers for returning GeoJSON built entirely inside PostGIS.

Strategy: instead of fetching rows into Python and serialising them, we let
PostGIS assemble the whole GeoJSON FeatureCollection with json_build_object()
+ ST_AsGeoJSON(). The query returns a single JSON document as text, which we
stream straight to the client. This is the fastest path — no per-row Python
overhead — and keeps the geometry encoding authoritative in the database.

Note on CRS: all geometries are stored in EPSG:25832 (UTM 32N). Leaflet /
web maps expect EPSG:4326 (lon/lat), so every geometry is reprojected with
ST_Transform(geom, 4326) before ST_AsGeoJSON.
"""
from fastapi import Response
from fastapi.responses import JSONResponse

# An empty FeatureCollection, returned when a query matches no rows.
EMPTY_FC = '{"type":"FeatureCollection","features":[]}'


def geojson_response(feature_collection: str | None) -> Response:
    """Wrap a PostGIS-produced JSON string in an application/json response."""
    body = feature_collection if feature_collection else EMPTY_FC
    return Response(content=body, media_type="application/json")


def error(status_code: int, message: str) -> JSONResponse:
    return JSONResponse(status_code=status_code, content={"detail": message})
