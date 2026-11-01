import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-24 right-4 z-10 glass-panel rounded-lg p-2.5 max-w-[210px] text-xs font-mono select-none">
      <div
        className="flex items-center justify-between cursor-pointer pb-1 mb-1.5 border-b border-border-subtle"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="font-semibold text-gray-200 flex items-center space-x-1.5 font-sans">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Operational Legend</span>
        </span>
        {collapsed ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
      </div>

      {!collapsed && (
        <div className="space-y-1.5 text-[11px] text-gray-300">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-sm bg-[#EF4444] border border-[#F87171]/80 inline-block opacity-75"></span>
            <span>Critical Hazard</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-sm bg-[#F59E0B] border border-[#FBBF24]/80 inline-block opacity-75"></span>
            <span>Moderate Hazard</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-sm bg-[#10B981] border border-[#34D399]/80 inline-block opacity-60"></span>
            <span>Resolved Zone</span>
          </div>
          <div className="flex items-center space-x-2 pt-1 border-t border-border-subtle/50">
            <span className="w-4 border-b-2 border-dashed border-[#EF4444] inline-block"></span>
            <span>Standard Route</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 border-b-2 border-solid border-[#10B981] inline-block"></span>
            <span>Safe Corridor</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] border border-white inline-block"></span>
            <span>Municipal Truck</span>
          </div>
        </div>
      )}
    </div>
  );
};

