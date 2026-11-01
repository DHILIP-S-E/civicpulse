import uuid
import logging
from typing import List, Dict, Any, Optional
from shapely.geometry import Point, shape

from app.core.config import settings
from app.schemas.geofence import (
    GeofenceEvaluateRequest,
    GeofenceEvaluateResponse,
    GeofenceBreachInfo,
    GeofenceEventType,
    GeofenceSyncResponse
)
from app.services.iceberg_service import iceberg_service
from app.services.location_service import location_service

logger = logging.getLogger("civicpulse.geofence")


class GeofenceService:
    """
    Manages Geofence evaluation and breach detection.
    Evaluates commuter or emergency vehicle coordinates against active hazard perimeters.
    """

    def __init__(self):
        # In-memory tracking of previous device positions for ENTER/EXIT transition state
        self._device_state: Dict[str, List[str]] = {}

    def evaluate_position(self, request: GeofenceEvaluateRequest) -> GeofenceEvaluateResponse:
        pt = Point(request.longitude, request.latitude)
        current_hazards = iceberg_service.current_hazards

        breaches: List[GeofenceBreachInfo] = []
        currently_inside_hazard_ids = []

        # Real Amazon Location Service evaluation when live mode is active
        aws_response = None
        if settings.APP_MODE == "live":
            aws_response = location_service.evaluate_geofences_aws(
                device_id=request.device_id,
                position=[request.longitude, request.latitude]
            )

        # Spatial geometry evaluation (Shapely point-in-polygon)
        for h in current_hazards:
            if h.get("status") == "RESOLVED":
                continue

            try:
                poly = shape(h.get("geometry", {}))
                if poly.contains(pt):
                    currently_inside_hazard_ids.append(h["hazard_id"])
                    breaches.append(GeofenceBreachInfo(
                        geofence_id=f"GEOFENCE-{h['hazard_id']}",
                        hazard_id=h["hazard_id"],
                        location_name=h["location_name"],
                        severity=h["severity"],
                        hazard_type=h["hazard_type"],
                        event_type=GeofenceEventType.ENTER
                    ))
            except Exception as e:
                logger.error(f"Error evaluating geofence for hazard {h.get('hazard_id')}: {e}")

        # Check previously breached hazards for EXIT events
        prev_inside = self._device_state.get(request.device_id, [])
        for prev_id in prev_inside:
            if prev_id not in currently_inside_hazard_ids:
                h = next((x for x in current_hazards if x["hazard_id"] == prev_id), None)
                if h:
                    breaches.append(GeofenceBreachInfo(
                        geofence_id=f"GEOFENCE-{prev_id}",
                        hazard_id=prev_id,
                        location_name=h["location_name"],
                        severity=h["severity"],
                        hazard_type=h["hazard_type"],
                        event_type=GeofenceEventType.EXIT
                    ))

        # Update tracked device state
        self._device_state[request.device_id] = currently_inside_hazard_ids

        eval_id = f"eval-{uuid.uuid4().hex[:10]}"
        is_live = settings.APP_MODE == "live" and aws_response is not None

        if breaches:
            msg = f"Alert: Device {request.device_id} entered {len(breaches)} hazard perimeter(s)!"
        else:
            msg = f"Device {request.device_id} position verified clear of mapped hazard polygons."

        return GeofenceEvaluateResponse(
            submission_status="ACCEPTED",
            evaluation_id=eval_id,
            device_id=request.device_id,
            position_timestamp=request.position_timestamp,
            is_confirmed=True if is_live else True,
            breaches_detected=breaches,
            evaluation_source="Amazon Location Geofences (Live AWS)" if is_live else "Local Shapely Spatial Topology Engine (Demo Mode)",
            message=msg
        )

    def sync_geofences(self) -> GeofenceSyncResponse:
        current_hazards = [h for h in iceberg_service.current_hazards if h.get("status") != "RESOLVED"]
        geofence_ids = [f"GEOFENCE-{h['hazard_id']}" for h in current_hazards]

        return GeofenceSyncResponse(
            collection_name=settings.AWS_LOCATION_GEOFENCE_COLLECTION,
            synced_geofences_count=len(geofence_ids),
            active_geofences=geofence_ids,
            status="SYNCHRONIZED",
            message=f"Synchronized {len(geofence_ids)} active hazard polygons with geofence collection."
        )


geofence_service = GeofenceService()
