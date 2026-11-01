import React, { useState, useEffect } from 'react';
import { IcebergSnapshot } from '../../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Clock,
  Database,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface StormTimelineProps {
  snapshots: IcebergSnapshot[];
  currentSnapshotIndex: number;
  onSelectSnapshot: (index: number) => void;
  isLoading: boolean;
  onOpenSnapshotInspector: () => void;
}

export const StormTimeline: React.FC<StormTimelineProps> = ({
  snapshots,
  currentSnapshotIndex,
  onSelectSnapshot,
  isLoading,
  onOpenSnapshotInspector,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play interval
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

  const activeSnapshot = snapshots[currentSnapshotIndex] || snapshots[0];

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
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 w-full max-w-[700px] px-3 select-none">
      <div className="glass-panel rounded-xl p-3 shadow-2xl border border-border-subtle backdrop-blur-xl">
        {/* Top Header Row of Timeline */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-border-subtle/70 text-xs">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1 text-cyan-400 font-mono font-semibold">
              <Database className="w-3.5 h-3.5" />
              <span>Athena Iceberg Time Travel</span>
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-300 font-medium">
              {activeSnapshot.stage_name}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono">
            <span className="text-amber-400">
              Active: {activeSnapshot.active_hazard_count}
            </span>
            <span className="text-emerald-400">
              Resolved: {activeSnapshot.resolved_hazard_count}
            </span>
            <button
              onClick={onOpenSnapshotInspector}
              className="text-[10px] text-blue-400 hover:text-blue-300 underline flex items-center space-x-0.5"
              title="Inspect Iceberg metadata & commit payload"
            >
              <span>{activeSnapshot.snapshot_id.slice(0, 16)}...</span>
            </button>
          </div>
        </div>

        {/* 4 Interactive Stage Steps */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {snapshots.map((s, idx) => {
            const isCurrent = idx === currentSnapshotIndex;
            return (
              <button
                key={s.snapshot_id}
                onClick={() => onSelectSnapshot(idx)}
                className={`p-2 rounded-lg text-left transition-all border ${
                  isCurrent
                    ? 'bg-blue-600/25 border-blue-500/70 text-white shadow-md'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-border-subtle text-gray-400'
                }`}
              >
                <div className="text-[10px] font-mono font-semibold uppercase text-blue-300">
                  {s.relative_time}
                </div>
                <div className="text-xs font-semibold truncate text-gray-200">
                  {s.stage_name.split(':')[1]?.trim() || s.stage_name}
                </div>
                <div className="text-[10px] text-gray-400 font-mono truncate">
                  {s.committed_at.slice(11, 16)} UTC
                </div>
              </button>
            );
          })}
        </div>

        {/* Controls Bar: Play / Pause / Next / Prev */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentSnapshotIndex === 0}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-gray-300 transition-colors"
              title="Previous Snapshot"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center space-x-1.5 transition-colors shadow"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Replay Storm'}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentSnapshotIndex === snapshots.length - 1}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-gray-300 transition-colors"
              title="Next Snapshot"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Loading / Execution status */}
          <div className="flex items-center space-x-2 text-[11px] font-mono text-gray-400">
            {isLoading ? (
              <span className="flex items-center space-x-1 text-cyan-400 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Executing Athena SQL...</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>Lakehouse State Committed</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
