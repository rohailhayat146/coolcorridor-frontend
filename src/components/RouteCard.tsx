import React from 'react';
import { RouteFeature } from '../types/routes';
import { Check, Clock, Route, Thermometer, Trees, ShieldAlert } from 'lucide-react';

interface RouteCardProps {
  feature: RouteFeature;
  isSelected: boolean;
  onSelect: () => void;
  shortestFeature?: RouteFeature;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  feature,
  isSelected,
  onSelect,
  shortestFeature,
}) => {
  const p = feature.properties;
  const scenario = p.scenario;

  const isLambda2 = scenario.includes('lambda=2');
  const isLambda1 = scenario.includes('lambda=1');
  const isShortest = scenario === 'Shortest';

  // Calculate dynamic differences against shortest route
  let exposureReductionPercent: number | null = null;
  let timeDifferenceMin: number | null = null;
  let distanceDifferenceMeters: number | null = null;

  if (shortestFeature && !isShortest) {
    const shortestExposure = shortestFeature.properties.mean_exposure_score;
    if (shortestExposure > 0) {
      exposureReductionPercent =
        ((shortestExposure - p.mean_exposure_score) / shortestExposure) * 100;
    }
    timeDifferenceMin = p.walking_time_min - shortestFeature.properties.walking_time_min;
    distanceDifferenceMeters =
      (p.distance_km - shortestFeature.properties.distance_km) * 1000;
  }

  // Accent theme based on scenario
  const getBadge = () => {
    if (isLambda2) {
      return (
        <span className="text-[11px] font-mono text-[#274333] font-medium">
          Lower relative exposure score
        </span>
      );
    }
    if (isLambda1) {
      return (
        <span className="text-[11px] font-mono text-[#5A6860]">
          Balanced exposure & distance
        </span>
      );
    }
    return (
      <span className="text-[11px] font-mono text-[#5A6860]">
        Direct baseline path
      </span>
    );
  };

  const getBorderColor = () => {
    if (isSelected) {
      if (isLambda2) return 'border-[#274333] ring-1 ring-[#274333] bg-[#F7F9F7]';
      if (isLambda1) return 'border-[#6E8B68] ring-1 ring-[#6E8B68] bg-[#F9FAF8]';
      return 'border-[#334155] ring-1 ring-[#334155] bg-white';
    }
    return 'border-[#E5E5DC] hover:border-[#B8B8AE] bg-white';
  };

  return (
    <div
      onClick={onSelect}
      className={`relative p-4 rounded-xl border transition-all cursor-pointer ${getBorderColor()}`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isLambda2
                  ? 'bg-[#274333]'
                  : isLambda1
                  ? 'bg-[#6E8B68]'
                  : 'bg-[#334155]'
              }`}
            />
            <h4 className="font-display text-sm font-bold text-[#202522]">
              {scenario}
            </h4>
          </div>
          <div className="mt-0.5">{getBadge()}</div>
        </div>

        {/* Selected Radio / Check Icon */}
        <div
          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
            isSelected
              ? isLambda2
                ? 'bg-[#274333] border-[#274333] text-white'
                : 'bg-[#202522] border-[#202522] text-white'
              : 'border-[#D0D0C8] bg-transparent'
          }`}
        >
          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
        </div>
      </div>

      {/* Primary Metrics (Distance & Walking Time) */}
      <div className="grid grid-cols-2 gap-3 py-2.5 my-2 border-y border-[#E5E5DC]/80">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#5A6860]">
            <Route className="w-3.5 h-3.5" />
            <span>Distance</span>
          </div>
          <div className="text-base font-bold font-mono tabular-nums text-[#202522] mt-0.5">
            {p.distance_km?.toFixed(2)} <span className="text-xs font-normal text-[#5A6860]">km</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#5A6860]">
            <Clock className="w-3.5 h-3.5" />
            <span>Est. Walk Time</span>
          </div>
          <div className="text-base font-bold font-mono tabular-nums text-[#202522] mt-0.5">
            {Math.round(p.walking_time_min)}{' '}
            <span className="text-xs font-normal text-[#5A6860]">min</span>
          </div>
        </div>
      </div>

      {/* Environmental Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center pt-1 pb-2">
        <div className="bg-[#F7F7F3] rounded-md p-1.5">
          <div className="text-[10px] font-mono uppercase text-[#5A6860] flex items-center justify-center gap-1">
            <ShieldAlert className="w-2.5 h-2.5" />
            <span>Exp. Score</span>
          </div>
          <div className="text-xs font-mono font-bold text-[#202522] mt-0.5">
            {p.mean_exposure_score?.toFixed(1)}
          </div>
        </div>

        <div className="bg-[#F7F7F3] rounded-md p-1.5">
          <div className="text-[10px] font-mono uppercase text-[#5A6860] flex items-center justify-center gap-1">
            <Thermometer className="w-2.5 h-2.5" />
            <span>Mean LST</span>
          </div>
          <div className="text-xs font-mono font-bold text-[#202522] mt-0.5">
            {p.mean_lst_c?.toFixed(1)}°C
          </div>
        </div>

        <div className="bg-[#F7F7F3] rounded-md p-1.5">
          <div className="text-[10px] font-mono uppercase text-[#5A6860] flex items-center justify-center gap-1">
            <Trees className="w-2.5 h-2.5" />
            <span>NDVI</span>
          </div>
          <div className="text-xs font-mono font-bold text-[#202522] mt-0.5">
            {p.mean_ndvi?.toFixed(3)}
          </div>
        </div>
      </div>

      {/* Comparison Delta vs Shortest Route (Live Calculated) */}
      {!isShortest && exposureReductionPercent !== null && (
        <div className="mt-2 pt-2 border-t border-[#E5E5DC]/80 flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#274333] font-medium">
            {exposureReductionPercent > 0 ? (
              <>↓ {exposureReductionPercent.toFixed(1)}% exposure proxy</>
            ) : (
              <>Equivalent exposure</>
            )}
          </span>
          <span className="text-[#5A6860]">
            {timeDifferenceMin !== null && timeDifferenceMin > 0
              ? `+${timeDifferenceMin.toFixed(1)} min (${Math.round(
                  distanceDifferenceMeters || 0
                )}m)`
              : 'Same time'}
          </span>
        </div>
      )}
    </div>
  );
};
