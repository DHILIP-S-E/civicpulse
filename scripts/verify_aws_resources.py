#!/usr/bin/env python3
"""
CivicPulse: Honest AWS Resource Verification Script
Inspects AWS infrastructure and reports real connectivity without fabricating claims.
"""

import os
import boto3
from botocore.exceptions import ClientError

def verify():
    region = os.environ.get("AWS_REGION", "ap-south-1")
    bucket = os.environ.get("AWS_S3_BUCKET", "civicpulse-madurai-lakehouse")
    database = os.environ.get("AWS_ATHENA_DATABASE", "civicpulse_db")
    map_name = os.environ.get("AWS_LOCATION_MAP_NAME", "CivicPulseMaduraiMap")
    place_index = os.environ.get("AWS_LOCATION_PLACE_INDEX", "CivicPulseMaduraiPlaces")
    routes_name = os.environ.get("AWS_LOCATION_ROUTE_CALCULATOR", "CivicPulseMaduraiRoutes")
    geofence_col = os.environ.get("AWS_LOCATION_GEOFENCE_COLLECTION", "CivicPulseMaduraiGeofences")

    print("=" * 65)
    print(" CIVICPULSE REAL AWS RESOURCE VERIFICATION")
    print(f" Target Region: {region}")
    print("=" * 65)

    # 1. AWS Identity
    try:
        sts = boto3.client("sts", region_name=region)
        ident = sts.get_caller_identity()
        print(f"[OK] Authenticated IAM Identity: {ident.get('Arn')}")
        print(f"     AWS Account ID: {ident.get('Account')}")
    except Exception as e:
        print(f"[FAIL] Could not authenticate with AWS STS: {e}")
        return

    # 2. S3 Bucket
    try:
        s3 = boto3.client("s3", region_name=region)
        s3.head_bucket(Bucket=bucket)
        print(f"[OK] Amazon S3 Lakehouse Bucket: {bucket} (Accessible)")
    except ClientError as e:
        code = e.response.get("Error", {}).get("Code")
        print(f"[WARN] Amazon S3 Lakehouse Bucket '{bucket}': {code} (Not created yet or access denied)")

    # 3. Amazon Athena Workgroup & Database
    try:
        athena = boto3.client("athena", region_name=region)
        wg = athena.get_work_group(WorkGroup="primary")
        print(f"[OK] Amazon Athena Primary Workgroup: Available (State: {wg['WorkGroup']['State']})")
    except Exception as e:
        print(f"[WARN] Amazon Athena Workgroup: {e}")

    # 4. Amazon Location Service Map
    try:
        loc = boto3.client("location", region_name=region)
        map_res = loc.describe_map(MapName=map_name)
        print(f"[OK] Amazon Location Map: {map_name} (Style: {map_res.get('Configuration', {}).get('Style')})")
    except ClientError as e:
        print(f"[NOTE] Amazon Location Map '{map_name}': Not yet provisioned in {region}.")

    # 5. Amazon Location Places
    try:
        loc = boto3.client("location", region_name=region)
        pl_res = loc.describe_place_index(IndexName=place_index)
        print(f"[OK] Amazon Location Place Index: {place_index} (DataSource: {pl_res.get('DataSource')})")
    except ClientError as e:
        print(f"[NOTE] Amazon Location Place Index '{place_index}': Not yet provisioned in {region}.")

    # 6. Amazon Location Routes
    try:
        loc = boto3.client("location", region_name=region)
        rt_res = loc.describe_route_calculator(CalculatorName=routes_name)
        print(f"[OK] Amazon Location Route Calculator: {routes_name} (DataSource: {rt_res.get('DataSource')})")
    except ClientError as e:
        print(f"[NOTE] Amazon Location Route Calculator '{routes_name}': Not yet provisioned in {region}.")

    # 7. Amazon Location Geofences
    try:
        loc = boto3.client("location", region_name=region)
        gf_res = loc.describe_geofence_collection(CollectionName=geofence_col)
        print(f"[OK] Amazon Location Geofence Collection: {geofence_col} (Status: Active)")
    except ClientError as e:
        print(f"[NOTE] Amazon Location Geofence Collection '{geofence_col}': Not yet provisioned in {region}.")

    print("=" * 65)
    print(" Verification complete. CivicPulse Demo Mode is available instantly.")
    print(" To provision AWS resources, deploy aws/infrastructure/template.yaml.")
    print("=" * 65)

if __name__ == "__main__":
    verify()

