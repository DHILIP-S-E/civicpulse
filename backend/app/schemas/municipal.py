from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class DispatchStatus(str, Enum):
    PENDING = "PENDING"
    EN_ROUTE = "EN_ROUTE"
    ON_SITE = "ON_SITE"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class TruckType(str, Enum):
    SUPER_SUCKER = "SUPER_SUCKER"  # High capacity dewatering suction tanker
    DEWATERING_PUMP = "DEWATERING_PUMP"
    ASPHALT_PATCHER = "ASPHALT_PATCHER"
    DEBRIS_LOADER = "DEBRIS_LOADER"


class PriorityFactor(BaseModel):
    name: str
    weight: float
    raw_value: float
    weighted_score: float
    explanation: str


class HazardPriorityScore(BaseModel):
    hazard_id: str
    location_name: str
    hazard_type: str
    severity: str
    priority_score: float = Field(..., ge=0.0, le=100.0)
    priority_rank: int
    contributing_factors: List[PriorityFactor]
    data_confidence: float
    recommended_action: str
    missing_information: Optional[str] = None


class DispatchRequest(BaseModel):
    hazard_id: str
    truck_type: TruckType = TruckType.SUPER_SUCKER
    crew_id: str = "CREW-MDU-WEST-04"
    operator_notes: Optional[str] = None


class DispatchRecord(BaseModel):
    dispatch_id: str
    hazard_id: str
    hazard_location: str
    truck_type: TruckType
    crew_id: str
    status: DispatchStatus
    dispatched_at: str
    estimated_arrival_minutes: int
    vehicle_path: List[List[float]] = Field(default=[], description="Interpolated route points for vehicle animation")
    action_log: List[Dict[str, Any]]
