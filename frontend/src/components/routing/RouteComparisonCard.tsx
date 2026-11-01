import React from 'react';
import { RouteCompareResponse } from '../../types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Navigation,
  ShieldCheck
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
      <div className="bg-[#fff9f9] rounded-xl p-3.5 border border-[#fca5a5] shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#c4242a]"></span>
            <span className="text-xs font-semibold text-[#131416] uppercase tracking-wider">
              Direct Arterial Route
            </span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#ffedea] text-[#831c1e] border border-[#f87171]/40">
            High Risk
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white border border-[#fca5a5]/40 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-[#c4242a] shrink-0 mt-0.5" />
          <div className="text-[11px] text-[#831c1e] leading-snug">
            {standard_route.warnings[0] || 'Passes through known low-lying flood inundation points.'}
          </div>
        </div>

        {/* Mapped Flooded Roads Traversed */}
        {standard_route.hazard_intersections.length > 0 && (
          <div className="text-[11px] space-y-1 pt-1">
            <div className="font-semibold text-[#5d5f60]">Flooded Locations on Route:</div>
            <div className="space-y-0.5">
              {standard_route.hazard_intersections.map((h) => (
                <div
                  key={h.hazard_id}
                  className="flex items-center justify-between text-[#131416] bg-white px-2 py-1 rounded border border-[#fecaca]"
                >
                  <span className="truncate pr-1">- {h.location_name}</span>
                  <span className="text-[#c4242a] font-bold tabular-nums shrink-0">
                    {h.water_depth_cm} cm
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-[#5d5f60] pt-1 border-t border-[#fca5a5]/30">
          <div className="flex items-center space-x-1">
            <Navigation className="w-3.5 h-3.5 text-[#5d5f60]" />
            <span className="tabular-nums font-semibold text-[#131416]">{standard_route.distance_km} km</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-[#5d5f60]" />
            <span className="tabular-nums font-semibold text-[#131416]">{standard_route.duration_minutes} min</span>
          </div>
        </div>
      </div>

      {/* 2. Safe Avoidance Corridor */}
      {hazard_avoiding_route && (
        <div className="bg-[#f6fcf8] rounded-xl p-3.5 border border-[#86efac] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1e7b4f]"></span>
              <span className="text-xs font-semibold text-[#131416] uppercase tracking-wider">
                Safe Corridor (Recommended)
              </span>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#dcfae5] text-[#04250e] border border-[#86efac] flex items-center space-x-1">
              <ShieldCheck className="w-3 h-3 text-[#1e7b4f]" />
              <span>{avoidance_successful ? 'Hazard Free' : 'Minimized'}</span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-white border border-[#86efac]/40 flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#1e7b4f] shrink-0 mt-0.5" />
            <div className="text-[11px] text-[#04250e] leading-snug">
              Bypasses Sellur underpass and flooded arterial points via elevated ring corridors.
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#5d5f60] pt-1 border-t border-[#86efac]/30">
            <div className="flex items-center space-x-1">
              <Navigation className="w-3.5 h-3.5 text-[#1e7b4f]" />
              <span className="tabular-nums font-semibold text-[#131416]">{hazard_avoiding_route.distance_km} km</span>
              {(distance_delta_km ?? 0) > 0 && (
                <span className="text-[10px] text-[#5d5f60]">(+{distance_delta_km} km)</span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-[#1e7b4f]" />
              <span className="tabular-nums font-semibold text-[#131416]">{hazard_avoiding_route.duration_minutes} min</span>
              {(time_delta_minutes ?? 0) > 0 && (
                <span className="text-[10px] text-[#5d5f60]">(+{time_delta_minutes} min)</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
