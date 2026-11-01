from fastapi import APIRouter, HTTPException

from app.schemas.geofence import (
    GeofenceEvaluateRequest,
    GeofenceEvaluateResponse,
    GeofenceSyncResponse
)
from app.services.geofence_service import geofence_service

router = APIRouter(prefix="/geofences", tags=["Geofences"])


@router.post("/evaluate", response_model=GeofenceEvaluateResponse)
def evaluate_geofence(request: GeofenceEvaluateRequest):
    """
    Submits device position to Amazon Location Geofencing or local spatial geometry evaluator.
    Returns confirmed or pending breach events with ENTER/EXIT transition states.
    """
    try:
        return geofence_service.evaluate_position(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geofence evaluation failed: {str(e)}")


@router.post("/sync", response_model=GeofenceSyncResponse)
def sync_geofences():
    """
    Synchronizes active hazard polygons into the Amazon Location Geofence Collection.
    """
    try:
        return geofence_service.sync_geofences()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geofence sync failed: {str(e)}")
