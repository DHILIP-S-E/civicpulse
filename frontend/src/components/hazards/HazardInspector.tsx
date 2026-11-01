import React from 'react';
import { Hazard } from '../../types';
import { Radio, Truck } from 'lucide-react';

interface HazardInspectorProps {
  hazard: Hazard | null;
  onSimulateBreach: (hazard: Hazard) => void;
  onDispatchToHazard: (hazard: Hazard) => void;
}

export const HazardInspector: React.FC<HazardInspectorProps> = ({
  hazard,
  onSimulateBreach,
  onDispatchToHazard,
}) => {
  if (!hazard) {
    return (
      <div className="p-6 text-center text-terminal-muted text-xs font-mono space-y-1">
        <div className="text-terminal-subtle text-base font-semibold">Select Hazard Polygon</div>
        <p className="font-sans text-[11px] text-terminal-muted">
          Click any hazard feature on the 3D map to inspect Iceberg parquet metadata and spatial properties.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs select-text">
      {/* Header with ID and Severity */}
      <div className="border-b border-terminal-border pb-2">
        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="font-mono text-terminal-muted">{hazard.hazard_id}</span>
          <span className={`px-1.5 py-0.5 text-[10px] font-mono border rounded-sm ${
            hazard.severity === 'CRITICAL'
              ? 'border-hazard-critical text-hazard-critical bg-[#261619]'
              : 'border-hazard-moderate text-hazard-moderate bg-[#262016]'
          }`}>
            {hazard.severity}
          </span>
        </div>
        <div className="font-semibold text-sm text-white">
          {hazard.location_name}
        </div>
      </div>

      {/* Tabular Properties */}
      <div className="space-y-1.5 text-xs bg-surface border border-terminal-border p-2.5 tabular-nums">
        <div className="flex items-center justify-between py-1 border-b border-rule">
          <span className="text-terminal-muted">Status</span>
          <span className={`font-mono text-[11px] ${
            hazard.status === 'RESOLVED' ? 'text-hazard-resolved' : 'text-hazard-critical font-medium'
          }`}>
            {hazard.status}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-rule">
          <span className="text-terminal-muted">Water Depth</span>
          <span className="font-medium text-white">
            {hazard.water_depth_cm !== null && hazard.water_depth_cm !== undefined ? `${hazard.water_depth_cm} cm` : '—'}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-rule">
          <span className="text-terminal-muted">Category</span>
          <span className="text-white">{hazard.hazard_type}</span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-rule">
          <span className="text-terminal-muted">Coordinates</span>
          <span className="font-mono text-terminal-muted">
            {hazard.latitude.toFixed(4)}°N, {hazard.longitude.toFixed(4)}°E
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-rule">
          <span className="text-terminal-muted">Observation Time</span>
          <span className="font-mono text-terminal-muted">
            {hazard.observed_at.replace('T', ' ').slice(0, 19)}
          </span>
        </div>

        <div className="flex items-center justify-between py-1 border-b border-rule">
          <span className="text-terminal-muted">Sensor Ingestion</span>
          <span className="text-white">{hazard.source_type}</span>
        </div>

        <div className="flex items-center justify-between py-1">
          <span className="text-terminal-muted">Confidence Score</span>
          <span className="font-medium text-white">
            {(hazard.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Iceberg Lakehouse Partition Details */}
      <div className="p-2 bg-ground border border-terminal-border text-[11px] space-y-1">
        <div className="text-terminal-muted font-medium">Iceberg Storage Partition:</div>
        <div className="font-mono text-terminal-subtle break-all">
          s3://civicpulse-lakehouse/data/status={hazard.status.toLowerCase()}/{hazard.hazard_id}.parquet
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-1.5 pt-1">
        <button
          onClick={() => onSimulateBreach(hazard)}
          className="w-full py-1.5 px-3 bg-surface hover:bg-raised text-terminal-muted hover:text-white border border-terminal-border text-xs transition-colors flex items-center justify-center space-x-1.5"
        >
          <Radio className="w-3.5 h-3.5 text-hazard-moderate" />
          <span>Simulate Commuter Geofence Breach</span>
        </button>

        {hazard.status !== 'RESOLVED' && (
          <button
            onClick={() => onDispatchToHazard(hazard)}
            className="w-full py-1.5 px-3 bg-raised hover:bg-[#25252c] text-white border border-terminal-border text-xs font-medium transition-colors flex items-center justify-center space-x-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-accent" />
            <span>Dispatch Municipal Dewatering Unit</span>
          </button>
        )}
      </div>
    </div>
  );
};
