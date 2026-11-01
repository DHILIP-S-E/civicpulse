import React from 'react';
import { AppMode } from '../../types';
import { Compass, Shield, Radio } from 'lucide-react';

interface TopHeaderProps {
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  isBackendHealthy: boolean;
  activeSnapshotStage?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  appMode,
  setAppMode,
  isBackendHealthy,
}) => {
  return (
    <header className="h-14 bg-[#111827] border-b border-[rgba(148,163,184,0.15)] px-4 sm:px-6 flex items-center justify-between select-none z-30">
      {/* Brand Identity */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
          <Radio className="w-4 h-4" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm tracking-tight text-white">CivicPulse</span>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
              Live
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-normal">
            Madurai Flood Intelligence
          </span>
        </div>
      </div>

      {/* Primary Navigation - Two Modes */}
      <nav className="flex items-center bg-[#0B0F19] p-1 rounded-lg border border-[rgba(148,163,184,0.15)]">
        <button
          onClick={() => setAppMode('citizen')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            appMode === 'citizen'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Plan Safe Route</span>
        </button>

        <button
          onClick={() => setAppMode('municipal')}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            appMode === 'municipal'
              ? 'bg-blue-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Municipal Command</span>
        </button>
      </nav>

      {/* Live Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isBackendHealthy ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isBackendHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
          </span>
          <span className="hidden md:inline">Live - Madurai Water Monitoring</span>
          <span className="md:hidden">Live</span>
        </div>
      </div>
    </header>
  );
};
