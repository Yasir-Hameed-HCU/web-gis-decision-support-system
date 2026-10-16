"""
/hospitals — GeoJSON point layer of the 35 acute hospitals.

Optional filters:
  service  : surgery | geriatrics | emergency  (only hospitals offering it)
  active   : 1 (default) returns only active hospitals; 0 returns all
"""
from fastapi import APIRouter, Query

from ..db import get_pool
from ..geojson import geojson_response

router = APIRouter(prefix="/hospitals", tags=["hospitals"])

_SERVICE_COLS = {"surgery": "surgery", "geriatrics": "geriatrics", "emergency": "emergency"}


@router.get("", summary="Hospitals as GeoJSON points")
async def get_hospitals(
    service: str | None = Query(None, description="surgery | geriatrics | emergency"),
    active: int = Query(1, description="1 = active only, 0 = all"),
):
    # Build the optional service filter safely from a whitelist (no SQL injection)
    service_filter = ""
    if service:
        col = _SERVICE_COLS.get(service.lower())
        if col:
            service_filter = f"AND h.{col} = 1"

    query = f"""
        SELECT json_build_object(
            'type', 'FeatureCollection',
            'features', COALESCE(json_agg(feature), '[]'::json)
        )::text
        FROM (
            SELECT json_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(ST_Transform(h.geom, 4326))::json,
                'properties', json_build_object(
                    'hospital_id',   h.hospital_id,
                    'hospital_name', h.hospital_name,
                    'city',          h.city,
                    'beds',          h.beds,
                    'surgery',       h.surgery,
                    'geriatrics',    h.geriatrics,
                    'emergency',     h.emergency,
                    'active',        h.active
                )
            ) AS feature
            FROM hospitals h
            WHERE ($1 = 0 OR h.active = 1)
            {service_filter}
        ) t;
    """
    pool = get_pool()
    async with pool.acquire() as conn:
        fc = await conn.fetchval(query, active)
    return geojson_response(fc)
