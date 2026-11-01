from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class GeofenceEventType(str, Enum):
    ENTER = "ENTER"
    EXIT = "EXIT"
    IDLE = "IDLE"


class GeofenceEvaluateRequest(BaseModel):
    device_id: str = Field(..., description="Device or commuter identifier")
    longitude: float = Field(..., ge=-180.0, le=180.0)
    latitude: float = Field(..., ge=-90.0, le=90.0)
    position_timestamp: str
    simulation_id: Optional[str] = None


class GeofenceBreachInfo(BaseModel):
    geofence_id: str
    hazard_id: str
    location_name: str
    severity: str
    hazard_type: str
    event_type: GeofenceEventType


class GeofenceEvaluateResponse(BaseModel):
    submission_status: str
    evaluation_id: str
    device_id: str
    position_timestamp: str
    is_confirmed: bool  # False for pending/speculative, True once verified
    breaches_detected: List[GeofenceBreachInfo]
    evaluation_source: str  # "Amazon Location Geofences" or "Deterministic Local Spatial Engine"
    message: str


class GeofenceSyncResponse(BaseModel):
    collection_name: str
    synced_geofences_count: int
    active_geofences: List[str]
    status: str
    message: str
