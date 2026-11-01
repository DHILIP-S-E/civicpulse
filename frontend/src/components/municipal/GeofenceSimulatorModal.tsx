import React, { useState } from 'react';
import { Hazard } from '../../types';
import { X, CheckCircle2, AlertTriangle } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 select-none">
      <div className="bg-surface w-full max-w-lg p-5 border border-terminal-border space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
          <div className="text-sm font-semibold text-white">
            Amazon Location Geofence Breach Evaluator
          </div>
          <button
            onClick={onClose}
            className="p-1 text-terminal-muted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hazard Target Info */}
        <div className="p-3 bg-ground border border-terminal-border space-y-1 text-xs">
          <div className="text-[11px] text-terminal-muted uppercase tracking-wider">
            Target Geofence Polygon
          </div>
          <div className="font-semibold text-white">{hazard.location_name}</div>
          <div className="font-mono text-[11px] text-terminal-muted tabular-nums">
            ID: {hazard.hazard_id} · Center: {hazard.latitude.toFixed(4)}°N, {hazard.longitude.toFixed(4)}°E
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2">
          <div className="text-xs text-terminal-muted leading-tight">
            Transmit telemetry position packet from commuter device to Amazon Location Service Geofence Collection:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSimulate(true)}
              disabled={isSimulating}
              className="py-2 px-3 bg-raised hover:bg-[#25252c] text-white border border-terminal-border text-xs font-medium transition-colors"
            >
              Simulate INSIDE (Breach)
            </button>
            <button
              onClick={() => handleSimulate(false)}
              disabled={isSimulating}
              className="py-2 px-3 bg-surface hover:bg-raised text-terminal-muted hover:text-white border border-terminal-border text-xs transition-colors"
            >
              Simulate OUTSIDE (Clear)
            </button>
          </div>
        </div>

        {/* Results Stream */}
        {result && (
          <div className="p-3 bg-ground border border-terminal-border space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] text-terminal-muted uppercase">
                {result.evaluation_source}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-mono border rounded-sm ${
                result.breaches_detected.length > 0
                  ? 'border-hazard-critical text-hazard-critical bg-[#261619]'
                  : 'border-hazard-resolved text-hazard-resolved bg-[#15231e]'
              }`}>
                {result.breaches_detected.length > 0 ? 'BREACH CONFIRMED' : 'CLEAR'}
              </span>
            </div>

            <p className="text-terminal-muted text-[11px] leading-tight">
              {result.message}
            </p>

            {result.breaches_detected.length > 0 && (
              <div className="space-y-1 pt-1.5 border-t border-rule font-mono text-[11px] text-terminal-muted">
                {result.breaches_detected.map((b: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span>Geofence: {b.geofence_id}</span>
                    <span className="text-hazard-critical font-medium">{b.action}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-terminal-border">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-raised hover:bg-[#25252c] text-white text-xs border border-terminal-border transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
