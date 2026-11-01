import React from 'react';
import { X } from 'lucide-react';

interface ArchitectureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureDrawer: React.FC<ArchitectureDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 select-none">
      <div className="bg-surface w-full max-w-xl h-full p-6 overflow-y-auto space-y-6 border-l border-terminal-border text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
          <div>
            <h2 className="text-sm font-semibold text-white">
              CivicPulse Lakehouse Architecture
            </h2>
            <p className="text-[11px] text-terminal-muted font-mono">Madurai Spatial Lakehouse · AWS Architecture</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-terminal-muted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Decision Stages */}
        <div className="space-y-3">
          <div className="text-[11px] font-medium uppercase tracking-wider text-terminal-muted">
            The 4-Stage Geospatial Decision Cycle
          </div>

          <div className="space-y-2">
            {/* Stage 1 */}
            <div className="p-3 bg-ground border border-terminal-border space-y-1">
              <div className="text-xs font-semibold text-white">
                1. Observe Geographic Hazards
              </div>
              <p className="text-[11px] text-terminal-muted leading-relaxed">
                Multi-source telemetry ingestion from SmartCity IoT water-level sensors, municipal ward logs, and citizen crowdsourced reports across Madurai.
              </p>
            </div>

            {/* Stage 2 */}
            <div className="p-3 bg-ground border border-terminal-border space-y-1">
              <div className="text-xs font-semibold text-white">
                2. Lakehouse Persistence & Time Travel
              </div>
              <p className="text-[11px] text-terminal-muted leading-relaxed">
                Hazard polygons and incident states persist directly into Apache Iceberg v2 tables on Amazon S3 via AWS Glue Data Catalog. Queryable with point-in-time snapshots in Amazon Athena.
              </p>
            </div>

            {/* Stage 3 */}
            <div className="p-3 bg-ground border border-terminal-border space-y-1">
              <div className="text-xs font-semibold text-white">
                3. Hazard-Aware Route Exposure
              </div>
              <p className="text-[11px] text-terminal-muted leading-relaxed">
                Calculates commuter routes using Amazon Location Service Routes and performs Shapely polygon intersection analysis to detect road inundation breaches and compute safe bypass corridors.
              </p>
            </div>

            {/* Stage 4 */}
            <div className="p-3 bg-ground border border-terminal-border space-y-1">
              <div className="text-xs font-semibold text-white">
                4. Prioritize & Verify Response
              </div>
              <p className="text-[11px] text-terminal-muted leading-relaxed">
                Multi-factor scoring prioritizes municipal pumping crews. Interventions trigger an Athena MERGE INTO query, committing an immutable snapshot that reopens corridors.
              </p>
            </div>
          </div>
        </div>

        {/* AWS Infrastructure Inventory */}
        <div className="space-y-2 pt-2 border-t border-terminal-border">
          <div className="text-[11px] font-medium uppercase tracking-wider text-terminal-muted">
            Deployed Cloud Resources (AWS ap-south-1)
          </div>

          <table className="w-full text-[11px] font-mono border-collapse tabular-nums">
            <tbody className="divide-y divide-rule">
              <tr>
                <td className="py-2 text-terminal-muted font-sans">Amazon S3 Lakehouse</td>
                <td className="py-2 text-white">s3://civicpulse-lakehouse-979342849987-ap-south-1</td>
              </tr>
              <tr>
                <td className="py-2 text-terminal-muted font-sans">Apache Iceberg Table</td>
                <td className="py-2 text-white">civicpulse_db.civic_hazards_iceberg</td>
              </tr>
              <tr>
                <td className="py-2 text-terminal-muted font-sans">Amazon Athena Workgroup</td>
                <td className="py-2 text-white">civicpulse-workgroup (Engine v3)</td>
              </tr>
              <tr>
                <td className="py-2 text-terminal-muted font-sans">Amazon Location Map</td>
                <td className="py-2 text-white">CivicPulseMaduraiMap (Esri Dark Canvas)</td>
              </tr>
              <tr>
                <td className="py-2 text-terminal-muted font-sans">Location Geofences</td>
                <td className="py-2 text-white">CivicPulseMaduraiGeofences (4 Polygons)</td>
              </tr>
              <tr>
                <td className="py-2 text-terminal-muted font-sans">EventBridge Rule</td>
                <td className="py-2 text-white">CivicPulse-GeofenceBreachRule</td>
              </tr>
              <tr>
                <td className="py-2 text-terminal-muted font-sans">Lambda Handler</td>
                <td className="py-2 text-white">CivicPulse-GeofenceEventHandler</td>
              </tr>
            </tbody>
          </table>
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
