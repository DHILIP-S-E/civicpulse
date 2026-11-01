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
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30';
      case 'HIGH':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]/30';
      case 'MODERATE':
        return 'bg-[#F0F9FF] text-[#0284C7] border-[#0284C7]/30';
      default:
        return 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/30';
    }
  };

  const getUrgencyBar = (score: number) => {
    if (score >= 80) return 'bg-[#DC2626]';
    if (score >= 60) return 'bg-[#D97706]';
    if (score >= 40) return 'bg-[#1677FF]';
    return 'bg-[#16A34A]';
  };

  const translateFactor = (name: string, explanation: string) => {
    if (name.toLowerCase().includes('depth')) return explanation || 'Water Depth Exceeds Threshold';
    if (name.toLowerCase().includes('traffic')) return explanation || 'Arterial Corridor Traversed';
    if (name.toLowerCase().includes('facility')) return explanation || 'Near Hospitals or Schools';
    if (name.toLowerCase().includes('freshness')) return explanation || 'Recently Verified Telemetry';
    return explanation || name;
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] space-y-3.5 shadow-xs">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#172033] flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
            <span>Response Priority Queue</span>
          </h2>
          <span className="text-[10px] font-mono text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
            {priorities.filter(p => p.severity !== 'LOW').length} Urgent
          </span>
        </div>
        <p className="text-xs text-[#64748B] mt-0.5">
          Automated triage ranking based on water depth, bus corridor exposure, and facility access
        </p>
      </div>

      {/* Triage Cards */}
      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-0.5">
        {priorities.map((item) => {
          const isSelected = selectedHazardId === item.hazard_id;
          const isResolved = item.severity === 'LOW';

          return (
            <div
              key={item.hazard_id}
              onClick={() => onSelectHazardById(item.hazard_id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#EAF3FF] border-[#1677FF] shadow-xs'
                  : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold text-[#64748B] tabular-nums">
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
                  <span className="text-[11px] font-mono font-semibold text-[#172033] tabular-nums">
                    Score: {item.priority_score}
                  </span>
                </div>
              </div>

              {/* Urgency Progress Bar */}
              <div className="w-full h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full ${getUrgencyBar(item.priority_score)}`}
                  style={{ width: `${Math.min(100, item.priority_score)}%` }}
                ></div>
              </div>

              {/* Location Name */}
              <h4 className="text-xs font-semibold text-[#172033] truncate">
                {item.location_name}
              </h4>

              {/* Action Recommendation */}
              <p className="text-[11px] text-[#64748B] mt-1 leading-snug line-clamp-1">
                {item.recommended_action}
              </p>

              {/* Contributing Factors */}
              {item.contributing_factors && item.contributing_factors.length > 0 && (
                <div className="mt-2 pt-2 border-t border-[#E2E8F0] flex flex-wrap gap-1">
                  {item.contributing_factors.slice(0, 2).map((f, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-[#64748B] bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0] truncate max-w-[140px]"
                    >
                      {translateFactor(f.name, f.explanation)}
                    </span>
                  ))}
                </div>
              )}

              {/* Dispatch Action */}
              {!isResolved && (
                <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDispatch(item.hazard_id);
                    }}
                    className="px-2.5 py-1 bg-[#1677FF] hover:bg-[#0958D9] text-white text-[11px] font-semibold rounded-md transition-colors flex items-center space-x-1 shadow-xs cursor-pointer"
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
