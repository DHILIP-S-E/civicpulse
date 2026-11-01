import pytest
from app.schemas.geofence import GeofenceEvaluateRequest
from app.services.geofence_service import geofence_service


def test_geofence_evaluation_outside():
    # Coords far away outside known hazard zones
    req = GeofenceEvaluateRequest(
        device_id="DEV-COMMUTER-101",
        longitude=78.180,
        latitude=9.880,
        position_timestamp="2026-11-01T08:00:00Z"
    )
    res = geofence_service.evaluate_position(req)
    assert res.submission_status == "ACCEPTED"
    assert len(res.breaches_detected) == 0


def test_geofence_evaluation_inside_sellur():
    # Sellur hazard centroid is approx [78.1275, 9.941]
    req = GeofenceEvaluateRequest(
        device_id="DEV-COMMUTER-102",
        longitude=78.1275,
        latitude=9.941,
        position_timestamp="2026-11-01T08:05:00Z"
    )
    res = geofence_service.evaluate_position(req)
    assert res.submission_status == "ACCEPTED"
    assert len(res.breaches_detected) > 0
    assert any("Sellur" in b.location_name or "HAZ-MDU-001" == b.hazard_id for b in res.breaches_detected)
