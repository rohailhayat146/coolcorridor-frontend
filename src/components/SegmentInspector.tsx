import React, { useState } from 'react';
import { RouteFeature } from '../types/routes';
import { extractRouteSegments, RouteSegmentData } from '../utils/segments';
import { Navigation, ChevronRight } from 'lucide-react';

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
  const p = feature.properties;

  if (segments.length === 0) return null;

  return (
    <div className="border border-[#E5E5DC] rounded-xl bg-white p-4 space-y-3">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#385E48]" />
          <span className="font-display text-xs font-bold text-[#202522] uppercase tracking-wider">
            Street Segment Inspector ({segments.length} segments)
          </span>
        </div>
        <button type="button" className="text-xs font-mono text-[#5A6860] hover:text-[#202522]">
          {isOpen ? 'Collapse ∧' : 'Expand ∨'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-3 pt-2 border-t border-[#E5E5DC]">
          <p className="text-[11px] text-[#5A6860] leading-relaxed">
            Click any network segment below to inspect its length, coordinates, and associated environmental proxy values.
          </p>

          {/* Segment dropdown / selector */}
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
            {segments.map((seg) => {
              const isSelected = selectedSegment?.index === seg.index;
              return (
                <button
                  key={seg.index}
                  type="button"
                  onClick={() => onSelectSegment(isSelected ? null : seg)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center justify-between cursor-pointer border ${
                    isSelected
                      ? 'bg-[#EBF1ED] border-[#385E48] text-[#274333] font-semibold'
                      : 'bg-[#F7F7F3] border-[#E5E5DC] text-[#202522] hover:bg-[#F1F1EB]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-[#E5E5DC]">
                      #{seg.index}
                    </span>
                    <span>{seg.lengthMeters.toFixed(0)}m segment</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-[#385E48]' : 'text-[#5A6860]'}`} />
                </button>
              );
            })}
          </div>

          {/* Selected Segment Details Card */}
          {selectedSegment && (
            <div className="p-3 bg-[#F7F7F3] rounded-lg border border-[#E5E5DC] space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-[#E5E5DC] pb-1.5">
                <span className="font-bold text-[#202522]">Segment #{selectedSegment.index} Details</span>
                <button
                  type="button"
                  onClick={() => onSelectSegment(null)}
                  className="text-[11px] text-[#5A6860] hover:text-[#202522]"
                >
                  Clear Selection
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#5A6860]">Length:</span> <span className="text-[#202522] font-bold">{selectedSegment.lengthMeters.toFixed(1)} m</span>
                </div>
                <div>
                  <span className="text-[#5A6860]">Est. LST:</span> <span className="text-[#202522] font-bold">{p.mean_lst_c?.toFixed(1)}°C</span>
                </div>
                <div>
                  <span className="text-[#5A6860]">Mean NDVI:</span> <span className="text-[#202522] font-bold">{p.mean_ndvi?.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-[#5A6860]">Exp. Score:</span> <span className="text-[#202522] font-bold">{p.mean_exposure_score?.toFixed(1)}</span>
                </div>
              </div>
              <div className="text-[10px] text-[#5A6860] pt-1 border-t border-[#E5E5DC]/60">
                Start: [{selectedSegment.startLat.toFixed(4)}, {selectedSegment.startLng.toFixed(4)}] → End: [{selectedSegment.endLat.toFixed(4)}, {selectedSegment.endLng.toFixed(4)}]
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
