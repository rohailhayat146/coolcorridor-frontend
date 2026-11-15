
import React, { useState } from 'react';
import { RouteFeature } from '../types/routes';
import { extractRouteSegments, RouteSegmentData } from '../utils/segments';
import {
  Navigation,
  ChevronDown,
  ChevronRight,
  MapPin,
  Ruler,
  X,
  MousePointerClick,
  Info,
} from 'lucide-react';

interface SegmentInspectorProps {
  feature: RouteFeature;
  selectedSegment: RouteSegmentData | null;
  onSelectSegment: (segment: RouteSegmentData | null) => void;
}

export const SegmentInspector: React.FC<SegmentInspectorProps> = ({
  feature,
  selectedSegment,
  onSelectSegment,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const segments = extractRouteSegments(feature.geometry.coordinates);

  if (segments.length === 0) return null;

  const activeSegment = selectedSegment
    ? segments.find(segment => segment.index === selectedSegment.index) ?? null
    : null;

  const isSelected = (index: number) =>
    activeSegment?.index === index;

  const totalLength = segments.reduce(
    (total, segment) => total + segment.lengthMeters,
    0
  );

  return (
    <div className="border border-[#E5E5DC] rounded-xl bg-white overflow-hidden">

      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FAFAF7] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EBF1ED] flex items-center justify-center">
            <Navigation className="w-4 h-4 text-[#385E48]" />
          </div>

          <div>
            <div className="font-display text-xs font-bold text-[#202522] uppercase tracking-wider">
              Corridor Intelligence
            </div>
            <div className="text-[11px] text-[#7A827C] mt-1">
              {segments.length} sections · {totalLength >= 1000
                ? `${(totalLength / 1000).toFixed(2)} km`
                : `${totalLength.toFixed(0)} m`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeSegment && (
            <span className="text-[10px] font-mono bg-[#EBF1ED] text-[#385E48] px-2 py-1 rounded-md">
              Section {activeSegment.index}
            </span>
          )}

          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-[#5A6860]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#5A6860]" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-3 border-t border-[#E5E5DC] space-y-4">

          {/* Introduction */}
          <div className="flex gap-2 items-start bg-[#F7F7F3] rounded-lg p-3">
            <Info className="w-4 h-4 text-[#385E48] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#5A6860] leading-relaxed">
              Explore your route section by section. Select any section to
              inspect its geographical position and length, and locate it
              directly on the map. Environmental measurements currently
              describe the overall route rather than individual sections.
            </p>
          </div>

          {/* Route overview */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#F7F7F3] rounded-lg p-3">
              <div className="text-[9px] uppercase tracking-wider font-bold text-[#7A827C]">
                Sections analysed
              </div>
              <div className="text-lg font-bold text-[#202522] mt-1">
                {segments.length}
              </div>
            </div>

            <div className="bg-[#F7F7F3] rounded-lg p-3">
              <div className="text-[9px] uppercase tracking-wider font-bold text-[#7A827C]">
                Total route length
              </div>
              <div className="text-lg font-bold text-[#202522] mt-1">
                {totalLength >= 1000
                  ? `${(totalLength / 1000).toFixed(2)} km`
                  : `${totalLength.toFixed(0)} m`}
              </div>
            </div>
          </div>

          {/* Segment list heading */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#202522]">
                Route sections
              </h3>
              <p className="text-[10px] text-[#7A827C] mt-1">
                Select a section to locate it on the map
              </p>
            </div>

            {activeSegment && (
              <button
                type="button"
                onClick={() => onSelectSegment(null)}
                className="text-[10px] font-medium text-[#385E48] hover:underline"
              >
                Clear selection
              </button>
            )}
          </div>

          {/* Segment list */}
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {segments.map((segment, position) => {
              const active = isSelected(segment.index);

              return (
                <button
                  key={segment.index}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    onSelectSegment(active ? null : segment)
                  }
                  className={`w-full rounded-lg border p-3 text-left transition-all ${
                    active
                      ? 'bg-[#EBF1ED] border-[#385E48] shadow-sm'
                      : 'bg-white border-[#E5E5DC] hover:bg-[#F7F7F3] hover:border-[#B8C8BB]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">

                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          active
                            ? 'bg-[#385E48] text-white'
                            : 'bg-[#F1F1EB] text-[#5A6860]'
                        }`}
                      >
                        {position + 1}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#202522]">
                          Route section {position + 1}
                        </div>
                        <div className="text-[10px] text-[#7A827C] font-mono mt-1">
                          {segment.lengthMeters.toFixed(1)} metres
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {active && (
                        <span className="text-[9px] uppercase tracking-wider font-bold text-[#385E48]">
                          Selected
                        </span>
                      )}
                      <ChevronRight
                        className={`w-4 h-4 ${
                          active ? 'text-[#385E48]' : 'text-[#A0A69F]'
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selection prompt */}
          {!activeSegment && (
            <div className="border border-dashed border-[#C9CEC6] rounded-lg p-5 text-center">
              <MousePointerClick className="w-5 h-5 text-[#385E48] mx-auto mb-2" />

              <p className="text-xs font-semibold text-[#202522]">
                Select a route section
              </p>

              <p className="text-[10px] text-[#7A827C] mt-1 leading-relaxed">
                Choose any section above to inspect its geographical
                details and highlight its position on the map.
              </p>
            </div>
          )}

          {/* Selected segment details */}
          {activeSegment && (
            <div className="rounded-xl border border-[#B8C8BB] overflow-hidden">

              <div className="bg-[#EBF1ED] px-3 py-3 flex items-center justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-[#5A6860] font-bold">
                    Section inspection
                  </div>
                  <div className="text-sm font-bold text-[#274333] mt-1">
                    Route section {segments.findIndex(
                      segment => segment.index === activeSegment.index
                    ) + 1}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectSegment(null)}
                  aria-label="Clear selected section"
                  className="p-1.5 rounded-md hover:bg-white/70 text-[#385E48]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 space-y-3">

                {/* Length */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F1F1EB] flex items-center justify-center">
                    <Ruler className="w-4 h-4 text-[#385E48]" />
                  </div>

                  <div>
                    <div className="text-[10px] text-[#7A827C]">
                      Section length
                    </div>
                    <div className="text-sm font-bold text-[#202522]">
                      {activeSegment.lengthMeters.toFixed(1)} m
                    </div>
                  </div>
                </div>

                {/* Coordinates */}
                <div className="border-t border-[#E5E5DC] pt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#385E48]" />
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#5A6860]">
                      Geographical position
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#F7F7F3] rounded-lg p-2">
                      <div className="text-[9px] text-[#7A827C] mb-1">
                        Starting point
                      </div>
                      <div className="text-[10px] font-mono text-[#202522]">
                        {activeSegment.startLat.toFixed(5)}
                      </div>
                      <div className="text-[10px] font-mono text-[#202522]">
                        {activeSegment.startLng.toFixed(5)}
                      </div>
                    </div>

                    <div className="bg-[#F7F7F3] rounded-lg p-2">
                      <div className="text-[9px] text-[#7A827C] mb-1">
                        Ending point
                      </div>
                      <div className="text-[10px] font-mono text-[#202522]">
                        {activeSegment.endLat.toFixed(5)}
                      </div>
                      <div className="text-[10px] font-mono text-[#202522]">
                        {activeSegment.endLng.toFixed(5)}
                      </div>
                    </div>
                  </div>

                  {/* Midpoint */}
                  <div className="bg-[#F7F7F3] rounded-lg p-2">
                    <div className="text-[9px] text-[#7A827C] mb-1">
                      Section midpoint
                    </div>
                    <div className="text-[10px] font-mono text-[#202522]">
                      {activeSegment.midpointLat.toFixed(5)}, {activeSegment.midpointLng.toFixed(5)}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
