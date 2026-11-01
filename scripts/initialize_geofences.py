#!/usr/bin/env python3
"""
Initializes Amazon Location Service Geofence Collection and registers active Madurai hazard polygons.
"""

import os
import json
import boto3
from botocore.exceptions import ClientError

def initialize_geofences():
    region = os.environ.get("AWS_REGION", "ap-south-1")
    collection_name = os.environ.get("AWS_LOCATION_GEOFENCE_COLLECTION", "CivicPulseMaduraiGeofences")

    print(f"Connecting to Amazon Location Service ({region})...")
    try:
        loc = boto3.client("location", region_name=region)
    except Exception as e:
        print(f"Could not connect to Location client: {e}")
        return False

    # 1. Create Collection if missing
    try:
        loc.describe_geofence_collection(CollectionName=collection_name)
        print(f"Geofence Collection '{collection_name}' already exists.")
    except ClientError:
        print(f"Creating Geofence Collection '{collection_name}'...")
        try:
            loc.create_geofence_collection(
                CollectionName=collection_name,
                Description="Active Madurai flood and hazard zones"
            )
            print(f"Collection '{collection_name}' created successfully.")
        except Exception as e:
            print(f"Failed to create collection: {e}")
            return False

    # 2. Upload Hazard Polygons
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    demo_file = os.path.join(base_dir, "data", "demo", "madurai_hazards.json")
    with open(demo_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Use latest snapshot active hazards
    latest_hazards = data["snapshots"][-1]["hazards"]
    for h in latest_hazards:
        if h.get("status") == "RESOLVED":
            continue

        geofence_id = f"GEOFENCE-{h['hazard_id']}"
        coords = h["geometry"]["coordinates"]

        print(f"Uploading geofence {geofence_id} for {h['location_name']}...")
        try:
            loc.put_geofence(
                CollectionName=collection_name,
                GeofenceId=geofence_id,
                Geometry={
                    "Polygon": coords
                }
            )
            print(f" -> [OK] Geofence {geofence_id} registered.")
        except ClientError as e:
            print(f" -> [FAIL] Could not register {geofence_id}: {e}")

    print("Geofence initialization completed.")
    return True

if __name__ == "__main__":
    initialize_geofences()
