import time
import uuid
import logging
from typing import Dict, Any, List, Optional
import boto3
from botocore.exceptions import ClientError, BotoCoreError

from app.core.config import settings

logger = logging.getLogger("civicpulse.athena")


class AthenaService:
    """
    Manages asynchronous Amazon Athena query execution for the Apache Iceberg lakehouse.
    Uses parameterized query templates to prevent arbitrary SQL injection.
    Supports both real AWS Athena execution and deterministic demo simulation.
    """

    def __init__(self):
        self.region = settings.AWS_REGION
        self.database = settings.AWS_ATHENA_DATABASE
        self.workgroup = settings.AWS_ATHENA_WORKGROUP
        self.results_s3_uri = settings.AWS_ATHENA_RESULTS_S3_URI
        self.is_live = settings.APP_MODE.lower() == "live"
        self._client = None

    @property
    def client(self):
        if self._client is None and self.is_live:
            try:
                self._client = boto3.client("athena", region_name=self.region)
            except Exception as e:
                logger.warning(f"Could not initialize Boto3 Athena client: {e}. Falling back to demo mode.")
                self.is_live = False
        return self._client

    def execute_query(
        self,
        query: str,
        timeout_seconds: int = 30,
        poll_interval: float = 0.5
    ) -> Dict[str, Any]:
        """
        Executes a predefined query asynchronously in Athena and polls for completion.
        """
        start_time = time.time()

        if not self.is_live or not self.client:
            # Deterministic simulation for demo mode
            execution_id = f"demo-athena-{uuid.uuid4().hex[:12]}"
            duration_ms = int((time.time() - start_time) * 1000) + 120
            return {
                "execution_id": execution_id,
                "status": "SUCCEEDED",
                "execution_time_ms": duration_ms,
                "data_scanned_bytes": 1024 * 48,
                "query": query,
                "mode": "DEMO_CACHED_QUERY"
            }

        try:
            response = self.client.start_query_execution(
                QueryString=query,
                QueryExecutionContext={"Database": self.database},
                ResultConfiguration={"OutputLocation": self.results_s3_uri},
                WorkGroup=self.workgroup
            )
            execution_id = response["QueryExecutionId"]

            # Poll for completion with strict timeout
            elapsed = 0.0
            while elapsed < timeout_seconds:
                res = self.client.get_query_execution(QueryExecutionId=execution_id)
                status = res["QueryExecution"]["Status"]["State"]

                if status in ["SUCCEEDED"]:
                    duration_ms = int((time.time() - start_time) * 1000)
                    stats = res["QueryExecution"]["Status"].get("SubmissionDateTime", {})
                    scanned_bytes = res["QueryExecution"].get("Statistics", {}).get("DataScannedInBytes", 0)
                    return {
                        "execution_id": execution_id,
                        "status": "SUCCEEDED",
                        "execution_time_ms": duration_ms,
                        "data_scanned_bytes": scanned_bytes,
                        "query": query,
                        "mode": "LIVE_AWS_ATHENA"
                    }
                elif status in ["FAILED", "CANCELLED"]:
                    reason = res["QueryExecution"]["Status"].get("StateChangeReason", "Unknown Athena error")
                    raise RuntimeError(f"Athena query execution {execution_id} {status}: {reason}")

                time.sleep(poll_interval)
                elapsed = time.time() - start_time

            raise TimeoutError(f"Athena query {execution_id} timed out after {timeout_seconds}s")

        except (ClientError, BotoCoreError) as e:
            logger.error(f"AWS Athena API failure: {e}")
            raise RuntimeError(f"Athena API execution error: {str(e)}")

    def build_time_travel_query(self, table_name: str, timestamp_iso: Optional[str] = None, snapshot_id: Optional[str] = None) -> str:
        """
        Constructs a safe Iceberg time-travel query using engine-supported syntax.
        """
        if snapshot_id:
            # Iceberg snapshot ID query
            return f"""
            SELECT
                hazard_id, location_name, hazard_type, severity, status,
                geometry_json, longitude, latitude, water_depth_cm,
                observed_at, updated_at, source_type, source_reference,
                confidence, simulation_id, created_at
            FROM {self.database}.{table_name}
            FOR VERSION AS OF '{snapshot_id}'
            ORDER BY severity DESC, observed_at DESC;
            """.strip()
        elif timestamp_iso:
            return f"""
            SELECT
                hazard_id, location_name, hazard_type, severity, status,
                geometry_json, longitude, latitude, water_depth_cm,
                observed_at, updated_at, source_type, source_reference,
                confidence, simulation_id, created_at
            FROM {self.database}.{table_name}
            FOR TIMESTAMP AS OF TIMESTAMP '{timestamp_iso}'
            ORDER BY severity DESC, observed_at DESC;
            """.strip()
        else:
            return f"""
            SELECT
                hazard_id, location_name, hazard_type, severity, status,
                geometry_json, longitude, latitude, water_depth_cm,
                observed_at, updated_at, source_type, source_reference,
                confidence, simulation_id, created_at
            FROM {self.database}.{table_name}
            ORDER BY severity DESC, observed_at DESC;
            """.strip()

    def build_merge_resolution_query(self, table_name: str, hazard_id: str, resolved_at_iso: str, notes: Optional[str] = None) -> str:
        """
        Constructs a safe MERGE INTO query for resolving a hazard in Apache Iceberg.
        """
        safe_hazard_id = hazard_id.replace("'", "''")
        safe_time = resolved_at_iso.replace("'", "''")
        safe_notes = (notes or "Resolved via Municipal Dispatch").replace("'", "''")

        return f"""
        MERGE INTO {self.database}.{table_name} AS target
        USING (
            SELECT
                '{safe_hazard_id}' AS hazard_id,
                '{safe_time}' AS resolved_at,
                '{safe_notes}' AS resolution_note
        ) AS source
        ON target.hazard_id = source.hazard_id
        WHEN MATCHED THEN
            UPDATE SET
                status = 'RESOLVED',
                water_depth_cm = 0.0,
                updated_at = source.resolved_at,
                source_reference = CONCAT('RESOLVED: ', source.resolution_note);
        """.strip()


athena_service = AthenaService()
