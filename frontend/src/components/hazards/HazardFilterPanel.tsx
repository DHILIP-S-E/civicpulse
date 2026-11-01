import React from 'react';
import { FilterState } from '../../types';
import { Filter, Droplets, Trash2, AlertOctagon, CheckCircle2, Box } from 'lucide-react';

interface HazardFilterPanelProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const HazardFilterPanel: React.FC<HazardFilterPanelProps> = ({ filters, setFilters }) => {
  const toggle = (key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-2 pt-2 border-t border-border-subtle">
      <div className="flex items-center space-x-1.5 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
        <Filter className="w-3.5 h-3.5 text-blue-400" />
        <span>Spatial Hazard Layers</span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-xs">
        {/* Floods */}
        <button
          onClick={() => toggle('showFloods')}
          className={`flex items-center space-x-2 px-2.5 py-1.5 rounded border transition-colors ${
            filters.showFloods
              ? 'bg-blue-950/50 border-blue-600/50 text-blue-200'
              : 'bg-slate-900/40 border-border-subtle text-gray-500'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="truncate">Floods & Inundation</span>
        </button>

        {/* Waste Overflow */}
        <button
          onClick={() => toggle('showWaste')}
          className={`flex items-center space-x-2 px-2.5 py-1.5 rounded border transition-colors ${
            filters.showWaste
              ? 'bg-amber-950/50 border-amber-600/50 text-amber-200'
              : 'bg-slate-900/40 border-border-subtle text-gray-500'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">Sanitation Overflow</span>
        </button>

        {/* Debris / Road Damage */}
        <button
          onClick={() => toggle('showDebris')}
          className={`flex items-center space-x-2 px-2.5 py-1.5 rounded border transition-colors ${
            filters.showDebris
              ? 'bg-purple-950/50 border-purple-600/50 text-purple-200'
              : 'bg-slate-900/40 border-border-subtle text-gray-500'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate">Debris & Road Obstruction</span>
        </button>

        {/* Resolved */}
        <button
          onClick={() => toggle('showResolved')}
          className={`flex items-center space-x-2 px-2.5 py-1.5 rounded border transition-colors ${
            filters.showResolved
              ? 'bg-emerald-950/50 border-emerald-600/50 text-emerald-200'
              : 'bg-slate-900/40 border-border-subtle text-gray-500'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">Resolved Incidents</span>
        </button>
      </div>

      {/* 3D Extrusion Toggle */}
      <div className="pt-1 flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-900/70 border border-border-subtle text-xs">
        <span className="flex items-center space-x-1.5 text-gray-300">
          <Box className="w-3.5 h-3.5 text-cyan-400" />
          <span>3D Water Depth Extrusion</span>
        </span>
        <input
          type="checkbox"
          checked={filters.showExtrusion3D}
          onChange={() => toggle('showExtrusion3D')}
          className="rounded border-gray-700 text-blue-600 bg-slate-800 cursor-pointer w-4 h-4"
        />
      </div>
    </div>
  );
};
