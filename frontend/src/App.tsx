import React, { useState, useEffect, useRef } from 'react';
import {
  Hazard,
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
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

interface ToastNotice {
  id: string;
  type: 'success' | 'warning' | 'info';
  message: string;
}

export const App: React.FC = () => {
  // Navigation & Modes
  const [appMode, setAppMode] = useState<AppMode>('citizen');
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);

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
    showExtrusion3D: true, // 3D Extrusion enabled by default
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
  const [isSnapshotInspectorOpen, setIsSnapshotInspectorOpen] = useState(false);
  const [isGeofenceModalOpen, setIsGeofenceModalOpen] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<ToastNotice | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'info') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ id: String(Date.now()), type, message });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 4500);
  };

  const vehicleAnimInterval = useRef<any>(null);

  // 1. Initial Load: Health, Snapshots, Hazards, Events
  useEffect(() => {
    const initialize = async () => {
      try {
        const health = await api.getHealth();
        setIsBackendHealthy(health?.status === 'healthy');

        const sn = await api.getSnapshots();
        setSnapshots(sn);

        const hz = await api.getHazards();
        setHazards(hz);

        const prio = await api.getPriorities();
        setPriorities(prio);

        const ev = await api.getEvents();
        setEvents(ev);

        // Pre-select first hazard
        if (hz.length > 0) {
          setSelectedHazard(hz[0]);
        }
      } catch (err) {
        console.warn('Initial data load warning:', err);
      }
    };

    initialize();

    // Auto-refresh event log every 8s
    const eventPoll = setInterval(async () => {
      try {
        const ev = await api.getEvents();
        setEvents(ev);
      } catch (_) { }
    }, 8000);

    return () => clearInterval(eventPoll);
  }, []);

  // 2. Clear vehicle animation on unmount
  useEffect(() => {
    return () => {
      if (vehicleAnimInterval.current) clearInterval(vehicleAnimInterval.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // 3. Handle Route Calculation
  const handleCalculateRoute = async (
    origin: Place,
    destination: Place,
    profile: string,
    avoidHazards: boolean
  ) => {
    setIsRoutingLoading(true);
    try {
      const res = await api.compareRoutes({
        origin: { longitude: origin.longitude, latitude: origin.latitude },
        destination: { longitude: destination.longitude, latitude: destination.latitude },
        transport_profile: profile,
        avoid_hazards: avoidHazards
      });
      setRouteComparison(res);

      const ev = await api.getEvents();
      setEvents(ev);

      if (res.avoidance_successful) {
        showToast(`Safe Corridor found! Avoids all active flood zones (+${res.time_delta_minutes} min)`, 'success');
      } else {
        showToast('Direct arterial route crosses active flood zones. Exercise caution.', 'warning');
      }
    } catch (err: any) {
      showToast(`Route calculation completed with advisory: ${err.message}`, 'info');
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

      if (originPlace && destPlace) {
        handleCalculateRoute(originPlace, destPlace, 'Car', true);
      }

      const ev = await api.getEvents();
      setEvents(ev);

      showToast(`Loaded: ${targetSnap.stage_name} (${targetSnap.summary})`, 'info');
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

      showToast(`Super-sucker crew dispatched to ${target?.location_name || 'location'}!`, 'success');
    } catch (err: any) {
      showToast(`Dispatch notice: ${err.message}`, 'warning');
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

      const hz = await api.getHazards();
      setHazards(hz);

      const prio = await api.getPriorities();
      setPriorities(prio);

      const sn = await api.getSnapshots();
      setSnapshots(sn);

      if (originPlace && destPlace) {
        handleCalculateRoute(originPlace, destPlace, 'Car', true);
      }

      if (selectedHazard && selectedHazard.hazard_id === hazardId) {
        const updated = hz.find(h => h.hazard_id === hazardId);
        if (updated) setSelectedHazard(updated);
      }

      const ev = await api.getEvents();
      setEvents(ev);

      showToast('Road cleared! City map updated and safe corridor reopened.', 'success');
    } catch (err: any) {
      showToast(`Resolution note: ${err.message}`, 'warning');
    } finally {
      setIsResolving(false);
    }
  };

  // 7. Handle Geofence Simulation
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

  const visibleHazards = hazards.filter(h => {
    if (h.status === 'RESOLVED' && !filters.showResolved) return false;
    if (h.hazard_type === 'FLOOD' && !filters.showFloods) return false;
    if (h.hazard_type === 'WASTE_OVERFLOW' && !filters.showWaste) return false;
    if ((h.hazard_type === 'DEBRIS' || h.hazard_type === 'ROAD_DAMAGE') && !filters.showDebris) return false;
    return true;
  });

  const activeSnapshot = snapshots[currentSnapshotIndex] || snapshots[0];

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-ground relative">
      {/* Non-intrusive Toast Notification Banner */}
      {toast && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200 select-none bg-[#111827] text-white border-[rgba(148,163,184,0.25)]">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span className="leading-snug">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-0.5 text-slate-400 hover:text-white rounded ml-2 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <TopHeader
        appMode={appMode}
        setAppMode={setAppMode}
        isBackendHealthy={isBackendHealthy}
        activeSnapshotStage={activeSnapshot?.stage_name}
      />

      {/* Main Spatial Workspace */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Left Operational Control Panel (360px) */}
        <aside className="w-[360px] z-10 h-full bg-surface border-r border-terminal-border flex flex-col p-4 space-y-4 overflow-y-auto select-none">
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
        <aside className="w-[340px] z-10 h-full bg-surface border-l border-terminal-border flex flex-col p-4 space-y-4 overflow-y-auto select-none">
          {appMode === 'citizen' ? (
            <>
              <div className="flex-1">
                <HazardInspector
                  hazard={selectedHazard}
                  onSimulateBreach={() => setIsGeofenceModalOpen(true)}
                  onDispatchToHazard={(h) => handleDispatch(h.hazard_id)}
                />
              </div>

              <div className="pt-2 border-t border-terminal-border">
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

              <div className="pt-2 border-t border-terminal-border">
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
    </div>
  );
};

export default App;
