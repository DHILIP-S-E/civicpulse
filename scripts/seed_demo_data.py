#!/usr/bin/env python3
"""
Seeds demonstration data into local processed directory and uploads to Amazon S3 data lake if configured.
"""

import os
import json
import boto3
from botocore.exceptions import ClientError

def seed():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    demo_file = os.path.join(base_dir, "data", "demo", "madurai_hazards.json")
    
    with open(demo_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"Loaded demo dataset with {len(data['snapshots'])} snapshots.")

    # Export processed raw GeoJSON for each snapshot
    processed_dir = os.path.join(base_dir, "data", "processed")
    os.makedirs(processed_dir, exist_ok=True)

    for s in data["snapshots"]:
        snap_id = s["snapshot_id"]
        geojson_features = []
        for h in s["hazards"]:
            geojson_features.append({
                "type": "Feature",
                "properties": {
                    "hazard_id": h["hazard_id"],
                    "location_name": h["location_name"],
                    "hazard_type": h["hazard_type"],
                    "severity": h["severity"],
                    "status": h["status"],
                    "water_depth_cm": h.get("water_depth_cm"),
                    "observed_at": h["observed_at"],
                    "updated_at": h["updated_at"],
                    "source_type": h["source_type"],
                    "confidence": h["confidence"]
                },
                "geometry": h["geometry"]
            })
            
        fc = {
            "type": "FeatureCollection",
            "metadata": {
                "snapshot_id": snap_id,
                "stage_name": s["stage_name"],
                "committed_at": s["timestamp"]
            },
            "features": geojson_features
        }
        
        out_path = os.path.join(processed_dir, f"{snap_id}.geojson")
        with open(out_path, "w", encoding="utf-8") as out_f:
            json.dump(fc, out_f, indent=2)
        print(f"Exported processed GeoJSON -> {out_path}")

    # S3 sync if bucket configured
    bucket = os.environ.get("AWS_S3_BUCKET")
    if bucket:
        print(f"Syncing seed files to S3 bucket: {bucket}...")
        try:
            s3 = boto3.client("s3")
            for root, _, files in os.walk(processed_dir):
                for file in files:
                    local_path = os.path.join(root, file)
                    s3_key = f"civicpulse/raw/{file}"
                    s3.upload_file(local_path, bucket, s3_key)
                    print(f"Uploaded s3://{bucket}/{s3_key}")
        except Exception as e:
            print(f"S3 sync skipped or failed: {e}")

    print("Data seeding completed successfully.")

if __name__ == "__main__":
    seed()

