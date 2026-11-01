import { create } from 'zustand';
import {
  Hazard,
  Place,
  RouteCompareResponse,
  IcebergSnapshot,
  HazardPriorityScore,
  DispatchRecord,
  OperationalEvent,
  FilterState
} from '../types';

export type WorkspaceId =
  | 'command'
  | 'routing'
  | 'hazards'
  | 'timeline'
  | 'operations'
  | 'analytics'
  | 'architecture';

export type ContextualPanelType =
  | 'hazard-detail'
  | 'route-compare'
  | 'dispatch-fleet'
  | 'timeline-detail'
  | null;

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  message: string;
}

interface AppStoreState {
  // Navigation & Shell
  activeWorkspace: WorkspaceId;
  setActiveWorkspace: (ws: WorkspaceId) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Contextual Panels
  activePanel: ContextualPanelType;
  setActivePanel: (panel: ContextualPanelType) => void;
  closePanel: () => void;

  // Selected Entities
  selectedHazardId: string | null;
  setSelectedHazardId: (id: string | null) => void;
  selectedHazard: Hazard | null;
  setSelectedHazard: (hazard: Hazard | null) => void;

  // Hazards & Filters
  hazards: Hazard[];
  setHazards: (hazards: Hazard[]) => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  toggleFilter: (key: keyof FilterState) => void;

  // Routing
  originPlace: Place | null;
  setOriginPlace: (p: Place | null) => void;
  destPlace: Place | null;
  setDestPlace: (p: Place | null) => void;
  routeComparison: RouteCompareResponse | null;
  setRouteComparison: (res: RouteCompareResponse | null) => void;
  isRoutingLoading: boolean;
  setIsRoutingLoading: (loading: boolean) => void;

  // Timeline / Iceberg
  snapshots: IcebergSnapshot[];
  setSnapshots: (sn: IcebergSnapshot[]) => void;
  currentSnapshotIndex: number;
  setCurrentSnapshotIndex: (idx: number) => void;
  isSnapshotLoading: boolean;
  setIsSnapshotLoading: (loading: boolean) => void;

  // Municipal Operations
  priorities: HazardPriorityScore[];
  setPriorities: (p: HazardPriorityScore[]) => void;
  activeDispatch: DispatchRecord | null;
  setActiveDispatch: (d: DispatchRecord | null) => void;
  vehiclePosition: [number, number] | null;
  setVehiclePosition: (pos: [number, number] | null) => void;
  isResolving: boolean;
  setIsResolving: (val: boolean) => void;

  // Events & Health
  events: OperationalEvent[];
  setEvents: (events: OperationalEvent[]) => void;
  isBackendHealthy: boolean;
  setIsBackendHealthy: (healthy: boolean) => void;
  isLocationConnected: boolean;
  setIsLocationConnected: (val: boolean) => void;
  isIcebergConnected: boolean;
  setIsIcebergConnected: (val: boolean) => void;
  operatingMode: 'live' | 'demo';
  setOperatingMode: (mode: 'live' | 'demo') => void;

  // Toast System
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'warning' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Video Modal
  isVideoModalOpen: boolean;
  setIsVideoModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  // Navigation
  activeWorkspace: 'command',
  setActiveWorkspace: (activeWorkspace) => {
    set({ activeWorkspace });
    // Adjust contextual panel automatically based on workspace
    if (activeWorkspace === 'routing') {
      set({ activePanel: 'route-compare' });
    } else if (activeWorkspace === 'operations') {
      set({ activePanel: 'dispatch-fleet' });
    } else if (activeWorkspace === 'command' && !get().selectedHazard) {
      set({ activePanel: null });
    }
  },
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),

  // Contextual Panels
  activePanel: null,
  setActivePanel: (activePanel) => set({ activePanel }),
  closePanel: () => set({ activePanel: null }),

  // Selected Entities
  selectedHazardId: null,
  setSelectedHazardId: (id) => {
    set({ selectedHazardId: id });
    if (id) {
      const hazard = get().hazards.find((h) => h.hazard_id === id) || null;
      set({ selectedHazard: hazard, activePanel: 'hazard-detail' });
    }
  },
  selectedHazard: null,
  setSelectedHazard: (selectedHazard) => {
    set({
      selectedHazard,
      selectedHazardId: selectedHazard ? selectedHazard.hazard_id : null,
      activePanel: selectedHazard ? 'hazard-detail' : get().activePanel
    });
  },

  // Hazards & Filters
  hazards: [],
  setHazards: (hazards) => set({ hazards }),
  filters: {
    showFloods: true,
    showWaste: true,
    showDebris: true,
    showResolved: true,
    showSimulated: true,
    showVerified: true,
    showExtrusion3D: true,
  },
  setFilters: (filters) => set({ filters }),
  toggleFilter: (key) =>
    set((state) => ({
      filters: { ...state.filters, [key]: !state.filters[key] }
    })),

  // Routing
  originPlace: null,
  setOriginPlace: (originPlace) => set({ originPlace }),
  destPlace: null,
  setDestPlace: (destPlace) => set({ destPlace }),
  routeComparison: null,
  setRouteComparison: (routeComparison) => set({ routeComparison }),
  isRoutingLoading: false,
  setIsRoutingLoading: (isRoutingLoading) => set({ isRoutingLoading }),

  // Timeline
  snapshots: [],
  setSnapshots: (snapshots) => set({ snapshots }),
  currentSnapshotIndex: 3,
  setCurrentSnapshotIndex: (currentSnapshotIndex) => set({ currentSnapshotIndex }),
  isSnapshotLoading: false,
  setIsSnapshotLoading: (isSnapshotLoading) => set({ isSnapshotLoading }),

  // Municipal Operations
  priorities: [],
  setPriorities: (priorities) => set({ priorities }),
  activeDispatch: null,
  setActiveDispatch: (activeDispatch) => set({ activeDispatch }),
  vehiclePosition: null,
  setVehiclePosition: (vehiclePosition) => set({ vehiclePosition }),
  isResolving: false,
  setIsResolving: (isResolving) => set({ isResolving }),

  // Events & Health
  events: [],
  setEvents: (events) => set({ events }),
  isBackendHealthy: true,
  setIsBackendHealthy: (isBackendHealthy) => set({ isBackendHealthy }),
  isLocationConnected: true,
  setIsLocationConnected: (isLocationConnected) => set({ isLocationConnected }),
  isIcebergConnected: true,
  setIsIcebergConnected: (isIcebergConnected) => set({ isIcebergConnected }),
  operatingMode: 'live',
  setOperatingMode: (operatingMode) => set({ operatingMode }),

  // Toast System
  toasts: [],
  showToast: (message, type = 'info') => {
    const id = String(Date.now() + Math.random());
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }));
    setTimeout(() => {
      get().removeToast(id);
    }, 4500);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  // Video Modal
  isVideoModalOpen: false,
  setIsVideoModalOpen: (isVideoModalOpen) => set({ isVideoModalOpen })
}));

