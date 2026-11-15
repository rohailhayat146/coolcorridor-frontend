import React from 'react';
import { ArrowDown, Compass, MapPin } from 'lucide-react';

interface HeroSectionProps {
  onPlanClick: () => void;
  onExploreResearchClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onPlanClick,
  onExploreResearchClick,
}) => {
  return (
    <section className="relative overflow-hidden border-b border-[#E5E5DC] bg-[#F7F7F3] pt-12 pb-14 md:pt-16 md:pb-20">
      {/* Background Cartographic Grid Texture (subtle hairline cartographic coordinates) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #202522 1px, transparent 1px),
            linear-gradient(to bottom, #202522 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            {/* Location Indicator (Unboxed, typographic) */}
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[#5A6860]">
              <MapPin className="w-3.5 h-3.5 text-[#385E48]" />
              <span>INITIAL STUDY AREA · DOWNTOWN PHOENIX, ARIZONA</span>
            </div>

            {/* Main Headline */}
            <h1
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#202522] leading-[1.08]"
              style={{ textWrap: 'balance' }}
            >
              Take the cooler way.
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-[#5A6860] leading-relaxed max-w-2xl">
              Explore walking routes that account for the urban heat environment.
              Compare distance, estimated walking time, and environmental conditions
              before choosing your path.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onPlanClick}
                className="px-6 py-3 text-sm font-semibold text-white bg-[#385E48] hover:bg-[#274333] transition-colors rounded-md shadow-xs flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Plan your route</span>
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreResearchClick}
                className="px-5 py-3 text-sm font-medium text-[#202522] hover:text-[#385E48] hover:bg-[#F1F1EB] transition-colors rounded-md border border-[#E5E5DC] flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Compass className="w-4 h-4 text-[#5A6860]" />
                <span>Explore the research</span>
              </button>
            </div>
          </div>

          {/* Right Visual Column: Subtle Cartographic & Empirical Study Frame */}
          <div className="lg:col-span-5">
            <div className="bg-[#FFFFFF] border border-[#E5E5DC] rounded-xl p-6 shadow-xs relative overflow-hidden">
              {/* Top status banner */}
              <div className="flex items-center justify-between border-b border-[#E5E5DC] pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#385E48]" />
                  <span className="font-mono text-xs uppercase tracking-wider text-[#202522] font-semibold">
                    Urban Thermal Routing Model
                  </span>
                </div>
                <span className="font-mono text-xs text-[#5A6860]">EPSG:4326</span>
              </div>

              {/* Minimal SVG Graphic representing the 3-path comparison (Shortest vs Lambda 1 vs Lambda 2) */}
              <div className="relative h-44 rounded-lg bg-[#F7F7F3] border border-[#E5E5DC]/80 p-4 flex flex-col justify-between">
                <div className="flex justify-between items-start text-xs font-mono text-[#5A6860]">
                  <span className="flex items-center gap-1 font-semibold text-[#202522]">
                    <span className="w-4 h-4 rounded-full bg-[#202522] text-white flex items-center justify-center text-[10px]">A</span>
                    Origin
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-[#385E48]">
                    <span className="w-4 h-4 rounded-full bg-[#385E48] text-white flex items-center justify-center text-[10px]">B</span>
                    Destination
                  </span>
                </div>

                {/* Conceptual vector curves */}
                <svg className="w-full h-24 my-1" viewBox="0 0 340 90" fill="none">
                  {/* Grid lines */}
                  <line x1="20" y1="15" x2="320" y2="15" stroke="#E5E5DC" strokeDasharray="3 3" />
                  <line x1="20" y1="45" x2="320" y2="45" stroke="#E5E5DC" strokeDasharray="3 3" />
                  <line x1="20" y1="75" x2="320" y2="75" stroke="#E5E5DC" strokeDasharray="3 3" />

                  {/* Route 1: Shortest (direct, high sun/heat exposure) */}
                  <path
                    d="M 30 70 L 120 70 L 180 70 L 260 70 L 310 20"
                    stroke="#475569"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                  />

                  {/* Route 2: Lower Exposure lambda=1 */}
                  <path
                    d="M 30 70 Q 90 40 160 42 T 260 45 L 310 20"
                    stroke="#6E8B68"
                    strokeWidth="3"
                  />

                  {/* Route 3: Lower Exposure lambda=2 (shaded corridor detour) */}
                  <path
                    d="M 30 70 Q 70 15 150 18 Q 240 18 310 20"
                    stroke="#274333"
                    strokeWidth="3.5"
                  />
                </svg>

                <div className="flex items-center justify-between text-[11px] font-mono text-[#5A6860] border-t border-[#E5E5DC] pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#475569] inline-block" />
                    <span>Shortest</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 bg-[#6E8B68] inline-block" />
                    <span>Lower exp. λ1</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-semibold text-[#274333]">
                    <span className="w-3 h-0.5 bg-[#274333] inline-block" />
                    <span>Lower exp. λ2</span>
                  </div>
                </div>
              </div>

              {/* Research Metrics Bar */}
              <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-[#E5E5DC] text-center">
                <div>
                  <div className="font-mono text-base font-bold text-[#202522]">10×10 km</div>
                  <div className="text-[11px] font-mono text-[#5A6860] uppercase tracking-wider">Downtown Grid</div>
                </div>
                <div className="border-x border-[#E5E5DC]">
                  <div className="font-mono text-base font-bold text-[#202522]">45,483</div>
                  <div className="text-[11px] font-mono text-[#5A6860] uppercase tracking-wider">Walk Nodes</div>
                </div>
                <div>
                  <div className="font-mono text-base font-bold text-[#385E48]">70,025</div>
                  <div className="text-[11px] font-mono text-[#5A6860] uppercase tracking-wider">Scored Edges</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
