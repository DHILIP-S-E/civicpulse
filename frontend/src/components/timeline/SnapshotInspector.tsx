import React from 'react';
import { IcebergSnapshot } from '../../types';
import { X, Check, Copy } from 'lucide-react';

interface SnapshotInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: IcebergSnapshot | null;
  sqlExecuted?: string;
}

export const SnapshotInspector: React.FC<SnapshotInspectorProps> = ({
  isOpen,
  onClose,
  snapshot,
  sqlExecuted,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !snapshot) return null;

  const defaultSql = `SELECT hazard_id, location_name, hazard_type, severity, status, water_depth_cm\nFROM civicpulse_db.civic_hazards_iceberg\nFOR VERSION AS OF '${snapshot.snapshot_id}';`;

  const sqlToDisplay = sqlExecuted || defaultSql;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlToDisplay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 select-none">
      <div className="bg-surface w-full max-w-2xl border border-terminal-border p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
          <div>
            <h2 className="text-sm font-semibold text-white">Apache Iceberg Snapshot Inspector</h2>
            <p className="text-[11px] text-terminal-muted font-mono">civicpulse_db.civic_hazards_iceberg</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-terminal-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Snapshot Metadata Table */}
        <table className="w-full text-xs border-collapse">
          <tbody className="divide-y divide-rule font-mono text-[11px] tabular-nums">
            <tr>
              <td className="py-2 text-terminal-muted font-sans w-1/3">Snapshot Identifier</td>
              <td className="py-2 text-white font-medium break-all">{snapshot.snapshot_id}</td>
            </tr>
            <tr>
              <td className="py-2 text-terminal-muted font-sans">Operation Type</td>
              <td className="py-2 text-white">{snapshot.operation}</td>
            </tr>
            <tr>
              <td className="py-2 text-terminal-muted font-sans">Committed Timestamp</td>
              <td className="py-2 text-terminal-muted">{snapshot.committed_at}</td>
            </tr>
            <tr>
              <td className="py-2 text-terminal-muted font-sans">Lakehouse Provenance</td>
              <td className="py-2 text-accent break-all">{snapshot.provenance}</td>
            </tr>
          </tbody>
        </table>

        {/* SQL Query */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-terminal-muted font-medium">Athena Time-Travel SQL</span>
            <button
              onClick={handleCopySql}
              className="flex items-center space-x-1 text-[11px] text-terminal-muted hover:text-white font-mono"
            >
              {copied ? <Check className="w-3 h-3 text-hazard-resolved" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3 bg-ground border border-terminal-border font-mono text-[11px] text-white overflow-x-auto select-text leading-relaxed">
            {sqlToDisplay}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-terminal-border">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-raised hover:bg-[#25252c] text-white text-xs border border-terminal-border transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
