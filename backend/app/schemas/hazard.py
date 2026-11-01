from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class HazardType(str, Enum):
    FLOOD = "FLOOD"
    WASTE_OVERFLOW = "WASTE_OVERFLOW"
    DEBRIS = "DEBRIS"
    ROAD_DAMAGE = "ROAD_DAMAGE"


class HazardSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    MODERATE = "MODERATE"
    LOW = "LOW"


class HazardStatus(str, Enum):
    ACTIVE = "ACTIVE"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"


class SourceType(str, Enum):
    CITIZEN_REPORT = "CITIZEN_REPORT"
    IOT_SENSOR = "IOT_SENSOR"
    MUNICIPAL_WARD_OFFICER = "MUNICIPAL_WARD_OFFICER"
    SATELLITE_RADAR = "SATELLITE_RADAR"
    SIMULATED = "SIMULATED"


class PolygonGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[List[List[float]]] = Field(
        ...,
        description="GeoJSON Polygon coordinates [ring[point[lng, lat]]]"
    )

    @field_validator("coordinates")
    @classmethod
    def validate_polygon(cls, v: List[List[List[float]]]) -> List[List[List[float]]]:
        if not v or len(v) < 1:
            raise ValueError("Polygon must have at least one linear ring")
        for ring in v:
            if len(ring) < 4:
                raise ValueError("Each ring must have at least 4 positions (closed ring)")
            if ring[0] != ring[-1]:
                # Automatically close ring if start and end are not identical
                ring.append(ring[0])
            for pt in ring:
                if len(pt) < 2:
                    raise ValueError("Each coordinate must be [longitude, latitude]")
                lng, lat = pt[0], pt[1]
                if not (-180.0 <= lng <= 180.0):
                    raise ValueError(f"Longitude {lng} out of bounds [-180, 180]")
                if not (-90.0 <= lat <= 90.0):
                    raise ValueError(f"Latitude {lat} out of bounds [-90, 90]")
        return v


class Hazard(BaseModel):
    hazard_id: str
    location_name: str
    hazard_type: HazardType
    severity: HazardSeverity
    status: HazardStatus
    geometry: PolygonGeometry
    longitude: float
    latitude: float
    water_depth_cm: Optional[float] = None
    observed_at: str
    updated_at: str
    source_type: SourceType
    source_reference: Optional[str] = None
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    simulation_id: Optional[str] = None
    created_at: str


class HazardSummary(BaseModel):
    total_hazards: int
    active_hazards: int
    investigating_hazards: int
    resolved_hazards: int
    critical_severity_count: int
    moderate_severity_count: int
    low_severity_count: int
    max_water_depth_cm: float
    data_source: str
    last_updated: str

