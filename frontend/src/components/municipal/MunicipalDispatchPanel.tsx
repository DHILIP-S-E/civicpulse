import React, { useState } from 'react';
import { DispatchRecord, Hazard } from '../../types';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface MunicipalDispatchPanelProps {
  dispatch: DispatchRecord | null;
  targetHazard: Hazard | null;
  onResolveHazard: (hazardId: string, dispatchId?: string) => void;
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

  if (!dispatch) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-3">
        <div className="w-12 h-12 rounded-full bg-[#111827] border border-[rgba(148,163,184,0.15)] flex items-center justify-center text-slate-600">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-400">No Active Crew Dispatched</div>
          <div className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
            Select an urgent hazard from the priority queue and click "Dispatch Crew" to send a super-sucker tanker unit.
          </div>
        </div>
      </div>
    );
  }

  const isHazardResolved = targetHazard?.status === 'RESOLVED';

  const handleConfirmResolve = () => {
    setShowConfirmModal(false);
    onResolveHazard(dispatch.hazard_id, dispatch.dispatch_id);
  };

  const formatLogTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '10:45 AM';
    }
  };

  return (
    <div className="bg-[#111827] rounded-xl p-4 border border-[rgba(148,163,184,0.15)] space-y-4 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.15)]">
        <div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
            {dispatch.dispatch_id}
          </span>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 mt-0.5">
            <Truck className="w-4 h-4 text-blue-400" />
            <span>Madurai Municipal Dewatering Unit</span>
          </h3>
        </div>

        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
          En Route
        </span>
      </div>

      {/* Assigned Crew Card */}
      <div className="p-3 bg-[#0B0F19] rounded-lg border border-[rgba(148,163,184,0.15)] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Assigned Unit:</span>
          <span className="font-semibold text-white">{dispatch.crew_id}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Vehicle Type:</span>
          <span className="font-medium text-slate-200">Heavy Super-Sucker Tanker</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Destination:</span>
          <span className="font-semibold text-white truncate max-w-[170px]">
            {dispatch.hazard_location}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs pt-1 border-t border-[rgba(148,163,184,0.1)]">
          <span className="text-slate-400 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Est. Arrival:</span>
          </span>
          <span className="font-bold text-blue-400 tabular-nums">
            {dispatch.estimated_arrival_minutes} minutes
          </span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
          Dispatch Activity Log
        </label>
        <div className="space-y-2 relative pl-4 border-l border-slate-700">
          {(dispatch.action_log || []).map((log, i) => (
            <div key={i} className="relative text-xs space-y-0.5">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#111827]"></span>
              <div className="text-[10px] text-slate-500 font-mono">
                {formatLogTime(log.timestamp)}
              </div>
              <div className="text-slate-300 text-[11px] leading-snug">{log.message}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resolution Action */}
      <div className="pt-3 border-t border-[rgba(148,163,184,0.15)]">
        {!isHazardResolved ? (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isResolving}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow hover:shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <CheckCircle2 className={`w-4 h-4 ${isResolving ? 'animate-spin' : ''}`} />
            <span>{isResolving ? 'Updating City Map...' : 'Mark As Resolved (Road Cleared)'}</span>
          </button>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-center space-y-2.5">
            <div className="text-xs font-bold text-emerald-300 flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Road cleared - Database updated - Map refreshed</span>
            </div>
            <button
              onClick={onResetDispatch}
              className="px-3.5 py-1.5 bg-[#1F2937] hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-[rgba(148,163,184,0.2)] transition-colors shadow cursor-pointer flex items-center justify-center space-x-1.5 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ready for Next Dispatch</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] w-full max-w-md p-6 rounded-2xl border border-[rgba(148,163,184,0.2)] space-y-4 shadow-2xl">
            <div className="text-base font-bold text-white flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Confirm Hazard Resolution</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Have the dewatering crews finished pump-out operations at <strong className="text-white">{dispatch.hazard_location}</strong>?
              Marking this as resolved will update the city flood map, notify commuters, and reopen the safe travel corridor.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[rgba(148,163,184,0.15)]">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 hover:text-white text-xs rounded-lg border border-[rgba(148,163,184,0.15)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-colors cursor-pointer"
              >
                Confirm Road Cleared
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
