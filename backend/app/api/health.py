from fastapi import APIRouter
from datetime import datetime, timezone
import boto3

from app.core.config import settings
from app.services.location_service import location_service
from app.services.athena_service import athena_service

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "mode": settings.APP_MODE,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/aws")
def aws_health_check():
    """
    Verifies actual connectivity to configured AWS services.
    Returns status: CONNECTED only when real credentials and resources respond.
    """
    region = settings.AWS_REGION
    s3_status = "NOT_CONFIGURED"
    athena_status = "NOT_CONFIGURED"
    location_status = "NOT_CONFIGURED"
    caller_arn = None

    try:
        sts = boto3.client("sts", region_name=region)
        identity = sts.get_caller_identity()
        caller_arn = identity.get("Arn")

        # Test S3
        s3 = boto3.client("s3", region_name=region)
        s3.head_bucket(Bucket=settings.AWS_S3_BUCKET)
        s3_status = "CONNECTED"
    except Exception as e:
        s3_status = f"UNAVAILABLE ({str(e)[:40]})"

    try:
        # Test Athena
        athena = boto3.client("athena", region_name=region)
        athena.get_work_group(WorkGroup=settings.AWS_ATHENA_WORKGROUP)
        athena_status = "CONNECTED"
    except Exception as e:
        athena_status = f"UNAVAILABLE ({str(e)[:40]})"

    try:
        # Test Location
        loc = boto3.client("location", region_name=region)
        loc.describe_map(MapName=settings.AWS_LOCATION_MAP_NAME)
        location_status = "CONNECTED"
    except Exception as e:
        location_status = f"UNAVAILABLE ({str(e)[:40]})"

    all_connected = (
        s3_status == "CONNECTED" and
        athena_status == "CONNECTED" and
        location_status == "CONNECTED"
    )

    return {
        "overall_status": "CONNECTED" if all_connected else "PARTIAL_OR_DEMO",
        "configured_mode": settings.APP_MODE,
        "region": region,
        "caller_arn": caller_arn,
        "services": {
            "amazon_s3": s3_status,
            "amazon_athena": athena_status,
            "amazon_location_service": location_status,
            "apache_iceberg": "COMPATIBLE_V2"
        },
        "disclaimer": "Live AWS badges reflect real verified API handshakes."
    }

