import React from 'react';
import { RouteCompareResponse } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Navigation,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface RouteComparisonCardProps {
  comparison: RouteCompareResponse;
}

export const RouteComparisonCard: React.FC<RouteComparisonCardProps> = ({
  comparison,
}) => {
  const {
    standard_route,
    hazard_avoiding_route,
    time_delta_minutes,
    distance_delta_km,
    avoidance_successful,
  } = comparison;

  return (
    <div className="space-y-3">
      {/* 1. Direct Arterial Route (With Hazard Warning) */}
      <div className="bg-[#111827] rounded-xl p-3.5 border border-red-500/30 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Direct Arterial Route
            </span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30">
            High Risk
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-500/20 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="text-[11px] text-red-300 leading-snug">
            {standard_route.warnings[0] || 'Passes through known low-lying flood inundation points.'}
          </div>
        </div>

        {/* Mapped Flooded Roads Traversed */}
        {standard_route.hazard_intersections.length > 0 && (
          <div className="text-[11px] space-y-1 pt-1">
            <div className="font-semibold text-slate-400">Flooded Locations on Route:</div>
            <div className="space-y-0.5">
              {standard_route.hazard_intersections.map((h) => (
                <div
                  key={h.hazard_id}
                  className="flex items-center justify-between text-slate-300 bg-[#0B0F19] px-2 py-1 rounded border border-[rgba(148,163,184,0.1)]"
                >
                  <span className="truncate pr-1">- {h.location_name}</span>
                  <span className="text-red-400 font-bold tabular-nums shrink-0">
                    {h.water_depth_cm} cm
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-[rgba(148,163,184,0.1)]">
          <div className="flex items-center space-x-1">
            <Navigation className="w-3.5 h-3.5 text-slate-500" />
            <span className="tabular-nums font-medium text-white">{standard_route.distance_km} km</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="tabular-nums font-medium text-white">{standard_route.duration_minutes} min</span>
          </div>
        </div>
      </div>

      {/* 2. Safe Avoidance Corridor */}
      {hazard_avoiding_route && (
        <div className="bg-[#111827] rounded-xl p-3.5 border border-emerald-500/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Safe Corridor (Recommended)
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3" />
              <span>{avoidance_successful ? 'Hazard Free' : 'Minimized'}</span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-emerald-300 leading-snug">
              Bypasses Sellur underpass and flooded arterial points via elevated ring corridors.
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-[rgba(148,163,184,0.1)]">
            <div className="flex items-center space-x-1">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span className="tabular-nums font-medium text-white">{hazard_avoiding_route.distance_km} km</span>
              {(distance_delta_km ?? 0) > 0 && (
                <span className="text-[10px] text-slate-500">(+{distance_delta_km} km)</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="tabular-nums font-medium text-white">{hazard_avoiding_route.duration_minutes} min</span>
              {(time_delta_minutes ?? 0) > 0 && (
                <span className="text-[10px] text-slate-500">(+{time_delta_minutes} min)</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
