# CivicPulse — Data Sources, Provenance & Honesty Disclosures

## 1. Geographic Coverage & Demonstration Focus

The initial deployment of CivicPulse focuses on the historic city of **Madurai, Tamil Nadu, India**:
- **Bounding Box:** `[78.08°E, 9.88°N]` to `[78.18°E, 9.97°N]`
- **Coordinate Reference System:** EPSG:4326 (WGS84, Longitude / Latitude)
- **Primary Arterial River:** Vaigai River (dividing northern and southern municipal zones)

---

## 2. Documented Demonstration Landmarks

All geographic centerpoints and place names used in CivicPulse correspond to actual physical landmarks in Madurai:

| Landmark Name | WGS84 Coordinates | Category | Operational Context |
| :--- | :--- | :--- | :--- |
| **Periyar Bus Stand** | `[78.1135°E, 9.9175°N]` | Transit Hub | Core intra-city bus terminus near Madurai Junction Railway Station. |
| **Simmakkal** | `[78.1221°E, 9.9282°N]` | Major Junction | Dense commercial intersection on North Veli Street approaching Vaigai bridges. |
| **Goripalayam** | `[78.1325°E, 9.9328°N]` | Bridgehead Arterial | Northern bridgehead intersection near Goripalayam Dargah. |
| **Sellur** | `[78.1278°E, 9.9412°N]` | River Corridor | Chronic drainage underpass near Kanpalayam railway line prone to monsoonal overflow. |
| **Arapalayam** | `[78.1065°E, 9.9345°N]` | Intercity Bus Stand | Western bus terminal connecting Madurai to Dindigul, Theni, and Coimbatore. |
| **Mattuthavani (MIBT)**| `[78.1632°E, 9.9498°N]` | Major Integrated Terminal | Primary intercity bus hub on Melur Road. |
| **Vandiyur Teppakulam** | `[78.1488°E, 9.9142°N]` | Heritage & Public Lake | Historic 16-acre temple tank on Kamarajar Salai. |
| **Kalavasal** | `[78.0935°E, 9.9262°N]` | Arterial Highway Junction | Major junction connecting Theni Main Road and Bypass Road. |

---

## 3. Dataset Provenance & Synthesis Disclosures

In compliance with hackathon guidelines, **no hypothetical flood conditions are represented as verified real-world measurements**:

| Dataset Element | Primary Source | License | Classification | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Basemap Tiles & POIs** | OpenStreetMap / CARTO / Amazon Location Places | ODbL / Open Access | **Observed Real-World** | Physical road network, transit terminals, and place coordinates. |
| **Ward Boundaries** | Madurai Municipal Corporation Public Open Data | Open Government Data (OGD) | **Observed Real-World** | Municipal administrative zones (North, South, Central). |
| **Storm Inundation Polygons** | CivicPulse Deterministic Storm Scenario (`SIM-STORM-OCT26`) | MIT License | **Deterministic Simulation** | Calibrated synthetic flood perimeters reflecting historical monsoonal inundation hotspots along the Vaigai river basin. |
| **Water Depth Telemetry** | Simulated IoT Telemetry Generator | MIT License | **Deterministic Simulation** | Scaled millimetric sensor depth readings (0–95 cm). |
| **Municipal Dispatch Logs** | CivicPulse Dispatch Simulator | MIT License | **Operational Simulation** | Simulated work order issuance for Super Sucker dewatering suction trucks. |

---

## 4. Reusability for Other Cities

To adapt CivicPulse for another municipality (e.g. Chennai, Bengaluru, Mumbai, or New Orleans):
1. Replace `data/demo/madurai_hazards.json` with local city POIs and hazard polygons.
2. Update the default bounding box and map center in `frontend/src/components/map/OperationsMap.tsx` and `backend/app/core/config.py`.
3. Re-run `python scripts/seed_demo_data.py`.
4. Deploy the infrastructure template (`aws/infrastructure/template.yaml`) in the chosen AWS region.
