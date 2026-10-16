"""
Application configuration (12-factor: everything from environment variables).

Centralising config means no credentials are hard-coded in
source. Values are read once at start-up from the process environment / .env.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # --- database ---
    db_host: str = "127.0.0.1"
    db_port: int = 5432
    db_name: str = "healthcare_accessibility"
    db_user: str = "gis_readonly"
    db_password: str = ""
    db_pool_min: int = 2
    db_pool_max: int = 10

    # --- CORS ---
    # stored as a comma-separated string in the env, parsed to a list below
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # --- API metadata ---
    api_title: str = "Healthcare Accessibility Web GIS API"
    api_version: str = "1.0.0"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origin_list(self) -> list[str]:
        """Split the CORS env string into a clean list of origins."""
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


# single shared instance imported everywhere
settings = Settings()
