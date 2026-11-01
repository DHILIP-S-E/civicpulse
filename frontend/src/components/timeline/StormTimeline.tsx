import React, { useState, useEffect } from 'react';
import { IcebergSnapshot } from '../../types';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Database
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
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-full max-w-[720px] px-3 select-none">
      <div className="bg-surface border border-terminal-border p-3 text-xs">
        {/* Header Row */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-terminal-border text-xs">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 text-white font-medium">
              <Database className="w-3.5 h-3.5 text-accent" />
              <span>Iceberg Time-Travel Scrubber</span>
            </span>
            <span className="text-terminal-subtle">·</span>
            <span className="text-terminal-muted truncate max-w-[280px]">
              {activeSnapshot.stage_name}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono tabular-nums">
            <span className="text-hazard-critical">
              {activeSnapshot.active_hazard_count} Active
            </span>
            <span className="text-hazard-resolved">
              {activeSnapshot.resolved_hazard_count} Resolved
            </span>
            <button
              onClick={onOpenSnapshotInspector}
              className="text-accent hover:underline"
              title="Inspect Iceberg snapshot commit & metadata"
            >
              Inspect Snapshot
            </button>
          </div>
        </div>

        {/* 4 Discrete Commit Stages */}
        <div className="grid grid-cols-4 gap-1.5 mb-2.5">
          {snapshots.map((s, idx) => {
            const isCurrent = idx === currentSnapshotIndex;
            return (
              <button
                key={s.snapshot_id}
                onClick={() => onSelectSnapshot(idx)}
                className={`p-2 text-left transition-colors border ${
                  isCurrent
                    ? 'bg-raised border-terminal-border text-white border-b-2 border-b-accent'
                    : 'bg-surface hover:bg-raised border-terminal-border text-terminal-muted hover:text-white'
                }`}
              >
                <div className="text-[10px] font-mono text-accent">
                  {s.relative_time}
                </div>
                <div className="text-xs font-medium truncate mt-0.5">
                  {s.stage_name.split(':')[1]?.trim() || s.stage_name}
                </div>
                <div className="text-[10px] text-terminal-subtle font-mono tabular-nums">
                  {s.committed_at.slice(11, 16)} UTC
                </div>
              </button>
            );
          })}
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handlePrev}
              disabled={currentSnapshotIndex === 0}
              className="px-2 py-1 bg-surface hover:bg-raised disabled:opacity-30 border border-terminal-border text-terminal-muted hover:text-white transition-colors"
              title="Previous Snapshot"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-1 bg-raised hover:bg-[#25252c] text-white font-medium border border-terminal-border flex items-center space-x-1.5 transition-colors"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Replay Storm Sequence'}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentSnapshotIndex === snapshots.length - 1}
              className="px-2 py-1 bg-surface hover:bg-raised disabled:opacity-30 border border-terminal-border text-terminal-muted hover:text-white transition-colors"
              title="Next Snapshot"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="font-mono text-[11px] text-terminal-muted tabular-nums">
            {isLoading ? (
              <span className="text-accent animate-pulse">Running Athena Iceberg query...</span>
            ) : (
              <span>Lakehouse Commit Synced</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
