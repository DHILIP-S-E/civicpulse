import React from 'react';
import { OperationalEvent } from '../../types';
import { Activity } from 'lucide-react';

interface EventStreamProps {
  events: OperationalEvent[];
}

export const EventStream: React.FC<EventStreamProps> = ({ events }) => {
  return (
    <div className="flex flex-col h-full space-y-2 select-text">
      <div className="flex items-center justify-between pb-1 border-b border-terminal-border text-xs">
        <span className="font-medium text-terminal-muted uppercase tracking-wider flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-accent" />
          <span>Operational Event Stream</span>
        </span>
        <span className="text-[11px] font-mono text-terminal-muted tabular-nums">
          {events.length} logged
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[200px]">
        {events.length === 0 ? (
          <div className="text-center py-4 text-xs font-mono text-terminal-muted">
            Awaiting telemetry handshakes...
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.event_id}
              className="p-2 bg-surface border border-terminal-border text-xs font-mono space-y-1"
            >
              <div className="flex items-center justify-between text-[10px] tabular-nums">
                <span className="text-white font-medium">{ev.event_type}</span>
                <span className="text-terminal-subtle">{ev.timestamp.slice(11, 19)}</span>
              </div>
              <p className="text-[11px] font-sans text-terminal-muted leading-tight">
                {ev.message}
              </p>
              {ev.related_id && (
                <div className="text-[10px] text-terminal-subtle flex items-center space-x-1">
                  <span>Target:</span>
                  <span className="text-white">{ev.related_id}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
