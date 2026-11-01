import React from 'react';
import { Hazard } from '../../types';
import {
  AlertTriangle,
  Droplets,
  CheckCircle,
  Truck,
  ShieldAlert,
  MapPin,
  Clock,
  Radio
} from 'lucide-react';

interface HazardInspectorProps {
  hazard: Hazard | null;
  onSimulateBreach?: (hazard: Hazard) => void;
  onDispatchToHazard?: (hazard: Hazard) => void;
}

export const HazardInspector: React.FC<HazardInspectorProps> = ({
  hazard,
  onSimulateBreach,
  onDispatchToHazard,
}) => {
  if (!hazard) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#111827] border border-[rgba(148,163,184,0.15)] flex items-center justify-center text-slate-600">
          <MapPin className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-400">Select A Flood Zone</div>
          <div className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
            Click any red or amber area on the map to view real-time water depth and road passability.
          </div>
        </div>
      </div>
    );
  }

  const isResolved = hazard.status === 'RESOLVED';
  const isCritical = hazard.severity === 'CRITICAL';
  const depth = hazard.water_depth_cm || 0;

  let impactText = 'Road passable with caution';
  if (isResolved) {
    impactText = 'Road cleared and fully reopened for traffic';
  } else if (depth >= 40) {
    impactText = 'Road impassable - Avoid area completely';
  } else if (depth >= 20) {
    impactText = 'High risk - Two-wheelers and compact cars blocked';
  }

  return (
    <div className="bg-[#111827] rounded-xl p-4 border border-[rgba(148,163,184,0.15)] space-y-4 shadow-md">
      {/* Header & Badges */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
            {hazard.hazard_id}
          </span>
          <div className="flex items-center space-x-1.5">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                isResolved
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : isCritical
                  ? 'bg-red-500/15 text-red-400 border-red-500/30'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}
            >
              {isResolved ? 'Resolved' : hazard.severity}
            </span>
          </div>
        </div>

        <h3 className="text-sm font-bold text-white leading-snug">
          {hazard.location_name}
        </h3>
      </div>

      {/* Water Depth Gauge Card */}
      <div
        className={`p-3.5 rounded-xl border flex items-center justify-between ${
          isResolved
            ? 'bg-emerald-950/20 border-emerald-500/30'
            : isCritical
            ? 'bg-red-950/25 border-red-500/35'
            : 'bg-amber-950/20 border-amber-500/30'
        }`}
      >
        <div className="space-y-0.5">
          <div className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1.5">
            <Droplets
              className={`w-3.5 h-3.5 ${
                isResolved
                  ? 'text-emerald-400'
                  : isCritical
                  ? 'text-red-400'
                  : 'text-amber-400'
              }`}
            />
            <span>Reported Water Depth</span>
          </div>
          <div className="text-xl font-bold text-white tabular-nums tracking-tight">
            {isResolved ? '0 cm' : `${depth} cm`}
          </div>
          <div className="text-[11px] font-medium text-slate-300">{impactText}</div>
        </div>
      </div>

      {/* Observation Metadata */}
      <div className="space-y-2 text-xs border-t border-[rgba(148,163,184,0.1)] pt-3">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            <span>Detection Source</span>
          </span>
          <span className="text-white font-medium">IoT Ultrasonic Sensor</span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Last Observed</span>
          </span>
          <span className="text-white font-medium">14 minutes ago</span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Municipal Ward</span>
          </span>
          <span className="text-white font-medium">Madurai North - Ward 24</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-[rgba(148,163,184,0.1)]">
        {onSimulateBreach && !isResolved && (
          <button
            onClick={() => onSimulateBreach(hazard)}
            className="w-full py-2 px-3 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-[rgba(148,163,184,0.15)] transition-colors flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Commuter Geofence Breach</span>
          </button>
        )}

        {onDispatchToHazard && !isResolved && (
          <button
            onClick={() => onDispatchToHazard(hazard)}
            className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Dispatch Dewatering Crew</span>
          </button>
        )}
      </div>
    </div>
  );
};
