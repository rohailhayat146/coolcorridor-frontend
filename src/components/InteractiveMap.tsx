import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RouteFeature, LocationPoint } from '../types/routes';
import { RouteSegmentData } from '../utils/segments';
import { PHOENIX_STUDY_BOUNDS } from '../services/geocoding';
import { Maximize2, Layers, Sliders, Info, Check, X } from 'lucide-react';

interface InteractiveMapProps {
  features: RouteFeature[];
  selectedScenario: string | null;
  onSelectScenario: (scenario: string) => void;
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  isCalculating?: boolean;
  selectedSegment?: RouteSegmentData | null;
}

// Colors for the 3 scenarios
const SCENARIO_STYLES: Record<
  string,
  {
    color: string;
    label: string;
    baseWeight: number;
    activeWeight: number;
    dashArray?: string;
  }
> = {
  Shortest: {
    color: '#334155', // Slate/charcoal
    label: 'Shortest Route',
    baseWeight: 4,
    activeWeight: 6.5,
    dashArray: '6, 5',
  },
  'Lower exposure (lambda=1)': {
    color: '#6E8B68', // Muted olive/sage
    label: 'Lower Exposure λ1',
    baseWeight: 4,
    activeWeight: 6.5,
  },
  'Lower exposure (lambda=2)': {
    color: '#274333', // Deep forest green
    label: 'Lower Exposure λ2',
    baseWeight: 4.5,
    activeWeight: 7,
  },
};

const ENV_LAYER_CONFIG = {
  lst: {
    file: '/assets/aistudio/lst.png',
    bounds: [
      [33.40265680802978, -112.12837205289344],
      [33.493947329054336, -112.01947976474324],
    ] as L.LatLngBoundsExpression,
    name: 'Land Surface Temperature',
    shortName: 'LST (°C)',
    unit: '°C',
    range: '48.0°C – 58.4°C',
    note: '30m grid aligned (native thermal res ~100m). Satellite-observed surface temp, not pedestrian air temp.',
  },
  ndvi: {
    file: '/assets/aistudio/ndvi.png',
    bounds: [
      [33.40265680802978, -112.12837205289344],
      [33.493947329054336, -112.01947976474324],
    ] as L.LatLngBoundsExpression,
    name: 'Vegetation Index (NDVI)',
    shortName: 'Vegetation (NDVI)',
    unit: 'NDVI',
    range: '0.02 – 0.49',
    note: 'Vegetation greenness index, not direct measurements of street-level shade.',
  },
  lst_coverage: {
    file: '/assets/aistudio/lst_coverage.png',
    bounds: [
      [33.40265680802978, -112.12837205289344],
      [33.493947329054336, -112.01947976474324],
    ] as L.LatLngBoundsExpression,
    name: 'LST Observation Coverage',
    shortName: 'LST Coverage',
    unit: 'obs',
    range: '1 – 19 obs',
    note: 'Supporting satellite observations per pixel (May–September 2025).',
  },
  ndvi_coverage: {
    file: '/assets/aistudio/ndvi_coverage.png',
    bounds: [
      [33.40265680802978, -112.12837205289344],
      [33.493947329054336, -112.01947976474324],
    ] as L.LatLngBoundsExpression,
    name: 'NDVI Observation Coverage',
    shortName: 'NDVI Coverage',
    unit: 'obs',
    range: '1 – 19 obs',
    note: 'Supporting satellite observations per pixel (May–September 2025).',
  },
};

const getCartoApiKey = (): string => {
  const envVite = import.meta.env.VITE_CARTO_API_KEY as string | undefined;
  if (envVite && envVite !== 'YOUR_API_KEY') return envVite;
  return 'cb1_58vj_1_e51aadace024f561140a853d';
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  features,
  selectedScenario,
  onSelectScenario,
  origin,
  destination,
  isCalculating = false,
  selectedSegment = null,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const selectedSegmentLayerRef = useRef<L.Polyline | null>(null);
  const routeLayersRef = useRef<{ [key: string]: L.Polyline }>({});
  const haloLayersRef = useRef<{ [key: string]: L.Polyline }>({});
  const markerLayersRef = useRef<{ origin?: L.Marker; destination?: L.Marker }>({});
  const boundaryLayerRef = useRef<L.Rectangle | null>(null);
  const envImageOverlayLayersRef = useRef<{ [key: string]: L.ImageOverlay }>({});

  // Basemap style state: defaults to Carto if key is present or OSM
  const [tileSource, setTileSource] = useState<'carto' | 'osm'>(
    getCartoApiKey() ? 'carto' : 'osm'
  );

  // Environmental map layers state
  const [envLayersState, setEnvLayersState] = useState<{
    lst: boolean;
    ndvi: boolean;
    lst_coverage: boolean;
    ndvi_coverage: boolean;
  }>({
    lst: false,
    ndvi: false,
    lst_coverage: false,
    ndvi_coverage: false,
  });

  const [showEnvMenu, setShowEnvMenu] = useState(false);

  // Initialize Map
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapInstanceRef.current) return;

    // Center on Downtown Phoenix (approx City Hall)
    const map = L.map(container, {
      center: [PHOENIX_STUDY_BOUNDS.centerLat, PHOENIX_STUDY_BOUNDS.centerLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: true,
    });

    // Zoom controls at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Subtle 10x10 km study area boundary rectangle
    const bounds: L.LatLngBoundsLiteral = [
      [PHOENIX_STUDY_BOUNDS.minLat, PHOENIX_STUDY_BOUNDS.minLng],
      [PHOENIX_STUDY_BOUNDS.maxLat, PHOENIX_STUDY_BOUNDS.maxLng],
    ];
    const boundary = L.rectangle(bounds, {
      color: '#426B55',
      weight: 1,
      dashArray: '4, 6',
      fill: true,
      fillColor: '#426B55',
      fillOpacity: 0.015,
      interactive: false,
    }).addTo(map);
    boundaryLayerRef.current = boundary;

    // Invalidate size after layout settles to guarantee tile loading
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // ResizeObserver for dynamic layout changes
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(container);
    }

    mapInstanceRef.current = map;

    return () => {
      clearTimeout(resizeTimer);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Ensure map tiles and buildings never go blank when states change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      map.invalidateSize({ pan: false });
      const raf = requestAnimationFrame(() => {
        map.invalidateSize({ pan: false });
      });
      const timer = setTimeout(() => {
        map.invalidateSize({ pan: false });
      }, 150);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
  }, [features, origin, destination, tileSource]);

  // Update Base Tile Layer dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      baseTileLayerRef.current.remove();
      baseTileLayerRef.current = null;
    }

    const cartoKey = getCartoApiKey();

    if (tileSource === 'carto') {
      const url = cartoKey
        ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(
            cartoKey
          )}`
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

      const layer = L.tileLayer(url, {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
      });

      layer.on('tileerror', (e) => {
        console.warn(
          '[Map Diagnostic] Carto tile load error. Switching to OpenStreetMap fallback.',
          (e.tile as HTMLImageElement)?.src
        );
        setTileSource('osm');
      });

      layer.addTo(map);
      baseTileLayerRef.current = layer;
    } else {
      const layer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
      });
      layer.addTo(map);
      baseTileLayerRef.current = layer;
    }
  }, [tileSource]);

  // Update Environmental Image Overlays dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const overlayLayers = envImageOverlayLayersRef.current;

    (Object.keys(ENV_LAYER_CONFIG) as Array<keyof typeof ENV_LAYER_CONFIG>).forEach((key) => {
      const isActive = envLayersState[key];
      const existingOverlay = overlayLayers[key];

      if (isActive && !existingOverlay) {
        const cfg = ENV_LAYER_CONFIG[key];
        try {
          const overlay = L.imageOverlay(cfg.file, cfg.bounds, {
            opacity: 0.65,
            interactive: false,
          });
          overlay.addTo(map);
          overlay.bringToBack();
          overlayLayers[key] = overlay;
        } catch (err) {
          console.warn(`[Environmental Layer] Failed to load overlay ${key}:`, err);
        }
      } else if (!isActive && existingOverlay) {
        existingOverlay.remove();
        delete overlayLayers[key];
      }
    });
  }, [envLayersState]);

  // Update Segment Highlight
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedSegmentLayerRef.current) {
      selectedSegmentLayerRef.current.remove();
      selectedSegmentLayerRef.current = null;
    }

    if (selectedSegment) {
      const segLatLngs: [number, number][] = [
        [selectedSegment.startLat, selectedSegment.startLng],
        [selectedSegment.endLat, selectedSegment.endLng],
      ];
      const highlight = L.polyline(segLatLngs, {
        color: '#D97706', // Amber highlight
        weight: 8,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
      }).addTo(map);

      highlight.bindTooltip(
        `Segment #${selectedSegment.index} (${selectedSegment.lengthMeters.toFixed(0)}m)`,
        { direction: 'top' }
      );

      selectedSegmentLayerRef.current = highlight;
      map.panTo([selectedSegment.startLat, selectedSegment.startLng]);
    }
  }, [selectedSegment]);

  // Update Origin and Destination Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    if (markerLayersRef.current.origin) {
      markerLayersRef.current.origin.remove();
      delete markerLayersRef.current.origin;
    }
    if (markerLayersRef.current.destination) {
      markerLayersRef.current.destination.remove();
      delete markerLayersRef.current.destination;
    }

    // Origin Marker (Pin A)
    if (origin) {
      const originIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 26px;
            height: 26px;
            background: #202522;
            color: #FFFFFF;
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            font-weight: 700;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">A</div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const markerA = L.marker([origin.latitude, origin.longitude], {
        icon: originIcon,
        title: origin.label || 'Origin',
      }).addTo(map);

      markerA.bindTooltip(
        `<strong style="font-family: 'DM Sans', sans-serif;">Origin</strong><br/>${origin.label || 'Starting point'}`,
        { direction: 'top', offset: [0, -14] }
      );

      markerLayersRef.current.origin = markerA;
    }

    // Destination Marker (Pin B)
    if (destination) {
      const destIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 26px;
            height: 26px;
            background: #274333;
            color: #FFFFFF;
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            font-family: 'IBM Plex Mono', monospace;
            font-size: 11px;
            font-weight: 700;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">B</div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const markerB = L.marker([destination.latitude, destination.longitude], {
        icon: destIcon,
        title: destination.label || 'Destination',
      }).addTo(map);

      markerB.bindTooltip(
        `<strong style="font-family: 'DM Sans', sans-serif;">Destination</strong><br/>${destination.label || 'End point'}`,
        { direction: 'top', offset: [0, -14] }
      );

      markerLayersRef.current.destination = markerB;
    }
  }, [origin, destination]);

  // Update Route Polylines
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove previous polylines
    Object.values(routeLayersRef.current).forEach((layer) => layer.remove());
    Object.values(haloLayersRef.current).forEach((layer) => layer.remove());
    routeLayersRef.current = {};
    haloLayersRef.current = {};

    if (!features || features.length === 0) return;

    const allLatLngs: L.LatLngExpression[] = [];

    // Render each scenario
    features.forEach((feature) => {
      const scenario = feature.properties?.scenario || 'Unknown';
      const config = SCENARIO_STYLES[scenario] || {
        color: '#5A6860',
        label: scenario,
        baseWeight: 4,
        activeWeight: 6,
      };

      // GeoJSON is [lon, lat], convert to Leaflet [lat, lon]
      const latlngs: [number, number][] = feature.geometry.coordinates.map((coord) => [
        coord[1],
        coord[0],
      ]);

      if (latlngs.length === 0) return;

      latlngs.forEach((ll) => allLatLngs.push(ll));

      const isSelected = selectedScenario === scenario;

      // Outer Halo for selected route
      if (isSelected) {
        const halo = L.polyline(latlngs, {
          color: config.color,
          weight: 12,
          opacity: 0.22,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false,
        }).addTo(map);
        haloLayersRef.current[scenario] = halo;
      }

      // Main Route Polyline
      const polyline = L.polyline(latlngs, {
        color: config.color,
        weight: isSelected ? config.activeWeight : config.baseWeight,
        opacity: isSelected ? 1.0 : 0.45,
        dashArray: config.dashArray,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: true,
      }).addTo(map);

      // Tooltip
      polyline.bindTooltip(
        `<strong>${scenario}</strong><br/>Distance: ${feature.properties.distance_km?.toFixed(
          2
        )} km · ${Math.round(feature.properties.walking_time_min)} min`,
        { sticky: true }
      );

      // Click to select route
      polyline.on('click', () => {
        onSelectScenario(scenario);
      });

      // Hover emphasis
      polyline.on('mouseover', () => {
        if (selectedScenario !== scenario) {
          polyline.setStyle({ opacity: 0.85, weight: config.baseWeight + 1.5 });
        }
      });
      polyline.on('mouseout', () => {
        if (selectedScenario !== scenario) {
          polyline.setStyle({ opacity: 0.45, weight: config.baseWeight });
        }
      });

      routeLayersRef.current[scenario] = polyline;

      if (isSelected) {
        polyline.bringToFront();
      }
    });

    // Auto fit bounds with gentle padding
    if (allLatLngs.length > 0) {
      map.invalidateSize();
      const bounds = L.latLngBounds(allLatLngs);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [30, 30],
          maxZoom: 16,
          animate: true,
        });
      }
    }
  }, [features, selectedScenario, onSelectScenario]);

  // Re-order active scenario to front when selection changes
  useEffect(() => {
    if (!selectedScenario) return;
    const activeLayer = routeLayersRef.current[selectedScenario];
    if (activeLayer) {
      activeLayer.bringToFront();
    }
  }, [selectedScenario]);

  // Fit bounds helper
  const handleResetView = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (features && features.length > 0) {
      const allLatLngs: [number, number][] = [];
      features.forEach((f) =>
        f.geometry.coordinates.forEach((c) => allLatLngs.push([c[1], c[0]]))
      );
      if (allLatLngs.length > 0) {
        map.fitBounds(L.latLngBounds(allLatLngs), { padding: [30, 30] });
        return;
      }
    }

    map.setView([PHOENIX_STUDY_BOUNDS.centerLat, PHOENIX_STUDY_BOUNDS.centerLng], 14);
  };

  const activeEnvCount = Object.values(envLayersState).filter(Boolean).length;

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[620px] rounded-xl overflow-hidden border border-[#E5E5DC] shadow-xs bg-[#F4F4EE]">
      {/* Map DOM Target */}
      <div
        ref={mapContainerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Calculating Overlay */}
      {isCalculating && (
        <div className="absolute inset-0 bg-[#F7F7F3]/70 backdrop-blur-[2px] z-[1000] flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5DC] rounded-lg px-4 py-3 shadow-md flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-[#385E48] border-t-transparent rounded-full animate-spin" />
            <span className="font-mono text-xs uppercase tracking-wider text-[#202522]">
              Optimizing corridor...
            </span>
          </div>
        </div>
      )}

      {/* Floating Map HUD Controls (Top Right) */}
      <div className="absolute top-2 right-12 sm:top-3 sm:right-14 z-[990] flex items-center gap-1.5 sm:gap-2">
        {/* Environmental Layers Button */}
        <div className="relative">
          <button
            onClick={() => setShowEnvMenu(!showEnvMenu)}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-md shadow-xs transition-colors cursor-pointer text-[11px] sm:text-xs font-mono flex items-center gap-1 border ${
              activeEnvCount > 0
                ? 'bg-[#385E48] text-white border-[#385E48]'
                : 'bg-white hover:bg-[#F7F7F3] text-[#202522] border-[#E5E5DC]'
            }`}
          >
            <Sliders className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-current" />
            <span>Env {activeEnvCount > 0 ? `(${activeEnvCount})` : ''}</span>
          </button>

          {/* Environmental Layers Dropdown Menu */}
          {showEnvMenu && (
            <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-[#E5E5DC] p-3 z-[1000] space-y-3 font-sans">
              <div className="flex items-center justify-between border-b border-[#E5E5DC] pb-2">
                <span className="font-display text-xs font-bold text-[#202522] uppercase tracking-wider">
                  Environmental Layers
                </span>
                <button
                  onClick={() => setShowEnvMenu(false)}
                  className="text-[#5A6860] hover:text-[#202522]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {(Object.keys(ENV_LAYER_CONFIG) as Array<keyof typeof ENV_LAYER_CONFIG>).map(
                  (key) => {
                    const cfg = ENV_LAYER_CONFIG[key];
                    const isOn = envLayersState[key];
                    return (
                      <div
                        key={key}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer flex flex-col gap-1 ${
                          isOn
                            ? 'bg-[#EBF1ED] border-[#385E48]'
                            : 'bg-[#F7F7F3] border-[#E5E5DC] hover:bg-[#F1F1EB]'
                        }`}
                        onClick={() =>
                          setEnvLayersState((prev) => ({ ...prev, [key]: !prev[key] }))
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border ${
                                isOn
                                  ? 'bg-[#385E48] border-[#385E48] text-white'
                                  : 'bg-white border-[#E5E5DC]'
                              }`}
                            >
                              {isOn && <Check className="w-3 h-3" />}
                            </div>
                            <span className="font-semibold text-[#202522] text-[11px] sm:text-xs">{cfg.name}</span>
                          </div>
                          <span className="font-mono text-[9px] sm:text-[10px] text-[#5A6860] bg-white px-1.5 py-0.5 rounded border border-[#E5E5DC]">
                            {cfg.range}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {activeEnvCount > 0 && (
                <div className="pt-2 border-t border-[#E5E5DC] flex justify-between items-center text-xs">
                  <span className="text-[10px] font-mono text-[#5A6860]">
                    Layers active
                  </span>
                  <button
                    onClick={() =>
                      setEnvLayersState({
                        lst: false,
                        ndvi: false,
                        lst_coverage: false,
                        ndvi_coverage: false,
                      })
                    }
                    className="text-[11px] text-[#385E48] font-semibold hover:underline cursor-pointer"
                  >
                    Turn All Off
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Basemap Switcher Button */}
        <button
          onClick={() =>
            setTileSource((prev: 'carto' | 'osm') => (prev === 'carto' ? 'osm' : 'carto'))
          }
          title={`Switch Basemap Style`}
          className="px-2 py-1.5 sm:px-2.5 sm:py-1.5 bg-white hover:bg-[#F7F7F3] text-[#202522] border border-[#E5E5DC] rounded-md shadow-xs transition-colors cursor-pointer text-[11px] sm:text-xs font-mono flex items-center gap-1"
        >
          <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#385E48]" />
          <span className="hidden sm:inline">{tileSource === 'carto' ? 'Carto' : 'OSM'}</span>
        </button>

        {/* Reset View Button */}
        <button
          onClick={handleResetView}
          title="Reset View"
          className="p-1.5 sm:p-2 bg-white hover:bg-[#F7F7F3] text-[#202522] border border-[#E5E5DC] rounded-md shadow-xs transition-colors cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Scientific Labelling Note Banner (shown when any env layer is active) */}
      {activeEnvCount > 0 && (
        <div className="absolute top-14 right-2 left-2 sm:top-16 sm:right-14 sm:left-auto z-[980] max-w-md bg-[#202522]/95 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-mono p-2.5 sm:p-3 rounded-lg shadow-lg border border-[#385E48] space-y-1">
          <div className="flex items-center gap-1 font-bold text-[#86EFAC]">
            <Info className="w-3 h-3 shrink-0" />
            <span>Landsat Environmental Indicators (Phoenix 2025)</span>
          </div>
          <p className="text-zinc-300 leading-tight">
            LST is satellite surface temp, not pedestrian air temp (30m aligned grid). NDVI measures greenness, not direct shade.
          </p>
        </div>
      )}

      {/* Bottom Cartographic Legend */}
      <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-[990] bg-white/95 backdrop-blur-md border border-[#E5E5DC] rounded-lg p-2 sm:p-3 shadow-xs max-w-[220px] sm:max-w-[260px]">
        <div className="flex items-center gap-1 text-[11px] sm:text-xs font-mono font-semibold uppercase text-[#202522] mb-1.5 sm:mb-2 border-b border-[#E5E5DC] pb-1">
          <Layers className="w-3 h-3 text-[#385E48]" />
          <span>Route Scenarios</span>
        </div>
        <div className="space-y-1 text-[11px] sm:text-xs">
          <button
            onClick={() => onSelectScenario('Shortest')}
            className={`w-full flex items-center justify-between text-left px-1.5 py-0.5 sm:py-1 rounded transition-colors cursor-pointer ${
              selectedScenario === 'Shortest'
                ? 'bg-[#F1F1EB] font-semibold text-[#202522]'
                : 'text-[#5A6860] hover:text-[#202522]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-1 inline-block rounded-full"
                style={{ backgroundColor: SCENARIO_STYLES['Shortest'].color }}
              />
              <span>Shortest</span>
            </div>
            <span className="font-mono text-[10px] text-[#5A6860]">λ=0</span>
          </button>

          <button
            onClick={() => onSelectScenario('Lower exposure (lambda=1)')}
            className={`w-full flex items-center justify-between text-left px-1.5 py-0.5 sm:py-1 rounded transition-colors cursor-pointer ${
              selectedScenario === 'Lower exposure (lambda=1)'
                ? 'bg-[#F1F1EB] font-semibold text-[#202522]'
                : 'text-[#5A6860] hover:text-[#202522]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-1 inline-block rounded-full"
                style={{
                  backgroundColor: SCENARIO_STYLES['Lower exposure (lambda=1)'].color,
                }}
              />
              <span>Lower Exp</span>
            </div>
            <span className="font-mono text-[10px] text-[#5A6860]">λ=1</span>
          </button>

          <button
            onClick={() => onSelectScenario('Lower exposure (lambda=2)')}
            className={`w-full flex items-center justify-between text-left px-1.5 py-1 rounded transition-colors cursor-pointer ${
              selectedScenario === 'Lower exposure (lambda=2)'
                ? 'bg-[#EBF1ED] font-semibold text-[#274333]'
                : 'text-[#5A6860] hover:text-[#202522]'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-3.5 h-1.5 inline-block rounded-full"
                style={{
                  backgroundColor: SCENARIO_STYLES['Lower exposure (lambda=2)'].color,
                }}
              />
              <span>Lowest Proxy</span>
            </div>
            <span className="font-mono text-[10px] text-[#385E48]">λ=2</span>
          </button>
        </div>
      </div>
    </div>
  );
};
