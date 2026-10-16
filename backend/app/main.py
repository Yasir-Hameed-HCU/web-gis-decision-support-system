"""
FastAPI application entry point.

Responsibilities:
  * create / tear down the asyncpg pool via the lifespan handler
  * apply CORS so the React frontend (different origin) can call the API
  * mount every router under a versioned prefix  /api/v1

Run (development):
    uvicorn app.main:app --reload --port 8000
Interactive docs:  http://localhost:8000/docs
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import init_pool, close_pool
from .routers import (
    health,
    hospitals,
    accessibility,
    fragility,
    statistics,
    scenario,
    mcda,
    progress,
)

API_PREFIX = "/api/v1"   # URL versioning: future breaking changes -> /api/v2


@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- start-up: open the connection pool once ---
    await init_pool()
    yield
    # --- shutdown: close all connections cleanly ---
    await close_pool()


app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description=(
        "REST + WebSocket API serving healthcare accessibility, fragility, "
        "and closure-scenario results for Mecklenburg-Vorpommern. "
        "All geometries are returned as GeoJSON in EPSG:4326."
    ),
    lifespan=lifespan,
)

# CORS — only the configured frontend origins may call the API from a browser
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET"],          # the public API is read-only
    allow_headers=["*"],
)

# Mount all routers under /api/v1
for r in (health, hospitals, accessibility, fragility, statistics, scenario, mcda, progress):
    app.include_router(r.router, prefix=API_PREFIX)


@app.get("/", include_in_schema=False)
async def root():
    return {"service": settings.api_title, "version": settings.api_version, "docs": "/docs"}
