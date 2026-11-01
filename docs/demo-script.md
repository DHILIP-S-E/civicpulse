# CivicPulse — 3-Minute Hackathon Demonstration Script

**Target Duration:** 2 minutes 40 seconds  
**Objective:** Demonstrate how CivicPulse connects geographic hazard evidence, historical lakehouse time travel, route exposure, and municipal intervention.

---

### Phase 1: Problem Introduction & Map Exploration (0:00 – 0:20)
* **Visual:** Browser centered on the dark cartographic map of Madurai with active hazard polygons displayed.
* **Spoken Narrative:**
  > "Urban flooding and infrastructure hazards shouldn't leave citizens guessing which roads are impassable or city managers wondering where to send dewatering crews. This is CivicPulse: a Spatial Lakehouse built on Amazon Web Services and Apache Iceberg, focused on Madurai, Tamil Nadu. We connect real-world geographic observations with safe routing and verifiable municipal intervention."
* **Action:** Toggle 3D extrusion on the map to show proportional water depth heights.

---

### Phase 2: Hazard Evidence & Data Provenance (0:20 – 0:50)
* **Visual:** Click on the **Sellur Railway Underpass** hazard (`HAZ-MDU-001`) and **Simmakkal** (`HAZ-MDU-002`).
* **Spoken Narrative:**
  > "Clicking on Sellur reveals our Lakehouse properties: 65 cm water depth reported by an IoT sensor, severe flooding, and exact coordinates along the Vaigai river corridor. Notice our provenance tracking: every record cites its exact data source, sensor ID, and confidence score. We never fabricate claims—real geographic landmarks are coupled with transparently labeled scenario data."
* **Action:** Show the attribute table in the right inspector panel.

---

### Phase 3: Historical Time Travel with Apache Iceberg & Athena (0:50 – 1:20)
* **Visual:** Scrub the bottom 24-Hour Storm Timeline across Stages 1, 2, 3, and 4.
* **Spoken Narrative:**
  > "Under the hood, our data is stored in an Apache Iceberg v2 table on Amazon S3. Watch what happens as I step through our storm timeline from T−18h baseline, through storm intensification at T−12h, to peak inundation at T−6h. The backend executes real point-in-time time-travel queries in Amazon Athena using Iceberg's `FOR VERSION AS OF` syntax. We can inspect the exact snapshot manifest and committed SQL at any point."
* **Action:** Click the snapshot ID link to open the **Snapshot Inspector** modal showing the committed SQL query and metadata.

---

### Phase 4: Hazard-Aware Route Comparison (1:20 – 1:50)
* **Visual:** Select preset route **Periyar Bus Stand → Mattuthavani Bus Terminus** and click **Compare Safe Corridors**.
* **Spoken Narrative:**
  > "Now let's switch to the Citizen Corridor view. A commuter traveling from Periyar to Mattuthavani needs to know if their route is safe. CivicPulse computes the direct standard route—shown as a dashed red line—and evaluates exact spatial intersections with active hazard polygons using Shapely. The standard route intersects two critical hazard zones. Our routing engine then calculates an alternative bypass corridor—shown in solid green—detouring 2.1 km to guarantee a clear corridor."
* **Action:** Point out the intersection markers flashing on the red dashed route and the delta time/distance metrics card.

---

### Phase 5: Amazon Location Geofencing Breach Simulation (1:50 – 2:15)
* **Visual:** Open the **Geofence Breach Simulator** on the Simmakkal hazard.
* **Spoken Narrative:**
  > "What happens if a commuter strays into a flooded area? Using Amazon Location Service Geofences, we evaluate device coordinates against active hazard perimeters. Simulating an entry position triggers an immediate `GEOFENCE_ENTER` alert, streaming the telemetry update into our live operational event log."
* **Action:** Click 'Inside Perimeter' and watch the confirmed breach event populate in the Operational Event Stream.

---

### Phase 6: Municipal Response & Athena MERGE Resolution (2:15 – 2:35)
* **Visual:** Switch to **Municipal Operations** mode. Inspect the multi-factor priority ranking, then click **Dispatch Unit** on Sellur.
* **Spoken Narrative:**
  > "Switching to Municipal Mode, our transparent priority ranking scores hazards based on severity, road impact, and facility proximity. We dispatch a Super Sucker dewatering unit. Once work is completed on-site, the commander executes an atomic resolution. This triggers an Athena `MERGE INTO` statement directly updating the Iceberg table. Watch the map: the Sellur underpass transitions to green, and the risk picture changes in real time."
* **Action:** Confirm the resolution dialog. Watch the hazard polygon turn green and re-run route comparison to show the corridor is now clear.

---

### Phase 7: Closing & Impact (2:35 – 2:40)
* **Spoken Narrative:**
  > "CivicPulse proves that geographic data is most valuable when it closes the loop between observation, routing, and municipal action. Built on Amazon S3, Athena, and Amazon Location Service."

