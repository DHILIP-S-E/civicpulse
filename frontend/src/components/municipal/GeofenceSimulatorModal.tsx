import React, { useState } from 'react';
import { Hazard } from '../../types';
import {
  ShieldAlert,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  Play
} from 'lucide-react';

interface GeofenceSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  hazard: Hazard | null;
  onRunSimulation: (hazard: Hazard, isInside: boolean) => Promise<any>;
}

export const GeofenceSimulatorModal: React.FC<GeofenceSimulatorModalProps> = ({
  isOpen,
  onClose,
  hazard,
  onRunSimulation,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen || !hazard) return null;

  const handleSimulate = async (isInside: boolean) => {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await onRunSimulation(hazard, isInside);
      setResult(res);
    } catch (err: any) {
      setResult({ evaluation_status: 'ERROR', message: err.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-[#111827] w-full max-w-md p-6 rounded-2xl border border-[rgba(148,163,184,0.2)] space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.15)]">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white">
              Simulate Commuter in Flood Zone
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hazard Target Info */}
        <div className="p-3 bg-[#0B0F19] rounded-xl border border-[rgba(148,163,184,0.15)] space-y-1.5">
          <div className="text-xs font-semibold text-white truncate">
            {hazard.location_name}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>
              ID: {hazard.hazard_id} - Center: {hazard.latitude.toFixed(4)}N, {hazard.longitude.toFixed(4)}E
            </span>
          </div>
          <div className="text-[11px] text-amber-400 font-medium">
            Active Depth: {hazard.water_depth_cm} cm - Severity: {hazard.severity}
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Simulate a commuter vehicle's GPS position crossing into this mapped flood boundary to verify automatic geofence alerts.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            disabled={isRunning}
            onClick={() => handleSimulate(true)}
            className="p-3 bg-red-600/15 hover:bg-red-600/25 border border-red-500/40 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-xs font-bold text-red-400 flex items-center space-x-1.5 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Simulate Breach</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Submit GPS coordinate inside flooded zone
            </div>
          </button>

          <button
            disabled={isRunning}
            onClick={() => handleSimulate(false)}
            className="p-3 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/40 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate Safe Point</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Submit GPS coordinate 1.5km outside zone
            </div>
          </button>
        </div>

        {/* Simulation Output */}
        {result && (
          <div
            className={`p-3 rounded-xl border text-xs space-y-1.5 animate-in fade-in duration-200 ${
              result.evaluation_status === 'BREACH_DETECTED'
                ? 'bg-red-950/20 border-red-500/40 text-red-300'
                : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <div className="font-bold flex items-center space-x-1.5">
              {result.evaluation_status === 'BREACH_DETECTED' ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>ALERT: Flood Boundary Breached</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>SAFE: Position Outside Hazard Zone</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-300">
              {result.message || 'Geofence evaluation completed successfully.'}
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 text-xs rounded-lg border border-[rgba(148,163,184,0.15)] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
