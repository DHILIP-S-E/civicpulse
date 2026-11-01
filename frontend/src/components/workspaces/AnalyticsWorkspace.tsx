import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  BarChart3,
  PieChart,
  ShieldAlert,
  MapPin,
  TrendingUp,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const AnalyticsWorkspace: React.FC = () => {
  const { hazards, priorities } = useAppStore();

  const total = hazards.length || 1;
  const critical = hazards.filter(h => h.severity === 'CRITICAL' && h.status !== 'RESOLVED').length;
  const moderate = hazards.filter(h => h.severity === 'MODERATE' && h.status !== 'RESOLVED').length;
  const resolved = hazards.filter(h => h.status === 'RESOLVED').length;

  const floods = hazards.filter(h => h.hazard_type === 'FLOOD').length;
  const waste = hazards.filter(h => h.hazard_type === 'WASTE_OVERFLOW').length;
  const debris = hazards.filter(h => h.hazard_type === 'DEBRIS' || h.hazard_type === 'ROAD_DAMAGE').length;

  return (
    <div className="space-y-4">
      {/* Overview Analytics Card */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-xs">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-[#1677FF]" />
          <h3 className="text-sm font-bold text-[#172033]">
            Spatial Hazard Distribution
          </h3>
        </div>

        {/* Severity Progress Bars */}
        <div className="space-y-2 text-xs">
          <div>
            <div className="flex justify-between text-[#64748B] mb-1">
              <span>Critical Risk (Depth &gt; 35cm)</span>
              <span className="font-semibold text-[#DC2626] tabular-nums">{critical} zones</span>
            </div>
            <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#DC2626] rounded-full transition-all"
                style={{ width: `${(critical / total) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[#64748B] mb-1">
              <span>Moderate Hazard (Passing with Caution)</span>
              <span className="font-semibold text-[#D97706] tabular-nums">{moderate} zones</span>
            </div>
            <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D97706] rounded-full transition-all"
                style={{ width: `${(moderate / total) * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[#64748B] mb-1">
              <span>Resolved Corridors</span>
              <span className="font-semibold text-[#16A34A] tabular-nums">{resolved} zones</span>
            </div>
            <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#16A34A] rounded-full transition-all"
                style={{ width: `${(resolved / total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Hazard Category Breakdown */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-xs text-xs">
        <div className="font-bold text-[#172033] flex items-center space-x-2">
          <PieChart className="w-4 h-4 text-[#1677FF]" />
          <span>Incident Type Classification</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2.5 rounded-lg bg-[#FEF2F2] border border-[#DC2626]/20">
            <div className="text-[10px] font-semibold text-[#DC2626] uppercase">Inundation</div>
            <div className="text-lg font-bold text-[#172033] mt-0.5 tabular-nums">{floods}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#F0F9FF] border border-[#0284C7]/20">
            <div className="text-[10px] font-semibold text-[#0284C7] uppercase">Drainage</div>
            <div className="text-lg font-bold text-[#172033] mt-0.5 tabular-nums">{waste}</div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#FFFBEB] border border-[#D97706]/20">
            <div className="text-[10px] font-semibold text-[#D97706] uppercase">Blockages</div>
            <div className="text-lg font-bold text-[#172033] mt-0.5 tabular-nums">{debris}</div>
          </div>
        </div>
      </div>

      {/* Transparent Priority Scoring Model Card */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-xs text-xs">
        <div className="flex items-center justify-between">
          <div className="font-bold text-[#172033] flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#1677FF]" />
            <span>Triage Scoring Formulation</span>
          </div>
          <span className="text-[10px] font-semibold text-[#1677FF] bg-[#EAF3FF] px-2 py-0.5 rounded">
            Configurable
          </span>
        </div>

        <p className="text-[11px] text-[#64748B] leading-relaxed">
          Incident urgency is evaluated using normalized factor weights calibrated for Madurai monsoonal transit networks:
        </p>

        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded-lg">
            <span className="text-[#172033] font-medium">Water Depth Severity</span>
            <span className="font-mono font-bold text-[#1677FF]">35%</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded-lg">
            <span className="text-[#172033] font-medium">Arterial Bus Network Impact</span>
            <span className="font-mono font-bold text-[#1677FF]">25%</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded-lg">
            <span className="text-[#172033] font-medium">Public Hospital / School Proximity</span>
            <span className="font-mono font-bold text-[#1677FF]">20%</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded-lg">
            <span className="text-[#172033] font-medium">Telemetry Observation Recency</span>
            <span className="font-mono font-bold text-[#1677FF]">10%</span>
          </div>
          <div className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded-lg">
            <span className="text-[#172033] font-medium">Source Confidence Verification</span>
            <span className="font-mono font-bold text-[#1677FF]">10%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
