import React, { useState } from 'react';
import { Hazard } from '../../types';
import {
  ShieldAlert,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-2xl animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-[#D97706]" />
            <h3 className="text-sm font-bold text-[#172033]">
              Simulate Commuter in Flood Zone
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#172033] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hazard Target Info */}
        <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
          <div className="text-xs font-semibold text-[#172033] truncate">
            {hazard.location_name}
          </div>
          <div className="text-[11px] text-[#64748B] flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>
              ID: {hazard.hazard_id} - Center: {hazard.latitude.toFixed(4)}N, {hazard.longitude.toFixed(4)}E
            </span>
          </div>
          <div className="text-[11px] text-[#D97706] font-semibold">
            Active Depth: {hazard.water_depth_cm} cm - Severity: {hazard.severity}
          </div>
        </div>

        <p className="text-xs text-[#64748B] leading-relaxed">
          Simulate a commuter vehicle's GPS position crossing into this mapped flood boundary to verify automatic geofence alerts.
        </p>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            disabled={isRunning}
            onClick={() => handleSimulate(true)}
            className="p-3 bg-[#FEF2F2] hover:bg-[#FEE2E2] border border-[#DC2626]/30 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-xs font-bold text-[#DC2626] flex items-center space-x-1.5 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Simulate Breach</span>
            </div>
            <div className="text-[11px] text-[#64748B]">
              Submit GPS coordinate inside flooded zone
            </div>
          </button>

          <button
            disabled={isRunning}
            onClick={() => handleSimulate(false)}
            className="p-3 bg-[#F0FDF4] hover:bg-[#DCFCE7] border border-[#16A34A]/30 rounded-xl text-left transition-all cursor-pointer disabled:opacity-50"
          >
            <div className="text-xs font-bold text-[#16A34A] flex items-center space-x-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Simulate Safe Point</span>
            </div>
            <div className="text-[11px] text-[#64748B]">
              Submit GPS coordinate 1.5km outside zone
            </div>
          </button>
        </div>

        {/* Simulation Output */}
        {result && (
          <div
            className={`p-3 rounded-xl border text-xs space-y-1.5 animate-in fade-in duration-200 ${
              result.evaluation_status === 'BREACH_DETECTED'
                ? 'bg-[#FEF2F2] border-[#DC2626]/30 text-[#DC2626]'
                : 'bg-[#F0FDF4] border-[#16A34A]/30 text-[#16A34A]'
            }`}
          >
            <div className="font-bold flex items-center space-x-1.5">
              {result.evaluation_status === 'BREACH_DETECTED' ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
                  <span>ALERT: Flood Boundary Breached</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A]" />
                  <span>SAFE: Position Outside Hazard Zone</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-[#172033]">
              {result.message || 'Geofence evaluation completed successfully.'}
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
