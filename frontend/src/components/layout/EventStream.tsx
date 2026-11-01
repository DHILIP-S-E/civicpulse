import React from 'react';
import { OperationalEvent } from '../../types';
import { Activity, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

interface EventStreamProps {
  events: OperationalEvent[];
}

export const EventStream: React.FC<EventStreamProps> = ({ events }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'FAILURE':
        return <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />;
      default:
        return <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col h-full space-y-2 select-text">
      <div className="flex items-center justify-between pb-1 border-b border-border-subtle">
        <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Operational Event Stream</span>
        </span>
        <span className="text-[10px] font-mono text-gray-500">
          {events.length} logged
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[220px]">
        {events.length === 0 ? (
          <div className="text-center py-4 text-xs font-mono text-gray-500">
            Awaiting telemetry handshakes...
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.event_id}
              className="p-2 rounded bg-slate-900/60 border border-border-subtle/70 text-xs font-mono space-y-1"
            >
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center space-x-1 font-semibold text-gray-300">
                  {getStatusIcon(ev.status)}
                  <span className="text-cyan-300">{ev.event_type}</span>
                </div>
                <span className="text-gray-500">
                  {ev.timestamp.slice(11, 19)}
                </span>
              </div>
              <p className="text-[11px] font-sans text-gray-300 leading-snug">
                {ev.message}
              </p>
              {ev.related_id && (
                <div className="text-[10px] text-gray-400 flex items-center space-x-1">
                  <span className="text-gray-500">Target:</span>
                  <span className="text-blue-300">{ev.related_id}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
