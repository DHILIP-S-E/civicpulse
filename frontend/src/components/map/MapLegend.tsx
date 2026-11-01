import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-20 right-4 z-10 bg-surface border border-terminal-border p-2.5 max-w-[200px] text-xs select-none">
      <div
        className="flex items-center justify-between cursor-pointer pb-1 mb-1.5 border-b border-terminal-border"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="font-medium text-white flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-accent" />
          <span>Operational Legend</span>
        </span>
        {collapsed ? <ChevronUp className="w-3.5 h-3.5 text-terminal-muted" /> : <ChevronDown className="w-3.5 h-3.5 text-terminal-muted" />}
      </div>

      {!collapsed && (
        <div className="space-y-1.5 text-[11px] text-terminal-muted">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-hazard-critical inline-block"></span>
            <span className="text-white">Critical Inundation</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-hazard-moderate inline-block"></span>
            <span className="text-white">Moderate Hazard</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 bg-hazard-resolved inline-block"></span>
            <span className="text-white">Resolved Zone</span>
          </div>
          <div className="flex items-center space-x-2 pt-1 border-t border-terminal-border">
            <span className="w-4 border-b-2 border-dashed border-hazard-critical inline-block"></span>
            <span>Standard Route</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 border-b-2 border-solid border-hazard-resolved inline-block"></span>
            <span>Safe Corridor</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-accent inline-block"></span>
            <span>Municipal Unit</span>
          </div>
        </div>
      )}
    </div>
  );
};
