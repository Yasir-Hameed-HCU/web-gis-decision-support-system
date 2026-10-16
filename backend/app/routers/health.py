"""
/health — liveness + database connectivity probe.

A trivial SELECT 1 confirms the pool can reach PostgreSQL. Used by Docker
health-checks and uptime monitors.
"""
from fastapi import APIRouter

from ..config import settings
from ..db import get_pool
from ..models import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse, summary="Service health")
async def health():
    db_status = "down"
    try:
        pool = get_pool()
        async with pool.acquire() as conn:
            await conn.fetchval("SELECT 1;")
        db_status = "up"
    except Exception:
        db_status = "down"
    return HealthResponse(
        status="ok" if db_status == "up" else "degraded",
        database=db_status,
        api_version=settings.api_version,
    )
