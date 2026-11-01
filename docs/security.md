# CivicPulse — Security, Reliability & Privacy Architecture

## 1. Zero Secret Exposure in Frontend Code

CivicPulse enforces a strict separation between public presentation assets and privileged cloud operations:
- **No AWS secret keys (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) are ever embedded in the frontend bundle or exposed via `VITE_` variables.**
- The browser communicates solely with the backend REST API via structured JSON payloads.
- Where MapLibre accesses Amazon Location Services directly, it uses restricted, domain-bound Amazon Location API keys or pre-signed STS tokens.

---

## 2. SQL Injection Prevention & Query Whitelisting

To guarantee Lakehouse integrity:
- **The frontend is never permitted to submit raw SQL strings to the backend.**
- All Athena queries are constructed through strictly typed, server-side parameterized query templates in `athena_service.py`.
- User-supplied parameters (e.g. `hazard_id`, `snapshot_id`, `timestamp`) are validated via Pydantic regular expressions and sanitized against SQL injection:
  - `hazard_id` must match `^HAZ-[A-Z0-9-]+$`
  - Timestamps must parse as valid ISO 8601 date-times
  - Special characters are escaped before template insertion

---

## 3. Spatial Geometry Sanitization & Bounds Checking

All incoming geographic data is validated at the boundary:
- **Bounding coordinates** are strictly enforced to WGS84 ranges:
  - Longitude: `[-180.0, 180.0]`
  - Latitude: `[-90.0, 90.0]`
- **Polygon Rings** must contain at least 4 coordinates and automatically close if the terminal point does not match the origin point.
- **Topological Integrity:** All hazard polygons and route LineStrings are evaluated using Shapely 2.0 (`shape(geom).is_valid`). Self-intersecting "bowtie" polygons or degenerate geometries are rejected with HTTP 422 before reaching the Lakehouse or Amazon Location Services.

---

## 4. Controlled State Mutations & Idempotency

- Municipal hazard resolutions require **explicit two-step confirmation** in the UI to prevent accidental data modification.
- Duplicate dispatch requests for the same active hazard are automatically deduplicated by the dispatch coordinator.
- Lakehouse mutations execute atomic `MERGE INTO` statements that only update rows where `target.status != 'RESOLVED'`.

---

## 5. Least-Privilege IAM Policies

The execution role for CivicPulse adheres to the principle of least privilege:
- `athena:*` access is strictly scoped to the `civicpulse_db` database and `civicpulse-workgroup`.
- `s3:*` write permissions are restricted exclusively to the `civicpulse/` prefix inside the allocated Lakehouse bucket.
- `geo:*` permissions are constrained to the named Map, Place Index, Route Calculator, and Geofence Collection resources.
