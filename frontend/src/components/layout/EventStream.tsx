import React from 'react';
import { OperationalEvent } from '../../types';
import { Activity } from 'lucide-react';

const EVENT_LABELS: Record<string, string> = {
  'ICEBERG_MERGE_SUCCEEDED': 'City database updated',
  'GEOFENCE_ENTER': 'Alert: Commuter entered flood zone',
  'GEOFENCE_EXIT': 'Commuter left flood zone',
  'ROUTE_INTERSECTION_DETECTED': 'Route crosses active flood area',
  'MUNICIPAL_DISPATCH_CREATED': 'Dewatering crew dispatched',
  'HAZARD_LAYER_REFRESHED': 'Flood map updated',
  'ROUTE_CALCULATED': 'Safe route found',
  'HAZARD_RESOLUTION_REQUESTED': 'Road clearance requested',
  'HAZARD_RESOLVED': 'Road cleared - map updated',
  'SNAPSHOT_QUERIED': 'Historical flood map loaded',
  'GEOFENCE_EVALUATED': 'Flood zone check complete',
};

interface EventStreamProps {
  events: OperationalEvent[];
}

export const EventStream: React.FC<EventStreamProps> = ({ events }) => {
  return (
    <div className="flex flex-col space-y-2 select-text">
      <div className="flex items-center justify-between pb-1.5 border-b border-[#E2E8F0] text-xs">
        <span className="font-bold text-[#172033] uppercase tracking-wider flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-[#1677FF]" />
          <span>Event Stream</span>
        </span>
        <span className="text-[11px] font-mono text-[#64748B] tabular-nums">
          {events.length} logged
        </span>
      </div>

      <div className="overflow-y-auto space-y-1.5 pr-1 max-h-[180px]">
        {events.length === 0 ? (
          <div className="text-center py-4 text-xs font-mono text-[#64748B]">
            Awaiting telemetry handshakes...
          </div>
        ) : (
          events.slice(0, 10).map((ev) => (
            <div
              key={ev.event_id}
              className="p-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs space-y-1 shadow-2xs"
            >
              <div className="flex items-center justify-between text-[10px] tabular-nums">
                <span className="text-[#172033] font-bold">
                  {EVENT_LABELS[ev.event_type] ?? ev.event_type}
                </span>
                <span className="text-[#94A3B8] font-mono">{ev.timestamp.slice(11, 19)}</span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-snug">
                {ev.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
