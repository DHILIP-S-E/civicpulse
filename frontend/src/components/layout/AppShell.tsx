import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { ToastContainer } from './ToastContainer';
import { OperationsMap } from '../map/OperationsMap';
import { MapLegend } from '../map/MapLegend';
import { ContextualPanel } from '../panels/ContextualPanel';
import { HazardInspectorPanel } from '../panels/HazardInspectorPanel';
import { GeofenceSimulatorModal } from '../municipal/GeofenceSimulatorModal';

// Workspaces
import { CommandCenterWorkspace } from '../workspaces/CommandCenterWorkspace';
import { RoutingWorkspace } from '../workspaces/RoutingWorkspace';
import { HazardManagementWorkspace } from '../workspaces/HazardManagementWorkspace';
import { HistoricalTimelineWorkspace } from '../workspaces/HistoricalTimelineWorkspace';
import { MunicipalOperationsWorkspace } from '../workspaces/MunicipalOperationsWorkspace';
import { AnalyticsWorkspace } from '../workspaces/AnalyticsWorkspace';
import { ArchitectureWorkspace } from '../workspaces/ArchitectureWorkspace';

import { api } from '../../services/api';
import { Hazard } from '../../types';

export const AppShell: React.FC = () => {
  const {
    activeWorkspace,
    hazards,
    selectedHazard,
    setSelectedHazard,
    routeComparison,
    vehiclePosition,
    originPlace,
    destPlace,
    filters,
    setEvents
  } = useAppStore();

  const [isGeofenceModalOpen, setIsGeofenceModalOpen] = useState(false);

  // Filter visible hazards
  const visibleHazards = hazards.filter((h) => {
    if (h.status === 'RESOLVED' && !filters.showResolved) return false;
    if (h.hazard_type === 'FLOOD' && !filters.showFloods) return false;
    if (h.hazard_type === 'WASTE_OVERFLOW' && !filters.showWaste) return false;
    if ((h.hazard_type === 'DEBRIS' || h.hazard_type === 'ROAD_DAMAGE') && !filters.showDebris) return false;
    return true;
  });

  const handleRunGeofenceSimulation = async (hazard: Hazard, isInside: boolean) => {
    const coords = isInside
      ? [hazard.longitude, hazard.latitude]
      : [hazard.longitude + 0.015, hazard.latitude + 0.015];

    const res = await api.evaluatePosition({
      device_id: 'DEV-COMMUTER-MDU-99',
      longitude: coords[0],
      latitude: coords[1],
      position_timestamp: new Date().toISOString()
    });

    const ev = await api.getEvents();
    setEvents(ev);
    return res;
  };

  // Render the active workspace panel content
  const renderWorkspaceContent = () => {
    switch (activeWorkspace) {
      case 'command':
        return <CommandCenterWorkspace />;
      case 'routing':
        return <RoutingWorkspace />;
      case 'hazards':
        return <HazardManagementWorkspace />;
      case 'timeline':
        return <HistoricalTimelineWorkspace />;
      case 'operations':
        return <MunicipalOperationsWorkspace />;
      case 'analytics':
        return <AnalyticsWorkspace />;
      case 'architecture':
        return <ArchitectureWorkspace />;
      default:
        return <CommandCenterWorkspace />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F5F7FA]">
      {/* Global Top Header */}
      <TopHeader />

      {/* Main Workspace Frame with Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Multi-Panel Map Workspace */}
        <div className="flex-1 relative flex overflow-hidden">
          {/* Persistent Left Operational Control Panel (370px) */}
          <aside className="w-[370px] z-10 h-full bg-white border-r border-[#E2E8F0] flex flex-col p-4 space-y-4 overflow-y-auto select-none shadow-xs shrink-0">
            {renderWorkspaceContent()}
          </aside>

          {/* Central GIS Map Canvas */}
          <main className="flex-1 relative h-full">
            <OperationsMap
              hazards={visibleHazards}
              selectedHazard={selectedHazard}
              onSelectHazard={(h) => setSelectedHazard(h)}
              standardRoute={routeComparison?.standard_route || null}
              safeRoute={routeComparison?.hazard_avoiding_route || null}
              vehiclePosition={vehiclePosition}
              originCoords={originPlace ? [originPlace.longitude, originPlace.latitude] : null}
              destCoords={destPlace ? [destPlace.longitude, destPlace.latitude] : null}
              showExtrusion3D={filters.showExtrusion3D}
            />

            {/* Contextual Right Inspector (Opens when hazard is selected) */}
            {selectedHazard && (
              <ContextualPanel
                title={selectedHazard.location_name}
                subtitle={`${selectedHazard.hazard_id} - ${selectedHazard.severity} ${selectedHazard.hazard_type}`}
                onClose={() => setSelectedHazard(null)}
                position="right"
                width="w-[360px]"
              >
                <HazardInspectorPanel
                  onOpenGeofenceModal={() => setIsGeofenceModalOpen(true)}
                />
              </ContextualPanel>
            )}

            {/* Map Operational Legend */}
            <MapLegend />
          </main>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Geofence Breach Simulator Modal */}
      <GeofenceSimulatorModal
        isOpen={isGeofenceModalOpen}
        onClose={() => setIsGeofenceModalOpen(false)}
        hazard={selectedHazard}
        onRunSimulation={handleRunGeofenceSimulation}
      />
    </div>
  );
};

