import React from 'react';
import { IcebergSnapshot } from '../../types';
import { Database, X, Check, Copy, FileText, Layers, Clock } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="glass-panel w-full max-w-2xl rounded-xl shadow-2xl border border-border-subtle p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Apache Iceberg Snapshot Inspector</h2>
              <p className="text-[11px] text-gray-400 font-mono">civicpulse_db.civic_hazards_iceberg</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Snapshot Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-border-subtle space-y-1">
            <span className="text-[10px] uppercase text-gray-500">Snapshot Identifier</span>
            <p className="text-blue-300 font-semibold truncate">{snapshot.snapshot_id}</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-border-subtle space-y-1">
            <span className="text-[10px] uppercase text-gray-500">Operation Type</span>
            <p className="text-emerald-300 font-semibold">{snapshot.operation}</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-border-subtle space-y-1">
            <span className="text-[10px] uppercase text-gray-500">Committed Timestamp</span>
            <p className="text-gray-200">{snapshot.committed_at}</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/80 border border-border-subtle space-y-1">
            <span className="text-[10px] uppercase text-gray-500">Lakehouse Provenance</span>
            <p className="text-cyan-300 truncate">{snapshot.provenance}</p>
          </div>
        </div>

        {/* SQL Query Template & Execution */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400 font-semibold flex items-center space-x-1.5 font-sans">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span>Athena Time-Travel Query</span>
            </span>
            <button
              onClick={handleCopySql}
              className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-gray-300 transition-colors font-mono"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy SQL'}</span>
            </button>
          </div>
          <pre className="p-3 rounded-lg bg-black/80 border border-border-subtle font-mono text-[11px] text-emerald-300 overflow-x-auto select-text leading-relaxed">
            {sqlToDisplay}
          </pre>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-border-subtle">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

