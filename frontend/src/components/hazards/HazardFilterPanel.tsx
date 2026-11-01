import React from 'react';
import { FilterState } from '../../types';
import { Layers, Box } from 'lucide-react';

interface HazardFilterPanelProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const HazardFilterPanel: React.FC<HazardFilterPanelProps> = ({ filters, setFilters }) => {
  const toggle = (key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-[#e8eaec] space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#131416] uppercase tracking-wider flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-[#1b6c80]" />
          <span>Map Hazards</span>
        </span>
        <span className="text-[11px] text-[#5d5f60]">Toggle layers</span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Flood Zones */}
        <button
          onClick={() => toggle('showFloods')}
          className={`px-3 py-2 rounded-lg text-left border transition-all flex items-center justify-between cursor-pointer ${
            filters.showFloods
              ? 'bg-[#ffedea] border-[#fca5a5] text-[#831c1e] font-medium shadow-xs'
              : 'bg-[#f9fbfc] border-[#e8eaec] text-[#5d5f60] hover:bg-[#f4f6f8]'
          }`}
        >
          <span className="truncate">Flood Zones</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#c4242a] shrink-0 ml-1.5"></span>
        </button>

        {/* Road Blockages */}
        <button
          onClick={() => toggle('showDebris')}
          className={`px-3 py-2 rounded-lg text-left border transition-all flex items-center justify-between cursor-pointer ${
            filters.showDebris
              ? 'bg-[#fffbeb] border-[#fde68a] text-[#92400e] font-medium shadow-xs'
              : 'bg-[#f9fbfc] border-[#e8eaec] text-[#5d5f60] hover:bg-[#f4f6f8]'
          }`}
        >
          <span className="truncate">Road Blockages</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#92400e] shrink-0 ml-1.5"></span>
        </button>

        {/* Overflow */}
        <button
          onClick={() => toggle('showWaste')}
          className={`px-3 py-2 rounded-lg text-left border transition-all flex items-center justify-between cursor-pointer ${
            filters.showWaste
              ? 'bg-[#e8f3f6] border-[#99d1df] text-[#1b6c80] font-medium shadow-xs'
              : 'bg-[#f9fbfc] border-[#e8eaec] text-[#5d5f60] hover:bg-[#f4f6f8]'
          }`}
        >
          <span className="truncate">Overflow</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#1b6c80] shrink-0 ml-1.5"></span>
        </button>

        {/* Cleared Areas */}
        <button
          onClick={() => toggle('showResolved')}
          className={`px-3 py-2 rounded-lg text-left border transition-all flex items-center justify-between cursor-pointer ${
            filters.showResolved
              ? 'bg-[#dcfae5] border-[#86efac] text-[#04250e] font-medium shadow-xs'
              : 'bg-[#f9fbfc] border-[#e8eaec] text-[#5d5f60] hover:bg-[#f4f6f8]'
          }`}
        >
          <span className="truncate">Cleared Areas</span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#1e7b4f] shrink-0 ml-1.5"></span>
        </button>
      </div>

      {/* 3D Volumetric Water Depth switch */}
      <div className="pt-1 flex items-center justify-between text-xs text-[#5d5f60]">
        <label htmlFor="extrusion-depth" className="flex items-center space-x-1.5 cursor-pointer hover:text-[#131416] transition-colors">
          <Box className="w-3.5 h-3.5 text-[#1b6c80]" />
          <span>Show 3D Water Depth</span>
        </label>
        <input
          id="extrusion-depth"
          type="checkbox"
          checked={filters.showExtrusion3D}
          onChange={() => toggle('showExtrusion3D')}
          className="cursor-pointer accent-[#1b6c80] w-4 h-4 rounded"
        />
      </div>
    </div>
  );
};
