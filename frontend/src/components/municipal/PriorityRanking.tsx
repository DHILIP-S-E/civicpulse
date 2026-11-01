import React, { useState } from 'react';
import { HazardPriorityScore } from '../../types';
import {
  ChevronDown,
  ChevronUp,
  Truck
} from 'lucide-react';

interface PriorityRankingProps {
  priorities: HazardPriorityScore[];
  onSelectHazardById: (hazardId: string) => void;
  onDispatch: (hazardId: string) => void;
  selectedHazardId?: string;
}

export const PriorityRanking: React.FC<PriorityRankingProps> = ({
  priorities,
  onSelectHazardById,
  onDispatch,
  selectedHazardId,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-terminal-border">
        <span className="text-xs font-semibold text-white">Prioritized Municipal Queue</span>
        <span className="text-[11px] font-mono text-terminal-muted tabular-nums">
          {priorities.length} Active Targets
        </span>
      </div>

      <div className="text-[11px] text-terminal-muted leading-tight">
        Multi-criteria model: 0.35 Depth + 0.25 Arterial Exposure + 0.20 Vulnerability + 0.20 Recency
      </div>

      {/* Structured Operational Table / Queue */}
      <div className="space-y-1.5 max-h-[440px] overflow-y-auto pr-1">
        {priorities.map((item) => {
          const isSelected = selectedHazardId === item.hazard_id;
          const isExpanded = expandedId === item.hazard_id;

          return (
            <div
              key={item.hazard_id}
              onClick={() => onSelectHazardById(item.hazard_id)}
              className={`p-2.5 border transition-colors cursor-pointer text-xs ${
                isSelected
                  ? 'bg-raised border-terminal-border border-l-2 border-l-accent'
                  : 'bg-surface hover:bg-raised border-terminal-border'
              }`}
            >
              {/* Top Row: Rank, ID, Score */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[11px] text-terminal-muted">
                    #{item.priority_rank}
                  </span>
                  <span className="font-mono text-xs font-semibold text-white">
                    {item.hazard_id}
                  </span>
                </div>

                <div className="flex items-center space-x-2 tabular-nums">
                  <span className="font-mono font-medium text-xs text-white">
                    Score: {item.priority_score.toFixed(2)}
                  </span>
                  <button
                    onClick={(e) => toggleExpand(item.hazard_id, e)}
                    className="p-0.5 text-terminal-muted hover:text-white"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Location Name & Severity */}
              <div className="flex items-start justify-between text-xs mb-1.5">
                <span className="font-medium text-white truncate pr-2">
                  {item.location_name}
                </span>
                <span className={`px-1.5 py-0.2 text-[10px] font-mono border rounded-sm shrink-0 ${
                  item.severity === 'CRITICAL'
                    ? 'border-hazard-critical text-hazard-critical bg-[#261619]'
                    : 'border-hazard-moderate text-hazard-moderate bg-[#262016]'
                }`}>
                  {item.severity}
                </span>
              </div>

              {/* Action Note */}
              <div className="text-[11px] text-terminal-muted bg-ground p-1.5 border border-terminal-border mb-2">
                {item.recommended_action}
              </div>

              {/* Contributing Factors Accordion */}
              {isExpanded && (
                <div className="space-y-1 pt-1.5 border-t border-terminal-border text-[11px] font-mono">
                  <span className="text-[10px] uppercase text-terminal-muted font-sans block mb-1">
                    Scoring Breakdown:
                  </span>
                  {item.contributing_factors.map((f) => (
                    <div key={f.name} className="flex items-center justify-between py-0.5 border-b border-rule">
                      <span className="text-terminal-muted font-sans">{f.name}</span>
                      <span className="text-white font-medium">+{f.weighted_score.toFixed(2)} pts</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Dispatch Action Button */}
              <div className="pt-1 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDispatch(item.hazard_id);
                  }}
                  className="px-2.5 py-1 bg-surface hover:bg-raised text-white border border-terminal-border text-xs transition-colors flex items-center space-x-1.5"
                >
                  <Truck className="w-3 h-3 text-accent" />
                  <span>Dispatch Unit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
