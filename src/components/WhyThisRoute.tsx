import React from 'react';
import { RouteFeature } from '../types/routes';
import { Sparkles } from 'lucide-react';

interface WhyThisRouteProps {
  selectedFeature: RouteFeature;
  shortestFeature?: RouteFeature;
}

export const WhyThisRoute: React.FC<WhyThisRouteProps> = ({
  selectedFeature,
  shortestFeature,
}) => {
  const p = selectedFeature.properties;
  const scenario = p.scenario;

  if (scenario === 'Shortest' || !shortestFeature) {
    return (
      <div className="p-4 rounded-xl bg-white border border-[#E5E5DC] space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#202522] font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#385E48]" />
          <span>Why this route?</span>
        </div>
        <p className="text-xs text-[#5A6860] leading-relaxed">
          The <strong className="text-[#202522]">Shortest</strong> route prioritizes direct physical distance ({p.distance_km.toFixed(2)} km) with no environmental weighting ($\lambda = 0$). It offers the fastest traversal time but crosses higher surface temperature anomalies.
        </p>
      </div>
    );
  }

  const shortP = shortestFeature.properties;
  const distanceDiffPercent = ((p.distance_km - shortP.distance_km) / shortP.distance_km) * 100;
  const exposureDiffPercent = ((shortP.mean_exposure_score - p.mean_exposure_score) / shortP.mean_exposure_score) * 100;

  return (
    <div className="p-4 rounded-xl bg-white border border-[#E5E5DC] space-y-2">
      <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#202522] font-bold">
        <Sparkles className="w-3.5 h-3.5 text-[#385E48]" />
        <span>Why this route? ({scenario})</span>
      </div>
      <p className="text-xs text-[#5A6860] leading-relaxed">
        The <strong className="text-[#202522]">{scenario}</strong> alternative is approximately{' '}
        <strong className="text-[#202522]">{Math.abs(distanceDiffPercent).toFixed(1)}% {distanceDiffPercent >= 0 ? 'longer' : 'shorter'}</strong> than the shortest route ({p.distance_km.toFixed(2)} km vs {shortP.distance_km.toFixed(2)} km) and achieves a{' '}
        <strong className="text-[#274333]">{exposureDiffPercent.toFixed(1)}% lower</strong> mean environmental exposure-score proxy ({p.mean_exposure_score.toFixed(1)} vs {shortP.mean_exposure_score.toFixed(1)}).
      </p>
    </div>
  );
};
