import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Server,
  Database,
  MapPin,
  CheckCircle2,
  Code2,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

export const ArchitectureWorkspace: React.FC = () => {
  const {
    isBackendHealthy,
    isLocationConnected,
    isIcebergConnected,
    operatingMode,
    setOperatingMode
  } = useAppStore();

  const [selectedQuery, setSelectedQuery] = useState<'select' | 'merge' | 'geofence'>('select');

  const QUERIES = {
    select: `-- Athena Iceberg Time-Travel Query
SELECT
  hazard_id,
  location_name,
  hazard_type,
  severity,
  status,
  water_depth_cm,
  observed_at
FROM civicpulse_db.civic_hazards_iceberg
FOR TIMESTAMP AS OF TIMESTAMP '2026-10-31 18:00:00';`,
    merge: `-- Athena Iceberg Atomic Hazard Resolution
MERGE INTO civicpulse_db.civic_hazards_iceberg AS target
USING (
  SELECT 'HAZ-MDU-001' AS hazard_id, CURRENT_TIMESTAMP AS resolved_at
) AS source
ON target.hazard_id = source.hazard_id
WHEN MATCHED THEN
  UPDATE SET
    status = 'RESOLVED',
    updated_at = source.resolved_at;`,
    geofence: `-- Amazon Location Geofence Position Evaluation
POST /geofencing/v2/collections/CivicPulseMaduraiGeofences/positions
{
  "DeviceId": "DEV-COMMUTER-MDU-99",
  "Position": [78.1135, 9.9175],
  "SampleTime": "2026-11-01T10:45:00Z"
}`
  };

  return (
    <div className="space-y-4 text-xs">
      {/* End-to-End Pipeline Card */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <Server className="w-4 h-4 text-[#1677FF]" />
          <h3 className="text-sm font-bold text-[#172033]">
            Spatial Lakehouse Pipeline
          </h3>
        </div>

        <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] font-mono text-[11px] leading-relaxed text-[#172033]">
          IoT Ultrasonic Sensors & Municipal Wards<br/>
          &nbsp;&nbsp;→ Amazon S3 Parquet Lakehouse<br/>
          &nbsp;&nbsp;→ Apache Iceberg v2 Tables<br/>
          &nbsp;&nbsp;→ AWS Glue Data Catalog (`civicpulse_db`)<br/>
          &nbsp;&nbsp;→ Amazon Athena Workgroup (`civicpulse-workgroup`)<br/>
          &nbsp;&nbsp;→ Amazon Location Service (Maps, Routes, Geofences)<br/>
          &nbsp;&nbsp;→ MapLibre GL JS Light GIS Operations
        </div>
      </div>

      {/* Cloud Service Status Table */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#172033] uppercase tracking-wider text-[11px]">
            AWS Infrastructure State (ap-south-1)
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/30">
            Connected
          </span>
        </div>

        <div className="divide-y divide-[#E2E8F0] text-[11px]">
          <div className="py-2 flex items-center justify-between">
            <span className="text-[#64748B]">S3 Lakehouse Bucket</span>
            <span className="font-mono text-[#172033] truncate max-w-[180px]">
              civicpulse-lakehouse-979342849987
            </span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="text-[#64748B]">Glue / Iceberg Table</span>
            <span className="font-mono text-[#172033]">civicpulse_db.civic_hazards_iceberg</span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="text-[#64748B]">Athena Query Workgroup</span>
            <span className="font-mono text-[#172033]">civicpulse-workgroup (Engine v3)</span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="text-[#64748B]">Location Maps Resource</span>
            <span className="font-mono text-[#172033]">CivicPulseMaduraiMap (Esri Light)</span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="text-[#64748B]">Geofence Collection</span>
            <span className="font-mono text-[#172033]">CivicPulseMaduraiGeofences (4 Polygons)</span>
          </div>
        </div>
      </div>

      {/* Predefined SQL Inspection Drawer */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="font-bold text-[#172033] flex items-center space-x-1.5">
            <Code2 className="w-4 h-4 text-[#1677FF]" />
            <span>Predefined Lakehouse Queries</span>
          </div>
        </div>

        <div className="flex space-x-1.5 bg-[#F1F5F9] p-1 rounded-lg">
          <button
            onClick={() => setSelectedQuery('select')}
            className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              selectedQuery === 'select' ? 'bg-white text-[#1677FF] shadow-xs' : 'text-[#64748B]'
            }`}
          >
            Time Travel
          </button>
          <button
            onClick={() => setSelectedQuery('merge')}
            className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              selectedQuery === 'merge' ? 'bg-white text-[#1677FF] shadow-xs' : 'text-[#64748B]'
            }`}
          >
            MERGE INTO
          </button>
          <button
            onClick={() => setSelectedQuery('geofence')}
            className={`flex-1 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              selectedQuery === 'geofence' ? 'bg-white text-[#1677FF] shadow-xs' : 'text-[#64748B]'
            }`}
          >
            Geofence
          </button>
        </div>

        <pre className="p-3 bg-[#172033] text-[#F8FAFC] rounded-lg font-mono text-[10px] overflow-x-auto leading-relaxed">
          {QUERIES[selectedQuery]}
        </pre>
      </div>
    </div>
  );
};
