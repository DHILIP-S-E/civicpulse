import React, { useState } from 'react';
import { Hazard } from '../../types';
import { Radio, X, CheckCircle2, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';

interface GeofenceSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  hazard: Hazard | null;
  onRunSimulation: (
    hazard: Hazard,
    isInside: boolean
  ) => Promise<{
    submission_status: string;
    is_confirmed: boolean;
    breaches_detected: any[];
    evaluation_source: string;
    message: string;
  }>;
}

export const GeofenceSimulatorModal: React.FC<GeofenceSimulatorModalProps> = ({
  isOpen,
  onClose,
  hazard,
  onRunSimulation,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  if (!isOpen || !hazard) return null;

  const handleSimulate = async (isInside: boolean) => {
    setIsSimulating(true);
    setResult(null);
    try {
      const res = await onRunSimulation(hazard, isInside);
      setResult({ ...res, isInside });
    } catch (err: any) {
      setResult({
        submission_status: 'FAILED',
        message: err.message || 'Geofence simulation failed',
        breaches_detected: []
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="glass-panel w-full max-w-lg rounded-xl p-5 border border-border-subtle space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <h3 className="font-bold text-sm text-white">Amazon Location Geofence Breach Simulator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hazard Target Info */}
        <div className="p-3 rounded-lg bg-slate-900/80 border border-border-subtle space-y-1 text-xs font-mono">
          <div className="flex items-center justify-between text-gray-400">
            <span>Target Geofence:</span>
            <span className="text-cyan-300 font-bold">GEOFENCE-{hazard.hazard_id}</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Location:</span>
            <span className="text-white font-sans font-semibold">{hazard.location_name}</span>
          </div>
          <div className="flex items-center justify-between text-gray-400">
            <span>Water Inundation:</span>
            <span className="text-amber-400 font-semibold">{hazard.water_depth_cm ?? 0} cm</span>
          </div>
        </div>

        {/* Step-by-Step Simulation Controls */}
        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">
            Simulate Device Telemetry Update
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleSimulate(false)}
              disabled={isSimulating}
              className="p-3 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-border-subtle text-left space-y-1 transition-all"
            >
              <div className="text-emerald-400 font-semibold flex items-center space-x-1">
                <span>Outside Perimeter</span>
              </div>
              <p className="text-[10px] text-gray-400 font-sans">
                Simulate commuter traveling 500m outside the inundation zone boundary.
              </p>
            </button>

            <button
              onClick={() => handleSimulate(true)}
              disabled={isSimulating}
              className="p-3 rounded-lg bg-red-950/30 hover:bg-red-950/50 border border-red-800/40 text-left space-y-1 transition-all"
            >
              <div className="text-red-400 font-semibold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Inside Perimeter</span>
              </div>
              <p className="text-[10px] text-gray-400 font-sans">
                Simulate commuter crossing directly into active hazard polygon.
              </p>
            </button>
          </div>
        </div>

        {/* Live / Simulated Result Output */}
        {result && (
          <div className={`p-3 rounded-lg border text-xs font-mono space-y-1.5 ${
            result.breaches_detected?.length > 0
              ? 'bg-red-950/40 border-red-700/50 text-red-200'
              : 'bg-emerald-950/40 border-emerald-700/50 text-emerald-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center space-x-1">
                {result.breaches_detected?.length > 0 ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>GEOFENCE_ENTER DETECTED</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>POSITION CLEAR</span>
                  </>
                )}
              </span>
              <span className="text-[10px] text-gray-400">
                {result.evaluation_source}
              </span>
            </div>
            <p className="font-sans text-[11px] leading-snug">{result.message}</p>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-medium"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
