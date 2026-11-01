# CivicPulse — Madurai Spatial Lakehouse
### Complete Geospatial Civic Decision-Support Platform
**Built on Amazon Web Services, Apache Iceberg, Amazon Athena & Amazon Location Service**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Apache Iceberg](https://img.shields.io/badge/Apache%20Iceberg-v2-blue?logo=apache)](https://iceberg.apache.org)
[![Amazon Athena](https://img.shields.io/badge/Amazon%20Athena-Serverless%20SQL-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/athena/)
[![Amazon Location](https://img.shields.io/badge/Amazon%20Location-Maps%20%7C%20Routes%20%7C%20Geofences-FF9900?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/location/)
[![MapLibre GL JS](https://img.shields.io/badge/MapLibre-GL%20JS-3887BE?logo=maplibre&logoColor=white)](https://maplibre.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

---

## 1. Product Vision

**CivicPulse** is an enterprise geospatial civic operations command center focused on **Madurai, Tamil Nadu, India**. 

The primary innovation of CivicPulse is not simply rendering hazards on a map. It is closing the verifiable decision loop between:
1. **Observing a geographic hazard** (IoT water sensors, citizen reports, ward officer logs).
2. **Determining route exposure** (calculating exact geometric intersections with active hazard polygons and computing alternative safe corridors).
3. **Prioritizing operational municipal response** (transparent multi-criteria scoring across severity, arterial road exposure, public facilities, and confidence).
4. **Measuring how the risk picture changes after an intervention** (atomic Athena `MERGE INTO` table mutations that commit a new Apache Iceberg snapshot and immediately refresh routing calculations).

---

## 2. Core Madurai Demonstration Locations

All locations in CivicPulse correspond to physical Madurai geographic features:

* **Periyar Bus Stand** (`[78.1135°E, 9.9175°N]`): Central transit hub.
* **Simmakkal** (`[78.1221°E, 9.9282°N]`): Major arterial intersection on North Veli Street.
* **Goripalayam** (`[78.1325°E, 9.9328°N]`): Northern bridgehead arterial near Goripalayam Dargah.
* **Sellur** (`[78.1278°E, 9.9412°N]`): Railway underpass corridor prone to monsoonal overflow.
* **Arapalayam** (`[78.1065°E, 9.9345°N]`): Western intercity bus terminus.
* **Mattuthavani Integrated Bus Terminus (MIBT)** (`[78.1632°E, 9.9498°N]`): Major integrated terminal.
* **Vandiyur Teppakulam** (`[78.1488°E, 9.9142°N]`): Historic 16-acre temple tank.
* **Kalavasal** (`[78.0935°E, 9.9262°N]`): Four-road highway junction.

---

## 3. Architecture & The 4-Stage Decision Cycle

```
[1. OBSERVE] ──────────► [2. PERSIST & QUERY] ─────► [3. SAFE ROUTING & GEOFENCING] ─────► [4. MUNICIPAL INTERVENTION]
SmartCity Sensors        S3 Apache Iceberg v2        Amazon Location Routes                Multi-Criteria Priority Ranking
Citizen Crowdsourcing    AWS Glue Data Catalog       Shapely Polygon Intersections         Super Sucker Truck Dispatch
Ward Sanitation Logs     Athena Time-Travel SQL      Alternative Corridor Detour           Athena MERGE INTO Mutation
```

### Key Technical Components
- **Amazon S3 Data Lake:** Hosts Parquet data files, Avro manifest files, and Iceberg metadata trees.
- **Apache Iceberg v2:** Provides atomic transactions, snapshot isolation, and historical time-travel queries.
- **Amazon Athena:** Executes serverless Trino/Presto queries with `FOR VERSION AS OF` syntax and `MERGE INTO` mutations.
- **Amazon Location Service:**
  - *Maps:* Dark cartographic base map rendering.
  - *Places:* Geocoding and search biased to Madurai.
  - *Routes:* Arterial route calculation and hazard avoidance.
  - *Geofences:* Real-time device breach detection against active hazard perimeters.
- **FastAPI Backend:** Python 3.11 with Pydantic v2 schemas and Shapely 2.0 geometric calculations.
- **MapLibre GL JS Frontend:** Interactive 3D vector map with restrained glassmorphic control panels.

---

## 4. Repository Structure

```
civicpulse/
├── frontend/                        # React + TypeScript + Vite + MapLibre GL JS
│   ├── src/
│   │   ├── components/              # Layout, Map, Hazards, Routing, Timeline, Municipal
│   │   ├── services/api.ts          # Strongly typed REST client
│   │   ├── types/index.ts           # Shared TypeScript interfaces
│   │   └── App.tsx                  # Primary spatial operations command center
│   ├── package.json
│   └── vite.config.ts
├── backend/                         # FastAPI + Pydantic + Boto3 + Shapely
│   ├── app/
│   │   ├── api/                     # REST routers (health, places, hazards, routes, geofences, iceberg, municipal, events)
│   │   ├── core/config.py           # Settings and environment configuration
│   │   ├── schemas/                 # Pydantic v2 models
│   │   ├── services/                # Location, Routing, Athena, Iceberg, Prioritization services
│   │   └── main.py                  # Application entry point
│   ├── tests/                       # 14 Pytest automated test suites
│   ├── requirements.txt
│   └── Dockerfile
├── data/                            # Lakehouse datasets and schemas
│   ├── demo/madurai_hazards.json    # 4 committed snapshots and place catalogs
│   ├── processed/                   # Exported GeoJSON layers
│   └── schemas/hazard_schema.json   # JSON Schema validation
├── aws/                             # AWS Infrastructure & CloudFormation
│   ├── infrastructure/template.yaml # Complete CloudFormation/SAM template
│   ├── athena/                      # Real Iceberg table DDL
│   ├── lambda/                      # Geofence event handler
│   └── eventbridge/                 # Geofence event routing rules
├── scripts/                         # Setup and verification utilities
│   ├── setup.ps1 / setup.sh         # One-click environment bootstrap
│   ├── validate_environment.py      # Pre-flight checklist runner
│   ├── seed_demo_data.py            # Local and S3 data lake seeder
│   ├── create_iceberg_table.py      # Athena Iceberg table provisioner
│   ├── initialize_geofences.py      # Amazon Location Geofence collection setup
│   └── verify_aws_resources.py      # Honest AWS resource verification script
├── docs/                            # In-depth technical documentation
│   ├── architecture.md
│   ├── data-sources.md
│   ├── aws-deployment.md
│   ├── security.md
│   ├── demo-script.md               # 2m 40s hackathon presentation script
│   └── troubleshooting.md
├── docker-compose.yml
├── Makefile
└── README.md
```

---

## 5. Quick Start (Local Development)

### 1. Clone & Bootstrap
```bash
cd c:\github\hackthon\civicpulse

# Windows PowerShell:
.\scripts\setup.ps1

# Linux / macOS:
./scripts/setup.sh
```

### 2. Run Backend
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://localhost:8000` (Docs: `http://localhost:8000/docs`).

### 3. Run Frontend
```bash
cd frontend
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 6. Running with Docker Compose

To run the complete platform inside isolated containers:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

---

## 7. Automated Testing Suite

CivicPulse includes automated tests covering polygon integrity, route intersections, prioritization scoring, and Iceberg queries:

```bash
cd backend
python -m pytest tests/ -v
```

Expected output:
```text
tests/test_geofences.py::test_geofence_evaluation_outside PASSED
tests/test_geofences.py::test_geofence_evaluation_inside_sellur PASSED
tests/test_hazards.py::test_polygon_validation_closed_ring PASSED
tests/test_hazards.py::test_polygon_validation_auto_close PASSED
tests/test_hazards.py::test_polygon_validation_out_of_bounds PASSED
tests/test_hazards.py::test_get_all_hazards PASSED
tests/test_hazards.py::test_hazard_summary PASSED
tests/test_iceberg.py::test_get_iceberg_snapshots PASSED
tests/test_iceberg.py::test_time_travel_query_athena_builder PASSED
tests/test_iceberg.py::test_merge_resolution_query_builder PASSED
tests/test_iceberg.py::test_iceberg_time_travel_query_execution PASSED
tests/test_prioritization.py::test_prioritization_calculation PASSED
tests/test_routing.py::test_compare_routes_detects_intersections PASSED
tests/test_routing.py::test_haversine_distance PASSED
============================== 14 passed in 0.60s ==============================
```

Frontend TypeScript build verification:
```bash
cd frontend
npm run build
```

---

## 8. Live AWS Mode vs. Demo Mode

CivicPulse adheres to strict architectural honesty:
- **Demo Mode (`APP_MODE=demo`):** Uses deterministic Madurai fixtures and real local Shapely spatial calculations. No AWS credentials or charges required.
- **Live AWS Mode (`APP_MODE=live`):** Connects to genuine AWS S3, AWS Glue, Amazon Athena, and Amazon Location Services. Status badges in the UI only turn green when real AWS handshakes succeed.

To verify your AWS configuration:
```bash
python scripts/verify_aws_resources.py
```

---

## 9. Hackathon Submission Draft

### Project Title
**CivicPulse: Geospatial Hazard Intelligence and Safe-Corridor Routing for Madurai**

### Problem
Monsoonal storm surges and urban inundation frequently sever arterial road networks. Citizens lack real-time visibility into route safety, while municipal dispatchers struggle to prioritize dewatering trucks across fragmented reporting channels.

### Solution
CivicPulse connects multi-source hazard observations with an Apache Iceberg lakehouse on Amazon S3. Commuters receive validated safe-corridor routing that avoids active hazard polygons, while municipal commanders use transparent multi-criteria ranking and Athena `MERGE INTO` queries to mobilize and verify interventions in real time.

### Innovation
- **Explainable Route Avoidance:** Exact geometric intersections between routes and hazard polygons.
- **Immutable Historical Time Travel:** Querying snapshot history via Amazon Athena.
- **Verifiable Municipal Mutation:** Ground interventions committed directly to Apache Iceberg tables.
- **Transparent Prioritization:** Weighted multi-factor scoring (severity 35%, road impact 25%, public facilities 20%, recency 10%, confidence 10%).

---

## 10. License

MIT License. Open-source software developed for civic resilience and geospatial innovation.

