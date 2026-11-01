import React from 'react';
import { RouteCompareResponse } from '../../types';
import { AlertTriangle, CheckCircle2, ShieldCheck, Clock, MapPin } from 'lucide-react';

interface RouteComparisonCardProps {
  comparison: RouteCompareResponse;
}

export const RouteComparisonCard: React.FC<RouteComparisonCardProps> = ({ comparison }) => {
  const { standard_route, hazard_avoiding_route, time_delta_minutes, distance_delta_km } = comparison;

  const hasIntersections = standard_route.hazard_intersections.length > 0;
  const maxDepth = standard_route.hazard_intersections.reduce((max, cur) => {
    return Math.max(max, cur.water_depth_cm || 0);
  }, 0);

  return (
    <div className="space-y-3">
      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
        <span>Route Safety Assessment</span>
        <span className="text-[11px] font-normal text-slate-400">Live Traffic & Flood Model</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {/* Card 1: Standard Route */}
        <div className={`p-3.5 rounded-xl border transition-all ${
          hasIntersections
            ? 'bg-red-950/20 border-red-500/40 text-red-100 shadow-sm'
            : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              Standard Route
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center space-x-1">
              <AlertTriangle className="w-3 h-3 mr-1" />
              NOT RECOMMENDED
            </span>
          </div>

          <div className="text-sm font-semibold text-white mb-2 flex items-center space-x-1.5">
            <span className="text-red-400">⚠️</span>
            <span>
              {hasIntersections
                ? `Crosses ${standard_route.hazard_intersections.length} flood zone${standard_route.hazard_intersections.length > 1 ? 's' : ''}${maxDepth > 0 ? ` (${maxDepth}cm depth)` : ''}`
                : 'Direct path is hazard-free'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 py-1.5 border-t border-red-500/20 tabular-nums">
            <span>Distance: <strong className="text-white">{standard_route.distance_km} km</strong></span>
            <span>Est. Time: <strong className="text-white">{standard_route.duration_minutes} min</strong></span>
          </div>

          {hasIntersections && (
            <div className="mt-2 pt-2 border-t border-red-500/20 space-y-1">
              <span className="text-[10px] font-semibold uppercase text-red-400 block">Flooded Roads Encountered:</span>
              {standard_route.hazard_intersections.map(h => (
                <div key={h.hazard_id} className="text-[11px] text-red-200 flex items-center justify-between">
                  <span className="truncate pr-1">• {h.location_name}</span>
                  <span className="font-semibold shrink-0 text-red-400">{h.water_depth_cm ? `${h.water_depth_cm}cm` : h.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 2: Safe Corridor */}
        {hazard_avoiding_route ? (
          <div className="p-3.5 rounded-xl border bg-emerald-950/25 border-emerald-500/50 text-emerald-100 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 inline" />
                Safe Corridor
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                RECOMMENDED ✓
              </span>
            </div>

            <div className="text-sm font-semibold text-white mb-2 flex items-center space-x-1.5">
              <span className="text-emerald-400">✅</span>
              <span>Avoids all known flood zones</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 py-1.5 border-t border-emerald-500/20 tabular-nums">
              <span>Distance: <strong className="text-white">{hazard_avoiding_route.distance_km} km</strong></span>
              <span>Est. Time: <strong className="text-white">{hazard_avoiding_route.duration_minutes} min</strong></span>
            </div>

            {(distance_delta_km !== undefined || time_delta_minutes !== undefined) && (
              <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px] text-emerald-300 font-medium">
                <span>Detour tradeoff:</span>
                <span className="tabular-nums">
                  {distance_delta_km ? `+${distance_delta_km} km` : ''}
                  {time_delta_minutes ? ` · +${time_delta_minutes} min` : ''}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 rounded-lg border border-[rgba(148,163,184,0.15)] bg-[#0B0F19] text-xs text-slate-400 text-center">
            Standard route is currently the safest option.
          </div>
        )}
      </div>
    </div>
  );
};
