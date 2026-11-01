import React from 'react';
import { Hazard } from '../../types';
import {
  ShieldAlert,
  MapPin,
  Clock,
  Compass,
  Radio,
  ExternalLink,
  Truck,
  Activity
} from 'lucide-react';

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
      <div className="p-4 text-center text-gray-500 text-xs font-mono space-y-2">
        <div className="w-10 h-10 mx-auto rounded-full bg-slate-900 border border-border-subtle flex items-center justify-center text-gray-600">
          <MapPin className="w-5 h-5" />
        </div>
        <p className="font-sans text-gray-400">Select any hazard polygon on the map to inspect Lakehouse metadata & spatial attributes.</p>
      </div>
    );
  }

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-950/80 border-red-700/60 text-red-300';
      case 'MODERATE':
        return 'bg-amber-950/80 border-amber-700/60 text-amber-300';
      default:
        return 'bg-blue-950/80 border-blue-700/60 text-blue-300';
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'RESOLVED':
        return 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300';
      case 'INVESTIGATING':
        return 'bg-purple-950/80 border-purple-700/60 text-purple-300';
      default:
        return 'bg-amber-950/80 border-amber-700/60 text-amber-300';
    }
  };

  return (
    <div className="space-y-3 select-text">
      {/* Header */}
      <div className="pb-2 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[11px] font-semibold text-blue-400">
            {hazard.hazard_id}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-semibold ${getSeverityBadge(hazard.severity)}`}>
            {hazard.severity}
          </span>
        </div>
        <h3 className="font-bold text-sm text-white leading-tight">
          {hazard.location_name}
        </h3>
      </div>

      {/* Compact Attribute Table */}
      <div className="space-y-1.5 font-mono text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-border-subtle">
        <div className="flex items-center justify-between py-0.5 border-b border-border-subtle/50">
          <span className="text-gray-400 font-sans">Status</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] border ${getStatusBadge(hazard.status)}`}>
            {hazard.status}
          </span>
        </div>

        <div className="flex items-center justify-between py-0.5 border-b border-border-subtle/50">
          <span className="text-gray-400 font-sans">Water Depth</span>
          <span className="font-semibold text-white">
            {hazard.water_depth_cm !== null && hazard.water_depth_cm !== undefined ? `${hazard.water_depth_cm} cm` : 'Not reported'}
          </span>
        </div>

        <div className="flex items-center justify-between py-0.5 border-b border-border-subtle/50">
          <span className="text-gray-400 font-sans">Category</span>
          <span className="text-gray-200">{hazard.hazard_type}</span>
        </div>

        <div className="flex items-center justify-between py-0.5 border-b border-border-subtle/50">
          <span className="text-gray-400 font-sans">Coordinates</span>
          <span className="text-cyan-400">{hazard.latitude.toFixed(4)}°N, {hazard.longitude.toFixed(4)}°E</span>
        </div>

        <div className="flex items-center justify-between py-0.5 border-b border-border-subtle/50">
          <span className="text-gray-400 font-sans">Observed At</span>
          <span className="text-gray-300">{hazard.observed_at.replace('T', ' ').slice(0, 19)}</span>
        </div>

        <div className="flex items-center justify-between py-0.5 border-b border-border-subtle/50">
          <span className="text-gray-400 font-sans">Telemetry Source</span>
          <span className="text-gray-300">{hazard.source_type}</span>
        </div>

        <div className="flex items-center justify-between py-0.5">
          <span className="text-gray-400 font-sans">Confidence</span>
          <span className="text-emerald-400 font-semibold">{(hazard.confidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Provenance & Citation Note */}
      <div className="text-[10px] text-gray-400 bg-slate-950/70 p-2 rounded border border-border-subtle">
        <span className="text-gray-300 font-semibold block mb-0.5">Provenance Reference:</span>
        <p className="font-mono text-gray-400 break-words">{hazard.source_reference || 'Madurai SmartCity Unified Spatial Catalog'}</p>
      </div>

      {/* Operational Actions */}
      <div className="space-y-1.5 pt-1">
        <button
          onClick={() => onSimulateBreach(hazard)}
          className="w-full py-2 px-3 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-600/40 text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
        >
          <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Simulate Commuter Geofence Breach</span>
        </button>

        {hazard.status !== 'RESOLVED' && (
          <button
            onClick={() => onDispatchToHazard(hazard)}
            className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow"
          >
            <Truck className="w-3.5 h-3.5 text-white" />
            <span>Dispatch Dewatering Unit</span>
          </button>
        )}
      </div>
    </div>
  );
};

