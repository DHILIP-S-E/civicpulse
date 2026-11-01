import asyncio
import json
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.events import OperationalEvent, OperationalEventType

router = APIRouter(prefix="/events", tags=["Events"])

# Ring buffer of recent operational events
events_buffer: List[OperationalEvent] = []


def record_event(
    event_type: OperationalEventType,
    status: str,
    message: str,
    related_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
) -> OperationalEvent:
    ev = OperationalEvent(
        event_id=f"EVT-{uuid.uuid4().hex[:8].upper()}",
        timestamp=datetime.now(timezone.utc).isoformat(),
        event_type=event_type,
        status=status,
        related_id=related_id,
        message=message,
        metadata=metadata or {}
    )
    events_buffer.insert(0, ev)
    if len(events_buffer) > 100:
        events_buffer.pop()
    return ev


# Initialize with realistic startup events
if not events_buffer:
    record_event(
        OperationalEventType.ICEBERG_MERGE_SUCCEEDED,
        "SUCCESS",
        "Iceberg table civic_hazards_iceberg v2 loaded into Athena engine.",
        "snap-20261101-000000-004"
    )
    record_event(
        OperationalEventType.HAZARD_LAYER_REFRESHED,
        "INFO",
        "Madurai spatial hazard lakehouse layers synchronized.",
        "MDU-LAKEHOUSE"
    )


@router.get("", response_model=List[OperationalEvent])
def get_events(limit: int = 30):
    return events_buffer[:limit]


@router.post("/record", response_model=OperationalEvent)
def post_event(
    event_type: OperationalEventType,
    status: str,
    message: str,
    related_id: Optional[str] = None
):
    return record_event(event_type, status, message, related_id)


@router.get("/stream")
async def event_stream():
    """
    Server-Sent Events (SSE) stream for real-time operational telemetry.
    """
    async def event_generator():
        last_index = 0
        while True:
            current_len = len(events_buffer)
            if current_len > last_index:
                for ev in reversed(events_buffer[:current_len - last_index]):
                    yield f"data: {ev.model_dump_json()}\n\n"
                last_index = current_len
            await asyncio.sleep(1.0)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
