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
import { localEngine } from './localEngine';

const API_BASE = '/api';

// Helper for fetch with automatic timeout and fallback
async function safeFetch<T>(url: string, options?: RequestInit, fallback?: () => T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (_) {
    // Backend unreachable or returned non-ok (e.g. S3 404 static hosting)
  }

  if (fallback) {
    return fallback();
  }
  throw new Error(`Request to ${url} failed and no fallback available`);
}

export const api = {
  // Health
  getHealth: async () => {
    return safeFetch(`${API_BASE}/health`, undefined, () => localEngine.getHealth());
  },

  getAwsHealth: async () => {
    return safeFetch(`${API_BASE}/health/aws`, undefined, () => localEngine.getAwsHealth());
  },

  // Places
  searchPlaces: async (q: string): Promise<Place[]> => {
    return safeFetch(`${API_BASE}/places/search?q=${encodeURIComponent(q)}`, undefined, () => []);
  },

  // Hazards
  getHazards: async (includeResolved = true): Promise<Hazard[]> => {
    return safeFetch(
      `${API_BASE}/hazards?include_resolved=${includeResolved}`,
      undefined,
      () => localEngine.getHazards(includeResolved)
    );
  },

  getHazardSummary: async (): Promise<HazardSummary> => {
    return safeFetch(`${API_BASE}/hazards/summary`, undefined, () => {
      const all = localEngine.getHazards(true);
      const active = all.filter(h => h.status !== 'RESOLVED');
      return {
        total_hazards: all.length,
        active_hazards: active.length,
        investigating_hazards: 0,
        resolved_hazards: all.filter(h => h.status === 'RESOLVED').length,
        critical_severity_count: active.filter(h => h.severity === 'CRITICAL').length,
        moderate_severity_count: active.filter(h => h.severity === 'MODERATE').length,
        low_severity_count: active.filter(h => h.severity === 'LOW').length,
        max_water_depth_cm: Math.max(...all.map(h => h.water_depth_cm || 0), 0),
        data_source: 'Madurai Flood Telemetry System',
        last_updated: new Date().toISOString()
      };
    });
  },

  // Routes
  compareRoutes: async (payload: {
    origin: { longitude: number; latitude: number };
    destination: { longitude: number; latitude: number };
    transport_profile?: string;
    avoid_hazards?: boolean;
  }): Promise<RouteCompareResponse> => {
    return safeFetch(
      `${API_BASE}/routes/compare`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          transport_profile: payload.transport_profile || 'Car',
          avoid_hazards: payload.avoid_hazards ?? true
        }),
      },
      () => localEngine.compareRoutes(payload)
    );
  },

  // Geofences
  evaluatePosition: async (payload: {
    device_id: string;
    longitude: number;
    latitude: number;
    position_timestamp: string;
  }) => {
    return safeFetch(
      `${API_BASE}/geofences/evaluate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      () => localEngine.evaluatePosition(payload)
    );
  },

  syncGeofences: async () => {
    return safeFetch(`${API_BASE}/geofences/sync`, { method: 'POST' }, () => ({ status: 'SYNCED' }));
  },

  // Iceberg
  getSnapshots: async (): Promise<IcebergSnapshot[]> => {
    return safeFetch(`${API_BASE}/iceberg/snapshots`, undefined, () => localEngine.getSnapshots());
  },

  querySnapshot: async (snapshotId: string) => {
    return safeFetch(
      `${API_BASE}/iceberg/query-snapshot`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot_id: snapshotId }),
      },
      () => localEngine.querySnapshot(snapshotId)
    );
  },

  resolveHazard: async (payload: {
    hazard_id: string;
    dispatch_id?: string;
    notes?: string;
  }) => {
    return safeFetch(
      `${API_BASE}/iceberg/resolve-hazard`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      () => localEngine.resolveHazard(payload.hazard_id, payload.dispatch_id, payload.notes)
    );
  },

  // Municipal
  getPriorities: async (): Promise<HazardPriorityScore[]> => {
    return safeFetch(`${API_BASE}/municipal/priorities`, undefined, () => localEngine.getPriorities());
  },

  createDispatch: async (payload: {
    hazard_id: string;
    truck_type?: string;
    crew_id?: string;
  }): Promise<DispatchRecord> => {
    return safeFetch(
      `${API_BASE}/municipal/dispatch`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      () => localEngine.createDispatch(payload)
    );
  },

  // Events
  getEvents: async (): Promise<OperationalEvent[]> => {
    return safeFetch(`${API_BASE}/events`, undefined, () => localEngine.getEvents());
  },
};
