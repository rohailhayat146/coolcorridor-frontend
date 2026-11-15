import React from 'react';
import { RouteFeature, RouteMetadata } from '../types/routes';

interface InterventionPlannerProps {
  selectedFeature: RouteFeature;
  metadata?: RouteMetadata | null;
}

export const InterventionPlanner: React.FC<InterventionPlannerProps> = ({
  selectedFeature,
  metadata,
}) => {
  const p = selectedFeature.properties;
  const lst = p.mean_lst_c;
  const ndvi = p.mean_ndvi;

  // Snapping calculations from metadata
  const originSnap = metadata?.origin_snap_distance_m ?? 0;
  const destSnap = metadata?.destination_snap_distance_m ?? 0;
  const hasSubstantialOriginSnap = originSnap >= 25;
  const hasSubstantialDestSnap = destSnap >= 25;

  return (
    <div className="border border-[#E5E5DC] rounded-xl bg-white p-4 space-y-4 text-[#202522] shadow-xs">
      {/* Header */}
      <div className="border-b border-[#E5E5DC] pb-2">
        <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#202522]">
          Intervention Planner
        </h4>
        <p className="text-[11px] text-[#5A6860] mt-0.5">
          Decision support for urban heat mitigation · {p.scenario}
        </p>
      </div>

      {/* Observed Baseline */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#5A6860] font-semibold">
          Observed Baseline
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#F7F7F3] border border-[#E5E5DC] rounded-lg p-2.5">
            <div className="text-[11px] font-mono text-[#5A6860]">Mean Surface Temp (LST)</div>
            <div className="font-display text-base font-bold text-[#202522] tabular-nums mt-0.5">
              {lst.toFixed(1)}°C
            </div>
          </div>
          <div className="bg-[#F7F7F3] border border-[#E5E5DC] rounded-lg p-2.5">
            <div className="text-[11px] font-mono text-[#5A6860]">Mean Greenness (NDVI)</div>
            <div className="font-display text-base font-bold text-[#202522] tabular-nums mt-0.5">
              {ndvi.toFixed(3)}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-[#5A6860] leading-relaxed">
          {ndvi < 0.2
            ? 'Relatively low vegetation greenness along this corridor. NDVI indicates vegetation presence, but does not directly measure pedestrian shade.'
            : 'Moderate vegetation greenness along this corridor. NDVI indicates vegetation presence, but does not directly measure pedestrian shade.'}
        </p>
      </div>

      {/* Proposed Interventions */}
      <div className="space-y-2 pt-2 border-t border-[#E5E5DC]">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#5A6860] font-semibold">
          Proposed Interventions
        </div>
        <div className="space-y-2.5 text-xs">
          <div className="space-y-0.5">
            <div className="font-semibold text-[#202522]">Urban trees and vegetation</div>
            <p className="text-[#5A6860] leading-relaxed text-[11px]">
              Prioritise suitable gaps along pedestrian corridors for drought-tolerant vegetation and future canopy development.
            </p>
          </div>
          <div className="space-y-0.5">
            <div className="font-semibold text-[#202522]">Pedestrian shade infrastructure</div>
            <p className="text-[#5A6860] leading-relaxed text-[11px]">
              Consider shade structures at exposed pedestrian waiting areas where tree planting may be impractical.
            </p>
          </div>
          <div className="space-y-0.5">
            <div className="font-semibold text-[#202522]">Cool-pavement assessment</div>
            <p className="text-[#5A6860] leading-relaxed text-[11px]">
              Identify high-surface-temperature areas for further investigation of suitable reflective pavement interventions.
            </p>
          </div>
        </div>
      </div>

      {/* Network Precision Warning */}
      {(hasSubstantialOriginSnap || hasSubstantialDestSnap) && (
        <div className="p-2.5 bg-[#FAF7F2] border border-[#E8DFD1] rounded-lg text-[11px] text-[#7A5B35] leading-relaxed">
          {hasSubstantialOriginSnap && hasSubstantialDestSnap ? (
            <span>
              Origin snapped {originSnap.toFixed(1)} m and destination snapped {destSnap.toFixed(1)} m to the pedestrian network. The routed endpoints may differ from your selected locations.
            </span>
          ) : hasSubstantialOriginSnap ? (
            <span>
              Origin snapped {originSnap.toFixed(1)} m to the pedestrian network. The routed starting point may differ from your selected location.
            </span>
          ) : (
            <span>
              Destination snapped {destSnap.toFixed(1)} m to the pedestrian network. The routed endpoint may differ from your selected location.
            </span>
          )}
        </div>
      )}

      {/* Compact Technical Parameters */}
      {metadata && (
        <div className="pt-2 border-t border-[#E5E5DC] text-[10px] font-mono text-[#5A6860] space-y-1">
          <div className="flex flex-wrap justify-between gap-x-3 gap-y-0.5">
            <span>Speed: {metadata.walking_speed_mps || 1.2} m/s</span>
            <span>CRS: {metadata.coordinate_system || 'EPSG:4326'}</span>
            <span>Origin Snap: {originSnap.toFixed(1)} m</span>
            <span>Dest Snap: {destSnap.toFixed(1)} m</span>
          </div>
          <p className="italic text-[#7A8680]">
            {metadata.exposure_score_note || 'Relative environmental score proxy, not measured pedestrian heat exposure.'}
          </p>
        </div>
      )}

      {/* Scientific Distinction Notice */}
      <div className="p-2.5 bg-[#F7F7F3] border border-[#E5E5DC] rounded-lg text-[10px] text-[#5A6860] leading-relaxed space-y-1">
        <div className="font-semibold text-[#202522]">Scientific Distinction Notice</div>
        <p>
          Landsat LST measures land-surface temperature, not pedestrian-level air temperature. NDVI is a vegetation-greenness indicator, not a direct shade measurement. Proposed interventions are recommendations, not implemented changes, and CoolCorridor does not predict exact temperature reductions.
        </p>
      </div>
    </div>
  );
};
