import React from 'react';
import { FilterState } from '../../types';
import { Eye, Layers, Box } from 'lucide-react';

interface HazardFilterPanelProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const HazardFilterPanel: React.FC<HazardFilterPanelProps> = ({ filters, setFilters }) => {
  const toggle = (key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-[#111827] rounded-xl p-4 border border-[rgba(148,163,184,0.15)] space-y-3 shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Map Hazards</span>
        </span>
        <span className="text-[11px] text-slate-400">Toggle layers</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Flood Zones */}
        <button
          onClick={() => toggle('showFloods')}
          className={`px-3 py-2 rounded-lg text-left border transition-all flex items-center justify-between ${
            filters.showFloods
              ? 'bg-red-500/15 border-red-500/40 text-white font-medium shadow-sm'
              : 'bg-[#0B0F19] border-[rgba(148,163,184,0.15)] text-slate-400 hover:text-white'
          }`}
        >
          <span className="truncate">Flood Zones</span>
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 ml-1.5 shadow-sm"></span>
        </button>

        {/* Road Blockages */}
        <button
          onClick={() => toggle('showDebris')}
          className={`px-3 py-2 rounded-lg text-left border transition-all flex items-center justify-between ${
            filters.showDebris
              ? 'bg-amber-500/15 border-amber-500/40 text-white font-medium shadow-sm'
              : 'bg-[#0B0F19] border-[rgba(148,163,184,0.15)] text-slate-400 hover:text-white'
          }`}
        >
          <span className="truncate">Road Blockages</span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 ml-1.5 shadow-sm"></span>
        </button>

        {/* Overflow */}
        <button
          onClick={() => toggle('showWaste')}
          className={`px-3 py-2 rounded-lg text-left border transition-all flex items-center justify-between ${
            filters.showWaste
              ? 'bg-cyan-500/15 border-cyan-500/40 text-white font-medium shadow-sm'
              : 'bg-[#0B0F19] border-[rgba(148,163,184,0.15)] text-slate-400 hover:text-white'
          }`}
        >
          <span className="truncate">Overflow</span>
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 ml-1.5 shadow-sm"></span>
        </button>

        {/* Cleared Areas */}
        <button
          onClick={() => toggle('showResolved')}
          className={`px-3 py-2 rounded-lg text-left border transition-all flex items-center justify-between ${
            filters.showResolved
              ? 'bg-emerald-500/15 border-emerald-500/40 text-white font-medium shadow-sm'
              : 'bg-[#0B0F19] border-[rgba(148,163,184,0.15)] text-slate-400 hover:text-white'
          }`}
        >
          <span className="truncate">Cleared Areas</span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 ml-1.5 shadow-sm"></span>
        </button>
      </div>

      {/* 3D Volumetric Water Depth switch */}
      <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
        <label htmlFor="extrusion-depth" className="flex items-center space-x-1.5 cursor-pointer hover:text-white transition-colors">
          <Box className="w-3.5 h-3.5 text-blue-400" />
          <span>Show 3D Water Depth</span>
        </label>
        <input
          id="extrusion-depth"
          type="checkbox"
          checked={filters.showExtrusion3D}
          onChange={() => toggle('showExtrusion3D')}
          className="cursor-pointer accent-blue-600 w-4 h-4 rounded"
        />
      </div>
    </div>
  );
};
