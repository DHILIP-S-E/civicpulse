import pytest
from app.services.iceberg_service import iceberg_service
from app.services.athena_service import athena_service


def test_get_iceberg_snapshots():
    snapshots = iceberg_service.get_snapshots()
    assert len(snapshots) == 4
    stages = [s.stage_name for s in snapshots]
    assert any("Stage 1" in s for s in stages)
    assert any("Stage 2" in s for s in stages)
    assert any("Stage 3" in s for s in stages)
    assert any("Stage 4" in s for s in stages)


def test_time_travel_query_athena_builder():
    query_snap = athena_service.build_time_travel_query(
        table_name="civic_hazards_iceberg",
        snapshot_id="snap-20261031-060000-001"
    )
    assert "FOR VERSION AS OF 'snap-20261031-060000-001'" in query_snap
    assert "civic_hazards_iceberg" in query_snap

    query_ts = athena_service.build_time_travel_query(
        table_name="civic_hazards_iceberg",
        timestamp_iso="2026-10-31T12:00:00Z"
    )
    assert "FOR TIMESTAMP AS OF TIMESTAMP '2026-10-31T12:00:00Z'" in query_ts


def test_merge_resolution_query_builder():
    merge_sql = athena_service.build_merge_resolution_query(
        table_name="civic_hazards_iceberg",
        hazard_id="HAZ-MDU-001",
        resolved_at_iso="2026-11-01T02:00:00Z",
        notes="Madurai Corporation Dewatering Unit Complete"
    )
    assert "MERGE INTO" in merge_sql
    assert "WHEN MATCHED THEN" in merge_sql
    assert "HAZ-MDU-001" in merge_sql
    assert "RESOLVED" in merge_sql


def test_iceberg_time_travel_query_execution():
    res = iceberg_service.query_snapshot(snapshot_id="snap-20261031-060000-001")
    assert res.snapshot_id == "snap-20261031-060000-001"
    assert res.active_count > 0
    assert len(res.hazards) > 0

