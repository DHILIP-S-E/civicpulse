import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "CivicPulse - Madurai Spatial Lakehouse"
    APP_ENV: str = "development"
    # Modes: "demo" (deterministic local mock + real computation) or "live" (calls real AWS Athena/Location)
    APP_MODE: str = "demo"
    DEBUG: bool = True
    
    # AWS Settings
    AWS_REGION: str = "ap-south-1"
    AWS_S3_BUCKET: str = "civicpulse-madurai-lakehouse"
    AWS_S3_DATA_PREFIX: str = "civicpulse/"
    AWS_ATHENA_DATABASE: str = "civicpulse_db"
    AWS_ATHENA_TABLE: str = "civic_hazards_iceberg"
    AWS_ATHENA_WORKGROUP: str = "primary"
    AWS_ATHENA_RESULTS_S3_URI: str = "s3://civicpulse-madurai-lakehouse/civicpulse/query-results/"
    
    # Amazon Location Service Resources
    AWS_LOCATION_MAP_NAME: str = "CivicPulseMaduraiMap"
    AWS_LOCATION_PLACE_INDEX: str = "CivicPulseMaduraiPlaces"
    AWS_LOCATION_ROUTE_CALCULATOR: str = "CivicPulseMaduraiRoutes"
    AWS_LOCATION_GEOFENCE_COLLECTION: str = "CivicPulseMaduraiGeofences"
    AWS_LOCATION_TRACKER_NAME: str = "CivicPulseMaduraiTracker"
    AWS_LOCATION_API_KEY: Optional[str] = None
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    # Paths: resolve repository root whether running from repo root, backend, or installed package
    @property
    def DATA_DEMO_PATH(self) -> str:
        # Check several candidate locations
        current_dir = os.path.dirname(os.path.abspath(__file__))
        candidates = [
            # 4 levels up: backend/app/core/config.py -> civicpulse/data/demo/...
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))), "data", "demo", "madurai_hazards.json"),
            # 3 levels up: backend/app/core -> civicpulse/data/demo/...
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(current_dir))), "data", "demo", "madurai_hazards.json"),
            # From current working directory
            os.path.join(os.getcwd(), "data", "demo", "madurai_hazards.json"),
            os.path.join(os.getcwd(), "..", "data", "demo", "madurai_hazards.json"),
        ]
        for p in candidates:
            if os.path.exists(p):
                return os.path.abspath(p)
        return candidates[1]

    model_config = SettingsConfigDict(
        env_file=[".env", "../.env"],
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
