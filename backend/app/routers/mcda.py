"""
/mcda — multi-criteria vulnerability scores per district.

Serves the rule-based Multi-Criteria Decision Analysis scores held in
district_vulnerability: each district is scored on travel time, redundancy and
elderly share, and classed from the weighted result. The endpoint returns an
empty list until that table is populated, so the frontend degrades gracefully.

Params:
  service_group : optional filter
  district      : optional filter
"""
from fastapi import APIRouter, Query

from ..db import get_pool
from ..models import MCDAScore

router = APIRouter(prefix="/mcda", tags=["mcda"])


@router.get("", response_model=list[MCDAScore], summary="District vulnerability scores")
async def get_mcda_scores(
    service_group: str | None = Query(None, description="optional service filter"),
    district: str | None = Query(None, description="optional district filter"),
):
    query = """
        SELECT district, service_group, vulnerability_class, vulnerability_score,
               travel_time_avg, elderly_pct, redundancy_avg, reasoning
        FROM district_vulnerability
        WHERE ($1::text IS NULL OR service_group = $1)
          AND ($2::text IS NULL OR district = $2)
        ORDER BY vulnerability_score DESC;
    """
    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, service_group, district)
    return [dict(r) for r in rows]
