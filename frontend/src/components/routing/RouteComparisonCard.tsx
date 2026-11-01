import React from 'react';
import { RouteCompareResponse } from '../../types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface RouteComparisonCardProps {
  comparison: RouteCompareResponse;
}

export const RouteComparisonCard: React.FC<RouteComparisonCardProps> = ({ comparison }) => {
  const { standard_route, hazard_avoiding_route, time_delta_minutes, distance_delta_km } = comparison;

  return (
    <div className="space-y-3 pt-2">
      {/* Header and Source */}
      <div className="flex items-center justify-between text-[11px] text-terminal-muted border-b border-terminal-border pb-1">
        <span className="font-medium uppercase tracking-wider">Corridor Exposure Summary</span>
        <span className="tabular-nums text-terminal-subtle">
          {comparison.routing_source.includes('Amazon') ? 'Amazon Location Routes' : 'Spatial Graph Engine'}
        </span>
      </div>

      {/* Structured Comparison Table */}
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-terminal-border text-[11px] text-terminal-muted">
            <th className="text-left font-medium pb-1.5">Metric</th>
            <th className="text-right font-medium pb-1.5">Standard</th>
            <th className="text-right font-medium pb-1.5 text-hazard-resolved">Safe Corridor</th>
            <th className="text-right font-medium pb-1.5">Delta</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-terminal-border tabular-nums text-xs">
          <tr>
            <td className="py-1.5 text-terminal-muted">Distance</td>
            <td className="text-right py-1.5 font-medium">{standard_route.distance_km} km</td>
            <td className="text-right py-1.5 font-medium text-white">
              {hazard_avoiding_route ? `${hazard_avoiding_route.distance_km} km` : '—'}
            </td>
            <td className="text-right py-1.5 text-terminal-muted">
              {distance_delta_km !== undefined ? `+${distance_delta_km} km` : '—'}
            </td>
          </tr>
          <tr>
            <td className="py-1.5 text-terminal-muted">Duration</td>
            <td className="text-right py-1.5 font-medium">{standard_route.duration_minutes} min</td>
            <td className="text-right py-1.5 font-medium text-white">
              {hazard_avoiding_route ? `${hazard_avoiding_route.duration_minutes} min` : '—'}
            </td>
            <td className="text-right py-1.5 text-terminal-muted">
              {time_delta_minutes !== undefined ? `+${time_delta_minutes} min` : '—'}
            </td>
          </tr>
          <tr>
            <td className="py-1.5 text-terminal-muted">Hazard Exposure</td>
            <td className="text-right py-1.5 font-semibold text-hazard-critical">
              {standard_route.hazard_intersections.length} polygons
            </td>
            <td className="text-right py-1.5 font-semibold text-hazard-resolved">
              {hazard_avoiding_route ? `${hazard_avoiding_route.hazard_intersections.length} polygons` : '—'}
            </td>
            <td className="text-right py-1.5 font-medium text-hazard-resolved">
              {hazard_avoiding_route && standard_route.hazard_intersections.length > 0 ? '100% Cleared' : '0'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Intersected Hazards Detail */}
      {standard_route.hazard_intersections.length > 0 && (
        <div className="p-2.5 bg-surface border border-terminal-border text-xs space-y-1.5">
          <div className="flex items-center space-x-1.5 text-hazard-critical text-[11px] font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Standard Route Breaches {standard_route.hazard_intersections.length} Hazard Geofences</span>
          </div>
          <div className="space-y-1 pl-4 text-terminal-muted text-[11px]">
            {standard_route.hazard_intersections.map((hz) => (
              <div key={hz.hazard_id} className="flex items-center justify-between">
                <span className="font-mono text-white truncate max-w-[190px]">
                  {hz.hazard_id} ({hz.location_name})
                </span>
                <span className="text-hazard-critical text-[10px] shrink-0">
                  {hz.water_depth_cm ? `${hz.water_depth_cm} cm` : hz.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Safe Corridor Confirmation */}
      {hazard_avoiding_route && hazard_avoiding_route.hazard_intersections.length === 0 && (
        <div className="p-2 bg-surface border border-terminal-border flex items-center space-x-2 text-xs text-hazard-resolved">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[11px] text-terminal-muted">
            Safe Corridor bypasses Sellur railway underpass via arterial bypass.
          </span>
        </div>
      )}
    </div>
  );
};
