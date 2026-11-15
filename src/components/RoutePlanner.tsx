
import React, { useState, useEffect, useCallback } from 'react';
import { LocationPoint, RouteFeature, RouteMetadata } from '../types/routes';
import { RouteSegmentData } from '../utils/segments';
import { fetchRoutes, checkBackendHealth, ApiError } from '../services/api';
import { isWithinPhoenixStudyArea } from '../services/geocoding';
import { saveRouteToHistory, getCurrentUser } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { LocationInput } from './LocationInput';
import { InteractiveMap } from './InteractiveMap';
import { RouteComparison } from './RouteComparison';
import { InterventionPlanner } from './InterventionPlanner';
import { SegmentInspector } from './SegmentInspector';
import { AlertCircle, ArrowRight, Bookmark, Check } from 'lucide-react';

interface RoutePlannerProps {
  onRouteSaved?: () => void;
  loadedRoute?: {
    origin: LocationPoint;
    destination: LocationPoint;
  } | null;
}

export const RoutePlanner: React.FC<RoutePlannerProps> = ({
  onRouteSaved,
  loadedRoute,
}) => {
  const { user, loginAsGuest } = useAuth();

  // Origin & Destination state
  const [origin, setOrigin] = useState<LocationPoint | null>(null);
  const [destination, setDestination] = useState<LocationPoint | null>(null);

  // Routes state
  const [features, setFeatures] = useState<RouteFeature[]>([]);
  const [metadata, setMetadata] = useState<RouteMetadata | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(
    'Lower exposure (lambda=2)'
  );
  const [selectedSegment, setSelectedSegment] =
    useState<RouteSegmentData | null>(null);

  // Status & Error
  const [isCalculating, setIsCalculating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendReady, setBackendReady] = useState(true);

  // Route saving state
  const [isSavingRoute, setIsSavingRoute] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Check health on mount
  useEffect(() => {
    checkBackendHealth()
      .then((health) => {
        setBackendReady(health.status === 'healthy');
      })
      .catch(() => {
        setBackendReady(false);
      });
  }, []);

  // Validate study area bounds for origin and destination
  const originOutside = origin
    ? !isWithinPhoenixStudyArea(origin.latitude, origin.longitude)
    : false;

  const destOutside = destination
    ? !isWithinPhoenixStudyArea(
        destination.latitude,
        destination.longitude
      )
    : false;

  const isOutsideStudyArea = originOutside || destOutside;

  let boundaryWarning: string | null = null;

  if (originOutside && destOutside) {
    boundaryWarning =
      'Both starting point (Origin) and destination are outside the Downtown Phoenix study area. CoolCorridor currently supports pedestrian routing only within the Downtown Phoenix study area.';
  } else if (originOutside) {
    boundaryWarning =
      'Starting point (Origin) is outside the Downtown Phoenix study area. CoolCorridor currently supports pedestrian routing only within the Downtown Phoenix study area.';
  } else if (destOutside) {
    boundaryWarning =
      'Destination is outside the Downtown Phoenix study area. CoolCorridor currently supports pedestrian routing only within the Downtown Phoenix study area.';
  }

  // Selected feature derived from active scenario
  const selectedFeature =
    features.find(
      (feature) => feature.properties?.scenario === selectedScenario
    ) ||
    features[0] ||
    null;

  // Calculate Routes handler
  const handleCalculateRoutes = useCallback(
    async (
      startPoint?: LocationPoint | null,
      endPoint?: LocationPoint | null
    ) => {
      const orig = startPoint !== undefined ? startPoint : origin;
      const dest = endPoint !== undefined ? endPoint : destination;

      if (!orig || !dest) {
        setErrorMessage(
          'Please select both a starting point and a destination.'
        );
        return;
      }

      if (
        !isWithinPhoenixStudyArea(orig.latitude, orig.longitude) ||
        !isWithinPhoenixStudyArea(dest.latitude, dest.longitude)
      ) {
        setErrorMessage(
          'Selected location is outside the Downtown Phoenix study area. Routing is supported only within the 10×10 km pedestrian network.'
        );
        return;
      }

      setIsCalculating(true);
      setErrorMessage(null);
      setSelectedSegment(null);
      setSaveSuccess(false);
      setSaveError(null);

      try {
        const response = await fetchRoutes({
          origin_latitude: orig.latitude,
          origin_longitude: orig.longitude,
          destination_latitude: dest.latitude,
          destination_longitude: dest.longitude,
        });

        setFeatures(response.features || []);
        setMetadata(response.metadata || null);

        // Default highlight lambda=2 if available, else first scenario
        const hasLambda2 = response.features?.some(
          (feature) =>
            feature.properties.scenario === 'Lower exposure (lambda=2)'
        );

        setSelectedScenario(
          hasLambda2
            ? 'Lower exposure (lambda=2)'
            : response.features?.[0]?.properties.scenario || null
        );
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setErrorMessage(err.message);
        } else if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage(
            'Failed to compute walking routes. Please try again.'
          );
        }
      } finally {
        setIsCalculating(false);
      }
    },
    [origin, destination]
  );

  // Load external route when selected from RouteHistory
  useEffect(() => {
    if (loadedRoute) {
      setOrigin(loadedRoute.origin);
      setDestination(loadedRoute.destination);
      handleCalculateRoutes(
        loadedRoute.origin,
        loadedRoute.destination
      );
    }
  }, [loadedRoute, handleCalculateRoutes]);

  // Swap origin and destination
  const handleSwap = () => {
    const prevOrigin = origin;
    const prevDest = destination;

    setOrigin(prevDest);
    setDestination(prevOrigin);
    setSelectedSegment(null);
    setSaveSuccess(false);
    setSaveError(null);

    if (
      prevDest &&
      prevOrigin &&
      isWithinPhoenixStudyArea(
        prevDest.latitude,
        prevDest.longitude
      ) &&
      isWithinPhoenixStudyArea(
        prevOrigin.latitude,
        prevOrigin.longitude
      )
    ) {
      handleCalculateRoutes(prevDest, prevOrigin);
    }
  };

  // Save route action
  const handleSaveRoute = async () => {
    if (!selectedFeature || !origin || !destination || isSavingRoute) {
      return;
    }

    setIsSavingRoute(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      let activeUserId = user?.id;

      // Establish a genuine Supabase guest session if necessary.
      if (!activeUserId) {
        const guestResult = await loginAsGuest();

        if (guestResult.error) {
          throw new Error(guestResult.error);
        }

        // Read the authenticated Supabase user after guest sign-in.
        const authenticatedUser = await getCurrentUser();
        activeUserId = authenticatedUser?.id;
      }

      if (!activeUserId) {
        throw new Error(
          'Unable to establish your account session. Please sign in and try again.'
        );
      }

      const result = await saveRouteToHistory({
        userId: activeUserId,
        origin,
        destination,
        feature: selectedFeature,
      });

      // Do not show success unless Supabase confirms the insert.
      if (result.error || !result.data) {
        throw new Error(
          result.error || 'The route could not be saved.'
        );
      }

      setSaveSuccess(true);
      setSaveError(null);
      onRouteSaved?.();

      // Reset the success indicator after a short delay.
      window.setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Could not save this route. Please try again.';

      console.error('[RoutePlanner] Save route failed:', err);
      setSaveSuccess(false);
      setSaveError(message);
    } finally {
      setIsSavingRoute(false);
    }
  };

  return (
    <section id="planner" className="py-10 md:py-14 bg-[#F7F7F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5E5DC] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[#5A6860] mb-1">
              <span>INTERACTIVE WALK CORRIDOR OPTIMIZATION</span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#202522]">
              Plan your journey
            </h2>

            <p className="text-sm text-[#5A6860] mt-1 max-w-xl">
              Compare walking routes across the Phoenix study area.
              Evaluate the shortest distance against paths with lower
              environmental exposure proxies.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#5A6860]">
            <span className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendReady ? 'bg-[#385E48]' : 'bg-amber-500'
                }`}
              />
              <span>
                {backendReady
                  ? 'FastAPI Routing Active'
                  : 'Connecting to API'}
              </span>
            </span>
          </div>
        </div>

        {/* Split Screen Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Route Controls and Scenario Selection */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Input Form Card */}
            <div className="bg-white border border-[#E5E5DC] rounded-xl p-5 shadow-xs">
              <LocationInput
                origin={origin}
                destination={destination}
                onOriginChange={(pt) => {
                  setOrigin(pt);
                  setErrorMessage(null);
                  setSaveSuccess(false);
                  setSaveError(null);
                }}
                onDestinationChange={(pt) => {
                  setDestination(pt);
                  setErrorMessage(null);
                  setSaveSuccess(false);
                  setSaveError(null);
                }}
                onSwap={handleSwap}
                disabled={isCalculating}
              />

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleCalculateRoutes()}
                disabled={
                  isCalculating ||
                  !origin ||
                  !destination ||
                  isOutsideStudyArea
                }
                className="w-full mt-4 py-3 px-4 bg-[#385E48] hover:bg-[#274333] disabled:bg-[#B8C7BE] disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCalculating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Calculating Routes...</span>
                  </>
                ) : (
                  <>
                    <span>Calculate Walking Routes</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Boundary Warning or Error Message Alert */}
            {(boundaryWarning || errorMessage) && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />

                <div className="space-y-1">
                  <span className="font-semibold block">
                    {boundaryWarning
                      ? 'Study Area Boundary Notice'
                      : 'Routing Notice'}
                  </span>

                  <p className="text-rose-800 leading-relaxed">
                    {boundaryWarning || errorMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Route Saving Action Bar */}
            {features.length > 0 &&
              !isOutsideStudyArea &&
              selectedFeature &&
              origin &&
              destination && (
                <div className="flex items-center justify-between p-3 bg-white border border-[#E5E5DC] rounded-xl text-xs shadow-xs">
                  <div className="flex items-center gap-1.5 font-medium text-[#202522]">
                    <Bookmark className="w-4 h-4 text-[#385E48]" />
                    <span>{selectedFeature.properties.scenario}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveRoute}
                    disabled={isSavingRoute}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      saveSuccess
                        ? 'bg-[#EBF1ED] text-[#274333] border border-[#385E48]/30'
                        : 'bg-[#202522] hover:bg-[#385E48] text-white shadow-xs'
                    }`}
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#385E48]" />
                        <span>Saved</span>
                      </>
                    ) : isSavingRoute ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>Save Route</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            {/* Save Error */}
            {saveError && (
              <div
                role="alert"
                className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <p className="leading-relaxed">{saveError}</p>
              </div>
            )}

            {/* Left Column: Route Comparison */}
            {features.length > 0 && !isOutsideStudyArea && (
              <RouteComparison
                features={features}
                selectedScenario={selectedScenario}
                onSelectScenario={(scenario) => {
                  setSelectedScenario(scenario);
                  setSelectedSegment(null);
                  setSaveSuccess(false);
                  setSaveError(null);
                }}
              />
            )}
          </div>

          {/* Right Column: Interactive Map & Analysis */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-4">
            <div>
              <InteractiveMap
                features={features}
                selectedScenario={selectedScenario}
                onSelectScenario={(scenario) => {
                  setSelectedScenario(scenario);
                  setSaveSuccess(false);
                  setSaveError(null);
                }}
                origin={origin}
                destination={destination}
                isCalculating={isCalculating}
                selectedSegment={selectedSegment}
              />

              {/* Scientific Guidance Footer beneath Map */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-[#5A6860] px-1 gap-2">
                <div className="flex items-center gap-2">
                  <span>
                    Model: Pooled Landsat Thermal (LST) & NDVI percentiles
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Walking speed: 1.2 m/s</span>
                </div>

                <div className="text-right">
                  <span>
                    Search and select custom start and end locations
                  </span>
                </div>
              </div>
            </div>

            {/* Intervention Planner & Street Segment Inspector */}
            {features.length > 0 &&
              !isOutsideStudyArea &&
              selectedFeature && (
                <div className="space-y-4 pt-1">
                  <InterventionPlanner
                    selectedFeature={selectedFeature}
                    metadata={metadata}
                  />

                  <SegmentInspector
                    feature={selectedFeature}
                    selectedSegment={selectedSegment}
                    onSelectSegment={setSelectedSegment}
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    </section>
  );
};
