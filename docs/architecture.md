# CivicPulse — Architecture Specification

## 1. Executive Summary

**CivicPulse — Madurai Spatial Lakehouse** is a geospatial civic operations command center designed to bridge the gap between static urban GIS mapping and verifiable municipal intervention.

Rather than relying on isolated mapping dashboards or static database views, CivicPulse couples an **Apache Iceberg v2 Spatial Lakehouse** hosted on **Amazon S3** with **Amazon Athena** serverless SQL analytics and **Amazon Location Service** (Maps, Places, Routes, and Geofences).

---

## 2. The 4-Stage Geospatial Decision Cycle

CivicPulse is engineered around four distinct, verifiable decision-support stages:

```
+-----------------------------------------------------------------------------------------+
|                                    1. OBSERVE                                           |
|  SmartCity IoT Sensors (Sellur / Periyar) • Citizen Reports • Ward Officer Inspections  |
+--------------------------------------------+--------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                   2. PERSIST & QUERY                                    |
|   Apache Iceberg v2 Table (S3) • AWS Glue Data Catalog • Amazon Athena Time-Travel SQL  |
+--------------------------------------------+--------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                              3. ROUTE EXPOSURE & GEOFENCING                              |
|   Amazon Location Service Routes • Shapely LineString-Polygon Intersections • Avoidance |
+--------------------------------------------+--------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                               4. INTERVENE & VERIFY DELTA                               |
|   Multi-Criteria Prioritization • Municipal Truck Dispatch • Athena MERGE INTO Mutation |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Technology Stack Breakdown

| Tier | Component | Technology / AWS Service | Function |
| :--- | :--- | :--- | :--- |
| **Frontend** | Spatial Web UI | React 18, TypeScript, Vite, Tailwind CSS | High-craft dark cartographic command center |
| | Map Engine | MapLibre GL JS | GPU-accelerated vector rendering, pitch/bearing, 3D polygons |
| | Geometry Engine | Turf.js | Client-side spatial validation & measurement |
| **Backend** | API Engine | Python 3.11, FastAPI, Uvicorn | High-performance asynchronous REST endpoints |
| | Data Validation | Pydantic v2 | Strict JSON schema validation for coordinates & polygons |
| | Spatial Analysis | Shapely 2.0 | Exact geometric intersection testing (`LineString` vs `Polygon`) |
| **AWS Data Lake** | Lakehouse Storage | Amazon S3 | Parquet data files, Avro manifest lists, Iceberg metadata |
| | Data Catalog | AWS Glue Data Catalog | Hive metastore-compatible Iceberg v2 table registration |
| | Query Engine | Amazon Athena v3 | Serverless Trino/Presto queries with snapshot time-travel |
| **AWS Geospatial** | Base Mapping | Amazon Location Maps v2 | Dark Gray Canvas vector basemaps |
| | Places Search | Amazon Location Places | Geocoding & POI search biased to Madurai coordinates |
| | Route Calculator | Amazon Location Routes | Arterial routing & hazard polygon avoidance |
| | Perimeter Alerting| Amazon Location Geofences | Real-time device breach detection (BatchEvaluateGeofences)|
| | Event Router | Amazon EventBridge | Real-time geofence event routing to Lambda handler |

---

## 4. Apache Iceberg Lakehouse Architecture

### Table Layout
- **Database:** `civicpulse_db`
- **Table:** `civic_hazards_iceberg`
- **Location:** `s3://civicpulse-madurai-lakehouse/civicpulse/warehouse/civic_hazards_iceberg/`
- **Format:** Apache Iceberg Format Version 2 on Parquet
- **Partitioning:** `PARTITIONED BY (status, bucket(10, hazard_id))`

### Snapshot Immutability & Point-in-Time Time Travel
Every change to the table produces a new committed snapshot:
- `snap-20261031-060000-001`: Stage 1 Baseline (T-18h)
- `snap-20261031-120000-002`: Stage 2 Storm Development (T-12h)
- `snap-20261031-180000-003`: Stage 3 Peak Monsoonal Storm (T-6h)
- `snap-20261101-000000-004`: Stage 4 Post-Intervention State (Latest)

Users can scrub the 24-hour storm timeline to trigger historical queries using Athena time-travel SQL syntax:
```sql
SELECT * FROM civicpulse_db.civic_hazards_iceberg
FOR VERSION AS OF 'snap-20261031-060000-001';
```

---

## 5. Hazard-Resolution Mutation Workflow

When municipal commanders resolve a hazard on the ground:
1. Operator confirms the resolution in the UI.
2. Backend validates that the hazard exists and is in an `ACTIVE` state.
3. Backend executes an atomic `MERGE INTO` statement via Athena:
   ```sql
   MERGE INTO civicpulse_db.civic_hazards_iceberg AS target
   USING (
       SELECT 'HAZ-MDU-001' AS hazard_id, '2026-11-01T02:00:00Z' AS resolved_at
   ) AS source
   ON target.hazard_id = source.hazard_id
   WHEN MATCHED THEN
       UPDATE SET
           status = 'RESOLVED',
           water_depth_cm = 0.0,
           updated_at = source.resolved_at;
   ```
4. Athena commits the mutation, writing a new data file and snapshot metadata.
5. The map layer refreshes, showing the resolved polygon in emerald green, and re-computes safe corridors without the resolved hazard.
