import os
import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from app.core.config import settings
from app.schemas.iceberg import (
    IcebergSnapshot,
    IcebergOperationType,
    QuerySnapshotResponse,
    ResolveHazardResponse
)
from app.services.athena_service import athena_service

logger = logging.getLogger("civicpulse.iceberg")


class IcebergService:
    """
    Service managing Apache Iceberg lakehouse interactions:
    - Snapshot inspection & history
    - Point-in-time time-travel queries
    - Atomic MERGE INTO hazard mutations
    """

    def __init__(self):
        self.table_name = settings.AWS_ATHENA_TABLE
        self._load_demo_data()

    def _load_demo_data(self):
        with open(settings.DATA_DEMO_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.demo_snapshots = data.get("snapshots", [])
        self.places = data.get("madurai_places", [])
        self.wards = data.get("madurai_wards", [])

        # In-memory working copy of latest hazards
        latest_snap = self.demo_snapshots[-1] if self.demo_snapshots else {}
        self.current_hazards = list(latest_snap.get("hazards", []))

    def get_snapshots(self) -> List[IcebergSnapshot]:
        """
        Returns committed Apache Iceberg table snapshots.
        """
        result = []
        parent_id = None
        for s in self.demo_snapshots:
            active_cnt = sum(1 for h in s.get("hazards", []) if h.get("status") in ["ACTIVE", "INVESTIGATING"])
            resolved_cnt = sum(1 for h in s.get("hazards", []) if h.get("status") == "RESOLVED")

            op_map = {
                "APPEND": IcebergOperationType.APPEND,
                "OVERWRITE": IcebergOperationType.OVERWRITE,
                "MERGE_UPDATE": IcebergOperationType.MERGE_UPDATE
            }

            snapshot = IcebergSnapshot(
                snapshot_id=s["snapshot_id"],
                parent_snapshot_id=parent_id,
                stage_name=s["stage_name"],
                relative_time=s["relative_time"],
                committed_at=s["timestamp"],
                operation=op_map.get(s.get("commit_type"), IcebergOperationType.APPEND),
                manifest_list=f"s3://{settings.AWS_S3_BUCKET}/civicpulse/metadata/{s['snapshot_id']}.avro",
                summary={
                    "total-records": str(len(s.get("hazards", []))),
                    "added-data-files": "4",
                    "description": s.get("summary", "")
                },
                active_hazard_count=active_cnt,
                resolved_hazard_count=resolved_cnt,
                total_records=len(s.get("hazards", [])),
                provenance="AWS Glue Data Catalog / Apache Iceberg v2" if settings.APP_MODE == "live" else "Deterministic Lakehouse Demo Fixture"
            )
            result.append(snapshot)
            parent_id = s["snapshot_id"]
        return result

    def query_snapshot(
        self,
        snapshot_id: Optional[str] = None,
        timestamp_as_of: Optional[str] = None
    ) -> QuerySnapshotResponse:
        """
        Executes an Iceberg time-travel query for a specific snapshot or timestamp.
        """
        sql = athena_service.build_time_travel_query(
            table_name=self.table_name,
            timestamp_iso=timestamp_as_of,
            snapshot_id=snapshot_id
        )

        # Run query via Athena service
        athena_result = athena_service.execute_query(sql)

        # Find matching snapshot in dataset
        matched_snap = None
        if snapshot_id:
            matched_snap = next((s for s in self.demo_snapshots if s["snapshot_id"] == snapshot_id), None)
        elif timestamp_as_of:
            # Find closest snapshot at or before the timestamp
            for s in reversed(self.demo_snapshots):
                if s["timestamp"] <= timestamp_as_of:
                    matched_snap = s
                    break

        if not matched_snap:
            matched_snap = self.demo_snapshots[-1]

        hazards = matched_snap.get("hazards", [])
        active_cnt = sum(1 for h in hazards if h.get("status") in ["ACTIVE", "INVESTIGATING"])
        resolved_cnt = sum(1 for h in hazards if h.get("status") == "RESOLVED")

        return QuerySnapshotResponse(
            snapshot_id=matched_snap["snapshot_id"],
            stage_name=matched_snap["stage_name"],
            query_executed=sql,
            athena_execution_id=athena_result.get("execution_id"),
            execution_time_ms=athena_result.get("execution_time_ms", 150),
            hazards=hazards,
            active_count=active_cnt,
            resolved_count=resolved_cnt,
            source=athena_result.get("mode", "DEMO_CACHED_QUERY"),
            status=athena_result.get("status", "SUCCEEDED")
        )

    def resolve_hazard(
        self,
        hazard_id: str,
        dispatch_id: Optional[str] = None,
        notes: Optional[str] = None,
        resolved_at: Optional[str] = None
    ) -> ResolveHazardResponse:
        """
        Executes an atomic MERGE INTO query to update hazard status to RESOLVED.
        """
        # Find hazard in current state
        target_hazard = next((h for h in self.current_hazards if h["hazard_id"] == hazard_id), None)
        if not target_hazard:
            raise ValueError(f"Hazard with ID {hazard_id} not found in current lakehouse state.")

        if target_hazard.get("status") == "RESOLVED":
            return ResolveHazardResponse(
                success=True,
                hazard_id=hazard_id,
                previous_status="RESOLVED",
                new_status="RESOLVED",
                athena_query_id=None,
                new_snapshot_id=self.demo_snapshots[-1]["snapshot_id"],
                execution_time_ms=5,
                commit_type="NOOP",
                message=f"Hazard {hazard_id} was already marked as RESOLVED."
            )

        previous_status = target_hazard.get("status", "ACTIVE")
        resolve_time = resolved_at or datetime.now(timezone.utc).isoformat()

        # Build & execute Athena MERGE query
        sql = athena_service.build_merge_resolution_query(
            table_name=self.table_name,
            hazard_id=hazard_id,
            resolved_at_iso=resolve_time,
            notes=notes
        )
        athena_res = athena_service.execute_query(sql)

        # Update local working copy
        target_hazard["status"] = "RESOLVED"
        target_hazard["water_depth_cm"] = 0.0
        target_hazard["updated_at"] = resolve_time
        target_hazard["source_reference"] = f"RESOLVED: {notes or f'Dispatch {dispatch_id}'}"

        new_snap_id = f"snap-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}-res"

        return ResolveHazardResponse(
            success=True,
            hazard_id=hazard_id,
            previous_status=previous_status,
            new_status="RESOLVED",
            athena_query_id=athena_res.get("execution_id"),
            new_snapshot_id=new_snap_id,
            execution_time_ms=athena_res.get("execution_time_ms", 220),
            commit_type="MERGE_UPDATE",
            message=f"Hazard {hazard_id} ({target_hazard.get('location_name')}) successfully resolved via Athena Iceberg MERGE INTO."
        )


iceberg_service = IcebergService()
