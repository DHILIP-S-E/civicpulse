import React from 'react';
import { AppMode } from '../../types';
import {
  Layers,
  Database,
  MapPin,
  Clock,
  Navigation,
  ShieldCheck,
  Radio,
  Server
} from 'lucide-react';

interface TopHeaderProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  onOpenArchitecture: () => void;
  isBackendHealthy: boolean;
  activeSnapshotStage?: string;
  isAwsConnected?: boolean;
  onToggleAwsMode?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  appMode,
  setAppMode,
  onOpenArchitecture,
  isBackendHealthy,
  activeSnapshotStage,
  isAwsConnected = true,
  onToggleAwsMode,
}) => {
  return (
    <header className="h-12 bg-surface border-b border-terminal-border px-4 flex items-center justify-between select-none z-30">
      {/* Brand & Lakehouse Identity */}
      <div className="flex items-center space-x-3">
        {/* Monogram mark */}
        <div className="w-7 h-7 bg-raised border border-terminal-border flex items-center justify-center rounded-sm text-accent">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h4l3 8 4-16 3 8h4" />
          </svg>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className="font-semibold text-sm tracking-wide text-white">CIVICPULSE</span>
          <span className="text-xs text-terminal-muted hidden sm:inline">
            Madurai Spatial Lakehouse
          </span>
        </div>

        <div className="h-3.5 w-px bg-terminal-border mx-1 hidden lg:block" />

        {/* Lakehouse Scope Sub-items */}
        <div className="hidden lg:flex items-center space-x-3 text-xs text-terminal-muted tabular-nums">
          <span className="flex items-center space-x-1">
            <Database className="w-3 h-3 text-terminal-subtle" />
            <span>Apache Iceberg v2</span>
          </span>
          <span className="text-terminal-subtle">/</span>
          <span className="flex items-center space-x-1">
            <MapPin className="w-3 h-3 text-terminal-subtle" />
            <span>Amazon Location</span>
          </span>
          <span className="text-terminal-subtle">/</span>
          <span className="flex items-center space-x-1">
            <Server className="w-3 h-3 text-terminal-subtle" />
            <span>ap-south-1</span>
          </span>
        </div>
      </div>

      {/* Primary Navigation - Underline Accent Style (Taste skill move) */}
      <nav className="flex items-center space-x-6 h-full text-xs font-medium">
        <button
          onClick={() => setAppMode('citizen')}
          className={`h-full flex items-center space-x-1.5 transition-colors relative ${
            appMode === 'citizen'
              ? 'text-white font-semibold'
              : 'text-terminal-muted hover:text-white'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Route Exposure Engine</span>
          {appMode === 'citizen' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
          )}
        </button>

        <button
          onClick={() => setAppMode('municipal')}
          className={`h-full flex items-center space-x-1.5 transition-colors relative ${
            appMode === 'municipal'
              ? 'text-white font-semibold'
              : 'text-terminal-muted hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Municipal Operations & Lakehouse Queue</span>
          {appMode === 'municipal' && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent" />
          )}
        </button>
      </nav>

      {/* System Telemetry & Utilities */}
      <div className="flex items-center space-x-3 text-xs">
        {/* Snapshot Commit Indicator */}
        <div className="hidden md:flex items-center space-x-1.5 text-terminal-muted text-xs tabular-nums px-2 py-1 bg-ground border border-terminal-border rounded-sm">
          <Clock className="w-3 h-3 text-terminal-subtle" />
          <span>{activeSnapshotStage || 'Snapshot: v4-latest'}</span>
        </div>

        {/* Live AWS Mode toggle */}
        <button
          onClick={onToggleAwsMode}
          className={`flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono rounded-sm border transition-colors ${
            isAwsConnected
              ? 'bg-[#15231e] border-[#254d3e] text-[#5fc39c]'
              : 'bg-[#261f18] border-[#523d24] text-[#d9a441]'
          }`}
          title="Active cloud execution mode"
        >
          <Radio className="w-3 h-3" />
          <span>{isAwsConnected ? 'AWS CONNECTED' : 'DEMO MODE'}</span>
        </button>

        {/* Architecture Inspector */}
        <button
          onClick={onOpenArchitecture}
          className="flex items-center space-x-1.5 px-2.5 py-1 text-xs text-white bg-raised hover:bg-[#25252b] border border-terminal-border rounded-sm transition-colors"
          title="Inspect Lakehouse Architecture & Verified Data Flow"
        >
          <Layers className="w-3.5 h-3.5 text-terminal-muted" />
          <span className="hidden sm:inline">Architecture</span>
        </button>
      </div>
    </header>
  );
};
