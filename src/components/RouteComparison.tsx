import React from 'react';
import { RouteFeature } from '../types/routes';
import { RouteCard } from './RouteCard';
import { WhyThisRoute } from './WhyThisRoute';

interface RouteComparisonProps {
  features: RouteFeature[];
  selectedScenario: string | null;
  onSelectScenario: (scenario: string) => void;
}

export const RouteComparison: React.FC<RouteComparisonProps> = ({
  features,
  selectedScenario,
  onSelectScenario,
}) => {
  if (!features || features.length === 0) {
    return null;
  }

  // Find shortest feature to use as relative comparison baseline
  const shortestFeature = features.find((f) => f.properties?.scenario === 'Shortest');
  const selectedFeature =
    features.find((f) => f.properties?.scenario === selectedScenario) || features[0];

  // Sorted list: Shortest, lambda=1, lambda=2
  const sortedFeatures = [...features].sort((a, b) => {
    const order: Record<string, number> = {
      Shortest: 1,
      'Lower exposure (lambda=1)': 2,
      'Lower exposure (lambda=2)': 3,
    };
    return (order[a.properties.scenario] || 99) - (order[b.properties.scenario] || 99);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[#E5E5DC] pb-2">
        <h3 className="font-display text-sm font-bold text-[#202522]">
          Available Route Alternatives ({features.length})
        </h3>
        <span className="text-[11px] font-mono text-[#5A6860]">
          Click card to highlight
        </span>
      </div>

      {/* Route Cards */}
      <div className="space-y-3">
        {sortedFeatures.map((feat, index) => {
          const scenario = feat.properties.scenario;
          return (
            <RouteCard
              key={scenario || index}
              feature={feat}
              isSelected={selectedScenario === scenario}
              onSelect={() => {
                onSelectScenario(scenario);
              }}
              shortestFeature={shortestFeature}
            />
          );
        })}
      </div>

      {/* "Why this route?" Explanation Panel */}
      {selectedFeature && (
        <WhyThisRoute
          selectedFeature={selectedFeature}
          shortestFeature={shortestFeature}
        />
      )}
    </div>
  );
};
