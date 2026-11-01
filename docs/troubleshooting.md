# CivicPulse — Troubleshooting & FAQ Guide

## 1. Common Issues & Solutions

### Issue 1: Map Tiles Failing to Load or Blank Map
- **Cause:** Restricted network environment blocking external tile CDN or invalid Amazon Location API key.
- **Solution:** CivicPulse includes an automatic raster fallback to CARTO Dark Matter tiles (`https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png`). If running offline or behind a strict enterprise proxy, ensure ports 80/443 outbound access is allowed to `basemaps.cartocdn.com` or configure `AWS_LOCATION_API_KEY` for Amazon Location Service Maps v2.

---

### Issue 2: Athena Query Timeouts or Permission Errors
- **Symptoms:** `Athena query timed out after 30s` or `Access Denied` on `athena:StartQueryExecution`.
- **Checks:**
  1. Verify your IAM user has the `AmazonAthenaFullAccess` managed policy or permissions scoped to the workgroup:
     ```bash
     aws athena get-work-group --work-group primary --region ap-south-1
     ```
  2. Ensure the output S3 location exists and has write permissions:
     ```bash
     aws s3 ls s3://${AWS_S3_BUCKET}/civicpulse/query-results/
     ```
  3. In Demo Mode (`APP_MODE=demo`), all queries execute deterministically in sub-second time without requiring paid Athena queries.

---

### Issue 3: Geofence Collection Not Found
- **Symptoms:** `ResourceNotFoundException: Geofence Collection CivicPulseMaduraiGeofences does not exist.`
- **Solution:**
  Run the initialization script to automatically provision the collection and upload hazard polygons:
  ```bash
  python scripts/initialize_geofences.py
  ```

---

### Issue 4: Python Package Installation Conflicts
- **Symptoms:** Dependency resolver conflicts between older botocore/pydantic versions.
- **Solution:**
  CivicPulse uses pinned dependencies in `backend/requirements.txt`:
  ```bash
  python -m pip install -r backend/requirements.txt
  ```
  Validate with:
  ```bash
  python scripts/validate_environment.py
  ```

---

### Issue 5: Port 8000 or 5173 Already in Use
- **Solution:**
  - Change backend port: `python -m uvicorn app.main:app --port 8001`
  - Change frontend port: update `server.port` in `frontend/vite.config.ts` or run `npm run dev -- --port 5174`
