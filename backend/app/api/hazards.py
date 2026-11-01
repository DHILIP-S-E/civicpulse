from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional

from app.schemas.hazard import Hazard, HazardSummary, HazardSeverity, HazardStatus, HazardType
from app.services.hazard_service import hazard_service

router = APIRouter(prefix="/hazards", tags=["Hazards"])


@router.get("", response_model=List[Hazard])
def list_hazards(
    severity: Optional[HazardSeverity] = None,
    status: Optional[HazardStatus] = None,
    hazard_type: Optional[HazardType] = None,
    include_resolved: bool = Query(default=True)
):
    return hazard_service.get_all_hazards(
        severity=severity,
        status=status,
        hazard_type=hazard_type,
        include_resolved=include_resolved
    )


@router.get("/summary", response_model=HazardSummary)
def get_hazard_summary():
    return hazard_service.get_summary()


@router.get("/{hazard_id}", response_model=Hazard)
def get_hazard(hazard_id: str):
    hazard = hazard_service.get_hazard_by_id(hazard_id)
    if not hazard:
        raise HTTPException(status_code=404, detail=f"Hazard {hazard_id} not found in Lakehouse.")
    return hazard
