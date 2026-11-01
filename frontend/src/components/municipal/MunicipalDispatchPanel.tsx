import React, { useState } from 'react';
import { DispatchRecord, Hazard } from '../../types';
import {
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle
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
      <div className="bg-[#111827] rounded-xl p-6 border border-[rgba(148,163,184,0.15)] text-center space-y-3 shadow-md">
        <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          <Truck className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-white">Live Dispatch Tracking</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Select an incident from the Priority Response Queue to mobilize municipal high-capacity dewatering trucks and track field resolution in real time.
        </p>
      </div>
    );
  }

  const isAlreadyResolved = targetHazard.status === 'RESOLVED';

  const handleConfirmResolve = async () => {
    setShowConfirmModal(false);
    await onResolveHazard(targetHazard.hazard_id, dispatch.dispatch_id);
  };

  const formatLogTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  const translateLogMessage = (msg: string) => {
    if (msg.includes('DISPATCH') || msg.includes('depot')) {
      return 'Crew departed Madurai Corporation yard';
    }
    if (msg.includes('ARRIVED') || msg.includes('on site')) {
      return `Reached ${dispatch.hazard_location.split('/')[0].trim()}`;
    }
    if (msg.includes('PUMP') || msg.includes('dewatering')) {
      return 'High-capacity dewatering pump operating';
    }
    return msg;
  };

  return (
    <div className="bg-[#111827] rounded-xl p-4 border border-[rgba(148,163,184,0.15)] space-y-4 shadow-md select-none">
      {/* Unit Status Banner */}
      <div className={`p-4 rounded-xl border ${
        isAlreadyResolved
          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-100'
          : 'bg-blue-950/30 border-blue-500/40 text-blue-100'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">🚛</span>
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Unit {dispatch.crew_id || 'MDU-WEST-04'}
            </span>
          </div>
          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
            isAlreadyResolved
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-blue-500/20 text-blue-300 border border-blue-500/40 animate-pulse'
          }`}>
            {isAlreadyResolved ? 'RESOLVED' : 'EN ROUTE'}
          </span>
        </div>

        <div className="text-base font-bold text-white mb-2">
          {dispatch.hazard_location}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-[rgba(148,163,184,0.15)]">
          <span className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>ETA: <strong className="text-white">{isAlreadyResolved ? 'Completed' : `${dispatch.estimated_arrival_minutes || 12} min`}</strong></span>
          </span>
          <span className="text-slate-400">
            Equipment: <strong className="text-slate-200">Super Sucker Pump</strong>
          </span>
        </div>
      </div>

      {/* Action Log in Plain English */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider">
            Live Field Activity Log
          </span>
          <span className="text-[11px] text-slate-400">Real-time GPS</span>
        </div>

        <div className="bg-[#0B0F19] rounded-lg p-3 border border-[rgba(148,163,184,0.15)] space-y-2 text-xs max-h-[170px] overflow-y-auto">
          {dispatch.action_log.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-xs leading-snug">
              <span className="text-blue-400 font-semibold shrink-0">
                {formatLogTime(log.timestamp)} —
              </span>
              <span className="text-slate-200">
                {translateLogMessage(log.message)}
              </span>
            </div>
          ))}

          {isAlreadyResolved && (
            <div className="flex items-start space-x-2 text-xs text-emerald-300 pt-1.5 border-t border-emerald-500/20 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Dewatering completed. Road is clear and safe for commuters.</span>
            </div>
          )}
        </div>
      </div>

      {/* Resolution Action */}
      <div className="pt-1">
        {!isAlreadyResolved ? (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isResolving}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isResolving ? 'Updating City Database...' : 'Mark as Resolved'}</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 text-center space-y-2.5">
            <div className="text-xs font-bold text-emerald-300 flex items-center justify-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Road cleared — Database updated — Map refreshed</span>
            </div>
            <button
              onClick={onResetDispatch}
              className="px-4 py-2 bg-[#1F2937] hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-[rgba(148,163,184,0.2)] transition-colors shadow"
            >
              Ready for Next Dispatch
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
                className="px-4 py-2 bg-[#0B0F19] hover:bg-slate-800 text-slate-300 hover:text-white text-xs rounded-lg border border-[rgba(148,163,184,0.15)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-colors"
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
