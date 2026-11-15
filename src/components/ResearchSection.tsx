import React, { useState } from 'react';
import { Layers, Database, Compass, Sliders } from 'lucide-react';

export const ResearchSection: React.FC = () => {
  const [interactiveLambda, setInteractiveLambda] = useState(2);

  // Verified Research Facts from Prompt §12
  const researchStats = [
    { label: 'Study Location', value: 'Downtown Phoenix, AZ', detail: 'Arid metropolitan core' },
    { label: 'Study Area Grid', value: '10 km × 10 km', detail: '100 sq km domain' },
    { label: 'Satellite Scenes', value: '44 Landsat Scenes', detail: 'Pooled May–September overpasses' },
    { label: 'Pedestrian Nodes', value: '45,483 Nodes', detail: 'Graph intersection points' },
    { label: 'Directed Edges', value: '137,994 Edges', detail: 'Bidirectional route graph' },
    { label: 'Physical Segments', value: '70,025 Segments', detail: 'Scored pedestrian sidewalks' },
  ];

  return (
    <section id="research" className="py-14 md:py-20 border-t border-[#E5E5DC] bg-[#F7F7F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#5A6860] mb-2">
            <Database className="w-3.5 h-3.5 text-[#385E48]" />
            <span>EMPIRICAL FOUNDATION & ROUTING ALGORITHM</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#202522]">
            Research and Environmental Methodology
          </h2>
          <p className="text-sm sm:text-base text-[#5A6860] mt-2 leading-relaxed">
            CoolCorridor couples Earth-observation data with graph-theoretic shortest-path
            optimization. Each directed edge in the Downtown Phoenix pedestrian network is scored
            using calibrated satellite indicators of surface heat and vegetative density.
          </p>
        </div>

        {/* 6 Key Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {researchStats.map((stat, idx) => (
            <div
              key={idx}
              className="p-4 bg-white border border-[#E5E5DC] rounded-xl flex flex-col justify-between"
            >
              <div className="text-[11px] font-mono uppercase text-[#5A6860]">
                {stat.label}
              </div>
              <div className="font-mono text-base font-bold text-[#202522] my-1.5 tabular-nums">
                {stat.value}
              </div>
              <div className="text-[11px] text-[#5A6860]/80">
                {stat.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Cost Function & Scoring Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Mathematical Formulation */}
          <div className="lg:col-span-7 bg-white border border-[#E5E5DC] rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#E5E5DC] pb-3 mb-4">
                <span className="font-mono text-xs uppercase font-bold text-[#202522]">
                  Edge Cost Optimization Formula
                </span>
                <span className="font-mono text-xs text-[#385E48]">Dijkstra Variant</span>
              </div>

              {/* Formula Card */}
              <div className="p-4 rounded-lg bg-[#F7F7F3] border border-[#E5E5DC] text-center my-4">
                <div className="font-mono text-base sm:text-lg font-bold text-[#202522]">
                  Cost(e) = Length(e) × [ 1 + λ × (Exposure(e) / 100) ]
                </div>
                <div className="text-xs font-mono text-[#5A6860] mt-2">
                  where Exposure(e) = 0.70 × P(LST) + 0.30 × [ 100 - P(NDVI) ]
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm text-[#5A6860] leading-relaxed">
                <p>
                  <strong className="text-[#202522]">Length(e):</strong> The physical length of the
                  pedestrian segment in metres.
                </p>
                <p>
                  <strong className="text-[#202522]">70% LST Percentile:</strong> Land Surface
                  Temperature derived from Landsat thermal sensors, normalized against all pedestrian
                  segments in Phoenix.
                </p>
                <p>
                  <strong className="text-[#202522]">30% Inverse NDVI Percentile:</strong> Vegetation
                  density index. Lower greenness scores an exposure penalty, capturing barren sidewalks.
                </p>
                <p>
                  <strong className="text-[#202522]">Lambda (λ) Multiplier:</strong> Controls the
                  pedestrian's willingness to add walking distance in exchange for walking along
                  corridors with lower relative environmental scores.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E5DC] text-xs font-mono text-[#5A6860]">
              Scoring weights: 70% LST percentile · 30% inverse NDVI percentile
            </div>
          </div>

          {/* Right Column: Interactive Lambda Trade-Off Explorer */}
          <div className="lg:col-span-5 bg-white border border-[#E5E5DC] rounded-xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-[#E5E5DC] pb-3 mb-4">
                <Sliders className="w-4 h-4 text-[#385E48]" />
                <span className="font-mono text-xs uppercase font-bold text-[#202522]">
                  Inspect Lambda Sensitivity (λ)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-[#5A6860]">Sensitivity Level:</span>
                <span className="font-bold text-[#202522] text-sm">λ = {interactiveLambda}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[0, 1, 2].map((val) => (
                  <button
                    key={val}
                    onClick={() => setInteractiveLambda(val)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono transition-colors border cursor-pointer ${
                      interactiveLambda === val
                        ? 'bg-[#385E48] text-white border-[#385E48] font-bold shadow-xs'
                        : 'bg-[#F7F7F3] text-[#5A6860] border-[#E5E5DC] hover:text-[#202522]'
                    }`}
                  >
                    λ = {val} {val === 0 ? '(Shortest)' : val === 1 ? '(Balanced)' : '(Cool Corridor)'}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-[#F7F7F3] rounded-lg border border-[#E5E5DC] text-xs space-y-2">
                {interactiveLambda === 0 && (
                  <>
                    <div className="font-bold text-[#202522] font-display">
                      Shortest Path Objective
                    </div>
                    <p className="text-[#5A6860] leading-relaxed">
                      Zero penalty is applied to surface temperature or barren asphalt. Routes follow
                      pure minimal Euclidean distance along the Phoenix street network regardless of
                      surface thermal extremes.
                    </p>
                  </>
                )}
                {interactiveLambda === 1 && (
                  <>
                    <div className="font-bold text-[#202522] font-display">
                      Balanced Environmental Consideration
                    </div>
                    <p className="text-[#5A6860] leading-relaxed">
                      A moderate penalty is applied to high-exposure segments. Routes will deviate 3–6%
                      in distance if a parallel street has significantly higher canopy or lower surface
                      temperatures.
                    </p>
                  </>
                )}
                {interactiveLambda === 2 && (
                  <>
                    <div className="font-bold text-[#274333] font-display">
                      Lower Environmental Proxy Objective
                    </div>
                    <p className="text-[#5A6860] leading-relaxed">
                      Higher sensitivity to thermal anomalies. The router proactively routes through
                      tree-lined street segments, civic plazas, and shaded alleys, accepting modest
                      distance increases to achieve substantive relative exposure reductions.
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#E5E5DC] text-[11px] font-mono text-[#5A6860]">
              Network: 137,994 directed graph edges in Downtown Phoenix
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
