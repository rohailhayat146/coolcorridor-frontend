
/**
 * Utilities for dividing a route GeoJSON LineString into
 * meaningful, approximately 100-metre route sections.
 *
 * Each section retains its own geometry so it can later
 * be highlighted and associated with environmental data.
 *
 * Note: These are geometric route sections, not necessarily
 * individual named streets or road intersections.
 */

export interface RouteSegmentData {
  index: number;

  // Section endpoints
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;

  // Section midpoint
  midpointLat: number;
  midpointLng: number;

  // Measurements
  lengthKm: number;
  lengthMeters: number;

  // GeoJSON coordinates [longitude, latitude]
  coordinates: [number, number][];
}

const DEFAULT_SEGMENT_LENGTH_METERS = 100;

export function extractRouteSegments(
  coordinates: [number, number][],
  targetLengthMeters = DEFAULT_SEGMENT_LENGTH_METERS
): RouteSegmentData[] {
  if (!Array.isArray(coordinates) || coordinates.length < 2) {
    return [];
  }

  if (!Number.isFinite(targetLengthMeters) || targetLengthMeters <= 0) {
    return [];
  }

  // Reject invalid geometry rather than filtering points and
  // accidentally connecting coordinates that were not adjacent.
  const validCoordinates = coordinates.every(isValidCoordinate);

  if (!validCoordinates) return [];

  const sectionCoordinates: [number, number][][] = [];

  let currentSection: [number, number][] = [
    [...coordinates[0]] as [number, number],
  ];

  let currentLength = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    let cursor: [number, number] = [...coordinates[i]];
    const endpoint: [number, number] = [...coordinates[i + 1]];

    let remainingDistance = calculateHaversineMeters(
      cursor[1],
      cursor[0],
      endpoint[1],
      endpoint[0]
    );

    if (remainingDistance < 0.001) continue;

    while (remainingDistance > 0.001) {
      const distanceToBoundary =
        targetLengthMeters - currentLength;

      if (remainingDistance >= distanceToBoundary) {
        const fraction = distanceToBoundary / remainingDistance;

        const boundary = interpolateCoordinate(
          cursor,
          endpoint,
          fraction
        );

        currentSection.push(boundary);
        sectionCoordinates.push(currentSection);

        currentSection = [[...boundary]];
        cursor = boundary;
        currentLength = 0;

        remainingDistance = calculateHaversineMeters(
          cursor[1],
          cursor[0],
          endpoint[1],
          endpoint[0]
        );
      } else {
        currentSection.push(endpoint);
        currentLength += remainingDistance;
        remainingDistance = 0;
      }
    }
  }

  // Preserve the final section, even if it is shorter than 100m.
  if (currentSection.length >= 2) {
    sectionCoordinates.push(currentSection);
  }

  return sectionCoordinates
    .map((section, index) => buildSegment(section, index + 1))
    .filter((segment): segment is RouteSegmentData => segment !== null);
}

function isValidCoordinate(
  point: [number, number]
): boolean {
  return (
    Array.isArray(point) &&
    point.length >= 2 &&
    Number.isFinite(point[0]) &&
    Number.isFinite(point[1]) &&
    Math.abs(point[0]) <= 180 &&
    Math.abs(point[1]) <= 90
  );
}

function buildSegment(
  coordinates: [number, number][],
  index: number
): RouteSegmentData | null {
  if (coordinates.length < 2) return null;

  const start = coordinates[0];
  const end = coordinates[coordinates.length - 1];

  const lengthMeters = calculateLineLengthMeters(coordinates);

  if (lengthMeters <= 0) return null;

  const midpoint = calculateLineMidpoint(coordinates, lengthMeters);

  return {
    index,

    startLng: start[0],
    startLat: start[1],

    endLng: end[0],
    endLat: end[1],

    midpointLng: midpoint[0],
    midpointLat: midpoint[1],

    lengthMeters,
    lengthKm: lengthMeters / 1000,

    coordinates,
  };
}

function calculateLineLengthMeters(
  coordinates: [number, number][]
): number {
  let total = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    total += calculateHaversineMeters(
      coordinates[i][1],
      coordinates[i][0],
      coordinates[i + 1][1],
      coordinates[i + 1][0]
    );
  }

  return total;
}

function calculateLineMidpoint(
  coordinates: [number, number][],
  totalLength: number
): [number, number] {
  const halfway = totalLength / 2;
  let travelled = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i];
    const end = coordinates[i + 1];

    const edgeLength = calculateHaversineMeters(
      start[1],
      start[0],
      end[1],
      end[0]
    );

    if (travelled + edgeLength >= halfway) {
      const fraction =
        edgeLength === 0 ? 0 : (halfway - travelled) / edgeLength;

      return interpolateCoordinate(start, end, fraction);
    }

    travelled += edgeLength;
  }

  return coordinates[coordinates.length - 1];
}

function interpolateCoordinate(
  start: [number, number],
  end: [number, number],
  fraction: number
): [number, number] {
  const safeFraction = Math.max(0, Math.min(1, fraction));

  return [
    start[0] + (end[0] - start[0]) * safeFraction,
    start[1] + (end[1] - start[1]) * safeFraction,
  ];
}

function calculateHaversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const EARTH_RADIUS_METERS = 6371000;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const safeA = Math.max(0, Math.min(1, a));

  const c = 2 * Math.atan2(
    Math.sqrt(safeA),
    Math.sqrt(1 - safeA)
  );

  return EARTH_RADIUS_METERS * c;
}
