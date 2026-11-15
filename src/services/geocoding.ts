/**
 * Geocoding and Study Area Boundaries for Downtown Phoenix
 */

import { LocationPoint, NominatimResult } from '../types/routes';

// Downtown Phoenix 10km x 10km Approximate Study Area Bounds
export const PHOENIX_STUDY_BOUNDS = {
  minLat: 33.405,
  maxLat: 33.495,
  minLng: -112.135,
  maxLng: -112.015,
  centerLat: 33.4484,
  centerLng: -112.074,
};

/**
 * Check if a coordinate is within or near the Phoenix study area bounds
 */
export function isWithinPhoenixStudyArea(lat: number, lng: number): boolean {
  return (
    lat >= PHOENIX_STUDY_BOUNDS.minLat &&
    lat <= PHOENIX_STUDY_BOUNDS.maxLat &&
    lng >= PHOENIX_STUDY_BOUNDS.minLng &&
    lng <= PHOENIX_STUDY_BOUNDS.maxLng
  );
}

/**
 * Parse direct coordinate string format: "latitude, longitude" (e.g. "33.4484, -112.0740")
 * Validates latitude between -90 and 90, and longitude between -180 and 180.
 */
export function parseCoordinates(input: string): { latitude: number; longitude: number } | null {
  if (!input || !input.includes(',')) return null;
  const parts = input.split(',');
  if (parts.length !== 2) return null;

  const lat = parseFloat(parts[0].trim());
  const lng = parseFloat(parts[1].trim());

  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { latitude: lat, longitude: lng };
}

/**
 * Verified landmarks located solidly within the 45k-node pedestrian network
 */
export const PHOENIX_LANDMARKS: LocationPoint[] = [
  {
    label: 'Phoenix City Hall',
    latitude: 33.4484,
    longitude: -112.074,
    address: '200 W Washington St, Phoenix, AZ',
  },
  {
    label: 'ASU Downtown (Taylor Mall)',
    latitude: 33.4542,
    longitude: -112.0734,
    address: '411 N Central Ave, Phoenix, AZ',
  },
  {
    label: 'Roosevelt Row Arts District',
    latitude: 33.459,
    longitude: -112.071,
    address: 'Roosevelt St & 2nd St, Phoenix, AZ',
  },
  {
    label: 'Phoenix Convention Center',
    latitude: 33.4498,
    longitude: -112.0673,
    address: '100 N 3rd St, Phoenix, AZ',
  },
  {
    label: 'Chase Field',
    latitude: 33.4455,
    longitude: -112.0667,
    address: '401 E Jefferson St, Phoenix, AZ',
  },
  {
    label: 'Footprint Center',
    latitude: 33.4458,
    longitude: -112.0712,
    address: '201 E Jefferson St, Phoenix, AZ',
  },
  {
    label: 'Margaret T. Hance Park',
    latitude: 33.4615,
    longitude: -112.0772,
    address: '67 W Culver St, Phoenix, AZ',
  },
  {
    label: 'Heritage Square & Science Center',
    latitude: 33.4488,
    longitude: -112.0655,
    address: '113 N 6th St, Phoenix, AZ',
  },
  {
    label: 'Civic Space Park',
    latitude: 33.4532,
    longitude: -112.0738,
    address: '424 N Central Ave, Phoenix, AZ',
  },
  {
    label: 'The Van Buren',
    latitude: 33.4514,
    longitude: -112.0801,
    address: '401 W Van Buren St, Phoenix, AZ',
  },
];

/**
 * Search locations using OpenStreetMap Nominatim with Phoenix geographic bias
 */
export async function searchLocations(
  query: string,
  signal?: AbortSignal
): Promise<LocationPoint[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  // Check matching landmarks first
  const lower = trimmed.toLowerCase();
  const matchedLandmarks = PHOENIX_LANDMARKS.filter(
    (l) =>
      l.label.toLowerCase().includes(lower) ||
      (l.address && l.address.toLowerCase().includes(lower))
  );

  try {
    // Append Phoenix, AZ context if not specified
    const searchQuery = lower.includes('phoenix') ? trimmed : `${trimmed}, Phoenix, AZ`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      searchQuery
    )}&viewbox=${PHOENIX_STUDY_BOUNDS.minLng - 0.1},${PHOENIX_STUDY_BOUNDS.maxLat + 0.1},${
      PHOENIX_STUDY_BOUNDS.maxLng + 0.1
    },${PHOENIX_STUDY_BOUNDS.minLat - 0.1}&limit=6&addressdetails=1`;

    const res = await fetch(url, {
      signal,
      headers: {
        'Accept-Language': 'en',
        'User-Agent': 'CoolCorridor-UrbanHeatRouting/1.0 (contact@coolcorridor.app)',
      },
    });

    if (!res.ok) {
      return matchedLandmarks;
    }

    const results = (await res.json()) as NominatimResult[];
    const geocoded: LocationPoint[] = results.map((item) => {
      const parts = item.display_name.split(',');
      const shortTitle = item.name || parts[0];
      const address = parts.slice(0, 3).join(', ');
      return {
        label: shortTitle,
        address: address,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      };
    });

    // Deduplicate against landmarks
    const combined = [...matchedLandmarks];
    for (const item of geocoded) {
      if (
        !combined.some(
          (c) =>
            Math.abs(c.latitude - item.latitude) < 0.0005 &&
            Math.abs(c.longitude - item.longitude) < 0.0005
        )
      ) {
        combined.push(item);
      }
    }

    return combined.slice(0, 7);
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return [];
    }
    // Return landmark matches as robust fallback
    return matchedLandmarks;
  }
}
