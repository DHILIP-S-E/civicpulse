import pytest
from app.schemas.hazard import Hazard, PolygonGeometry, HazardType, HazardSeverity, HazardStatus, SourceType
from app.services.hazard_service import hazard_service


def test_polygon_validation_closed_ring():
    valid_coords = [
        [
            [78.11, 9.91],
            [78.13, 9.91],
            [78.13, 9.93],
            [78.11, 9.93],
            [78.11, 9.91]
        ]
    ]
    poly = PolygonGeometry(coordinates=valid_coords)
    assert len(poly.coordinates[0]) == 5
    assert poly.coordinates[0][0] == poly.coordinates[0][-1]


def test_polygon_validation_auto_close():
    # 4 unclosed points should auto-append the first point
    coords = [
        [
            [78.11, 9.91],
            [78.13, 9.91],
            [78.13, 9.93],
            [78.11, 9.93]
        ]
    ]
    poly = PolygonGeometry(coordinates=coords)
    assert len(poly.coordinates[0]) == 5
    assert poly.coordinates[0][0] == poly.coordinates[0][-1]


def test_polygon_validation_out_of_bounds():
    invalid_coords = [
        [
            [195.0, 9.91],
            [78.13, 9.91],
            [78.13, 9.93],
            [78.11, 9.93],
            [195.0, 9.91]
        ]
    ]
    with pytest.raises(ValueError):
        PolygonGeometry(coordinates=invalid_coords)


def test_get_all_hazards():
    hazards = hazard_service.get_all_hazards()
    assert len(hazards) > 0
    for h in hazards:
        assert isinstance(h, Hazard)
        assert h.hazard_id.startswith("HAZ-MDU-")
        assert -180.0 <= h.longitude <= 180.0
        assert -90.0 <= h.latitude <= 90.0


def test_hazard_summary():
    summary = hazard_service.get_summary()
    assert summary.total_hazards > 0
    assert summary.total_hazards == (summary.active_hazards + summary.investigating_hazards + summary.resolved_hazards)

