from enum import Enum
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class OperationalEventType(str, Enum):
    ROUTE_REQUESTED = "ROUTE_REQUESTED"
    ROUTE_CALCULATED = "ROUTE_CALCULATED"
    ROUTE_INTERSECTION_DETECTED = "ROUTE_INTERSECTION_DETECTED"
    GEOFENCE_POSITION_SUBMITTED = "GEOFENCE_POSITION_SUBMITTED"
    GEOFENCE_ENTER = "GEOFENCE_ENTER"
    GEOFENCE_EXIT = "GEOFENCE_EXIT"
    MUNICIPAL_DISPATCH_CREATED = "MUNICIPAL_DISPATCH_CREATED"
    HAZARD_RESOLUTION_REQUESTED = "HAZARD_RESOLUTION_REQUESTED"
    ICEBERG_MERGE_SUCCEEDED = "ICEBERG_MERGE_SUCCEEDED"
    ICEBERG_MERGE_FAILED = "ICEBERG_MERGE_FAILED"
    HAZARD_LAYER_REFRESHED = "HAZARD_LAYER_REFRESHED"


class OperationalEvent(BaseModel):
    event_id: str
    timestamp: str
    event_type: OperationalEventType
    status: str  # "SUCCESS", "WARNING", "FAILURE", "INFO"
    related_id: Optional[str] = None  # Hazard ID or Route ID or Dispatch ID
    message: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
