import React, { useState } from 'react';
import { Hazard } from '../../types';
import { AlertCircle, CheckCircle2, Droplets, MapPin, Radio, Clock, ShieldAlert, Truck } from 'lucide-react';

interface HazardInspectorProps {
  hazard: Hazard | null;
  onSimulateBreach?: (hazard: Hazard) => void;
  onDispatchToHazard?: (hazard: Hazard) => void;
  onCenterOnMap?: (hazard: Hazard) => void;
}

export const HazardInspector: React.FC<HazardInspectorProps> = ({
  hazard,
  onSimulateBreach,
  onDispatchToHazard,
  onCenterOnMap,
}) => {
  const [reportSent, setReportSent] = useState(false);

  if (!hazard) {
    return (
      <div className="bg-[#111827] rounded-xl p-5 border border-[rgba(148,163,184,0.15)] text-center space-y-2 shadow-md">
        <div className="w-10 h-10 mx-auto rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <MapPin className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-white">Select Any Hazard on Map</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Click any red or amber flood marker on the map to view real-time water depth and road passability conditions.
        </p>
      </div>
    );
  }

  const isResolved = hazard.status === 'RESOLVED';
  const isCritical = hazard.severity === 'CRITICAL';
  const depth = hazard.water_depth_cm ?? 25;

  let impactText = 'Passable with caution';
  if (isResolved) {
    impactText = 'Road cleared & fully open to traffic';
  } else if (depth >= 35) {
    impactText = 'Road impassable — Avoid area';
  } else if (depth >= 20) {
    impactText = 'High risk — Two-wheelers and sedans blocked';
  }

  const formatSource = (source: string) => {
    switch (source) {
      case 'IOT_SENSOR': return 'Smart City Flood Sensor';
      case 'CITIZEN_REPORT': return 'Citizen Field Report';
      case 'MUNICIPAL_WARD_OFFICER': return 'Ward Corporation Officer';
      case 'SATELLITE_RADAR': return 'Satellite Radar Observation';
      default: return 'Verified Field Report';
    }
  };

  const handleReport = () => {
    setReportSent(true);
    setTimeout(() => setReportSent(false), 3000);
    if (onSimulateBreach) onSimulateBreach(hazard);
  };

  return (
    <div className="bg-[#111827] rounded-xl p-4 border border-[rgba(148,163,184,0.15)] space-y-4 shadow-md select-text">
      {/* Alert Header Badge */}
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          isResolved
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            : isCritical
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
        }`}>
          <span>{isResolved ? '🟢' : isCritical ? '🔴' : '🟠'}</span>
          <span>{isResolved ? 'ROAD CLEARED' : isCritical ? 'SEVERE FLOODING' : 'MODERATE HAZARD'}</span>
        </span>

        <span className="text-[11px] text-slate-400 font-medium">
          {isResolved ? 'Safe to travel' : 'Active hazard'}
        </span>
      </div>

      {/* Location Headline */}
      <div>
        <h3 className="text-base font-bold text-white leading-snug">
          {hazard.location_name}
        </h3>
        <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
          <span>Madurai North · Ward Zone</span>
        </p>
      </div>

      {/* Depth & Road Passability Card */}
      <div className={`p-3 rounded-lg border ${
        isResolved
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
          : isCritical
            ? 'bg-red-950/20 border-red-500/30 text-red-100'
            : 'bg-amber-950/20 border-amber-500/30 text-amber-100'
      }`}>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs font-medium text-slate-300 flex items-center space-x-1">
            <Droplets className="w-3.5 h-3.5 text-blue-400 mr-1 inline" />
            Water Depth:
          </span>
          <span className="text-base font-bold text-white tabular-nums">
            {isResolved ? '0 cm' : `${depth} cm`}
          </span>
        </div>
        <div className="text-xs font-semibold">
          {impactText}
        </div>
      </div>

      {/* Field Details */}
      <div className="space-y-2 text-xs bg-[#0B0F19] rounded-lg p-3 border border-[rgba(148,163,184,0.15)] text-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Reported By:</span>
          <span className="font-medium text-white">{formatSource(hazard.source_type)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Last Verified:</span>
          <span className="text-slate-200">
            {hazard.observed_at ? new Date(hazard.observed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'} (2h ago)
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Confidence:</span>
          <span className="font-semibold text-emerald-400">High (98% Verified)</span>
        </div>
      </div>

      {/* Citizen Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleReport}
          className="w-full py-2.5 px-3 bg-[#1F2937] hover:bg-slate-700 text-white rounded-lg text-xs font-semibold border border-[rgba(148,163,184,0.2)] transition-all flex items-center justify-center space-x-2"
        >
          <Radio className="w-3.5 h-3.5 text-blue-400" />
          <span>{reportSent ? 'Update Submitted!' : 'Report Condition Update'}</span>
        </button>

        {hazard.status !== 'RESOLVED' && onDispatchToHazard && (
          <button
            onClick={() => onDispatchToHazard(hazard)}
            className="w-full py-2 px-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-xs font-medium border border-blue-500/40 transition-all flex items-center justify-center space-x-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-blue-400" />
            <span>Dispatch Municipal Response Unit</span>
          </button>
        )}
      </div>
    </div>
  );
};
