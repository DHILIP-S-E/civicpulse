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
      <div className="bg-white rounded-xl p-6 border border-[#E2E8F0] text-center text-[#64748B] space-y-2.5 shadow-xs">
        <div className="w-10 h-10 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#64748B] mx-auto">
          <Truck className="w-5 h-5" />
        </div>
        <div className="text-xs font-semibold text-[#172033]">No Active Fleet Dispatched</div>
        <div className="text-[11px] text-[#64748B] max-w-[240px] mx-auto">
          Select an urgent flood zone from the queue below and click "Send Crew" to deploy a dewatering super-sucker tanker unit.
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
    <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] space-y-3.5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
        <div>
          <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-wider block">
            {dispatch.dispatch_id}
          </span>
          <h3 className="text-sm font-bold text-[#172033] flex items-center space-x-2 mt-0.5">
            <Truck className="w-4 h-4 text-[#1677FF]" />
            <span>Madurai Corporation Super-Sucker Unit</span>
          </h3>
        </div>

        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#EAF3FF] text-[#1677FF] border border-[#1677FF]/30">
          En Route
        </span>
      </div>

      {/* Assigned Crew Card */}
      <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#64748B]">Assigned Unit:</span>
          <span className="font-semibold text-[#172033]">{dispatch.crew_id}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#64748B]">Vehicle Class:</span>
          <span className="font-medium text-[#172033]">Heavy Super-Sucker Dewatering Tanker</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[#64748B]">Destination:</span>
          <span className="font-semibold text-[#172033] truncate max-w-[180px]">
            {dispatch.hazard_location}
          </span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
          <span className="text-[#64748B] flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>Estimated Arrival:</span>
          </span>
          <span className="font-bold text-[#1677FF] tabular-nums">
            {dispatch.estimated_arrival_minutes} minutes
          </span>
        </div>
      </div>

      {/* Progress Timeline */}
      <div>
        <label className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
          Dispatch Activity Log
        </label>
        <div className="space-y-2 relative pl-4 border-l-2 border-[#CBD5E1]">
          {(dispatch.action_log || []).map((log, i) => (
            <div key={i} className="relative text-xs space-y-0.5">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#1677FF] ring-4 ring-white"></span>
              <div className="text-[10px] text-[#94A3B8] font-mono">
                {formatLogTime(log.timestamp)}
              </div>
              <div className="text-[#172033] text-[11px] leading-snug">{log.message}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Resolution Action */}
      <div className="pt-3 border-t border-[#E2E8F0]">
        {!isHazardResolved ? (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isResolving}
            className="w-full py-2.5 px-4 bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <CheckCircle2 className={`w-4 h-4 ${isResolving ? 'animate-spin' : ''}`} />
            <span>{isResolving ? 'Updating City Map...' : 'Mark As Resolved (Road Cleared)'}</span>
          </button>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#16A34A]/40 text-center space-y-2">
            <div className="text-xs font-bold text-[#16A34A] flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4 text-[#16A34A]" />
              <span>Road cleared - Map and Database refreshed</span>
            </div>
            <button
              onClick={onResetDispatch}
              className="px-3.5 py-1.5 bg-white hover:bg-[#F8FAFC] text-[#172033] text-xs font-semibold rounded-lg border border-[#E2E8F0] transition-colors shadow-2xs cursor-pointer flex items-center justify-center space-x-1.5 mx-auto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Ready for Next Fleet Dispatch</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-2xl">
            <div className="text-base font-bold text-[#172033] flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" />
              <span>Confirm Road Clearance</span>
            </div>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Have the dewatering tankers finished pump-out operations at <strong className="text-[#172033]">{dispatch.hazard_location}</strong>?
              Marking this as resolved will execute an atomic lakehouse MERGE INTO update, notify commuters, and reopen the corridor.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[#E2E8F0]">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] text-xs rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                className="px-5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
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
