/**
 * CoolCorridor Backend API Service
 * Integrates with FastAPI service deployed at https://coolcorridor.vercel.app
 */

import { BackendHealth, RouteRequest, RouteResponse } from '../types/routes';

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  (import.meta.env.DEV ? '/api/backend' : 'https://coolcorridor.vercel.app');

export class ApiError extends Error {
  statusCode?: number;
  detail?: string;

  constructor(message: string, statusCode?: number, detail?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

/**
 * Check backend health and pedestrian network stats
 */
export async function checkBackendHealth(): Promise<BackendHealth> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(
        `Backend health check failed with status ${response.status}`,
        response.status
      );
    }

    const data = (await response.json()) as BackendHealth;
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      'Unable to connect to CoolCorridor routing engine. Please check your network connection.'
    );
  }
}

/**
 * Calculate walking routes comparing shortest path vs heat-exposure aware alternatives
 * Sends exact fields: origin_latitude, origin_longitude, destination_latitude, destination_longitude
 */
export async function fetchRoutes(request: RouteRequest): Promise<RouteResponse> {
  const payload = {
    origin_latitude: Number(request.origin_latitude),
    origin_longitude: Number(request.origin_longitude),
    destination_latitude: Number(request.destination_latitude),
    destination_longitude: Number(request.destination_longitude),
  };

  try {
    const response = await fetch(`${API_BASE_URL}/route/coordinates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let detailMsg = '';
      try {
        const errorData = await response.json();
        if (typeof errorData?.detail === 'string') {
          detailMsg = errorData.detail;
        } else if (Array.isArray(errorData?.detail)) {
          detailMsg = errorData.detail.map((d: { msg?: string }) => d.msg || '').join(', ');
        }
      } catch {
        // Non-JSON response body
      }

      if (response.status === 422) {
        throw new ApiError(
          detailMsg ||
            'Location outside the Downtown Phoenix study network. Please select an origin and destination within approximately 250 metres of mapped walking segments in Phoenix.',
          422,
          detailMsg
        );
      }

      if (response.status === 500) {
        throw new ApiError(
          detailMsg || 'The routing engine encountered an internal calculation error. Please try nearby coordinates.',
          500,
          detailMsg
        );
      }

      throw new ApiError(
        detailMsg || `Routing service returned status ${response.status}`,
        response.status,
        detailMsg
      );
    }

    const data = (await response.json()) as RouteResponse;

    if (!data || !Array.isArray(data.features) || data.features.length === 0) {
      throw new ApiError('No route paths were returned for the given coordinates.');
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(
      error instanceof Error ? error.message : 'Failed to connect to CoolCorridor routing service.'
    );
  }
}
