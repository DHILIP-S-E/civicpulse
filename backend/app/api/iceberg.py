from fastapi import APIRouter, HTTPException
from typing import List

from app.schemas.iceberg import (
    IcebergSnapshot,
    QuerySnapshotRequest,
    QuerySnapshotResponse,
    ResolveHazardRequest,
    ResolveHazardResponse
)
from app.services.iceberg_service import iceberg_service

router = APIRouter(prefix="/iceberg", tags=["Apache Iceberg"])


@router.get("/snapshots", response_model=List[IcebergSnapshot])
def get_snapshots():
    """
    Returns committed snapshot metadata from the Apache Iceberg table.
    """
    return iceberg_service.get_snapshots()


@router.get("/history")
def get_history():
    """
    Returns the table commit history and stage chronology.
    """
    snapshots = iceberg_service.get_snapshots()
    return {
        "table": iceberg_service.table_name,
        "format_version": 2,
        "snapshots_count": len(snapshots),
        "history": [
            {
                "snapshot_id": s.snapshot_id,
                "timestamp_ms": s.committed_at,
                "operation": s.operation.value,
                "stage": s.stage_name,
                "active_hazards": s.active_hazard_count,
                "resolved_hazards": s.resolved_hazard_count
            }
            for s in snapshots
        ]
    }


@router.post("/query-snapshot", response_model=QuerySnapshotResponse)
def query_snapshot(request: QuerySnapshotRequest):
    """
    Executes an Iceberg time-travel query for a specific snapshot or timestamp.
    """
    try:
        return iceberg_service.query_snapshot(
            snapshot_id=request.snapshot_id,
            timestamp_as_of=request.timestamp_as_of
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Iceberg time-travel query failed: {str(e)}")


@router.post("/resolve-hazard", response_model=ResolveHazardResponse)
def resolve_hazard(request: ResolveHazardRequest):
    """
    Executes an atomic MERGE INTO query in Amazon Athena to transition a hazard to RESOLVED.
    """
    try:
        return iceberg_service.resolve_hazard(
            hazard_id=request.hazard_id,
            dispatch_id=request.dispatch_id,
            notes=request.notes,
            resolved_at=request.resolved_at
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute hazard resolution: {str(e)}")

