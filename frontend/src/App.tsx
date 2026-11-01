import React, { useState, useEffect, useRef } from 'react';
import {
  Hazard,
  HazardSummary,
  Place,
  RouteCompareResponse,
  IcebergSnapshot,
  HazardPriorityScore,
  DispatchRecord,
  OperationalEvent,
  AppMode,
  FilterState
} from './types';
import { api } from './services/api';

// Components
import { TopHeader } from './components/layout/TopHeader';
import { OperationsMap } from './components/map/OperationsMap';
import { MapLegend } from './components/map/MapLegend';
import { OriginDestinationSelector } from './components/routing/OriginDestinationSelector';
import { RouteComparisonCard } from './components/routing/RouteComparisonCard';
import { HazardFilterPanel } from './components/hazards/HazardFilterPanel';
import { HazardInspector } from './components/hazards/HazardInspector';
import { EventStream } from './components/layout/EventStream';
import { StormTimeline } from './components/timeline/StormTimeline';
import { SnapshotInspector } from './components/timeline/SnapshotInspector';
import { PriorityRanking } from './components/municipal/PriorityRanking';
import { MunicipalDispatchPanel } from './components/municipal/MunicipalDispatchPanel';
import { GeofenceSimulatorModal } from './components/municipal/GeofenceSimulatorModal';
import { ArchitectureDrawer } from './components/architecture/ArchitectureDrawer';

export const App: React.FC = () => {
  // Navigation & Modes
  const [appMode, setAppMode] = useState<AppMode>('citizen');
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);
  const [isAwsConnected, setIsAwsConnected] = useState(false);

  // Hazards State
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [selectedHazard, setSelectedHazard] = useState<Hazard | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    showFloods: true,
    showWaste: true,
    showDebris: true,
    showResolved: true,
    showSimulated: true,
    showVerified: true,
    showExtrusion3D: false,
  });

  // Routing State
  const [originPlace, setOriginPlace] = useState<Place | null>(null);
  const [destPlace, setDestPlace] = useState<Place | null>(null);
  const [routeComparison, setRouteComparison] = useState<RouteCompareResponse | null>(null);
  const [isRoutingLoading, setIsRoutingLoading] = useState(false);

  // Iceberg Snapshots & Timeline
  const [snapshots, setSnapshots] = useState<IcebergSnapshot[]>([]);
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(3); // Start on latest
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(false);
  const [lastExecutedSql, setLastExecutedSql] = useState<string>('');

  // Municipal Operations
  const [priorities, setPriorities] = useState<HazardPriorityScore[]>([]);
  const [activeDispatch, setActiveDispatch] = useState<DispatchRecord | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [vehiclePosition, setVehiclePosition] = useState<[number, number] | null>(null);

  // Operational Event Stream
  const [events, setEvents] = useState<OperationalEvent[]>([]);

  // Modals & Drawers
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isSnapshotInspectorOpen, setIsSnapshotInspectorOpen] = useState(false);
  const [isGeofenceModalOpen, setIsGeofenceModalOpen] = useState(false);

  const vehicleAnimInterval = useRef<any>(null);

  // 1. Initial Load: Health, Snapshots, Hazards, Events
  useEffect(() => {
    const initialize = async () => {
      try {
        const health = await api.getHealth();
        setIsBackendHealthy(health.status === 'healthy');

        const awsHealth = await api.getAwsHealth().catch(() => null);
        if (awsHealth && awsHealth.overall_status === 'CONNECTED') {
          setIsAwsConnected(true);
        }

        const sn = await api.getSnapshots();
        setSnapshots(sn);

        const hz = await api.getHazards();
        setHazards(hz);

        const prio = await api.getPriorities();
        setPriorities(prio);

        const ev = await api.getEvents();
        setEvents(ev);
      } catch (err) {
        console.warn('Initial backend fetch warning:', err);
      }
    };

    initialize();
  }, []);

  // 2. Poll Operational Events every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const ev = await api.getEvents();
        setEvents(ev);
      } catch (e) {
        // quiet
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // 3. Handle Route Compare
  const handleCalculateRoute = async (
    origin: Place,
    dest: Place,
    profile: string,
    avoidHazards: boolean
  ) => {
    setIsRoutingLoading(true);
    try {
      const res = await api.compareRoutes({
        origin: { longitude: origin.longitude, latitude: origin.latitude },
        destination: { longitude: dest.longitude, latitude: dest.latitude },
        transport_profile: profile,
        avoid_hazards: avoidHazards,
      });
      setRouteComparison(res);

      // Refresh events
      const ev = await api.getEvents();
      setEvents(ev);
    } catch (err: any) {
      alert(`Route calculation error: ${err.message}`);
    } finally {
      setIsRoutingLoading(false);
    }
  };

  // 4. Handle Timeline Stage Switch (Time Travel Query)
  const handleSelectSnapshot = async (index: number) => {
    setCurrentSnapshotIndex(index);
    const targetSnap = snapshots[index];
    if (!targetSnap) return;

    setIsSnapshotLoading(true);
    try {
      const queryRes = await api.querySnapshot(targetSnap.snapshot_id);
      setHazards(queryRes.hazards);
      setLastExecutedSql(queryRes.query_executed);

      // If route comparison exists, re-evaluate route intersections against the new snapshot
      if (originPlace && destPlace) {
        handleCalculateRoute(originPlace, destPlace, 'Car', true);
      }

      const ev = await api.getEvents();
      setEvents(ev);
    } catch (err) {
      console.error('Snapshot time travel error:', err);
    } finally {
      setIsSnapshotLoading(false);
    }
  };

  // 5. Handle Dispatch Municipal Unit
  const handleDispatch = async (hazardId: string) => {
    try {
      const target = hazards.find(h => h.hazard_id === hazardId) || null;
      if (target) setSelectedHazard(target);

      const record = await api.createDispatch({
        hazard_id: hazardId,
        truck_type: 'SUPER_SUCKER',
        crew_id: 'CREW-MDU-WEST-04'
      });
      setActiveDispatch(record);
      setAppMode('municipal');

      // Animate truck marker along route path
      if (vehicleAnimInterval.current) clearInterval(vehicleAnimInterval.current);
      if (record.vehicle_path && record.vehicle_path.length > 0) {
        let step = 0;
        setVehiclePosition(record.vehicle_path[0]);
        vehicleAnimInterval.current = setInterval(() => {
          step++;
          if (step < record.vehicle_path.length) {
            setVehiclePosition(record.vehicle_path[step]);
          } else {
            clearInterval(vehicleAnimInterval.current);
          }
        }, 120);
      }

      const ev = await api.getEvents();
      setEvents(ev);
    } catch (err: any) {
      alert(`Dispatch error: ${err.message}`);
    }
  };

  // 6. Handle Hazard Resolution via Athena MERGE INTO
  const handleResolveHazard = async (hazardId: string, dispatchId?: string) => {
    setIsResolving(true);
    try {
      await api.resolveHazard({
        hazard_id: hazardId,
        dispatch_id: dispatchId,
        notes: 'Cleared by Madurai Corporation Dewatering Tanker Unit 04'
      });

      // Refresh hazards & priorities
      const hz = await api.getHazards();
      setHazards(hz);

      const prio = await api.getPriorities();
      setPriorities(prio);

      const sn = await api.getSnapshots();
      setSnapshots(sn);

      // Re-query route if present
      if (originPlace && destPlace) {
        handleCalculateRoute(originPlace, destPlace, 'Car', true);
      }

      if (selectedHazard && selectedHazard.hazard_id === hazardId) {
        const updated = hz.find(h => h.hazard_id === hazardId);
        if (updated) setSelectedHazard(updated);
      }

      const ev = await api.getEvents();
      setEvents(ev);
    } catch (err: any) {
      alert(`Resolution error: ${err.message}`);
    } finally {
      setIsResolving(false);
    }
  };

  // 7. Handle Geofence Simulation
  const handleRunGeofenceSimulation = async (hazard: Hazard, isInside: boolean) => {
    // Pick point inside or outside hazard polygon
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

  // Filter visible hazards on the map
  const visibleHazards = hazards.filter(h => {
    if (h.status === 'RESOLVED' && !filters.showResolved) return false;
    if (h.hazard_type === 'FLOOD' && !filters.showFloods) return false;
    if (h.hazard_type === 'WASTE_OVERFLOW' && !filters.showWaste) return false;
    if ((h.hazard_type === 'DEBRIS' || h.hazard_type === 'ROAD_DAMAGE') && !filters.showDebris) return false;
    return true;
  });

  const activeSnapshot = snapshots[currentSnapshotIndex] || snapshots[0];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0B0F19]">
      {/* Top Header */}
      <TopHeader
        appMode={appMode}
        setAppMode={setAppMode}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        isBackendHealthy={isBackendHealthy}
        activeSnapshotStage={activeSnapshot?.stage_name}
        isAwsConnected={isAwsConnected}
      />

      {/* Main Spatial Workspace */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Left Operational Control Panel (360px) */}
        <aside className="w-[370px] z-10 h-full glass-panel border-r border-border-subtle flex flex-col p-3.5 space-y-3 overflow-y-auto select-none shadow-xl">
          {appMode === 'citizen' ? (
            <>
              <OriginDestinationSelector
                onCalculateRoute={handleCalculateRoute}
                isLoading={isRoutingLoading}
                selectedOrigin={originPlace}
                selectedDestination={destPlace}
                onSetOrigin={setOriginPlace}
                onSetDestination={setDestPlace}
              />

              {routeComparison && (
                <RouteComparisonCard comparison={routeComparison} />
              )}

              <HazardFilterPanel
                filters={filters}
                setFilters={setFilters}
              />
            </>
          ) : (
            <>
              <PriorityRanking
                priorities={priorities}
                onSelectHazardById={(id) => {
                  const h = hazards.find(item => item.hazard_id === id);
                  if (h) setSelectedHazard(h);
                }}
                onDispatch={handleDispatch}
                selectedHazardId={selectedHazard?.hazard_id}
              />

              <HazardFilterPanel
                filters={filters}
                setFilters={setFilters}
              />
            </>
          )}
        </aside>

        {/* Center: Interactive Map */}
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

          <MapLegend />

          {/* Floating 24-Hour Storm Timeline */}
          <StormTimeline
            snapshots={snapshots}
            currentSnapshotIndex={currentSnapshotIndex}
            onSelectSnapshot={handleSelectSnapshot}
            isLoading={isSnapshotLoading}
            onOpenSnapshotInspector={() => setIsSnapshotInspectorOpen(true)}
          />
        </main>

        {/* Right Inspector & Event Stream Panel (340px) */}
        <aside className="w-[350px] z-10 h-full glass-panel border-l border-border-subtle flex flex-col p-3.5 space-y-3 overflow-y-auto select-none shadow-xl">
          {appMode === 'citizen' ? (
            <>
              <div className="flex-1">
                <HazardInspector
                  hazard={selectedHazard}
                  onSimulateBreach={() => setIsGeofenceModalOpen(true)}
                  onDispatchToHazard={(h) => handleDispatch(h.hazard_id)}
                />
              </div>

              <div className="pt-2 border-t border-border-subtle">
                <EventStream events={events} />
              </div>
            </>
          ) : (
            <>
              <div className="flex-1">
                <MunicipalDispatchPanel
                  dispatch={activeDispatch}
                  targetHazard={selectedHazard}
                  onResolveHazard={handleResolveHazard}
                  isResolving={isResolving}
                  onResetDispatch={() => {
                    setActiveDispatch(null);
                    setVehiclePosition(null);
                  }}
                />
              </div>

              <div className="pt-2 border-t border-border-subtle">
                <EventStream events={events} />
              </div>
            </>
          )}
        </aside>
      </div>

      {/* Modals & Overlays */}
      <SnapshotInspector
        isOpen={isSnapshotInspectorOpen}
        onClose={() => setIsSnapshotInspectorOpen(false)}
        snapshot={activeSnapshot || null}
        sqlExecuted={lastExecutedSql}
      />

      <GeofenceSimulatorModal
        isOpen={isGeofenceModalOpen}
        onClose={() => setIsGeofenceModalOpen(false)}
        hazard={selectedHazard}
        onRunSimulation={handleRunGeofenceSimulation}
      />

      <ArchitectureDrawer
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
};

export default App;
