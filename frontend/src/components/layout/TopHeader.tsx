import React from 'react';
import { AppMode } from '../../types';
import { Navigation, ShieldCheck, Activity, Info } from 'lucide-react';

interface TopHeaderProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  onOpenArchitecture?: () => void;
  isBackendHealthy: boolean;
  activeSnapshotStage?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  appMode,
  setAppMode,
  onOpenArchitecture,
  isBackendHealthy,
}) => {
  return (
    <header className="h-14 bg-[#111827] border-b border-[rgba(148,163,184,0.15)] px-4 sm:px-6 flex items-center justify-between select-none z-30">
      {/* Brand Identity */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm tracking-wide text-white">CivicPulse</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
              Live
            </span>
          </div>
          <span className="text-xs text-slate-400 font-normal">
            Madurai Flood Intelligence
          </span>
        </div>
      </div>

      {/* Primary Navigation - Two Screen Tabs */}
      <nav className="flex items-center bg-[#0B0F19] p-1 rounded-lg border border-[rgba(148,163,184,0.15)]">
        <button
          onClick={() => setAppMode('citizen')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            appMode === 'citizen'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>🛣️ Plan My Route</span>
        </button>

        <button
          onClick={() => setAppMode('municipal')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
            appMode === 'municipal'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>🚛 Command Center</span>
        </button>
      </nav>

      {/* Live Status & Information */}
      <div className="flex items-center space-x-3">
        {/* Status Pill */}
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isBackendHealthy ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isBackendHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="hidden md:inline">Live Data · Madurai · Updated 2 min ago</span>
          <span className="md:hidden">Madurai Live</span>
        </div>

        {/* System Info Link */}
        {onOpenArchitecture && (
          <button
            onClick={onOpenArchitecture}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-md border border-[rgba(148,163,184,0.15)] transition-colors"
            title="System & Data Architecture"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
