
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  SavedRouteRecord,
  getRouteHistory,
  deleteRouteRecord,
} from '../services/supabase';
import {
  Bookmark,
  Clock,
  Trash2,
  ArrowRight,
  Thermometer,
  Trees,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface RouteHistoryProps {
  onLoadRoute?: (
    originLat: number,
    originLng: number,
    originLabel: string,
    destLat: number,
    destLng: number,
    destLabel: string
  ) => void;
  refreshTrigger?: number;
}

const formatMetric = (
  value: number | null | undefined,
  decimals: number
): string => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '—';
  }

  return value.toFixed(decimals);
};

const formatRouteName = (route: string | null | undefined): string => {
  if (!route) return 'Saved Route';

  const routeNames: Record<string, string> = {
    shortest: 'Shortest Route',
    lambda_1: 'Lower Exposure · λ1',
    lambda_2: 'Lower Exposure · λ2',
    lambda_4: 'Lower Exposure · λ4',
  };

  return routeNames[route] || route;
};

const getRouteSummary = (
  item: SavedRouteRecord
): Record<string, unknown> => {
  if (
    item.route_summary &&
    typeof item.route_summary === 'object' &&
    !Array.isArray(item.route_summary)
  ) {
    return item.route_summary as unknown as Record<string, unknown>;
  }

  return {};
};

const getSummaryText = (
  summary: Record<string, unknown>,
  key: string
): string | null => {
  const value = summary[key];

  return typeof value === 'string' && value.trim()
    ? value.trim()
    : null;
};

export const RouteHistory: React.FC<RouteHistoryProps> = ({
  onLoadRoute,
  refreshTrigger,
}) => {
  const { user, openAuthModal } = useAuth();

  const [routes, setRoutes] = useState<SavedRouteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load saved routes belonging to the authenticated user.
  const loadHistory = useCallback(async () => {
    if (!user?.id) {
      setRoutes([]);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getRouteHistory(user.id);
      setRoutes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[RouteHistory] Failed to load history:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to load your saved routes. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory, refreshTrigger]);

  // Delete a saved route only after the database confirms success.
  const handleDelete = async (id?: string) => {
    if (!id || !user?.id || deletingId) return;

    setDeletingId(id);
    setErrorMessage(null);

    try {
      const success = await deleteRouteRecord(id, user.id);

      if (!success) {
        throw new Error(
          'The route could not be deleted. Please refresh and try again.'
        );
      }

      setRoutes((previousRoutes) =>
        previousRoutes.filter((route) => route.id !== id)
      );

      if (expandedId === id) {
        setExpandedId(null);
      }
    } catch (err) {
      console.error('[RouteHistory] Failed to delete route:', err);

      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Unable to delete this route. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section
      id="history"
      className="py-10 md:py-14 bg-white/70 border-t border-[#E5E5DC]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E5E5DC] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[#5A6860] mb-1">
              <Bookmark className="w-3.5 h-3.5 text-[#385E48]" />
              <span>SAVED PEDESTRIAN CORRIDORS</span>
            </div>

            <h2 className="font-display text-2xl font-bold text-[#202522]">
              Route History
            </h2>

            <p className="text-xs text-[#5A6860] mt-1">
              Personal saved itineraries stored securely in your Supabase
              account.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user && (
              <button
                type="button"
                onClick={loadHistory}
                disabled={isLoading}
                className="px-3 py-1 text-xs font-mono text-[#5A6860] hover:text-[#202522] border border-[#E5E5DC] rounded-md bg-white hover:bg-[#F7F7F3] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Refresh history"
              >
                <RefreshCw
                  className={`w-3 h-3 ${
                    isLoading ? 'animate-spin' : ''
                  }`}
                />
                <span>Refresh</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Content based on Auth & History */}
        {!user ? (
          <div className="p-8 text-center bg-[#F7F7F3] rounded-xl border border-[#E5E5DC] max-w-xl mx-auto space-y-3">
            <Clock className="w-8 h-8 text-[#5A6860] mx-auto opacity-70" />

            <h3 className="font-display text-base font-bold text-[#202522]">
              Sign in to access your Route History
            </h3>

            <p className="text-xs text-[#5A6860] max-w-md mx-auto leading-relaxed">
              Save your evaluated heat-mitigated walking routes to revisit
              and compare later. You can sign in with email or continue as
              an anonymous guest.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 bg-[#385E48] hover:bg-[#274333] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <span>Sign In or Continue as Guest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="py-12 text-center text-xs font-mono text-[#5A6860]">
            <div className="w-5 h-5 border-2 border-[#385E48] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading saved routes...</span>
          </div>
        ) : routes.length === 0 ? (
          <div className="p-8 text-center bg-[#F7F7F3] rounded-xl border border-[#E5E5DC] max-w-xl mx-auto space-y-2">
            <Bookmark className="w-7 h-7 text-[#5A6860] mx-auto opacity-60" />

            <h3 className="font-display text-sm font-bold text-[#202522]">
              No saved routes yet
            </h3>

            <p className="text-xs text-[#5A6860] leading-relaxed">
              When you generate a route in the Route Planner above, click
              the{' '}
              <strong className="text-[#202522]">Save Route</strong>{' '}
              button to archive your walking path and environmental
              metrics.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {routes.map((item) => {
              const isExpanded = expandedId === item.id;

              const summary = getRouteSummary(item);

              const originLabel =
                item.origin_label ||
                getSummaryText(summary, 'origin_label') ||
                'Saved starting point';

              const destinationLabel =
                item.destination_label ||
                getSummaryText(summary, 'destination_label') ||
                'Saved destination';

              const summaryDescription =
                getSummaryText(summary, 'description') ||
                getSummaryText(summary, 'summary') ||
                'No additional itinerary details are available.';

              const dateStr = item.created_at
                ? new Date(item.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recent';

              const hasValidCoordinates =
                typeof item.origin_latitude === 'number' &&
                Number.isFinite(item.origin_latitude) &&
                typeof item.origin_longitude === 'number' &&
                Number.isFinite(item.origin_longitude) &&
                typeof item.destination_latitude === 'number' &&
                Number.isFinite(item.destination_latitude) &&
                typeof item.destination_longitude === 'number' &&
                Number.isFinite(item.destination_longitude);

              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#E5E5DC] rounded-xl p-4 shadow-xs space-y-3 flex flex-col justify-between hover:border-[#B8C7BE] transition-colors"
                >
                  <div className="space-y-2">
                    {/* Top line: scenario badge + date */}
                    <div className="flex items-center justify-between text-[11px] font-mono gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#EBF1ED] text-[#274333] font-semibold border border-[#385E48]/20">
                        {formatRouteName(item.selected_route)}
                      </span>

                      <span className="text-[#5A6860] shrink-0">
                        {dateStr}
                      </span>
                    </div>

                    {/* Origin & Destination */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#202522] text-white flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                          A
                        </span>

                        <span className="font-semibold text-[#202522] truncate">
                          {originLabel}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#385E48] text-white flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                          B
                        </span>

                        <span className="font-semibold text-[#202522] truncate">
                          {destinationLabel}
                        </span>
                      </div>
                    </div>

                    {/* Core Metric Pills */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1 font-mono text-[11px]">
                      <div className="p-1.5 bg-[#F7F7F3] rounded border border-[#E5E5DC] text-[#5A6860]">
                        <span>Dist: </span>
                        <strong className="text-[#202522]">
                          {formatMetric(item.distance_km, 2)} km
                        </strong>
                      </div>

                      <div className="p-1.5 bg-[#F7F7F3] rounded border border-[#E5E5DC] text-[#5A6860]">
                        <span>Walk: </span>
                        <strong className="text-[#202522]">
                          {item.walking_minutes != null &&
                          Number.isFinite(item.walking_minutes)
                            ? `~${Math.round(item.walking_minutes)}m`
                            : '—'}
                        </strong>
                      </div>

                      <div className="p-1.5 bg-[#F7F7F3] rounded border border-[#E5E5DC] text-[#5A6860] flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-amber-700" />

                        <strong className="text-[#202522]">
                          {formatMetric(item.mean_lst_c, 1)}°C
                        </strong>
                      </div>

                      <div className="p-1.5 bg-[#F7F7F3] rounded border border-[#E5E5DC] text-[#5A6860] flex items-center gap-1">
                        <Trees className="w-3 h-3 text-[#385E48]" />

                        <strong className="text-[#202522]">
                          {formatMetric(item.mean_ndvi, 3)}
                        </strong>
                      </div>
                    </div>

                    {/* Detailed Route Summary */}
                    {isExpanded && (
                      <div className="p-2.5 bg-[#F7F7F3] rounded-lg border border-[#E5E5DC] text-[11px] text-[#5A6860] leading-relaxed space-y-1">
                        <div className="font-semibold text-[#202522]">
                          Itinerary Details:
                        </div>

                        <p>{summaryDescription}</p>

                        <div className="text-[10px] text-[#7A8680] pt-1 border-t border-[#E5E5DC]">
                          Exposure Score:{' '}
                          {formatMetric(item.environmental_score, 1)}
                          {' · '}
                          Proxy:{' '}
                          {formatMetric(item.exposure_proxy, 2)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#E5E5DC] flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(
                          isExpanded ? null : item.id || null
                        )
                      }
                      className="text-[#385E48] hover:underline font-medium text-[11px] cursor-pointer"
                    >
                      {isExpanded ? 'Hide Details' : 'View Summary'}
                    </button>

                    <div className="flex items-center gap-2">
                      {onLoadRoute && hasValidCoordinates && (
                        <button
                          type="button"
                          onClick={() => {
                            onLoadRoute(
                              item.origin_latitude as number,
                              item.origin_longitude as number,
                              originLabel,
                              item.destination_latitude as number,
                              item.destination_longitude as number,
                              destinationLabel
                            );

                            const element =
                              document.getElementById('planner');

                            if (element) {
                              element.scrollIntoView({
                                behavior: 'smooth',
                              });
                            }
                          }}
                          className="px-2 py-1 bg-[#F7F7F3] hover:bg-[#EAEAE4] text-[#202522] rounded border border-[#E5E5DC] text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Load this route into the planner"
                        >
                          <ExternalLink className="w-3 h-3 text-[#385E48]" />
                          <span>Load</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1 text-zinc-400 hover:text-rose-600 rounded transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Delete from history"
                      >
                        {deletingId === item.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
