import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException

from app.schemas.municipal import (
    HazardPriorityScore,
    DispatchRequest,
    DispatchRecord,
    DispatchStatus,
    TruckType
)
from app.services.prioritization_service import prioritization_service
from app.services.iceberg_service import iceberg_service
from app.services.routing_service import routing_service

router = APIRouter(prefix="/municipal", tags=["Municipal Operations"])

# In-memory dispatch tracking store
dispatches_store: Dict[str, DispatchRecord] = {}


@router.get("/priorities", response_model=List[HazardPriorityScore])
def get_priorities():
    """
    Returns multi-criteria prioritized ranking of active hazards.
    """
    return prioritization_service.calculate_priorities()


@router.post("/dispatch", response_model=DispatchRecord)
def create_dispatch(request: DispatchRequest):
    """
    Dispatches a simulated municipal vehicle to resolve a critical hazard.
    Calculates an interpolated route path for the vehicle marker animation.
    """
    # Verify hazard exists
    hazard = next((h for h in iceberg_service.current_hazards if h["hazard_id"] == request.hazard_id), None)
    if not hazard:
        raise HTTPException(status_code=404, detail=f"Hazard {request.hazard_id} not found.")

    # Prevent concurrent duplicate dispatch actions
    for d in dispatches_store.values():
        if d.hazard_id == request.hazard_id and d.status in [DispatchStatus.PENDING, DispatchStatus.EN_ROUTE]:
            return d

    dispatch_id = f"DSP-MDU-{uuid.uuid4().hex[:8].upper()}"

    # Vehicle start depot: Madurai Corporation Central Workshop / Depot (near Melur Rd / Mattuthavani)
    depot_coords = [78.148, 9.940]
    hazard_coords = [hazard["longitude"], hazard["latitude"]]

    # Generate interpolated driving path for vehicle animation
    vehicle_path = routing_service.generate_interpolated_path(depot_coords, hazard_coords, steps_per_segment=25)

    record = DispatchRecord(
        dispatch_id=dispatch_id,
        hazard_id=request.hazard_id,
        hazard_location=hazard.get("location_name", "Madurai Zone"),
        truck_type=request.truck_type,
        crew_id=request.crew_id,
        status=DispatchStatus.EN_ROUTE,
        dispatched_at=datetime.now(timezone.utc).isoformat(),
        estimated_arrival_minutes=8,
        vehicle_path=vehicle_path,
        action_log=[
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "action": "WORK_ORDER_ISSUED",
                "message": f"Unit {request.crew_id} ({request.truck_type.value}) dispatched to {hazard.get('location_name')}."
            },
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "action": "EN_ROUTE",
                "message": "Vehicle moving along designated municipal emergency corridor."
            }
        ]
    )

    dispatches_store[dispatch_id] = record
    return record


@router.get("/dispatch/{dispatch_id}", response_model=DispatchRecord)
def get_dispatch(dispatch_id: str):
    if dispatch_id not in dispatches_store:
        raise HTTPException(status_code=404, detail=f"Dispatch {dispatch_id} not found.")
    return dispatches_store[dispatch_id]
