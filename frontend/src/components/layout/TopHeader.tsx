import React from 'react';
import { AppMode } from '../../types';
import {
  ShieldAlert,
  Layers,
  Database,
  MapPin,
  Clock,
  Compass,
  Truck,
  HelpCircle,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';

interface TopHeaderProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  onOpenArchitecture: () => void;
  isBackendHealthy: boolean;
  activeSnapshotStage?: string;
  isAwsConnected?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  appMode,
  setAppMode,
  onOpenArchitecture,
  isBackendHealthy,
  activeSnapshotStage,
  isAwsConnected = false,
}) => {
  return (
    <header className="h-14 bg-[#0B0F19]/95 border-b border-border-subtle px-4 flex items-center justify-between z-20 select-none backdrop-blur-md">
      {/* Brand & Lakehouse Identity */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-accent">
          <ShieldAlert className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base tracking-tight text-white">CIVICPULSE</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/40">
              Madurai Spatial Lakehouse
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] text-gray-400">
            <span className="flex items-center space-x-1">
              <Database className="w-3 h-3 text-cyan-400" />
              <span>Apache Iceberg v2</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>Amazon Location Maps</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              {isBackendHealthy ? (
                <span className="inline-flex items-center text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                  FastAPI Online
                </span>
              ) : (
                <span className="inline-flex items-center text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1"></span>
                  Local Engine
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Mode Switcher */}
      <div className="bg-[#111827] p-1 rounded-lg border border-border-subtle flex items-center space-x-1">
        <button
          onClick={() => setAppMode('citizen')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
            appMode === 'citizen'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Citizen Safe Corridor</span>
        </button>
        <button
          onClick={() => setAppMode('municipal')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
            appMode === 'municipal'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Municipal Operations</span>
        </button>
      </div>

      {/* Region, Lakehouse Status & Info */}
      <div className="flex items-center space-x-3 text-xs">
        <div className="hidden md:flex items-center space-x-2 px-2.5 py-1 rounded bg-slate-900/80 border border-border-subtle font-mono text-[11px] text-gray-300">
          <span className="text-gray-500">AWS:</span>
          <span className="text-blue-300 font-semibold">ap-south-1</span>
        </div>

        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-900/80 border border-border-subtle text-[11px] text-gray-300">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>{activeSnapshotStage || 'Latest Snapshot'}</span>
        </div>

        {/* Live / Demo Mode Badge */}
        <div
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border text-[11px] font-mono font-medium ${
            isAwsConnected
              ? 'bg-emerald-950/60 border-emerald-700/50 text-emerald-300'
              : 'bg-amber-950/60 border-amber-700/50 text-amber-300'
          }`}
        >
          {isAwsConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{isAwsConnected ? 'LIVE AWS MODE' : 'DEMO MODE'}</span>
        </div>

        {/* Architecture Drawer Toggle */}
        <button
          onClick={onOpenArchitecture}
          className="flex items-center space-x-1 px-2.5 py-1.5 rounded bg-slate-800/80 hover:bg-slate-700 text-gray-200 border border-border-subtle transition-colors text-xs font-medium"
          title="Inspect Lakehouse Architecture & Verified Data Flow"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Architecture</span>
        </button>
      </div>
    </header>
  );
};

