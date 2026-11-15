/**
 * Utility functions for extracting and calculating street segments from route GeoJSON LineStrings
 */

export interface RouteSegmentData {
  index: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  lengthKm: number;
  lengthMeters: number;
}

export function extractRouteSegments(coordinates: [number, number][]): RouteSegmentData[] {
  const segments: RouteSegmentData[] = [];
  if (!coordinates || coordinates.length < 2) return segments;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lon1, lat1] = coordinates[i];
    const [lon2, lat2] = coordinates[i + 1];
    const lengthKm = calculateHaversineKm(lat1, lon1, lat2, lon2);
    segments.push({
      index: i + 1,
      startLat: lat1,
      startLng: lon1,
      endLat: lat2,
      endLng: lon2,
      lengthKm,
      lengthMeters: lengthKm * 1000,
    });
  }
  return segments;
}

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
