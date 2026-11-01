import React from 'react';
import { RouteCompareResponse } from '../../types';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Milestone,
  Shield,
  ArrowRight
} from 'lucide-react';

interface RouteComparisonCardProps {
  comparison: RouteCompareResponse;
}

export const RouteComparisonCard: React.FC<RouteComparisonCardProps> = ({ comparison }) => {
  const { standard_route, hazard_avoiding_route, time_delta_minutes, distance_delta_km } = comparison;

  return (
    <div className="space-y-2.5 pt-1">
      <div className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold flex items-center justify-between">
        <span>Route Exposure Analysis</span>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
          {comparison.routing_source.includes('Amazon') ? 'Amazon Location' : 'Topological Engine'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Standard Route Box (Red Dashed) */}
        <div className="p-2.5 rounded-lg bg-red-950/20 border border-red-800/30 space-y-1.5">
          <div className="flex items-center space-x-1.5 font-semibold text-red-400 pb-1 border-b border-red-900/40">
            <span className="w-3 border-b-2 border-dashed border-red-500 inline-block"></span>
            <span>Standard Route</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span className="flex items-center space-x-1 text-[11px] text-gray-400">
              <Milestone className="w-3 h-3" />
              <span>Distance</span>
            </span>
            <span className="font-mono font-semibold">{standard_route.distance_km} km</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span className="flex items-center space-x-1 text-[11px] text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Time</span>
            </span>
            <span className="font-mono font-semibold">{standard_route.duration_minutes} min</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-red-900/30">
            <span className="text-[11px] text-red-300">Hazard Hits</span>
            <span className="font-mono font-bold text-red-400 bg-red-950/60 px-1.5 py-0.2 rounded border border-red-800/40">
              {standard_route.hazard_intersections.length}
            </span>
          </div>
        </div>

        {/* Safe Corridor Box (Green Solid) */}
        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 space-y-1.5">
          <div className="flex items-center space-x-1.5 font-semibold text-emerald-400 pb-1 border-b border-emerald-900/40">
            <span className="w-3 border-b-2 border-solid border-emerald-500 inline-block"></span>
            <span>Safe Corridor</span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span className="flex items-center space-x-1 text-[11px] text-gray-400">
              <Milestone className="w-3 h-3" />
              <span>Distance</span>
            </span>
            <span className="font-mono font-semibold">
              {hazard_avoiding_route ? `${hazard_avoiding_route.distance_km} km` : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between text-gray-300">
            <span className="flex items-center space-x-1 text-[11px] text-gray-400">
              <Clock className="w-3 h-3" />
              <span>Time</span>
            </span>
            <span className="font-mono font-semibold">
              {hazard_avoiding_route ? `${hazard_avoiding_route.duration_minutes} min` : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-emerald-900/30">
            <span className="text-[11px] text-emerald-300">Hazard Hits</span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/40">
              {hazard_avoiding_route ? hazard_avoiding_route.hazard_intersections.length : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Delta Metrics Pill */}
      {hazard_avoiding_route && (
        <div className="p-2 rounded-lg bg-slate-900/80 border border-border-subtle flex items-center justify-between text-[11px] font-mono">
          <span className="text-gray-400">Detour Cost:</span>
          <div className="flex items-center space-x-2">
            <span className="text-amber-400 font-semibold">
              +{distance_delta_km || 0} km
            </span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">
              +{time_delta_minutes || 0} min
            </span>
          </div>
        </div>
      )}

      {/* Warnings & Honesty Callout */}
      {standard_route.warnings.length > 0 && (
        <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-200 space-y-1">
          <div className="flex items-center space-x-1 font-semibold text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span>Hazard Corridor Warnings</span>
          </div>
          {standard_route.warnings.map((w, idx) => (
            <p key={idx} className="leading-tight text-gray-300">{w}</p>
          ))}
          <p className="text-[10px] text-gray-400 italic pt-1 border-t border-amber-900/40">
            Notice: Avoiding mapped polygons significantly reduces risk but does not guarantee completely dry passage on local residential alleys.
          </p>
        </div>
      )}
    </div>
  );
};

