import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Droplets,
  Radio,
  Clock,
  MapPin,
  Truck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';

interface HazardInspectorPanelProps {
  onOpenGeofenceModal: () => void;
}

export const HazardInspectorPanel: React.FC<HazardInspectorPanelProps> = ({
  onOpenGeofenceModal
}) => {
  const {
    selectedHazard,
    setSelectedHazard,
    setActiveWorkspace,
    setActiveDispatch,
    showToast,
    hazards,
    setHazards,
    setVehiclePosition
  } = useAppStore();

  if (!selectedHazard) return null;

  const isResolved = selectedHazard.status === 'RESOLVED';
  const isCritical = selectedHazard.severity === 'CRITICAL';
  const depth = selectedHazard.water_depth_cm || 0;

  let impactText = 'Road passable with caution';
  if (isResolved) {
    impactText = 'Road cleared and fully reopened for traffic';
  } else if (depth >= 40) {
    impactText = 'Road impassable - Avoid area completely';
  } else if (depth >= 20) {
    impactText = 'High risk - Two-wheelers and compact cars blocked';
  }

  const handleDispatchCrew = async () => {
    try {
      const record = await api.createDispatch({
        hazard_id: selectedHazard.hazard_id,
        truck_type: 'SUPER_SUCKER',
        crew_id: 'CREW-MDU-WEST-04'
      });
      setActiveDispatch(record);
      setActiveWorkspace('operations');
      showToast(`Super-sucker unit dispatched to ${selectedHazard.location_name}`, 'success');

      if (record.vehicle_path && record.vehicle_path.length > 0) {
        setVehiclePosition(record.vehicle_path[0]);
      }
    } catch (err: any) {
      showToast(`Dispatch notice: ${err.message}`, 'warning');
    }
  };

  return (
    <div className="space-y-4">
      {/* Hazard Status & Severity Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#64748B] tracking-wide">
            {selectedHazard.hazard_id}
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
              isResolved
                ? 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/30'
                : isCritical
                ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30'
                : 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]/30'
            }`}
          >
            {isResolved ? 'Resolved' : selectedHazard.severity}
          </span>
        </div>

        <h3 className="text-sm font-bold text-[#172033] leading-snug">
          {selectedHazard.location_name}
        </h3>
      </div>

      {/* Reported Water Depth Card */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between ${
          isResolved
            ? 'bg-[#F0FDF4] border-[#16A34A]/30'
            : isCritical
            ? 'bg-[#FEF2F2] border-[#DC2626]/30'
            : 'bg-[#FFFBEB] border-[#D97706]/30'
        }`}
      >
        <div className="space-y-0.5">
          <div className="text-[11px] font-semibold text-[#64748B] flex items-center space-x-1.5">
            <Droplets
              className={`w-3.5 h-3.5 ${
                isResolved
                  ? 'text-[#16A34A]'
                  : isCritical
                  ? 'text-[#DC2626]'
                  : 'text-[#D97706]'
              }`}
            />
            <span>Reported Water Depth</span>
          </div>
          <div className="text-2xl font-bold text-[#172033] tabular-nums tracking-tight">
            {isResolved ? '0 cm' : `${depth} cm`}
          </div>
          <div className="text-[11px] font-medium text-[#64748B]">{impactText}</div>
        </div>
      </div>

      {/* Sensor & Spatial Telemetry Details */}
      <div className="space-y-2.5 text-xs border-t border-[#E2E8F0] pt-3">
        <div className="flex items-center justify-between text-[#64748B]">
          <span className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-[#1677FF]" />
            <span>Detection Source</span>
          </span>
          <span className="text-[#172033] font-medium">IoT Ultrasonic Sensor</span>
        </div>

        <div className="flex items-center justify-between text-[#64748B]">
          <span className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Last Observed</span>
          </span>
          <span className="text-[#172033] font-medium">12 mins ago</span>
        </div>

        <div className="flex items-center justify-between text-[#64748B]">
          <span className="flex items-center space-x-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Coordinates</span>
          </span>
          <span className="text-[#172033] font-mono tabular-nums">
            {selectedHazard.latitude.toFixed(4)}N, {selectedHazard.longitude.toFixed(4)}E
          </span>
        </div>

        <div className="flex items-center justify-between text-[#64748B]">
          <span>Confidence Score</span>
          <span className="text-[#16A34A] font-semibold">95% Verified</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
        {!isResolved && (
          <button
            onClick={handleDispatchCrew}
            className="w-full py-2.5 px-3 bg-[#1677FF] hover:bg-[#0958D9] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Dispatch Dewatering Tanker</span>
          </button>
        )}

        <button
          onClick={onOpenGeofenceModal}
          className="w-full py-2 px-3 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#172033] text-xs font-medium rounded-lg border border-[#E2E8F0] transition-colors flex items-center justify-center space-x-2 cursor-pointer"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-[#D97706]" />
          <span>Simulate Commuter Geofence Breach</span>
        </button>
      </div>
    </div>
  );
};

