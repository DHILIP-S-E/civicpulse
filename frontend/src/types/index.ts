export type HazardType = 'FLOOD' | 'WASTE_OVERFLOW' | 'DEBRIS' | 'ROAD_DAMAGE';
export type HazardSeverity = 'CRITICAL' | 'MODERATE' | 'LOW';
export type HazardStatus = 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED';
export type SourceType = 'CITIZEN_REPORT' | 'IOT_SENSOR' | 'MUNICIPAL_WARD_OFFICER' | 'SATELLITE_RADAR' | 'SIMULATED';

export interface PolygonGeometry {
  type: 'Polygon';
  coordinates: number[][][]; // [ring[point[lng, lat]]]
}

export interface Hazard {
  hazard_id: string;
  location_name: string;
  hazard_type: HazardType;
  severity: HazardSeverity;
  status: HazardStatus;
  geometry: PolygonGeometry;
  longitude: number;
  latitude: number;
  water_depth_cm?: number | null;
  observed_at: string;
  updated_at: string;
  source_type: SourceType;
  source_reference?: string | null;
  confidence: number;
  simulation_id?: string | null;
  created_at: string;
}

export interface HazardSummary {
  total_hazards: number;
  active_hazards: number;
  investigating_hazards: number;
  resolved_hazards: number;
  critical_severity_count: number;
  moderate_severity_count: number;
  low_severity_count: number;
  max_water_depth_cm: number;
  data_source: string;
  last_updated: string;
}

export interface Place {
  place_id: string;
  name: string;
  address: string;
  category: string;
  longitude: number;
  latitude: number;
  source?: string;
}

export interface HazardIntersectionInfo {
  hazard_id: string;
  location_name: string;
  hazard_type: string;
  severity: string;
  water_depth_cm?: number | null;
  intersection_point: [number, number];
}

export interface RouteDetail {
  geometry: [number, number][];
  distance_km: number;
  duration_minutes: number;
  hazard_intersections: HazardIntersectionInfo[];
  is_hazard_free: boolean;
  status: string;
  warnings: string[];
}

export interface RouteCompareResponse {
  standard_route: RouteDetail;
  hazard_avoiding_route?: RouteDetail | null;
  time_delta_minutes?: number | null;
  distance_delta_km?: number | null;
  avoidance_successful: boolean;
  routing_source: string;
  data_freshness: string;
  status: string;
  overall_warnings: string[];
}

export interface IcebergSnapshot {
  snapshot_id: string;
  parent_snapshot_id?: string | null;
  stage_name: string;
  relative_time: string;
  committed_at: string;
  operation: string;
  manifest_list?: string | null;
  summary: Record<string, string>;
  active_hazard_count: number;
  resolved_hazard_count: number;
  total_records: number;
  provenance: string;
}

export interface PriorityFactor {
  name: string;
  weight: number;
  raw_value: number;
  weighted_score: number;
  explanation: string;
}

export interface HazardPriorityScore {
  hazard_id: string;
  location_name: string;
  hazard_type: string;
  severity: string;
  priority_score: number;
  priority_rank: number;
  contributing_factors: PriorityFactor[];
  data_confidence: number;
  recommended_action: string;
  missing_information?: string | null;
}

export interface DispatchRecord {
  dispatch_id: string;
  hazard_id: string;
  hazard_location: string;
  truck_type: string;
  crew_id: string;
  status: 'PENDING' | 'EN_ROUTE' | 'ON_SITE' | 'COMPLETED' | 'FAILED';
  dispatched_at: string;
  estimated_arrival_minutes: number;
  vehicle_path: [number, number][];
  action_log: { timestamp: string; action: string; message: string }[];
}

export interface OperationalEvent {
  event_id: string;
  timestamp: string;
  event_type: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILURE' | 'INFO';
  related_id?: string | null;
  message: string;
  metadata?: Record<string, any>;
}

export type AppMode = 'citizen' | 'municipal';

export interface FilterState {
  showFloods: boolean;
  showWaste: boolean;
  showDebris: boolean;
  showResolved: boolean;
  showSimulated: boolean;
  showVerified: boolean;
  showExtrusion3D: boolean;
}

