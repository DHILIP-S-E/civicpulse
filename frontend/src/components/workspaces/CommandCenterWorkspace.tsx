import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  AlertTriangle,
  Droplets,
  CheckCircle2,
  Clock,
  Layers,
  Box,
  Compass,
  ArrowRight
} from 'lucide-react';

export const CommandCenterWorkspace: React.FC = () => {
  const {
    hazards,
    filters,
    toggleFilter,
    setSelectedHazard,
    setActiveWorkspace
  } = useAppStore();

  const totalCount = hazards.length;
  const activeCount = hazards.filter(h => h.status !== 'RESOLVED').length;
  const criticalCount = hazards.filter(h => h.severity === 'CRITICAL' && h.status !== 'RESOLVED').length;
  const resolvedCount = hazards.filter(h => h.status === 'RESOLVED').length;

  return (
    <div className="space-y-4">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="text-[11px] font-semibold text-[#64748B] flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
            <span>Critical Floods</span>
          </div>
          <div className="text-xl font-bold text-[#DC2626] tabular-nums mt-0.5">
            {criticalCount}
          </div>
          <div className="text-[10px] text-[#64748B] mt-0.5">Water depth &gt; 35cm</div>
        </div>

        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs">
          <div className="text-[11px] font-semibold text-[#64748B] flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Cleared Corridors</span>
          </div>
          <div className="text-xl font-bold text-[#16A34A] tabular-nums mt-0.5">
            {resolvedCount}
          </div>
          <div className="text-[10px] text-[#64748B] mt-0.5">Dewatered by crews</div>
        </div>
      </div>

      {/* Layer Visibility Filters */}
      <div className="bg-white rounded-xl p-3.5 border border-[#E2E8F0] space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#172033] uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-[#1677FF]" />
            <span>Map Layers</span>
          </span>
          <span className="text-[11px] text-[#64748B]">Active layers</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs">
          <button
            onClick={() => toggleFilter('showFloods')}
            className={`px-2.5 py-1.5 rounded-lg text-left border transition-all flex items-center justify-between cursor-pointer ${
              filters.showFloods
                ? 'bg-[#FEF2F2] border-[#DC2626]/30 text-[#DC2626] font-semibold'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
            }`}
          >
            <span>Flood Zones</span>
            <span className="w-2 h-2 rounded-full bg-[#DC2626]"></span>
          </button>

          <button
            onClick={() => toggleFilter('showDebris')}
            className={`px-2.5 py-1.5 rounded-lg text-left border transition-all flex items-center justify-between cursor-pointer ${
              filters.showDebris
                ? 'bg-[#FFFBEB] border-[#D97706]/30 text-[#D97706] font-semibold'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
            }`}
          >
            <span>Blockages</span>
            <span className="w-2 h-2 rounded-full bg-[#D97706]"></span>
          </button>

          <button
            onClick={() => toggleFilter('showWaste')}
            className={`px-2.5 py-1.5 rounded-lg text-left border transition-all flex items-center justify-between cursor-pointer ${
              filters.showWaste
                ? 'bg-[#F0F9FF] border-[#0284C7]/30 text-[#0284C7] font-semibold'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
            }`}
          >
            <span>Overflow</span>
            <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
          </button>

          <button
            onClick={() => toggleFilter('showResolved')}
            className={`px-2.5 py-1.5 rounded-lg text-left border transition-all flex items-center justify-between cursor-pointer ${
              filters.showResolved
                ? 'bg-[#F0FDF4] border-[#16A34A]/30 text-[#16A34A] font-semibold'
                : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
            }`}
          >
            <span>Cleared</span>
            <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
          </button>
        </div>

        <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs text-[#64748B]">
          <label htmlFor="3d-toggle-cmd" className="flex items-center space-x-1.5 cursor-pointer hover:text-[#172033]">
            <Box className="w-3.5 h-3.5 text-[#1677FF]" />
            <span>Show 3D Water Volume</span>
          </label>
          <input
            id="3d-toggle-cmd"
            type="checkbox"
            checked={filters.showExtrusion3D}
            onChange={() => toggleFilter('showExtrusion3D')}
            className="cursor-pointer accent-[#1677FF] w-4 h-4 rounded"
          />
        </div>
      </div>

      {/* Priority Hazards Quick Inspection */}
      <div className="bg-white rounded-xl p-3.5 border border-[#E2E8F0] space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#172033] uppercase tracking-wider">
            Active Hazard Hotspots
          </span>
          <button
            onClick={() => setActiveWorkspace('hazards')}
            className="text-[11px] font-semibold text-[#1677FF] hover:underline flex items-center space-x-0.5 cursor-pointer"
          >
            <span>Full Table</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
          {hazards.slice(0, 5).map((h) => {
            const isCritical = h.severity === 'CRITICAL';
            const isResolved = h.status === 'RESOLVED';

            return (
              <div
                key={h.hazard_id}
                onClick={() => setSelectedHazard(h)}
                className="p-2.5 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="truncate pr-2">
                  <div className="text-xs font-semibold text-[#172033] truncate">
                    {h.location_name}
                  </div>
                  <div className="text-[10px] text-[#64748B] flex items-center space-x-1.5 mt-0.5">
                    <span>{h.hazard_id}</span>
                    <span>-</span>
                    <span>{h.water_depth_cm} cm depth</span>
                  </div>
                </div>

                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 border ${
                    isResolved
                      ? 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/30'
                      : isCritical
                      ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30'
                      : 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]/30'
                  }`}
                >
                  {isResolved ? 'Resolved' : h.severity}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
