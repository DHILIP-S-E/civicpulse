import React from 'react';
import {
  Menu,
  Radio,
  MapPin,
  Database,
  Play
} from 'lucide-react';
import { useAppStore, WorkspaceId } from '../../store/useAppStore';

const WORKSPACE_TITLES: Record<WorkspaceId, { title: string; subtitle: string }> = {
  command: {
    title: 'Command Center',
    subtitle: 'Real-time urban flood telemetry and spatial risk overview'
  },
  routing: {
    title: 'Hazard-Aware Routing',
    subtitle: 'Safe corridor calculation avoiding active Vaigai flood zones'
  },
  hazards: {
    title: 'Hazard Registry',
    subtitle: 'Searchable GIS records, depth telemetry, and municipal wards'
  },
  timeline: {
    title: 'Historical Lakehouse Timeline',
    subtitle: 'Apache Iceberg point-in-time snapshot progression'
  },
  operations: {
    title: 'Municipal Response Operations',
    subtitle: 'Super-sucker dewatering dispatch and road clearance'
  },
  analytics: {
    title: 'Spatial Impact Analytics',
    subtitle: 'Multi-factor triage ranking and ward exposure distribution'
  },
  architecture: {
    title: 'Platform Governance & Audit',
    subtitle: 'Disaster response verification, immutable audit ledger, and district SLA tracking'
  }
};

export const TopHeader: React.FC = () => {
  const {
    activeWorkspace,
    sidebarCollapsed,
    toggleSidebar,
    setIsVideoModalOpen
  } = useAppStore();

  const currentInfo = WORKSPACE_TITLES[activeWorkspace] || WORKSPACE_TITLES.command;

  return (
    <header className="h-[68px] bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between z-20 select-none">
      {/* Left: Brand Identity & Toggle */}
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
          title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EAF3FF] border border-[#1677FF]/20 flex items-center justify-center text-[#1677FF] shadow-xs">
            <Radio className="w-4 h-4" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-[#172033]">CivicPulse</span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#EAF3FF] text-[#1677FF] border border-[#1677FF]/30">
                Madurai
              </span>
            </div>
            <span className="text-[11px] text-[#64748B] font-normal">
              Spatial Lakehouse Platform
            </span>
          </div>
        </div>
      </div>

      {/* Center: Current Workspace Context */}
      <div className="hidden md:flex flex-col items-center text-center">
        <span className="text-sm font-semibold text-[#172033] tracking-tight">
          {currentInfo.title}
        </span>
        <span className="text-[11px] text-[#64748B]">
          {currentInfo.subtitle}
        </span>
      </div>

      {/* Right: Operational Status Badges */}
      <div className="flex items-center space-x-3">
        {/* District Jurisdiction Tag */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
          <MapPin className="w-3.5 h-3.5 text-[#1677FF]" />
          <span className="text-[#172033] font-semibold text-[11px]">Madurai Urban Core</span>
        </div>

        {/* Lakehouse Verified Sync Status */}
        <div
          title="Cryptographically verified immutable flood ledger"
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#F0FDF4] border border-[#16A34A]/20 text-xs"
        >
          <Database className="w-3.5 h-3.5 text-[#16A34A]" />
          <span className="text-[#166534] font-semibold text-[11px]">Audit Ledger Synced</span>
        </div>

        {/* Watch Story Video Button */}
        <button
          onClick={() => setIsVideoModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#1677FF] hover:bg-[#0958D9] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer hover:shadow-sm"
          title="Watch 2-minute narrated video walkthrough"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span className="hidden sm:inline">Watch Demo (2m)</span>
        </button>

        {/* Operational Telemetry Pulse */}
        <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#EAF3FF] border border-[#1677FF]/20 text-[#1677FF] text-xs font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1677FF] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1677FF]"></span>
          </span>
          <span className="hidden sm:inline">Telemetry Active</span>
        </div>
      </div>
    </header>
  );
};
