"""
/fragility — fragility index surface as GeoJSON polygons.

Returns the 1 km grid cells classified stable / fragile / critical from the
4-component fragility index, plus the underlying components so
the frontend can drive pop-ups and the redundancy view.

Params:
  service_group : surgery | geriatrics | emergency   (required)
"""
from fastapi import APIRouter, Query

from ..db import get_pool
from ..geojson import geojson_response

router = APIRouter(prefix="/fragility", tags=["fragility"])

_VALID_SERVICES = {"surgery", "geriatrics", "emergency"}


@router.get("", summary="Fragility index surface as GeoJSON")
async def get_fragility(
    service_group: str = Query(..., description="surgery | geriatrics | emergency"),
):
    if service_group.lower() not in _VALID_SERVICES:
        return geojson_response(None)

    query = """
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', COALESCE(json_agg(feature), '[]'::json)
        )::text
        FROM (
            SELECT json_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(ST_Transform(g.geom, 4326))::json,
                'properties', json_build_object(
                    'grid_id',          fr.grid_id,
                    'fragility_score',  round(fr.fragility_score::numeric, 3),
                    'fragility_class',  fr.fragility_class,
                    'dependency_gap',   round(fr.dependency_gap::numeric, 1),
                    'redundancy_count', fr.redundancy_count,
                    'district',         g.district_name,
                    'elderly',          g.elderly_population
                )
            ) AS feature
            FROM fragility_results fr
            JOIN population_grid g ON fr.grid_id = g.grid_id
            WHERE fr.service_group = $1
        ) t;
    """
    pool = get_pool()
    async with pool.acquire() as conn:
        fc = await conn.fetchval(query, service_group.lower())
    return geojson_response(fc)
