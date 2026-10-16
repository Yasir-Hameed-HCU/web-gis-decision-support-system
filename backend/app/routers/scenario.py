"""
/scenarios + /scenario/{n}/diff — pre-computed closure scenarios.

Scenarios S1-S4 were generated offline via the non-destructive
`active` flag (no pgRouting re-run). The API is strictly READ-ONLY: it serves
the stored results, it does not run new simulations. This keeps the public API
safe (the DB role has SELECT only — see sql/create_readonly_role.sql).

  GET /scenarios               -> impact-ranking summary
  GET /scenario/{n}/diff       -> per-cell difference surface as GeoJSON

scenario_results.scenario_id is a per-row auto-sequence rather than the
scenario number, so scenarios are selected by the name prefix 'Scenario {n}:'.
"""
from fastapi import APIRouter, Path, Query

from ..db import get_pool
from ..geojson import geojson_response
from ..models import ScenarioSummary

router = APIRouter(tags=["scenario"])


@router.get("/scenarios", response_model=list[ScenarioSummary],
            summary="Scenario impact-ranking summary")
async def list_scenarios():
    query = """
        SELECT
            -- Scenario 4 is stored under a label that misdescribes it: its type is
            -- 'hospital_removal', one hospital is removed and all three service
            -- groups are recomputed. Present the accurate name.
            REPLACE(scenario_name,
                    'Scenario 4: Emergency downgrade',
                    'Scenario 4: Dominant-hub removal')          AS scenario_name,
            scenario_type,
            service_group,
            MAX(removed_hospital_id)                            AS removed_hospital_id,
            COUNT(*) FILTER (WHERE accessibility_delta = -1)    AS cells_lost_access,
            -- population/elderly counted ONLY in cells that actually lost access
            COALESCE(SUM(population_affected)
                     FILTER (WHERE accessibility_delta = -1), 0) AS population_affected,
            COALESCE(SUM(elderly_affected)
                     FILTER (WHERE accessibility_delta = -1), 0) AS elderly_affected,
            ROUND(AVG(travel_time_delta)::numeric, 2)          AS mean_travel_delta_min
        FROM scenario_results
        GROUP BY scenario_name, scenario_type, service_group
        ORDER BY scenario_name, service_group;
    """
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(query)
    return [dict(r) for r in rows]


@router.get("/scenario/{n}/diff", summary="Scenario difference surface as GeoJSON")
async def scenario_diff(
    n: int = Path(..., ge=1, le=4, description="scenario number 1-4"),
    service_group: str = Query(..., description="surgery | geriatrics | emergency"),
):
    query = """
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', COALESCE(json_agg(feature), '[]'::json)
        )::text
        FROM (
            SELECT json_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(ST_Transform(geom, 4326))::json,
                'properties', json_build_object(
                    'grid_id',             grid_id,
                    'travel_time_delta',   round(travel_time_delta::numeric, 1),
                    'accessibility_delta', accessibility_delta,
                    'population_affected', population_affected,
                    'elderly_affected',    elderly_affected
                )
            ) AS feature
            FROM v_scenario_diff
            WHERE scenario_name LIKE 'Scenario ' || $1 || ':%'
              AND service_group = $2
        ) t;
    """
    pool = get_pool()
    async with pool.acquire() as conn:
        fc = await conn.fetchval(query, str(n), service_group.lower())
    return geojson_response(fc)
