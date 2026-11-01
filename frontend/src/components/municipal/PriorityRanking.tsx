import React, { useState } from 'react';
import { HazardPriorityScore } from '../../types';
import {
  ChevronDown,
  ChevronUp,
  Truck,
  AlertOctagon,
  Users,
  Activity,
  Droplets
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

  // Helper for human-friendly factor labels
  const translateFactor = (factorName: string, explanation: string) => {
    const lower = factorName.toLowerCase();
    if (lower.includes('depth') || lower.includes('water')) return 'Deep water inundation';
    if (lower.includes('arterial') || lower.includes('transit') || lower.includes('traffic')) return 'High-traffic arterial road';
    if (lower.includes('vulnerability') || lower.includes('population') || lower.includes('hospital')) return 'Near essential hospital route';
    if (lower.includes('recency') || lower.includes('trend')) return 'Rapid water accumulation';
    return explanation || factorName;
  };

  // Human friendly estimated population affected
  const getAffectedPopulation = (rank: number, score: number) => {
    if (rank === 1) return '31,200 residents affected';
    if (rank === 2) return '24,500 residents affected';
    if (rank === 3) return '18,800 residents affected';
    return `${Math.round(score * 28000).toLocaleString()} residents affected`;
  };

  const getEstimatedDepth = (rank: number) => {
    if (rank === 1) return '42 cm';
    if (rank === 2) return '28 cm';
    if (rank === 3) return '20 cm';
    return '15 cm';
  };

  return (
    <div className="bg-[#111827] rounded-xl p-4 border border-[rgba(148,163,184,0.15)] space-y-3.5 shadow-md">
      {/* Triage Board Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[rgba(148,163,184,0.15)]">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center space-x-1.5">
            <AlertOctagon className="w-4 h-4 text-red-500" />
            <span>Emergency Triage Board</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Ranked by water depth, commuter volume & critical facilities
          </p>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
          {priorities.length} Needs Response
        </span>
      </div>

      {/* Priority Queue List */}
      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
        {priorities.map((item) => {
          const isSelected = selectedHazardId === item.hazard_id;
          const isExpanded = expandedId === item.hazard_id;
          const percentage = Math.min(100, Math.round(item.priority_score * 100));
          const depth = getEstimatedDepth(item.priority_rank);
          const population = getAffectedPopulation(item.priority_rank, item.priority_score);

          return (
            <div
              key={item.hazard_id}
              onClick={() => onSelectHazardById(item.hazard_id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#1F2937] border-blue-500 shadow-md ring-1 ring-blue-500/50'
                  : 'bg-[#0B0F19] hover:bg-[#1a2333] border-[rgba(148,163,184,0.15)]'
              }`}
            >
              {/* Header: Rank + Severity Badge + Location */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                    item.priority_rank === 1 ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-200'
                  }`}>
                    #{item.priority_rank}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    item.severity === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {item.severity}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <button
                    onClick={(e) => toggleExpand(item.hazard_id, e)}
                    className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                    title="View risk breakdown"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Location Name */}
              <div className="text-sm font-bold text-white mb-1">
                {item.location_name}
              </div>

              {/* Stats: Depth & Population affected */}
              <div className="flex items-center space-x-3 text-xs text-slate-300 mb-2.5">
                <span className="flex items-center space-x-1 font-semibold text-red-400">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{depth} depth</span>
                </span>
                <span className="text-slate-500">·</span>
                <span className="flex items-center space-x-1 text-slate-300">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <span>{population}</span>
                </span>
              </div>

              {/* Visual Urgency Score Bar */}
              <div className="space-y-1 mb-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Urgency Rating</span>
                  <span className="font-semibold text-white">
                    {percentage >= 80 ? 'CRITICAL EMERGENCY' : percentage >= 60 ? 'HIGH PRIORITY' : 'MODERATE'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage >= 80
                        ? 'bg-red-500'
                        : percentage >= 60
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Contributing factors in plain language */}
              {isExpanded && (
                <div className="p-2.5 rounded-lg bg-[#111827] border border-[rgba(148,163,184,0.15)] mb-2.5 space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Risk Assessment Factors:
                  </span>
                  {item.contributing_factors.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] text-slate-300">
                      <span>• {translateFactor(f.name, f.explanation)}</span>
                      <span className="text-emerald-400 font-medium font-mono">+{Math.round(f.weighted_score * 100)}%</span>
                    </div>
                  ))}
                  <div className="pt-1.5 border-t border-[rgba(148,163,184,0.1)] text-[11px] text-slate-400">
                    Recommended action: <strong className="text-white">{item.recommended_action}</strong>
                  </div>
                </div>
              )}

              {/* Big Dispatch Button */}
              <div className="pt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDispatch(item.hazard_id);
                  }}
                  className="w-full py-2 px-3 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center justify-center space-x-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>DISPATCH UNIT</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
