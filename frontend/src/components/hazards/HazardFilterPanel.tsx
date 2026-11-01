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
    <div className="space-y-2 pt-3 border-t border-terminal-border">
      <div className="flex items-center space-x-1.5 text-[11px] font-medium uppercase tracking-wider text-terminal-muted">
        <Layers className="w-3.5 h-3.5" />
        <span>Spatial Hazard Layers</span>
      </div>

      <div className="grid grid-cols-2 gap-1 text-xs">
        {/* Floods */}
        <button
          onClick={() => toggle('showFloods')}
          className={`px-2 py-1.5 text-left border transition-colors flex items-center justify-between ${
            filters.showFloods
              ? 'bg-raised border-terminal-border text-white border-l-2 border-l-hazard-critical'
              : 'bg-surface border-terminal-border text-terminal-muted hover:text-white'
          }`}
        >
          <span className="truncate">Inundation Zones</span>
          <span className="w-1.5 h-1.5 rounded-full bg-hazard-critical shrink-0 ml-1"></span>
        </button>

        {/* Sanitation Overflow */}
        <button
          onClick={() => toggle('showWaste')}
          className={`px-2 py-1.5 text-left border transition-colors flex items-center justify-between ${
            filters.showWaste
              ? 'bg-raised border-terminal-border text-white border-l-2 border-l-hazard-moderate'
              : 'bg-surface border-terminal-border text-terminal-muted hover:text-white'
          }`}
        >
          <span className="truncate">Sanitation Overflow</span>
          <span className="w-1.5 h-1.5 rounded-full bg-hazard-moderate shrink-0 ml-1"></span>
        </button>

        {/* Debris / Obstruction */}
        <button
          onClick={() => toggle('showDebris')}
          className={`px-2 py-1.5 text-left border transition-colors flex items-center justify-between ${
            filters.showDebris
              ? 'bg-raised border-terminal-border text-white border-l-2 border-l-accent'
              : 'bg-surface border-terminal-border text-terminal-muted hover:text-white'
          }`}
        >
          <span className="truncate">Road Obstructions</span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 ml-1"></span>
        </button>

        {/* Resolved */}
        <button
          onClick={() => toggle('showResolved')}
          className={`px-2 py-1.5 text-left border transition-colors flex items-center justify-between ${
            filters.showResolved
              ? 'bg-raised border-terminal-border text-white border-l-2 border-l-hazard-resolved'
              : 'bg-surface border-terminal-border text-terminal-muted hover:text-white'
          }`}
        >
          <span className="truncate">Resolved Corridors</span>
          <span className="w-1.5 h-1.5 rounded-full bg-hazard-resolved shrink-0 ml-1"></span>
        </button>
      </div>

      {/* 3D Extrusion Depth Toggle */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-surface border border-terminal-border text-xs">
        <label htmlFor="extrusion-depth" className="flex items-center space-x-1.5 text-terminal-muted cursor-pointer">
          <Box className="w-3.5 h-3.5 text-accent" />
          <span>Volumetric 3D Water Depth</span>
        </label>
        <input
          id="extrusion-depth"
          type="checkbox"
          checked={filters.showExtrusion3D}
          onChange={() => toggle('showExtrusion3D')}
          className="cursor-pointer accent-accent w-4 h-4"
        />
      </div>
    </div>
  );
};
