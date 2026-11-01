import React, { useState } from 'react';
import { DispatchRecord, Hazard } from '../../types';
import {
  Truck,
  CheckCircle,
  Radio
} from 'lucide-react';

interface MunicipalDispatchPanelProps {
  dispatch: DispatchRecord | null;
  targetHazard: Hazard | null;
  onResolveHazard: (hazardId: string, dispatchId?: string) => Promise<void>;
  isResolving: boolean;
  onResetDispatch: () => void;
}

export const MunicipalDispatchPanel: React.FC<MunicipalDispatchPanelProps> = ({
  dispatch,
  targetHazard,
  onResolveHazard,
  isResolving,
  onResetDispatch,
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!dispatch || !targetHazard) {
    return (
      <div className="p-6 text-center text-terminal-muted text-xs font-mono space-y-1">
        <div className="text-terminal-subtle text-base font-semibold">No Active Dispatch</div>
        <p className="font-sans text-[11px] text-terminal-muted">
          Select a priority hazard from the queue to mobilize municipal pumping units.
        </p>
      </div>
    );
  }

  const handleConfirmResolve = async () => {
    setShowConfirmModal(false);
    await onResolveHazard(targetHazard.hazard_id, dispatch.dispatch_id);
  };

  const isAlreadyResolved = targetHazard.status === 'RESOLVED';

  return (
    <div className="space-y-3 text-xs select-none">
      {/* Active Work Order Header */}
      <div className="p-3 bg-surface border border-terminal-border space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-terminal-muted flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-hazard-moderate" />
            <span className="text-white font-medium">DISPATCH {dispatch.dispatch_id}</span>
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 border border-terminal-border bg-ground text-white">
            {isAlreadyResolved ? 'COMPLETED' : dispatch.status}
          </span>
        </div>
        <div className="font-semibold text-sm text-white pt-0.5">{dispatch.hazard_location}</div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-terminal-muted">
          <span>Crew: {dispatch.crew_id}</span>
          <span>·</span>
          <span>{dispatch.truck_type}</span>
        </div>
      </div>

      {/* Telemetry & Action Log */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-medium uppercase tracking-wider text-terminal-muted">
          Operational Event Feed
        </div>
        <div className="bg-ground p-2.5 border border-terminal-border space-y-1.5 text-xs font-mono max-h-[140px] overflow-y-auto tabular-nums">
          {dispatch.action_log.map((log, idx) => (
            <div key={idx} className="flex items-start space-x-2 text-[11px] leading-tight">
              <span className="text-terminal-subtle shrink-0">[{log.timestamp.slice(11, 19)}]</span>
              <span className="text-terminal-muted">{log.message}</span>
            </div>
          ))}
          {isAlreadyResolved && (
            <div className="flex items-start space-x-1.5 text-[11px] text-hazard-resolved pt-1 border-t border-rule">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Hazard resolved. Iceberg snapshot committed to S3.</span>
            </div>
          )}
        </div>
      </div>

      {/* Execution Actions */}
      <div className="pt-2">
        {!isAlreadyResolved ? (
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isResolving}
            className="w-full py-2 bg-raised hover:bg-[#25252c] disabled:opacity-40 text-white font-medium text-xs border border-terminal-border transition-colors flex items-center justify-center space-x-2"
          >
            <Truck className="w-3.5 h-3.5 text-accent" />
            <span>{isResolving ? 'Executing Athena MERGE Mutation...' : 'Resolve Hazard via Athena MERGE'}</span>
          </button>
        ) : (
          <div className="p-3 bg-surface border border-terminal-border text-center space-y-2">
            <div className="text-xs font-semibold text-hazard-resolved flex items-center justify-center space-x-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>Table Updated in Amazon Athena</span>
            </div>
            <button
              onClick={onResetDispatch}
              className="px-3 py-1 bg-raised hover:bg-[#25252c] text-white text-xs border border-terminal-border transition-colors"
            >
              Reset Dispatch
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog - Flat 1px borders */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-surface w-full max-w-md p-5 border border-terminal-border space-y-4">
            <div className="text-sm font-semibold text-white">
              Confirm Apache Iceberg Table Mutation
            </div>
            <p className="text-xs text-terminal-muted leading-relaxed">
              This action will execute an asynchronous <span className="font-mono text-white">MERGE INTO</span> SQL mutation in Amazon Athena against table <span className="font-mono text-white">civicpulse_db.civic_hazards_iceberg</span>, setting hazard <span className="font-mono text-white">{targetHazard.hazard_id}</span> status to <span className="font-mono text-hazard-resolved">RESOLVED</span> and generating a new Iceberg commit.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-terminal-border">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3 py-1.5 bg-ground hover:bg-raised text-terminal-muted hover:text-white text-xs border border-terminal-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolve}
                className="px-4 py-1.5 bg-raised hover:bg-[#25252c] text-white text-xs border border-terminal-border font-medium transition-colors"
              >
                Execute Mutation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
