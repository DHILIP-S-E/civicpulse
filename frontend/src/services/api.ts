import {
  Hazard,
  HazardSummary,
  Place,
  RouteCompareResponse,
  IcebergSnapshot,
  HazardPriorityScore,
  DispatchRecord,
  OperationalEvent
} from '../types';

const API_BASE = '/api';

export const api = {
  // Health
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  getAwsHealth: async () => {
    const res = await fetch(`${API_BASE}/health/aws`);
    return res.json();
  },

  // Places
  searchPlaces: async (q: string): Promise<Place[]> => {
    const res = await fetch(`${API_BASE}/places/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    return data.results || [];
  },

  // Hazards
  getHazards: async (includeResolved = true): Promise<Hazard[]> => {
    const res = await fetch(`${API_BASE}/hazards?include_resolved=${includeResolved}`);
    return res.json();
  },

  getHazardSummary: async (): Promise<HazardSummary> => {
    const res = await fetch(`${API_BASE}/hazards/summary`);
    return res.json();
  },

  // Routes
  compareRoutes: async (payload: {
    origin: { longitude: number; latitude: number };
    destination: { longitude: number; latitude: number };
    transport_profile?: string;
    avoid_hazards?: boolean;
  }): Promise<RouteCompareResponse> => {
    const res = await fetch(`${API_BASE}/routes/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        transport_profile: payload.transport_profile || 'Car',
        avoid_hazards: payload.avoid_hazards ?? true
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Routing calculation failed');
    }
    return res.json();
  },

  // Geofences
  evaluatePosition: async (payload: {
    device_id: string;
    longitude: number;
    latitude: number;
    position_timestamp: string;
  }) => {
    const res = await fetch(`${API_BASE}/geofences/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  syncGeofences: async () => {
    const res = await fetch(`${API_BASE}/geofences/sync`, { method: 'POST' });
    return res.json();
  },

  // Iceberg
  getSnapshots: async (): Promise<IcebergSnapshot[]> => {
    const res = await fetch(`${API_BASE}/iceberg/snapshots`);
    return res.json();
  },

  querySnapshot: async (snapshotId: string) => {
    const res = await fetch(`${API_BASE}/iceberg/query-snapshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot_id: snapshotId }),
    });
    return res.json();
  },

  resolveHazard: async (payload: {
    hazard_id: string;
    dispatch_id?: string;
    notes?: string;
  }) => {
    const res = await fetch(`${API_BASE}/iceberg/resolve-hazard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Hazard resolution failed');
    }
    return res.json();
  },

  // Municipal
  getPriorities: async (): Promise<HazardPriorityScore[]> => {
    const res = await fetch(`${API_BASE}/municipal/priorities`);
    return res.json();
  },

  createDispatch: async (payload: {
    hazard_id: string;
    truck_type?: string;
    crew_id?: string;
  }): Promise<DispatchRecord> => {
    const res = await fetch(`${API_BASE}/municipal/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Dispatch failed');
    }
    return res.json();
  },

  // Events
  getEvents: async (): Promise<OperationalEvent[]> => {
    const res = await fetch(`${API_BASE}/events`);
    return res.json();
  },
};

