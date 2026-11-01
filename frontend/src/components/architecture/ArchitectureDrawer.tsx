import React from 'react';
import { X, Database, MapPin, Compass, ShieldCheck, Activity, Layers, ArrowRight } from 'lucide-react';

interface ArchitectureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDrawer: React.FC<ArchitectureDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm select-none">
      <div className="glass-panel w-full max-w-xl h-full p-6 overflow-y-auto space-y-6 border-l border-border-subtle shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>CivicPulse Lakehouse Architecture</span>
            </h2>
            <p className="text-xs text-gray-400 font-mono">Madurai Spatial Lakehouse • AWS Solution Blueprint</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Decision Stages */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">
            The 4-Stage Geospatial Decision Cycle
          </h3>

          <div className="space-y-3">
            {/* Stage 1 */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-border-subtle space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-cyan-300">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-700/50 flex items-center justify-center font-mono text-[10px]">
                  1
                </span>
                <span>Observe Geographic Hazards</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-7">
                Multi-source telemetry ingestion from SmartCity IoT water-level sensors, municipal ward logs, and citizen crowdsourced flood reports in Madurai.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-border-subtle space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-300">
                <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-700/50 flex items-center justify-center font-mono text-[10px]">
                  2
                </span>
                <span>Lakehouse Persistence & Time Travel</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-7">
                Storage in <span className="text-white font-semibold">Apache Iceberg v2 tables on Amazon S3</span> via <span className="text-white font-semibold">AWS Glue Data Catalog</span>. Immutable commit history allows historical time-travel analysis via <span className="text-white font-semibold">Amazon Athena SQL</span>.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-border-subtle space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-700/50 flex items-center justify-center font-mono text-[10px]">
                  3
                </span>
                <span>Safe Corridor Routing & Geofence Verification</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-7">
                <span className="text-white font-semibold">Amazon Location Service Routes</span> dynamically queries active Iceberg hazard polygons. Shapely intersection engine verifies exposure and calculates safe bypass detours.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="p-3 rounded-lg bg-slate-900/80 border border-border-subtle space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-300">
                <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center font-mono text-[10px]">
                  4
                </span>
                <span>Municipal Intervention & Verified Resolution</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-7">
                Emergency dewatering trucks mobilized based on transparent multi-factor scoring. Field resolution triggers an atomic <span className="text-white font-semibold">Athena MERGE INTO</span> query, updating the table and producing a new verifiable Lakehouse snapshot.
              </p>
            </div>
          </div>
        </div>

        {/* AWS Service Matrix */}
        <div className="space-y-3 pt-2 border-t border-border-subtle">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            AWS Services Applied
          </h3>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded bg-slate-900/60 border border-border-subtle">
              <span className="text-blue-300 font-semibold block">Amazon S3</span>
              <span className="text-[11px] text-gray-400 font-sans">Data Lake storage for Parquet & Iceberg metadata</span>
            </div>

            <div className="p-2.5 rounded bg-slate-900/60 border border-border-subtle">
              <span className="text-cyan-300 font-semibold block">Amazon Athena</span>
              <span className="text-[11px] text-gray-400 font-sans">Serverless SQL engine for time-travel queries & mutations</span>
            </div>

            <div className="p-2.5 rounded bg-slate-900/60 border border-border-subtle">
              <span className="text-amber-300 font-semibold block">Amazon Location Maps</span>
              <span className="text-[11px] text-gray-400 font-sans">Dark cartographic base tile provider & rendering</span>
            </div>

            <div className="p-2.5 rounded bg-slate-900/60 border border-border-subtle">
              <span className="text-emerald-300 font-semibold block">Amazon Location Routes</span>
              <span className="text-[11px] text-gray-400 font-sans">Hazard-aware arterial routing & avoidance engine</span>
            </div>
          </div>
        </div>

        {/* Honest Architecture Disclosure */}
        <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-800/40 text-[11px] text-blue-200 space-y-1">
          <span className="font-bold text-white block">Execution Mode Separation:</span>
          <p className="leading-relaxed text-gray-300">
            CivicPulse guarantees reproducible local evaluation in Demo Mode using deterministic Madurai lakehouse fixtures and real Shapely geometric calculations. When live AWS credentials and S3/Athena/Location resources are configured, it transparently executes genuine AWS API calls.
          </p>
        </div>
      </div>
    </div>
  );
};
