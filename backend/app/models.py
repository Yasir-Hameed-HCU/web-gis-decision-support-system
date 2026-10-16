"""
Pydantic response schemas.

These document and validate the JSON shapes the API returns. The geospatial
endpoints return raw GeoJSON assembled in PostGIS (see routers), so they are
not modelled here; these cover the tabular/statistical responses.
"""
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    database: str
    api_version: str


class DistrictStat(BaseModel):
    district: str
    service_group: str
    cells_total: int
    cells_covered: int
    coverage_pct: float
    population_total: int
    population_covered: int
    elderly_total: int
    elderly_uncovered: int
    avg_travel_time_min: float


class ScenarioSummary(BaseModel):
    scenario_name: str
    scenario_type: str
    service_group: str
    removed_hospital_id: str | None
    cells_lost_access: int
    population_affected: int
    elderly_affected: int
    mean_travel_delta_min: float


class MCDAScore(BaseModel):
    district: str
    service_group: str
    vulnerability_class: str
    vulnerability_score: float
    travel_time_avg: float
    elderly_pct: float
    redundancy_avg: float
    reasoning: str
