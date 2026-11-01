import React, { useState } from 'react';
import { DispatchRecord, Hazard } from '../../types';
import {
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  AlertTriangle,
  Play,
  RotateCcw,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface MunicipalDispatchPanelProps {
  dispatch: DispatchRecord | null;
  targetHazard: Hazard | null;
  onResolveHazard: (hazardId: string, dispatchId?: string) => Promise<void>;
  isResolving: boolean;
  onResetDispatch: () => void;
}

export const MunicipalDispatchPanel: React.FC<MunicipalDispatchPanelProps> = ({
  dispatch,
  targetHazard,
  onResolveHazard,
  isResolving,
  onResetDispatch,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!dispatch || !targetHazard) {
    return (
      <div className="p-4 text-center text-gray-500 text-xs font-mono space-y-2">
        <Truck className="w-8 h-8 mx-auto text-gray-600" />
        <p className="font-sans text-gray-400">No active vehicle dispatch. Select a critical hazard from the priority list to mobilize municipal units.</p>
      </div>
    );
  }

  const handleConfirmResolve = async () => {
    setShowConfirmModal(false);
    await onResolveHazard(targetHazard.hazard_id, dispatch.dispatch_id);
  };

  const isAlreadyResolved = targetHazard.status === 'RESOLVED';

  return (
    <div className="space-y-3.5 select-none">
      {/* Active Work Order Header */}
      <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono font-semibold text-amber-400 flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
            <span>DISPATCH {dispatch.dispatch_id}</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700/50">
            {isAlreadyResolved ? 'MISSION COMPLETED' : dispatch.status}
          </span>
        </div>
        <h4 className="font-bold text-sm text-white">{dispatch.hazard_location}</h4>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-gray-300">
          <span>Unit: {dispatch.crew_id}</span>
          <span>•</span>
          <span>{dispatch.truck_type}</span>
        </div>
      </div>

      {/* Telemetry & Action Log */}
      <div className="space-y-1.5">
        <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold block">
          Dispatch Action Telemetry
        </span>
        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-border-subtle space-y-2 text-xs font-mono max-h-[140px] overflow-y-auto">
          {dispatch.action_log.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-[11px] leading-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1 shrink-0"></span>
              <div>
                <span className="text-gray-400 font-mono">[{log.timestamp.slice(11, 19)}] </span>
                <span className="text-gray-200">{log.message}</span>
              </div>
            </div>
          ))}
          {isAlreadyResolved && (
            <div className="flex items-start space-x-2 text-[11px] text-emerald-400 leading-tight">
              <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>Hazard cleared. Iceberg lakehouse updated with new snapshot.</span>
            </div>
          )}
        </div>
      </div>

      {/* Execution Actions */}
      <div className="pt-2 space-y-2">
        {!isAlreadyResolved ? (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isResolving}
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs tracking-wide uppercase transition-all shadow-md flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isResolving ? 'Committing Athena Mutation...' : 'Execute Resolution via Athena MERGE'}</span>
          </button>
        ) : (
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-center space-y-2">
            <div className="text-xs font-semibold text-emerald-300 flex items-center justify-center space-x-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Resolved in Lakehouse (Status: RESOLVED)</span>
            </div>
            <button
              onClick={onResetDispatch}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs font-mono transition-colors"
            >
              Reset Dispatch View
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-xl p-5 border border-border-subtle space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Confirm Apache Iceberg Mutation</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              This action will execute an asynchronous <span className="font-mono text-cyan-300 font-semibold">MERGE INTO</span> SQL mutation in Amazon Athena against table <span className="font-mono text-cyan-300 font-semibold">civicpulse_db.civic_hazards_iceberg</span>, transitioning hazard <span className="font-mono text-amber-300 font-bold">{targetHazard.hazard_id}</span> to <span className="font-mono text-emerald-400 font-bold">RESOLVED</span> and committing a new immutable Iceberg snapshot.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border-subtle">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow"
              >
                Confirm & Mutate Table
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
