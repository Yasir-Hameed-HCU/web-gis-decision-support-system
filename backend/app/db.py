"""
asyncpg connection-pool management.

Why a pool? Each HTTP request needs a DB connection. Opening a fresh
PostgreSQL connection costs ~5-50 ms (TCP + auth + backend fork). A pool keeps
a small set of connections open and hands them out per-request, so the
expensive set-up happens once at start-up, not on every API call. asyncpg is
fully non-blocking, so one Uvicorn worker can serve many concurrent requests.

The pool is created in the FastAPI *lifespan* (see main.py) and stored on the
module so any router can reach it via get_pool().
"""
import asyncpg

from .config import settings

_pool: asyncpg.Pool | None = None


async def init_pool() -> asyncpg.Pool:
    """Create the global pool. Called once on application start-up."""
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            host=settings.db_host,
            port=settings.db_port,
            database=settings.db_name,
            user=settings.db_user,        # read-only role
            password=settings.db_password,
            min_size=settings.db_pool_min,
            max_size=settings.db_pool_max,
            command_timeout=60,           # kill any query running > 60 s
        )
    return _pool


async def close_pool() -> None:
    """Gracefully close all connections. Called once on shutdown."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool:
    """Return the live pool for use inside a request handler."""
    if _pool is None:
        raise RuntimeError("Database pool is not initialised.")
    return _pool
