from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class TransportProfile(str, Enum):
    CAR = "Car"
    WALKING = "Walking"
    TRUCK = "Truck"


class RouteCoordinates(BaseModel):
    longitude: float = Field(..., ge=-180.0, le=180.0)
    latitude: float = Field(..., ge=-90.0, le=90.0)


class RouteCompareRequest(BaseModel):
    origin: RouteCoordinates
    destination: RouteCoordinates
    transport_profile: TransportProfile = TransportProfile.CAR
    active_hazard_ids: Optional[List[str]] = None
    avoid_hazards: bool = True
    simulation_id: Optional[str] = None


class HazardIntersectionInfo(BaseModel):
    hazard_id: str
    location_name: str
    hazard_type: str
    severity: str
    water_depth_cm: Optional[float] = None
    intersection_point: List[float]  # [lng, lat]


class RouteDetail(BaseModel):
    geometry: List[List[float]] = Field(..., description="LineString coordinates [[lng, lat], ...]")
    distance_km: float
    duration_minutes: float
    hazard_intersections: List[HazardIntersectionInfo]
    is_hazard_free: bool
    status: str
    warnings: List[str] = []


class RouteCompareResponse(BaseModel):
    standard_route: RouteDetail
    hazard_avoiding_route: Optional[RouteDetail] = None
    time_delta_minutes: Optional[float] = None
    distance_delta_km: Optional[float] = None
    avoidance_successful: bool
    routing_source: str  # e.g. "Amazon Location Routes v2" or "Local Topological Fallback (Demo Mode)"
    data_freshness: str
    status: str
    overall_warnings: List[str] = []

