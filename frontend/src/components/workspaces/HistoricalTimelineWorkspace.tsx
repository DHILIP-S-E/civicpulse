import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  History,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { api } from '../../services/api';

export const HistoricalTimelineWorkspace: React.FC = () => {
  const {
    snapshots,
    currentSnapshotIndex,
    setCurrentSnapshotIndex,
    setHazards,
    showToast,
    isSnapshotLoading,
    setIsSnapshotLoading,
    setEvents
  } = useAppStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const playTimer = useRef<any>(null);

  const activeSnap = snapshots[currentSnapshotIndex] || snapshots[0];

  const handleSelectSnapshot = async (index: number) => {
    setCurrentSnapshotIndex(index);
    const target = snapshots[index];
    if (!target) return;

    setIsSnapshotLoading(true);
    try {
      const res = await api.querySnapshot(target.snapshot_id);
      setHazards(res.hazards);

      const ev = await api.getEvents();
      setEvents(ev);

      showToast(`Loaded ${target.stage_name} snapshot`, 'info');
    } catch (err: any) {
      showToast(`Snapshot load note: ${err.message}`, 'warning');
    } finally {
      setIsSnapshotLoading(false);
    }
  };

  useEffect(() => {
    if (isPlaying && snapshots.length > 0) {
      playTimer.current = setInterval(() => {
        const next = (currentSnapshotIndex + 1) % snapshots.length;
        handleSelectSnapshot(next);
      }, 3500);
    } else {
      if (playTimer.current) clearInterval(playTimer.current);
    }
    return () => {
      if (playTimer.current) clearInterval(playTimer.current);
    };
  }, [isPlaying, currentSnapshotIndex, snapshots.length]);

  return (
    <div className="space-y-4">
      {/* Player Header Card */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-[#1677FF]" />
            <h3 className="text-sm font-bold text-[#172033]">
              24-Hour Storm Progression
            </h3>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-2.5 py-1 bg-[#1677FF] hover:bg-[#0958D9] text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 cursor-pointer shadow-xs"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isPlaying ? 'Pause' : 'Replay'}</span>
            </button>

            <button
              disabled={currentSnapshotIndex === 0 || isSnapshotLoading}
              onClick={() => handleSelectSnapshot(Math.max(0, currentSnapshotIndex - 1))}
              className="p-1 rounded-lg border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              disabled={currentSnapshotIndex === snapshots.length - 1 || isSnapshotLoading}
              onClick={() => handleSelectSnapshot(Math.min(snapshots.length - 1, currentSnapshotIndex + 1))}
              className="p-1 rounded-lg border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Stages Progress Buttons */}
        <div className="space-y-2">
          {snapshots.map((s, idx) => {
            const isSelected = currentSnapshotIndex === idx;

            return (
              <div
                key={s.snapshot_id}
                onClick={() => handleSelectSnapshot(idx)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#EAF3FF] border-[#1677FF] shadow-xs'
                    : 'bg-[#F8FAFC] hover:bg-[#F1F5F9] border-[#E2E8F0]'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-[#1677FF] uppercase">
                      Stage {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-[#172033] truncate">
                      {s.stage_name}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64748B] truncate mt-0.5">
                    {s.relative_time} - {s.summary?.summary || 'Committed storm stage'}
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 text-right">
                  <span className="text-xs font-bold text-[#DC2626] tabular-nums">
                    {s.active_hazard_count} active
                  </span>
                  <span className="text-[10px] font-medium text-[#16A34A] tabular-nums">
                    {s.resolved_hazard_count} resolved
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Snapshot Lakehouse Details Card */}
      {activeSnap && (
        <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] space-y-2.5 shadow-xs text-xs">
          <div className="font-bold text-[#172033] flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Database className="w-3.5 h-3.5 text-[#1677FF]" />
              <span>Snapshot Metadata</span>
            </span>
            <span className="text-[10px] font-mono text-[#64748B]">
              {activeSnap.operation}
            </span>
          </div>

          <div className="space-y-1.5 text-[#64748B]">
            <div className="flex items-center justify-between">
              <span>Snapshot ID:</span>
              <span className="font-mono text-[#172033]">{activeSnap.snapshot_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Committed At:</span>
              <span className="text-[#172033] font-mono">{activeSnap.committed_at}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Lakehouse Format:</span>
              <span className="text-[#1677FF] font-semibold">{activeSnap.provenance}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
