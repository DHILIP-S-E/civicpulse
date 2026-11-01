import React, { useState } from 'react';
import { HazardPriorityScore } from '../../types';
import {
  ListOrdered,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Truck,
  CheckCircle,
  HelpCircle,
  Info
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
      <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-200">
          <ListOrdered className="w-4 h-4 text-amber-400" />
          <span>Municipal Response Prioritization</span>
        </div>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
          Multi-Factor Scoring
        </span>
      </div>

      <p className="text-[11px] text-gray-400 leading-tight">
        Transparent weighted ranking: Severity (35%), Road Impact (25%), Public Facilities (20%), Recency (10%), Confidence (10%).
      </p>

      {/* Ranked List */}
      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
        {priorities.map((item) => {
          const isSelected = selectedHazardId === item.hazard_id;
          const isExpanded = expandedId === item.hazard_id;

          return (
            <div
              key={item.hazard_id}
              onClick={() => onSelectHazardById(item.hazard_id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-950/40 border-blue-500/70 shadow-md'
                  : 'bg-slate-900/70 hover:bg-slate-800/70 border-border-subtle'
              }`}
            >
              {/* Row Header */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 border border-border-subtle font-mono text-[10px] font-bold text-gray-300 flex items-center justify-center">
                    #{item.priority_rank}
                  </span>
                  <span className="font-mono text-xs font-semibold text-blue-400">
                    {item.hazard_id}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs text-amber-400">
                    Score: {item.priority_score}
                  </span>
                  <button
                    onClick={(e) => toggleExpand(item.hazard_id, e)}
                    className="p-0.5 text-gray-400 hover:text-white"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Location Name & Severity */}
              <div className="flex items-start justify-between text-xs mb-2">
                <span className="font-semibold text-white leading-tight">
                  {item.location_name}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono shrink-0 ml-2 border ${
                  item.severity === 'CRITICAL'
                    ? 'bg-red-950/80 text-red-300 border-red-800/40'
                    : 'bg-amber-950/80 text-amber-300 border-amber-800/40'
                }`}>
                  {item.severity}
                </span>
              </div>

              {/* Recommended Action */}
              <div className="text-[11px] text-gray-300 bg-slate-950/60 p-2 rounded border border-border-subtle/50 mb-2">
                <span className="text-gray-400 font-semibold block text-[10px] uppercase">Recommended Action:</span>
                <p className="leading-snug">{item.recommended_action}</p>
              </div>

              {/* Expanded Contributing Factors Breakdown */}
              {isExpanded && (
                <div className="space-y-1.5 pt-2 border-t border-border-subtle/60 text-[11px] font-mono">
                  <span className="text-[10px] uppercase text-gray-400 font-sans block mb-1">
                    Factor Contribution Breakdown:
                  </span>
                  {item.contributing_factors.map((f) => (
                    <div key={f.name} className="p-1.5 rounded bg-black/40 border border-border-subtle/40 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 font-sans">{f.name} ({(f.weight * 100).toFixed(0)}%)</span>
                        <span className="text-cyan-400 font-bold">+{f.weighted_score} pts</span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-sans leading-tight">{f.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Dispatch Button */}
              <div className="pt-1 flex justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDispatch(item.hazard_id);
                  }}
                  className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow"
                >
                  <Truck className="w-3 h-3" />
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

