import React from 'react';
import { IcebergSnapshot } from '../../types';
import { Clock, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

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
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const playTimer = React.useRef<any>(null);

  const fallbackStages = [
    { title: 'T-18h (Yesterday 6AM)', subtitle: '3 active flood zones - Pre-storm baseline' },
    { title: 'T-12h (Yesterday Noon)', subtitle: '7 active flood zones - Heavy cloudburst' },
    { title: 'T-6h (Yesterday 6PM)', subtitle: '9 active flood zones - Peak inundation' },
    { title: 'Now (Committed)', subtitle: '6 resolved - Dewatering active' },
  ];

  const stages =
    snapshots && snapshots.length >= 4
      ? snapshots.map((s, idx) => ({
          title: fallbackStages[idx]?.title || s.stage_name,
          subtitle: `${s.active_hazard_count} active - ${s.resolved_hazard_count} resolved`,
        }))
      : fallbackStages;

  // Handle Play/Pause Auto-Replay
  React.useEffect(() => {
    if (isPlaying) {
      playTimer.current = setInterval(() => {
        onSelectSnapshot((currentSnapshotIndex + 1) % stages.length);
      }, 3500);
    } else {
      if (playTimer.current) clearInterval(playTimer.current);
    }
    return () => {
      if (playTimer.current) clearInterval(playTimer.current);
    };
  }, [isPlaying, currentSnapshotIndex, stages.length]);

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-[92%] max-w-[700px] select-none">
      <div className="bg-[#111827]/95 backdrop-blur-md rounded-2xl border border-[rgba(148,163,184,0.2)] p-3.5 shadow-2xl space-y-2.5">
        {/* Top Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white tracking-wide">
              24-Hour Storm History
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              - Monsoonal Flood Evolution
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-[#0B0F19] hover:bg-slate-800 text-xs text-slate-300 hover:text-white border border-[rgba(148,163,184,0.15)] transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
              <span>{isPlaying ? 'Pause' : 'Replay Storm'}</span>
            </button>

            <div className="flex items-center space-x-1">
              <button
                disabled={currentSnapshotIndex === 0 || isLoading}
                onClick={() => onSelectSnapshot(Math.max(0, currentSnapshotIndex - 1))}
                className="p-1 rounded bg-[#0B0F19] hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-[rgba(148,163,184,0.15)] cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                disabled={currentSnapshotIndex === stages.length - 1 || isLoading}
                onClick={() => onSelectSnapshot(Math.min(stages.length - 1, currentSnapshotIndex + 1))}
                className="p-1 rounded bg-[#0B0F19] hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-[rgba(148,163,184,0.15)] cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 4 Clickable Storm Stages */}
        <div className="grid grid-cols-4 gap-2">
          {stages.map((st, i) => {
            const isActive = currentSnapshotIndex === i;
            return (
              <button
                key={i}
                onClick={() => onSelectSnapshot(i)}
                className={`p-2 rounded-xl text-left transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-blue-600/15 border-blue-500/60 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-[#0B0F19] hover:bg-slate-800/50 border-[rgba(148,163,184,0.12)]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-[10px] font-bold ${
                      isActive ? 'text-blue-400' : 'text-slate-400'
                    }`}
                  >
                    Stage {i + 1}
                  </span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-white truncate">
                  {st.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {st.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="text-[11px] text-blue-400 text-center animate-pulse py-0.5 font-medium">
            Syncing flood map with database...
          </div>
        )}
      </div>
    </div>
  );
};
