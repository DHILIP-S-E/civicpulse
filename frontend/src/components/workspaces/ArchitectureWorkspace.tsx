import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  FileCheck2,
  Radio,
  Lock,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface AuditRecord {
  id: string;
  time: string;
  location: string;
  event: string;
  verification: string;
  status: 'VERIFIED' | 'DISPATCHED' | 'RESOLVED';
}

const AUDIT_TRAIL: AuditRecord[] = [
  {
    id: 'AUD-MDU-2026-081',
    time: '17:35 IST',
    location: 'Simmakkal North Veli St',
    event: 'Corridor Re-opened (Water receded below 15cm threshold)',
    verification: 'Ultrasonic Telemetry + Drone Verification',
    status: 'RESOLVED'
  },
  {
    id: 'AUD-MDU-2026-079',
    time: '17:18 IST',
    location: 'Sellur Railway Underpass',
    event: 'Dewatering Crew Unit-4 Dispatched (Priority 0.88)',
    verification: 'Municipal Fleet Automated Dispatch Order',
    status: 'DISPATCHED'
  },
  {
    id: 'AUD-MDU-2026-074',
    time: '16:45 IST',
    location: 'Goripalayam Main Junction',
    event: 'Flood Boundary Breached (Geofence Alert Broadcasted)',
    verification: 'Edge Sensor #ULTR-03 Tamper-Proof Log',
    status: 'VERIFIED'
  },
  {
    id: 'AUD-MDU-2026-068',
    time: '15:30 IST',
    location: 'Arapalayam Bus Stand Outflow',
    event: 'Storm Surge Inundation Detected (Depth: 42cm)',
    verification: 'Immutable Spatial Lakehouse Ledger',
    status: 'VERIFIED'
  }
];

export const ArchitectureWorkspace: React.FC = () => {
  const { hazards } = useAppStore();
  const [activeTab, setActiveTab] = useState<'pipeline' | 'audit' | 'sla'>('pipeline');

  const resolvedHazards = hazards.filter(h => h.status === 'RESOLVED').length;

  return (
    <div className="space-y-4 text-xs">
      {/* Header Tabs */}
      <div className="flex bg-[#F1F5F9] p-1 rounded-lg border border-[#E2E8F0]">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex-1 py-1.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
            activeTab === 'pipeline'
              ? 'bg-white text-[#1677FF] shadow-xs'
              : 'text-[#64748B] hover:text-[#172033]'
          }`}
        >
          Data Pipeline
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 py-1.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-white text-[#1677FF] shadow-xs'
              : 'text-[#64748B] hover:text-[#172033]'
          }`}
        >
          Audit Ledger
        </button>
        <button
          onClick={() => setActiveTab('sla')}
          className={`flex-1 py-1.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
            activeTab === 'sla'
              ? 'bg-white text-[#1677FF] shadow-xs'
              : 'text-[#64748B] hover:text-[#172033]'
          }`}
        >
          SLA & Security
        </button>
      </div>

      {/* Tab 1: Operational Civic Pipeline Flow */}
      {activeTab === 'pipeline' && (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172033] flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-[#1677FF]" />
                <span>Closed-Loop Civic Response Architecture</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/30">
                100% Operational
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              CivicPulse connects physical hazard telemetry to municipal interventions through a verifiable 4-stage data pipeline designed for municipal resilience.
            </p>

            <div className="space-y-2 pt-1">
              {/* Stage 1 */}
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
                <div className="flex items-center space-x-2 text-[#172033] font-semibold text-xs">
                  <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Physical Observation</span>
                </div>
                <div className="text-[11px] text-[#64748B] pl-7">
                  Solar-powered ultrasonic water depth sensors record road inundation every 30 seconds across 8 key transit bottlenecks.
                </div>
              </div>

              {/* Stage 2 */}
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
                <div className="flex items-center space-x-2 text-[#172033] font-semibold text-xs">
                  <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Spatial Exposure Analysis</span>
                </div>
                <div className="text-[11px] text-[#64748B] pl-7">
                  Live commuter route geometries are intersected against active flood polygons to calculate safe corridors and avoid road blockades.
                </div>
              </div>

              {/* Stage 3 */}
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
                <div className="flex items-center space-x-2 text-[#172033] font-semibold text-xs">
                  <span className="w-5 h-5 rounded-full bg-[#1677FF] text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Transparent Prioritization</span>
                </div>
                <div className="text-[11px] text-[#64748B] pl-7">
                  Municipal pumping and clearance units are automatically ranked by traffic criticality, water depth, and hospital access proximity.
                </div>
              </div>

              {/* Stage 4 */}
              <div className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1">
                <div className="flex items-center space-x-2 text-[#172033] font-semibold text-xs">
                  <span className="w-5 h-5 rounded-full bg-[#16A34A] text-white flex items-center justify-center text-[10px] font-bold">4</span>
                  <span>Verifiable Intervention</span>
                </div>
                <div className="text-[11px] text-[#64748B] pl-7">
                  Post-dewatering road reopening is verified by receding sensor depth and permanently recorded in an immutable historical audit ledger.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tamper-Proof Audit Ledger */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172033] flex items-center space-x-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-[#1677FF]" />
                <span>Municipal Response Audit Trail</span>
              </span>
              <span className="text-[10px] text-[#64748B]">Immutable Ledger</span>
            </div>

            <div className="space-y-2">
              {AUDIT_TRAIL.map((record) => (
                <div
                  key={record.id}
                  className="p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#172033] text-xs">{record.location}</span>
                    <span className="text-[10px] font-mono text-[#64748B]">{record.time}</span>
                  </div>
                  <div className="text-[11px] text-[#475569] leading-snug">
                    {record.event}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]/60 text-[10px]">
                    <span className="text-[#64748B]">{record.verification}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded font-semibold ${
                        record.status === 'RESOLVED'
                          ? 'bg-[#DCFCE7] text-[#16A34A]'
                          : record.status === 'DISPATCHED'
                          ? 'bg-[#E0F2FE] text-[#0284C7]'
                          : 'bg-[#FEF3C7] text-[#D97706]'
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: SLA & District Security */}
      {activeTab === 'sla' && (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#172033] flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-[#1677FF]" />
                <span>District Compliance & SLA Performance</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0FDF4] text-[#16A34A] border border-[#16A34A]/30">
                Passing
              </span>
            </div>

            <div className="divide-y divide-[#E2E8F0] text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#172033]">Telemetry Latency</div>
                  <div className="text-[10px] text-[#64748B]">Ultrasonic sensor to decision screen</div>
                </div>
                <span className="font-bold text-[#16A34A] font-mono">&lt; 420 ms</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#172033]">Sensor Ingestion Uptime</div>
                  <div className="text-[10px] text-[#64748B]">8 automated Madurai monitoring stations</div>
                </div>
                <span className="font-bold text-[#16A34A] font-mono">99.98% SLA</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#172033]">Geofence Warning Reliability</div>
                  <div className="text-[10px] text-[#64748B]">Commuter perimeter breach advisory</div>
                </div>
                <span className="font-bold text-[#16A34A] font-mono">100% Delivered</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#172033]">Data Integrity & Immutability</div>
                  <div className="text-[10px] text-[#64748B]">Point-in-time snapshot auditability</div>
                </div>
                <span className="font-bold text-[#16A34A] font-mono">Certified</span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#172033]">Municipal Standard</div>
                  <div className="text-[10px] text-[#64748B]">Disaster decision-support framework</div>
                </div>
                <span className="font-bold text-[#172033]">NDMA / MDU Corp</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
