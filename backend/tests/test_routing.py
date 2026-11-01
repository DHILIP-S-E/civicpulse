import pytest
from app.schemas.route import RouteCompareRequest, RouteCoordinates, TransportProfile
from app.services.routing_service import routing_service


def test_compare_routes_detects_intersections():
    # Route from Periyar Bus Stand to Mattuthavani Bus Terminus (passes through central Madurai flooded areas)
    origin = RouteCoordinates(longitude=78.1135, latitude=9.9175)
    dest = RouteCoordinates(longitude=78.1632, latitude=9.9498)

    req = RouteCompareRequest(
        origin=origin,
        destination=dest,
        transport_profile=TransportProfile.CAR,
        avoid_hazards=True
    )

    res = routing_service.compare_routes(req)

    assert res.standard_route is not None
    assert len(res.standard_route.geometry) > 5
    assert res.standard_route.distance_km > 0
    assert res.standard_route.duration_minutes > 0

    # Alternative route calculation
    assert res.hazard_avoiding_route is not None
    assert len(res.hazard_avoiding_route.geometry) > 5
    assert res.hazard_avoiding_route.distance_km >= res.standard_route.distance_km

    # Verification: Alternative route should have fewer or zero intersections compared to standard route
    assert len(res.hazard_avoiding_route.hazard_intersections) <= len(res.standard_route.hazard_intersections)


def test_haversine_distance():
    p1 = [78.1135, 9.9175]  # Periyar
    p2 = [78.1632, 9.9498]  # Mattuthavani
    dist = routing_service.haversine_distance_km(p1, p2)
    # Approx 6-8 km direct line distance
    assert 5.0 <= dist <= 10.0
