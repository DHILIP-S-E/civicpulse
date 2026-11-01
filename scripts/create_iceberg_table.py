#!/usr/bin/env python3
"""
Executes the Apache Iceberg DDL in Amazon Athena to initialize civicpulse_db.civic_hazards_iceberg.
"""

import os
import sys
import time
import boto3
from botocore.exceptions import ClientError

def create_table():
    region = os.environ.get("AWS_REGION", "ap-south-1")
    bucket = os.environ.get("AWS_S3_BUCKET", "civicpulse-madurai-lakehouse")
    database = os.environ.get("AWS_ATHENA_DATABASE", "civicpulse_db")
    workgroup = os.environ.get("AWS_ATHENA_WORKGROUP", "primary")
    output_location = os.environ.get("AWS_ATHENA_RESULTS_S3_URI", f"s3://{bucket}/civicpulse/query-results/")

    print(f"Connecting to Athena in region: {region}...")
    try:
        athena = boto3.client("athena", region_name=region)
    except Exception as e:
        print(f"Could not connect to Athena: {e}")
        return False

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ddl_file = os.path.join(base_dir, "aws", "athena", "create_iceberg_table.sql")
    
    with open(ddl_file, "r", encoding="utf-8") as f:
        ddl_template = f.read()

    ddl = ddl_template.replace("${AWS_S3_BUCKET}", bucket)

    queries = [q.strip() for q in ddl.split(";") if q.strip() and not q.strip().startswith("--")]

    for q in queries:
        print(f"\nExecuting SQL:\n{q[:100]}...\n")
        try:
            res = athena.start_query_execution(
                QueryString=q,
                ResultConfiguration={"OutputLocation": output_location},
                WorkGroup=workgroup
            )
            qid = res["QueryExecutionId"]
            print(f"Started query execution: {qid}. Waiting for completion...")

            while True:
                status_res = athena.get_query_execution(QueryExecutionId=qid)
                state = status_res["QueryExecution"]["Status"]["State"]
                if state == "SUCCEEDED":
                    print(f"Query {qid} SUCCEEDED!")
                    break
                elif state in ["FAILED", "CANCELLED"]:
                    reason = status_res["QueryExecution"]["Status"].get("StateChangeReason")
                    print(f"Query {qid} {state}: {reason}")
                    return False
                time.sleep(1)

        except ClientError as e:
            print(f"Athena ClientError: {e}")
            return False

    print("\n[SUCCESS] Iceberg table civicpulse_db.civic_hazards_iceberg created and configured.")
    return True

if __name__ == "__main__":
    create_table()
