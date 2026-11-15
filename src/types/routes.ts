/**
 * CoolCorridor Route Types and API Interfaces
 * Downtown Phoenix Urban Heat Walking Route Planner
 */

export type RouteScenario =
  | 'Shortest'
  | 'Lower exposure (lambda=1)'
  | 'Lower exposure (lambda=2)';

export interface RouteProperties {
  scenario: RouteScenario | string;
  distance_km: number;
  walking_time_min: number;
  segments: number;
  mean_exposure_score: number;
  mean_lst_c: number;
  mean_ndvi: number;
  exposure_proxy: number;
}

export interface RouteGeometry {
  type: 'LineString';
  // GeoJSON coordinates: [longitude, latitude]
  coordinates: [number, number][];
}

export interface RouteFeature {
  type: 'Feature';
  properties: RouteProperties;
  geometry: RouteGeometry;
}

export interface RouteMetadata {
  study_area: string;
  coordinate_system: string;
  origin_node: number;
  destination_node: number;
  origin_snap_distance_m: number;
  destination_snap_distance_m: number;
  walking_speed_mps: number;
  exposure_score_note: string;
}

export interface RouteResponse {
  type: 'FeatureCollection';
  metadata: RouteMetadata;
  features: RouteFeature[];
}

export interface RouteRequest {
  origin_latitude: number;
  origin_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
}

export interface LocationPoint {
  latitude: number;
  longitude: number;
  label: string;
  address?: string;
}

export interface BackendHealth {
  status: string;
  nodes: number;
  edges: number;
  strongly_connected: boolean;
  city?: string;
}

export interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
}
