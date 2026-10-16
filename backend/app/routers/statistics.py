"""
/statistics — aggregated coverage statistics per district x service.

Drives the dashboard side panel and the coverage bar chart. All
aggregation runs in PostgreSQL; the API just shapes the rows into JSON.

Params:
  scenario_id   : 0 baseline (default) | 1-4 scenarios
  service_group : optional filter; omit for all three services
"""
from fastapi import APIRouter, Query

from ..db import get_pool
from ..models import DistrictStat

router = APIRouter(prefix="/statistics", tags=["statistics"])


@router.get("", response_model=list[DistrictStat], summary="District coverage statistics")
async def get_statistics(
    scenario_id: int = Query(0, description="0 = baseline; 1-4 = scenarios"),
    service_group: str | None = Query(None, description="optional service filter"),
):
    # Reduce the baseline cell x hospital expansion to one nearest-hospital row
    # per (service, cell) with DISTINCT ON, THEN aggregate — otherwise absolute
    # counts (cells, population) are multiplied by the hospital count. No-op for
    # the already-reduced scenarios 1-4.
    query = """
        WITH nearest AS (
            SELECT DISTINCT ON (ar.service_group, ar.grid_id)
                   ar.service_group, ar.grid_id, ar.travel_time_min, ar.accessible
            FROM accessibility_results ar
            WHERE ar.scenario_id = $1
              AND ($2::text IS NULL OR ar.service_group = $2)
            ORDER BY ar.service_group, ar.grid_id, ar.travel_time_min
        )
        SELECT
            g.district_name                                   AS district,
            n.service_group                                   AS service_group,
            COUNT(*)                                          AS cells_total,
            COUNT(*) FILTER (WHERE n.accessible = 1)          AS cells_covered,
            ROUND(100.0 * COUNT(*) FILTER (WHERE n.accessible = 1)
                  / NULLIF(COUNT(*), 0), 1)                   AS coverage_pct,
            COALESCE(SUM(g.total_population), 0)              AS population_total,
            COALESCE(SUM(g.total_population)
                     FILTER (WHERE n.accessible = 1), 0)      AS population_covered,
            COALESCE(SUM(g.elderly_population), 0)            AS elderly_total,
            COALESCE(SUM(g.elderly_population)
                     FILTER (WHERE n.accessible = 0), 0)      AS elderly_uncovered,
            ROUND(AVG(n.travel_time_min)::numeric, 1)         AS avg_travel_time_min
        FROM nearest n
        JOIN population_grid g ON n.grid_id = g.grid_id
        GROUP BY g.district_name, n.service_group
        ORDER BY g.district_name, n.service_group;
    """
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, scenario_id, service_group)
    return [dict(r) for r in rows]
