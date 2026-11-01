from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class IcebergOperationType(str, Enum):
    APPEND = "APPEND"
    OVERWRITE = "OVERWRITE"
    MERGE_UPDATE = "MERGE_UPDATE"
    DELETE = "DELETE"


class IcebergSnapshot(BaseModel):
    snapshot_id: str
    parent_snapshot_id: Optional[str] = None
    stage_name: str
    relative_time: str
    committed_at: str
    operation: IcebergOperationType
    manifest_list: Optional[str] = None
    summary: Dict[str, Any] = {}
    active_hazard_count: int
    resolved_hazard_count: int
    total_records: int
    provenance: str  # "AWS Glue Data Catalog / Iceberg v2" or "Cached Lakehouse Fixture"


class QuerySnapshotRequest(BaseModel):
    snapshot_id: Optional[str] = None
    timestamp_as_of: Optional[str] = None  # ISO format string


class QuerySnapshotResponse(BaseModel):
    snapshot_id: str
    stage_name: str
    query_executed: str
    athena_execution_id: Optional[str] = None
    execution_time_ms: int
    hazards: List[Dict[str, Any]]
    active_count: int
    resolved_count: int
    source: str
    status: str


class ResolveHazardRequest(BaseModel):
    hazard_id: str
    dispatch_id: Optional[str] = None
    notes: Optional[str] = None
    resolved_at: Optional[str] = None


class ResolveHazardResponse(BaseModel):
    success: bool
    hazard_id: str
    previous_status: str
    new_status: str
    athena_query_id: Optional[str] = None
    new_snapshot_id: str
    execution_time_ms: int
    commit_type: str
    message: str
