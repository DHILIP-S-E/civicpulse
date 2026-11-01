#!/usr/bin/env python3
"""
CivicPulse: Environment & Pre-Flight Validation Script
Checks runtime prerequisites, lakehouse schemas, and AWS connectivity without exposing secrets.
"""

import sys
import os
import json

def run_checks():
    print("=" * 65)
    print(" CIVICPULSE PRE-FLIGHT VALIDATION CHECKLIST")
    print("=" * 65)
    
    all_ok = True

    # 1. Python runtime
    py_ver = sys.version_info
    print(f"[*] Python Version: {py_ver.major}.{py_ver.minor}.{py_ver.micro}", end="")
    if py_ver.major >= 3 and py_ver.minor >= 10:
        print(" -> [PASS]")
    else:
        print(" -> [FAIL: Requires Python 3.10+]")
        all_ok = False

    # 2. Critical Python Libraries
    packages = ["fastapi", "pydantic", "boto3", "shapely", "uvicorn"]
    for pkg in packages:
        try:
            __import__(pkg)
            print(f"[*] Python Module: {pkg:<12} -> [PASS]")
        except ImportError:
            print(f"[*] Python Module: {pkg:<12} -> [FAIL: Module missing]")
            all_ok = False

    # 3. Demo Dataset & Geometry Integrity
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    demo_path = os.path.join(base_dir, "data", "demo", "madurai_hazards.json")
    print(f"[*] Checking Lakehouse Dataset: {demo_path}", end="")
    if os.path.exists(demo_path):
        with open(demo_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            snapshots = data.get("snapshots", [])
            places = data.get("madurai_places", [])
            print(f" -> [PASS: {len(snapshots)} snapshots, {len(places)} places]")
            
            # Geometry check
            from shapely.geometry import shape
            geom_ok = True
            for s in snapshots:
                for h in s.get("hazards", []):
                    poly = shape(h.get("geometry", {}))
                    if not poly.is_valid:
                        print(f"    [!] Invalid polygon in {h.get('hazard_id')}")
                        geom_ok = False
            if geom_ok:
                print("    [*] All GeoJSON Hazard Polygon geometries verified valid via Shapely -> [PASS]")
            else:
                all_ok = False
    else:
        print(" -> [FAIL: File not found]")
        all_ok = False

    # 4. AWS Identity Check (Safe check)
    print("[*] Checking AWS Identity / Credentials...", end="")
    try:
        import boto3
        sts = boto3.client("sts")
        identity = sts.get_caller_identity()
        arn = identity.get("Arn")
        account = identity.get("Account")
        print(f" -> [PASS: Account {account}, User {arn.split('/')[-1]}]")
    except Exception as e:
        print(f" -> [NOTE: AWS live access inactive or unconfigured ({str(e)[:45]}...). Demo Mode available.]")

    print("=" * 65)
    if all_ok:
        print(" ALL PRE-FLIGHT CHECKS PASSED: Application is ready to run.")
    else:
        print(" SOME CHECKS FAILED: Review the errors above.")
    print("=" * 65)
    return all_ok

if __name__ == "__main__":
    success = run_checks()
    sys.exit(0 if success else 1)

