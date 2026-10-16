"""
/accessibility — travel-time surface as GeoJSON polygons.

Returns the 1 km grid cells coloured by travel time to the nearest hospital
offering the requested service, for a given scenario (0 = baseline).

Params:
  service_group : surgery | geriatrics | emergency   (required)
  scenario_id   : 0 baseline (default) | 1-4 simulated closures
  district      : optional district name filter
"""
from fastapi import APIRouter, Query

from ..db import get_pool
from ..geojson import geojson_response

router = APIRouter(prefix="/accessibility", tags=["accessibility"])

_VALID_SERVICES = {"surgery", "geriatrics", "emergency"}


@router.get("", summary="Accessibility travel-time surface as GeoJSON")
async def get_accessibility(
    service_group: str = Query(..., description="surgery | geriatrics | emergency"),
    scenario_id: int = Query(0, description="0 = baseline; 1-4 = scenarios"),
    district: str | None = Query(None, description="optional district name"),
):
    if service_group.lower() not in _VALID_SERVICES:
        return geojson_response(None)

    # The baseline (scenario_id=0) is stored as the full cell x hospital
    # expansion; the accessibility surface is the NEAREST hospital per cell, i.e.
    # MIN(travel_time). DISTINCT ON (grid_id) ORDER BY ... travel_time_min picks
    # that nearest row. For the already-reduced scenarios 1-4 it is a no-op.
    # (This reproduces v_accessibility_surface without mutating the table.)
    query = """
        WITH nearest AS (
            SELECT DISTINCT ON (ar.grid_id)
                   ar.grid_id, ar.travel_time_min, ar.accessible, ar.coverage_margin
            FROM accessibility_results ar
            WHERE ar.service_group = $1 AND ar.scenario_id = $2
            ORDER BY ar.grid_id, ar.travel_time_min
        )
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', COALESCE(json_agg(feature), '[]'::json)
        )::text
        FROM (
            SELECT json_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(ST_Transform(g.geom, 4326))::json,
                'properties', json_build_object(
                    'grid_id',         n.grid_id,
                    'travel_time_min', round(n.travel_time_min::numeric, 1),
                    'accessible',      n.accessible,
                    'coverage_margin', round(n.coverage_margin::numeric, 1),
                    'district',        g.district_name,
                    'population',      g.total_population,
                    'elderly',         g.elderly_population
                )
            ) AS feature
            FROM nearest n
            JOIN population_grid g ON n.grid_id = g.grid_id
            WHERE ($3::text IS NULL OR g.district_name = $3)
        ) t;
    """
    pool = get_pool()
    async with pool.acquire() as conn:
        fc = await conn.fetchval(query, service_group.lower(), scenario_id, district)
    return geojson_response(fc)
