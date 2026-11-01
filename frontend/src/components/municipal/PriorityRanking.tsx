import React from 'react';
import { HazardPriorityScore } from '../../types';
import {
  AlertTriangle,
  Truck,
  Droplets,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight
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
  const getUrgencyBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'MODERATE':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  const getUrgencyBar = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-amber-500';
    if (score >= 40) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const translateFactor = (name: string, explanation: string) => {
    if (name.toLowerCase().includes('depth')) return explanation || 'Water Depth Exceeds Threshold';
    if (name.toLowerCase().includes('traffic')) return explanation || 'Arterial Corridor Traversed';
    if (name.toLowerCase().includes('facility')) return explanation || 'Near Hospitals or Schools';
    if (name.toLowerCase().includes('freshness')) return explanation || 'Recently Verified Telemetry';
    return explanation || name;
  };

  return (
    <div className="bg-[#111827] rounded-xl p-4 border border-[rgba(148,163,184,0.15)] space-y-4 shadow-md">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Response Priority Queue</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-400 bg-[#0B0F19] px-2 py-0.5 rounded border border-[rgba(148,163,184,0.15)]">
            {priorities.filter(p => p.severity !== 'LOW').length} Urgent
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Automated triage ranking based on water depth, bus corridor exposure, and facility access
        </p>
      </div>

      {/* Triage Cards */}
      <div className="space-y-2 max-h-[460px] overflow-y-auto pr-0.5">
        {priorities.map((item) => {
          const isSelected = selectedHazardId === item.hazard_id;
          const isResolved = item.severity === 'LOW';

          return (
            <div
              key={item.hazard_id}
              onClick={() => onSelectHazardById(item.hazard_id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600/10 border-blue-500/50 shadow-sm'
                  : 'bg-[#0B0F19] hover:bg-slate-800/40 border-[rgba(148,163,184,0.12)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-slate-400 tabular-nums">
                    #{item.priority_rank}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 text-[9px] font-bold rounded uppercase tracking-wider border ${getUrgencyBadge(
                      item.severity
                    )}`}
                  >
                    {isResolved ? 'Resolved' : item.severity}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    Score: {item.priority_score}
                  </span>
                </div>
              </div>

              {/* Urgency Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${getUrgencyBar(item.priority_score)}`}
                  style={{ width: `${Math.min(100, item.priority_score)}%` }}
                ></div>
              </div>

              {/* Location Name */}
              <h4 className="text-xs font-semibold text-white truncate">
                {item.location_name}
              </h4>

              {/* Action Recommendation */}
              <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-1">
                {item.recommended_action}
              </p>

              {/* Contributing Factors */}
              {item.contributing_factors && item.contributing_factors.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[rgba(148,163,184,0.08)] flex flex-wrap gap-1">
                  {item.contributing_factors.slice(0, 2).map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded border border-[rgba(148,163,184,0.1)] truncate max-w-[140px]"
                    >
                      {translateFactor(f.name, f.explanation)}
                    </span>
                  ))}
                </div>
              )}

              {/* Dispatch Action */}
              {!isResolved && (
                <div className="mt-2.5 pt-2 border-t border-[rgba(148,163,184,0.1)] flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDispatch(item.hazard_id);
                    }}
                    className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium rounded transition-colors flex items-center space-x-1 shadow-sm cursor-pointer"
                  >
                    <Truck className="w-3 h-3" />
                    <span>Send Crew</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
