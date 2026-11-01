import React, { useState, useEffect } from 'react';
import { IcebergSnapshot } from '../../types';
import { Play, Pause, SkipBack, SkipForward, Clock, History } from 'lucide-react';

interface StormTimelineProps {
  snapshots: IcebergSnapshot[];
  currentSnapshotIndex: number;
  onSelectSnapshot: (index: number) => void;
  isLoading: boolean;
  onOpenSnapshotInspector?: () => void;
}

export const StormTimeline: React.FC<StormTimelineProps> = ({
  snapshots,
  currentSnapshotIndex,
  onSelectSnapshot,
  isLoading,
  onOpenSnapshotInspector,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying && snapshots.length > 0) {
      interval = setInterval(() => {
        onSelectSnapshot((currentSnapshotIndex + 1) % snapshots.length);
      }, 4500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentSnapshotIndex, snapshots.length]);

  if (snapshots.length === 0) return null;

  const stageLabels = [
    { title: 'Yesterday 6AM', subtitle: '3 active hazards · Light rain' },
    { title: 'Yesterday Noon', subtitle: '7 active hazards · Heavy storm' },
    { title: 'Yesterday 6PM', subtitle: '9 active hazards · Peak flooding' },
    { title: 'Now', subtitle: '6 resolved · Dewatering active' },
  ];

  const handlePrev = () => {
    if (currentSnapshotIndex > 0) {
      onSelectSnapshot(currentSnapshotIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentSnapshotIndex < snapshots.length - 1) {
      onSelectSnapshot(currentSnapshotIndex + 1);
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-[760px] px-3 select-none">
      <div className="bg-[#111827]/95 backdrop-blur-md rounded-xl border border-[rgba(148,163,184,0.2)] p-3.5 shadow-2xl text-xs space-y-3">
        {/* Header Row */}
        <div className="flex items-center justify-between pb-2 border-b border-[rgba(148,163,184,0.15)]">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 text-white font-bold">
              <History className="w-4 h-4 text-blue-400" />
              <span>24-Hour Storm History</span>
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-300 font-medium">
              See how the flood developed and cleared across Madurai
            </span>
          </div>

          {onOpenSnapshotInspector && (
            <button
              onClick={onOpenSnapshotInspector}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Timeline Details
            </button>
          )}
        </div>

        {/* 4 Citizen Timeline Stages */}
        <div className="grid grid-cols-4 gap-2">
          {snapshots.map((s, idx) => {
            const isCurrent = idx === currentSnapshotIndex;
            const label = stageLabels[idx] || {
              title: s.stage_name,
              subtitle: `${s.active_hazard_count} active · ${s.resolved_hazard_count} resolved`
            };

            return (
              <button
                key={s.snapshot_id}
                onClick={() => onSelectSnapshot(idx)}
                className={`p-2.5 rounded-lg text-left transition-all border ${
                  isCurrent
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                    : 'bg-[#0B0F19] hover:bg-slate-800/60 border-[rgba(148,163,184,0.15)] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${isCurrent ? 'text-blue-400' : 'text-slate-200'}`}>
                    {label.title}
                  </span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  {label.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Playback Controls & Status */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentSnapshotIndex === 0}
              className="p-1.5 rounded-md bg-[#0B0F19] hover:bg-slate-800 disabled:opacity-30 border border-[rgba(148,163,184,0.15)] text-slate-300 hover:text-white transition-colors"
              title="Previous Step"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow transition-all flex items-center space-x-1.5"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Replay Storm Development'}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentSnapshotIndex === snapshots.length - 1}
              className="p-1.5 rounded-md bg-[#0B0F19] hover:bg-slate-800 disabled:opacity-30 border border-[rgba(148,163,184,0.15)] text-slate-300 hover:text-white transition-colors"
              title="Next Step"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            {isLoading ? (
              <span className="text-blue-400 animate-pulse">Loading historic flood map...</span>
            ) : (
              <span>Stage {currentSnapshotIndex + 1} of {snapshots.length} selected</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
