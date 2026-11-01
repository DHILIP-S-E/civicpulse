import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';

export const MapLegend: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="absolute bottom-6 right-4 z-10 bg-white/95 backdrop-blur-md border border-[#E2E8F0] p-3 rounded-xl shadow-lg max-w-[210px] text-xs select-none">
      <div
        className="flex items-center justify-between cursor-pointer pb-1.5 mb-1.5 border-b border-[#E2E8F0]"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="font-bold text-[#172033] flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-[#1677FF]" />
          <span>Operational Legend</span>
        </span>
        {collapsed ? (
          <ChevronUp className="w-3.5 h-3.5 text-[#64748B]" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
        )}
      </div>

      {!collapsed && (
        <div className="space-y-1.5 text-[11px] text-[#64748B]">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#DC2626] inline-block"></span>
            <span className="text-[#172033] font-medium">Critical Inundation</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#D97706] inline-block"></span>
            <span className="text-[#172033] font-medium">Moderate Hazard</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#16A34A] inline-block"></span>
            <span className="text-[#172033] font-medium">Resolved Corridor</span>
          </div>
          <div className="flex items-center space-x-2 pt-1 border-t border-[#E2E8F0]">
            <span className="w-4 border-b-2 border-dashed border-[#DC2626] inline-block"></span>
            <span>Standard Route</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 border-b-2 border-solid border-[#16A34A] inline-block"></span>
            <span>Safe Corridor</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#1677FF] inline-block"></span>
            <span>Municipal Unit</span>
          </div>
        </div>
      )}
    </div>
  );
};
