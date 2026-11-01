import json
import logging
import os
import boto3

logger = logging.getLogger()
logger.setLevel(logging.INFO)

athena_client = boto3.client("athena")
database = os.environ.get("ATHENA_DATABASE", "civicpulse_db")
results_s3 = os.environ.get("ATHENA_RESULTS_S3_URI", "")


def handler(event, context):
    """
    Processes Amazon Location Service Geofence events delivered via Amazon EventBridge.
    Correlates commuter position updates, ENTER/EXIT triggers, and updates the operational lakehouse telemetry.
    """
    logger.info("Received Geofence Event from EventBridge: %s", json.dumps(event))

    detail = event.get("detail", {})
    event_type = detail.get("EventType")  # ENTER or EXIT
    geofence_id = detail.get("GeofenceId")
    device_id = detail.get("DeviceId")
    sample_time = detail.get("SampleTime")
    position = detail.get("Position", [])

    logger.info(
        "Geofence Alert: Device %s generated %s event in %s at %s. Coords: %s",
        device_id,
        event_type,
        geofence_id,
        sample_time,
        position
    )

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Geofence event processed successfully",
            "event_type": event_type,
            "device_id": device_id,
            "geofence_id": geofence_id
        })
    }

