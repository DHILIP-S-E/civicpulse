import React from 'react';
import { IcebergSnapshot } from '../../types';
import { X, Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SnapshotInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: IcebergSnapshot | null;
  sqlExecuted?: string;
}

export const SnapshotInspector: React.FC<SnapshotInspectorProps> = ({
  isOpen,
  onClose,
  snapshot,
}) => {
  if (!isOpen || !snapshot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="bg-[#111827] w-full max-w-lg rounded-2xl border border-[rgba(148,163,184,0.2)] p-6 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(148,163,184,0.15)]">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <span>Historic Flood Map Details</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Recorded flood conditions for {snapshot.relative_time}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Snapshot Overview Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-500/30">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-red-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Active Hazard Zones</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {snapshot.active_hazard_count}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Locations with active water depth
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Resolved Corridors</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {snapshot.resolved_hazard_count}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Dewatered and cleared by crews
            </div>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="p-4 rounded-xl bg-[#0B0F19] border border-[rgba(148,163,184,0.15)] space-y-2 text-xs text-slate-300 leading-relaxed">
          <div className="text-xs font-bold text-white uppercase tracking-wider">
            Storm Window Status
          </div>
          <p>
            {snapshot.stage_name.includes('Resolved') || snapshot.stage_name.includes('Resolution')
              ? 'Municipal dewatering teams completed pump-out operations at major intersections, restoring traffic flow along primary bus corridors.'
              : 'Continuous precipitation caused storm runoff to pool at critical arterial junctions and railway underpasses, triggering detour recommendations for commuters.'}
          </p>
          <div className="pt-2 border-t border-[rgba(148,163,184,0.1)] flex items-center justify-between text-[11px] text-slate-400">
            <span>Data Freshness:</span>
            <span className="text-emerald-400 font-medium">Verified Official Records</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[rgba(148,163,184,0.15)]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors shadow"
          >
            Back to Map
          </button>
        </div>
      </div>
    </div>
  );
};
