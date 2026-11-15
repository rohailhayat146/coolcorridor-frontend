import React, { useState } from 'react';
import {
  Thermometer,
  Leaf,
  GitCommit,
  Cpu,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  Database,
  BarChart2,
} from 'lucide-react';

export const KeyFindingsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'heat' | 'vegetation' | 'routing' | 'ml'>('all');
  const [expandedNotes, setExpandedNotes] = useState<{ [key: string]: boolean }>({
    heat: false,
    veg: false,
    routing: false,
    ml: false,
  });

  const toggleNote = (key: string) => {
    setExpandedNotes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="key-findings" className="py-16 md:py-24 border-t border-[#E5E5DC] bg-[#F7F7F3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Editorial Context */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#5A6860] mb-2">
            <BarChart2 className="w-3.5 h-3.5 text-[#385E48]" />
            <span>EMPIRICAL RESEARCH FINDINGS · SUMMER 2025</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-[#202522] tracking-tight">
            Key Findings & Research Dashboard
          </h2>
          <p className="text-base text-[#5A6860] mt-3 leading-relaxed">
            Empirical evaluations based on 110,762 satellite observation pixels and 20 geographically
            distributed origin–destination route-pair evaluations across Downtown Phoenix (May–September 2025).
            All metrics reflect verified satellite observations and graph optimization trials.
          </p>

          {/* Quick Filter Navigation */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-[#E5E5DC]">
            <span className="text-xs font-mono text-[#5A6860] mr-1">Section:</span>
            {[
              { id: 'all', label: 'All Findings' },
              { id: 'heat', label: '1. Urban Heat' },
              { id: 'vegetation', label: '2. Vegetation & LST' },
              { id: 'routing', label: '3. Heat-Aware Routing' },
              { id: 'ml', label: '4. Machine Learning' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as typeof activeTab);
                  if (tab.id !== 'all') {
                    scrollToSection(`finding-${tab.id}`);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
                  activeTab === tab.id
                    ? 'bg-[#385E48] text-white border-[#385E48] font-semibold'
                    : 'bg-white text-[#5A6860] border-[#E5E5DC] hover:text-[#202522] hover:bg-[#F1F1EB]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Main Research Subsections */}
        <div className="space-y-16">
          {/* ========================================================= */}
          {/* SUBSECTION A: The Urban Heat Landscape */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'heat') && (
            <div id="finding-heat" className="scroll-mt-24 space-y-6">
              <div className="border-b border-[#E5E5DC] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#385E48]">
                    <Thermometer className="w-3.5 h-3.5" />
                    <span>Subsection A · Satellite Thermal Baseline</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#202522] mt-1">
                    The Urban Heat Landscape
                  </h3>
                  <p className="text-sm text-[#5A6860] mt-1">
                    Phoenix summer surface temperatures derived from clear-sky Landsat 8/9 overpasses (May–September 2025).
                  </p>
                </div>
                <button
                  onClick={() => scrollToSection('planner')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#385E48] hover:text-[#274333] hover:underline cursor-pointer"
                >
                  <span>Inspect LST overlay on map</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Key Numeric Findings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E5E5DC] rounded-xl p-6 shadow-xs flex flex-col justify-between">
                  <div className="text-xs font-mono uppercase text-[#5A6860]">Study Sample</div>
                  <div className="my-2">
                    <span className="font-mono text-3xl sm:text-4xl font-bold text-[#202522] tabular-nums">
                      110,762
                    </span>
                    <span className="text-xs font-mono text-[#5A6860] ml-2">pixels</span>
                  </div>
                  <div className="text-xs text-[#5A6860]">
                    Valid pixels on a 30 m aligned analysis grid evaluated across the 10×10 km Phoenix study core.
                  </div>
                </div>

                <div className="bg-white border border-[#E5E5DC] rounded-xl p-6 shadow-xs flex flex-col justify-between">
                  <div className="text-xs font-mono uppercase text-[#5A6860]">Median Surface Temp (LST)</div>
                  <div className="my-2">
                    <span className="font-mono text-3xl sm:text-4xl font-bold text-[#274333] tabular-nums">
                      54.62
                    </span>
                    <span className="text-base font-mono text-[#385E48] font-bold ml-1">°C</span>
                    <span className="text-xs font-mono text-[#5A6860] ml-2">/ 327.774 K</span>
                  </div>
                  <div className="text-xs text-[#5A6860]">
                    P50 median land-surface temperature across all pooled summer observations.
                  </div>
                </div>

                <div className="bg-white border border-[#E5E5DC] rounded-xl p-6 shadow-xs flex flex-col justify-between">
                  <div className="text-xs font-mono uppercase text-[#5A6860]">Empirical Percentile Range</div>
                  <div className="my-2">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-[#202522] tabular-nums">
                      47.90 – 58.47
                    </span>
                    <span className="text-xs font-mono text-[#5A6860] ml-1">°C</span>
                  </div>
                  <div className="text-xs text-[#5A6860]">
                    Empirical 2nd–98th percentile span (10.57°C difference between the P2 and P98 percentiles).
                  </div>
                </div>
              </div>

              {/* Quantile Distribution Visualization */}
              <div className="bg-white border border-[#E5E5DC] rounded-xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5DC] pb-3">
                  <span className="font-mono text-xs uppercase font-bold text-[#202522]">
                    Empirical Temperature Percentiles (2nd to 98th Percentile)
                  </span>
                  <span className="text-xs font-mono text-[#5A6860]">
                    Thermal gradient span: 10.57°C
                  </span>
                </div>

                {/* Quantile Gradient Bar */}
                <div className="pt-2 pb-1 space-y-2">
                  <div className="relative h-7 w-full rounded-md overflow-hidden bg-gradient-to-r from-[#FDE68A] via-[#F97316] to-[#4C0519] border border-[#E5E5DC]">
                    {/* Median marker indicator at 63.6% position ((54.62-47.90)/(58.47-47.90) = 63.58%) */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-md z-10"
                      style={{ left: '63.58%' }}
                      title="Median LST: 54.62°C (327.774 K)"
                    />
                  </div>

                  {/* Distribution Tick Labels */}
                  <div className="flex justify-between items-center text-xs font-mono text-[#5A6860]">
                    <div>
                      <span className="font-bold text-[#202522]">47.90°C</span>
                      <span className="block text-[10px] text-[#5A6860]">P2 (Lower Bound)</span>
                    </div>
                    <div className="text-center">
                      <span className="font-bold text-[#274333] bg-[#EBF1ED] px-2 py-0.5 rounded border border-[#385E48]">
                        P50: 54.62°C (327.77 K)
                      </span>
                      <span className="block text-[10px] text-[#385E48] mt-0.5 font-medium">Urban Median</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#202522]">58.47°C</span>
                      <span className="block text-[10px] text-[#5A6860]">P98 (Upper Bound)</span>
                    </div>
                  </div>
                </div>

                {/* Data Transparency Callout */}
                <div className="p-3 bg-[#F7F7F3] rounded-lg border border-[#E5E5DC] text-xs text-[#5A6860] leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#385E48] shrink-0 mt-0.5" />
                  <p>
                    <strong>Data Integrity Note:</strong> Full continuous frequency histogram binning
                    requires the raw, unaggregated raster pixel array (e.g. from the Phoenix environmental
                    model dataset CSV). The visualization above displays the verified empirical percentiles
                    (P2, P50, and P98) recorded across all 110,762 valid observations without introducing
                    fabricated distribution bins.
                  </p>
                </div>
              </div>

              {/* Expandable Scientific Methodology Note */}
              <div className="border border-[#E5E5DC] rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleNote('heat')}
                  className="w-full text-left p-4 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#202522] hover:bg-[#F7F7F3] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-[#385E48]" />
                    <span>Scientific Context: Spatial LST vs. Ambient Air Temperature</span>
                  </span>
                  {expandedNotes.heat ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedNotes.heat && (
                  <div className="p-4 border-t border-[#E5E5DC] text-xs text-[#5A6860] space-y-2 leading-relaxed bg-[#F7F7F3]">
                    <p>
                      Land Surface Temperature represents the radiometric skin temperature of urban surfaces
                      (asphalt, concrete, rooftop materials, and vegetative canopy) as observed from satellite
                      radiometers.
                    </p>
                    <p>
                      On peak summer days in Phoenix, dark paved surfaces often exceed 50°C–65°C, while ambient
                      air temperature at 2 m height ranges between 40°C–45°C. Landsat 8 and 9 collect thermal
                      infrared data at a native sensor resolution of ~100 m, which the USGS resamples onto a
                      standard 30 m grid.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBSECTION B: Vegetation and Surface Temperature */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'vegetation') && (
            <div id="finding-vegetation" className="scroll-mt-24 space-y-6">
              <div className="border-b border-[#E5E5DC] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#385E48]">
                    <Leaf className="w-3.5 h-3.5" />
                    <span>Subsection B · Bivariate Correlation Analysis</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#202522] mt-1">
                    Vegetation and Surface Temperature
                  </h3>
                  <p className="text-sm text-[#5A6860] mt-1">
                    Empirical relationship between Normalized Difference Vegetation Index (NDVI) and Land Surface Temperature.
                  </p>
                </div>
                <button
                  onClick={() => scrollToSection('planner')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#385E48] hover:text-[#274333] hover:underline cursor-pointer"
                >
                  <span>Inspect NDVI overlay on map</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E5E5DC] rounded-xl p-5 shadow-xs">
                  <div className="text-[11px] font-mono uppercase text-[#5A6860]">Paired Sample Size</div>
                  <div className="font-mono text-2xl font-bold text-[#202522] my-1 tabular-nums">
                    110,762
                  </div>
                  <div className="text-[11px] text-[#5A6860]">Paired satellite pixels</div>
                </div>

                <div className="bg-white border border-[#E5E5DC] rounded-xl p-5 shadow-xs">
                  <div className="text-[11px] font-mono uppercase text-[#5A6860]">Pearson Correlation (r)</div>
                  <div className="font-mono text-2xl font-bold text-[#385E48] my-1 tabular-nums">
                    −0.53464
                  </div>
                  <div className="text-[11px] text-[#5A6860]">Moderate inverse linear association</div>
                </div>

                <div className="bg-white border border-[#E5E5DC] rounded-xl p-5 shadow-xs">
                  <div className="text-[11px] font-mono uppercase text-[#5A6860]">Spearman Rank (ρ)</div>
                  <div className="font-mono text-2xl font-bold text-[#385E48] my-1 tabular-nums">
                    −0.20200
                  </div>
                  <div className="text-[11px] text-[#5A6860]">Monotonic rank correlation</div>
                </div>

                <div className="bg-white border border-[#E5E5DC] rounded-xl p-5 shadow-xs">
                  <div className="text-[11px] font-mono uppercase text-[#5A6860]">Study Median NDVI</div>
                  <div className="font-mono text-2xl font-bold text-[#202522] my-1 tabular-nums">
                    0.10403
                  </div>
                  <div className="text-[11px] text-[#5A6860]">Reflects arid desert urban density</div>
                </div>
              </div>

              {/* Correlation Interpretation */}
              <div className="p-3.5 bg-white border border-[#E5E5DC] rounded-xl text-xs text-[#5A6860] leading-relaxed shadow-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#385E48] shrink-0 mt-0.5" />
                <p>
                  The difference between Pearson and Spearman correlations indicates that the strength of the observed association depends on the statistical measure: Pearson captures linear association, while Spearman measures rank-based monotonic association.
                </p>
              </div>

              {/* Grouped Comparison Chart: High-NDVI vs Remaining Pixels */}
              <div className="bg-white border border-[#E5E5DC] rounded-xl p-6 shadow-xs space-y-4">
                <div className="border-b border-[#E5E5DC] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-mono text-xs uppercase font-bold text-[#202522]">
                    High-NDVI vs. Remaining-Pixel Temperature Difference
                  </span>
                  <span className="text-xs font-mono text-[#385E48] font-bold">
                    Δ −5.258°C Thermal Difference
                  </span>
                </div>

                <div className="space-y-4 pt-2">
                  {/* High NDVI Cluster */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-semibold text-[#274333] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#385E48]" />
                        High-NDVI Pixels (NDVI &gt; 0.351, support &ge; 15 obs · n = 5,511)
                      </span>
                      <span className="font-bold text-[#274333] text-sm tabular-nums">49.472°C</span>
                    </div>
                    <div className="h-6 w-full bg-[#F7F7F3] rounded-md overflow-hidden border border-[#E5E5DC] relative">
                      {/* Scaled bar relative to max 60°C */}
                      <div
                        className="h-full bg-[#385E48] rounded-r transition-all"
                        style={{ width: `${(49.472 / 60) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Remaining Pixels */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[#5A6860] flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#94A3B8]" />
                        Remaining Valid Study-Area Pixels (n = 105,251)
                      </span>
                      <span className="font-bold text-[#202522] text-sm tabular-nums">54.730°C</span>
                    </div>
                    <div className="h-6 w-full bg-[#F7F7F3] rounded-md overflow-hidden border border-[#E5E5DC] relative">
                      <div
                        className="h-full bg-[#94A3B8] rounded-r transition-all"
                        style={{ width: `${(54.730 / 60) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-xs text-[#5A6860] leading-relaxed border-t border-[#E5E5DC] space-y-2">
                  <p>
                    Across the 5,511 high-NDVI pixels (such as parks, landscaped corridors, and irrigated turf),
                    the median surface temperature is <strong>49.472°C</strong>, compared to <strong>54.730°C</strong> across
                    the remaining 105,251 valid study-area pixels (difference of 5.258°C).
                  </p>
                  <p>
                    This is an observational spatial difference between two groups of satellite pixels. High NDVI indicates
                    vegetation greenness, not necessarily tree canopy or street-level shade. The observed temperature
                    difference does not establish that vegetation alone caused the difference.
                  </p>
                </div>
              </div>

              {/* Expandable Scientific Caveats Note */}
              <div className="border border-[#E5E5DC] rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleNote('veg')}
                  className="w-full text-left p-4 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#202522] hover:bg-[#F7F7F3] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-[#385E48]" />
                    <span>Scientific Rigor: Correlation vs. Street-Level Shade</span>
                  </span>
                  {expandedNotes.veg ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedNotes.veg && (
                  <div className="p-4 border-t border-[#E5E5DC] text-xs text-[#5A6860] space-y-2 leading-relaxed bg-[#F7F7F3]">
                    <p>
                      <strong>Correlation is not causation:</strong> While vegetative canopy strongly coincides with
                      reduced surface temperature due to solar shading and evapotranspiration, spatial associations in
                      satellite rasters do not isolate building geometry, street orientation, or ground albedo.
                    </p>
                    <p>
                      <strong>NDVI is not direct shade:</strong> NDVI detects photosynthetically active chlorophyll from
                      space. It does not measure cast architectural shadows, covered walkways, or solar angles at specific
                      times of day.
                    </p>
                    <p>
                      This is an observational spatial difference between two groups of satellite pixels. High NDVI indicates
                      vegetation greenness, not necessarily tree canopy or street-level shade. The observed temperature
                      difference does not establish that vegetation alone caused the difference.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBSECTION C: What Heat-Aware Routing Changes */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'routing') && (
            <div id="finding-routing" className="scroll-mt-24 space-y-6">
              <div className="border-b border-[#E5E5DC] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#385E48]">
                    <GitCommit className="w-3.5 h-3.5" />
                    <span>Subsection C · 20 Origin-Destination Pair Experiment</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#202522] mt-1">
                    What Heat-Aware Routing Changes
                  </h3>
                  <p className="text-sm text-[#5A6860] mt-1">
                    Experimental routing trade-offs across 20 geographically distributed OD pairs in Downtown Phoenix.
                  </p>
                </div>
                <button
                  onClick={() => scrollToSection('planner')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#385E48] hover:text-[#274333] hover:underline cursor-pointer"
                >
                  <span>Test routing alternatives in planner</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Data Table of Verified Results */}
              <div className="bg-white border border-[#E5E5DC] rounded-xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-[#E5E5DC] bg-[#F7F7F3] flex items-center justify-between">
                  <span className="font-mono text-xs uppercase font-bold text-[#202522]">
                    Routing Sensitivity Comparison (N = 20 OD Pairs)
                  </span>
                  <span className="font-mono text-[11px] text-[#385E48]">Dijkstra-based multi-criteria routing</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-white border-b border-[#E5E5DC] text-[#5A6860]">
                      <tr>
                        <th className="py-3 px-4 font-semibold uppercase">Routing Approach</th>
                        <th className="py-3 px-4 font-semibold uppercase text-right">Mean Detour</th>
                        <th className="py-3 px-4 font-semibold uppercase text-right">Mean Score Reduction</th>
                        <th className="py-3 px-4 font-semibold uppercase">Designation / Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5DC] text-[#202522]">
                      <tr className="hover:bg-[#F7F7F3] transition-colors">
                        <td className="py-3.5 px-4 font-medium flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#334155]" />
                          Shortest Route (λ = 0)
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums">0.00%</td>
                        <td className="py-3.5 px-4 text-right text-[#5A6860] tabular-nums">Reference</td>
                        <td className="py-3.5 px-4 text-[#5A6860]">Shortest-network-route baseline</td>
                      </tr>
                      <tr className="hover:bg-[#F7F7F3] transition-colors">
                        <td className="py-3.5 px-4 font-medium flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#6E8B68]" />
                          Environmental-Score λ1
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold tabular-nums">+2.55%</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-[#385E48] tabular-nums">−21.98%</td>
                        <td className="py-3.5 px-4 text-[#5A6860]">Minimal detour option</td>
                      </tr>
                      <tr className="bg-[#EBF1ED]/50 hover:bg-[#EBF1ED] transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#274333] flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#274333]" />
                          Environmental-Score λ2
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-[#274333] tabular-nums">+5.92%</td>
                        <td className="py-3.5 px-4 text-right font-bold text-[#274333] tabular-nums">−28.55%</td>
                        <td className="py-3.5 px-4 font-semibold text-[#385E48]">Provisional Default (Balanced)</td>
                      </tr>
                      <tr className="hover:bg-[#F7F7F3] transition-colors">
                        <td className="py-3.5 px-4 font-medium flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B]" />
                          Environmental-Score λ4
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums">+7.48%</td>
                        <td className="py-3.5 px-4 text-right text-[#385E48] tabular-nums">−30.42%</td>
                        <td className="py-3.5 px-4 text-[#5A6860]">Diminishing returns region</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detour vs Route-Score Reduction Chart */}
              <div className="bg-white border border-[#E5E5DC] rounded-xl p-6 shadow-xs space-y-4">
                <div className="border-b border-[#E5E5DC] pb-3 flex justify-between items-center">
                  <span className="font-mono text-xs uppercase font-bold text-[#202522]">
                    Trade-Off Frontier: Detour vs. Route-Score Reduction
                  </span>
                  <span className="text-xs font-mono text-[#5A6860]">Pareto Efficiency Curve</span>
                </div>

                {/* SVG Visualizing the 4 Points on the Pareto Curve */}
                <div className="h-64 w-full bg-[#F7F7F3] rounded-lg border border-[#E5E5DC] p-4 flex flex-col justify-between relative">
                  <svg className="w-full h-full" viewBox="0 0 500 200" fill="none">
                    {/* Gridlines */}
                    <line x1="60" y1="20" x2="480" y2="20" stroke="#E5E5DC" strokeDasharray="3 3" />
                    <line x1="60" y1="65" x2="480" y2="65" stroke="#E5E5DC" strokeDasharray="3 3" />
                    <line x1="60" y1="110" x2="480" y2="110" stroke="#E5E5DC" strokeDasharray="3 3" />
                    <line x1="60" y1="155" x2="480" y2="155" stroke="#E5E5DC" strokeDasharray="3 3" />
                    <line x1="60" y1="20" x2="60" y2="160" stroke="#CBD5E1" strokeWidth="1" />
                    <line x1="60" y1="160" x2="480" y2="160" stroke="#CBD5E1" strokeWidth="1" />

                    {/* Axis Labels */}
                    <text x="50" y="24" fill="#64748B" fontSize="10" fontFamily="monospace" textAnchor="end">35%</text>
                    <text x="50" y="69" fill="#64748B" fontSize="10" fontFamily="monospace" textAnchor="end">25%</text>
                    <text x="50" y="114" fill="#64748B" fontSize="10" fontFamily="monospace" textAnchor="end">15%</text>
                    <text x="50" y="159" fill="#64748B" fontSize="10" fontFamily="monospace" textAnchor="end">0%</text>
                    <text x="270" y="195" fill="#64748B" fontSize="10" fontFamily="monospace" textAnchor="middle">
                      Average Distance Detour (% over shortest)
                    </text>

                    {/* Curve connecting the 4 points */}
                    <path
                      d="M 60 160 Q 140 70 180 72 T 338.5 45.8 L 412 38.3"
                      stroke="#385E48"
                      strokeWidth="2.5"
                      fill="none"
                    />

                    {/* Points */}
                    {/* Point 1: Shortest */}
                    <circle cx="60" cy="160" r="4.5" fill="#334155" />
                    <text x="65" y="150" fill="#334155" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      Shortest (0%, 0%)
                    </text>

                    {/* Point 2: λ1 */}
                    <circle cx="180" cy="72" r="5" fill="#6E8B68" />
                    <text x="180" y="62" fill="#6E8B68" fontSize="10" fontFamily="monospace" textAnchor="middle">
                      λ1 (2.55%, 21.98%)
                    </text>

                    {/* Point 3: λ2 (Default) */}
                    <circle cx="338.5" cy="45.8" r="7" fill="#274333" stroke="#86EFAC" strokeWidth="2" />
                    <text x="338.5" y="32" fill="#274333" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                      ★ λ2 Default (5.92%, 28.55%)
                    </text>

                    {/* Point 4: λ4 */}
                    <circle cx="412" cy="38.3" r="5" fill="#1E293B" />
                    <text x="412" y="26" fill="#1E293B" fontSize="10" fontFamily="monospace" textAnchor="middle">
                      λ4 (7.48%, 30.42%)
                    </text>
                  </svg>
                </div>

                {/* Analytical Explanation of λ2 vs λ4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#5A6860] leading-relaxed pt-2">
                  <div className="p-3 bg-[#EBF1ED]/70 rounded-lg border border-[#385E48]/30">
                    <strong className="text-[#274333] block mb-1">
                      Why λ = 2 is the Provisional Default:
                    </strong>
                    At λ = 2, walking paths achieve an average <strong>28.55% reduction</strong> in relative
                    environmental route score while requiring only a <strong>5.92% average detour</strong>.
                    A 5.92% increase over a hypothetical 15-minute shortest-route journey would add approximately
                    53 seconds. This is an illustrative calculation, not a measured walking trial.
                  </div>

                  <div className="p-3 bg-[#F7F7F3] rounded-lg border border-[#E5E5DC]">
                    <strong className="text-[#202522] block mb-1">
                      Diminishing Marginal Returns at λ = 4:
                    </strong>
                    Increasing sensitivity to λ = 4 drives the average detour up to <strong>7.48%</strong> (+1.56%
                    further), but yields only an incremental <strong>1.87% additional score reduction</strong> (30.42%
                    total). The marginal route-score reduction attenuates sharply as route options in the street grid
                    saturate, and does not represent a measured physiological or physical temperature reduction.
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#5A6860] pt-2 border-t border-[#E5E5DC]">
                  *Note: Route-score reduction represents a relative mathematical environmental proxy derived from satellite
                  surface-temperature and vegetation percentiles. It is not a measured reduction in pedestrian temperature,
                  ambient air temperature or physiological heat exposure.
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUBSECTION D: Machine Learning Evaluation */}
          {/* ========================================================= */}
          {(activeTab === 'all' || activeTab === 'ml') && (
            <div id="finding-ml" className="scroll-mt-24 space-y-6">
              <div className="border-b border-[#E5E5DC] pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#385E48]">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Subsection D · Model Validation</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#202522] mt-1">
                    Machine Learning Evaluation
                  </h3>
                  <p className="text-sm text-[#5A6860] mt-1">
                    Preliminary scene-level LST estimation experiment across 7 chronological test scenes.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#5A6860] bg-white px-3 py-1.5 rounded-md border border-[#E5E5DC]">
                  Evaluation: 7 Chronological Scenes
                </div>
              </div>

              {/* ML Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-[#E5E5DC] rounded-xl p-6 shadow-xs flex flex-col justify-between">
                  <div className="text-xs font-mono uppercase text-[#5A6860]">Baseline Model MAE</div>
                  <div className="my-2">
                    <span className="font-mono text-3xl sm:text-4xl font-bold text-[#64748B] tabular-nums">
                      17.876
                    </span>
                    <span className="text-sm font-mono text-[#5A6860] font-bold ml-1">°C</span>
                  </div>
                  <div className="text-xs text-[#5A6860]">
                    Mean absolute error of uncalibrated baseline predictor across test scenes.
                  </div>
                </div>

                <div className="bg-white border border-[#E5E5DC] rounded-xl p-6 shadow-xs flex flex-col justify-between">
                  <div className="text-xs font-mono uppercase text-[#5A6860]">Regression Model MAE</div>
                  <div className="my-2">
                    <span className="font-mono text-3xl sm:text-4xl font-bold text-[#274333] tabular-nums">
                      3.832
                    </span>
                    <span className="text-sm font-mono text-[#385E48] font-bold ml-1">°C</span>
                    <span className="text-xs font-mono text-[#385E48] ml-2 font-bold">(–78.56%)</span>
                  </div>
                  <div className="text-xs text-[#5A6860]">
                    Mean absolute error achieved by trained regression model.
                  </div>
                </div>

                <div className="bg-white border border-[#E5E5DC] rounded-xl p-6 shadow-xs flex flex-col justify-between">
                  <div className="text-xs font-mono uppercase text-[#5A6860]">Regression RMSE</div>
                  <div className="my-2">
                    <span className="font-mono text-3xl sm:text-4xl font-bold text-[#202522] tabular-nums">
                      4.361
                    </span>
                    <span className="text-sm font-mono text-[#5A6860] font-bold ml-1">°C</span>
                  </div>
                  <div className="text-xs text-[#5A6860]">
                    Root mean square error on held-out chronological test overpasses.
                  </div>
                </div>
              </div>

              {/* Comparative Error Chart */}
              <div className="bg-white border border-[#E5E5DC] rounded-xl p-6 shadow-xs space-y-4">
                <div className="border-b border-[#E5E5DC] pb-3 flex justify-between items-center">
                  <span className="font-mono text-xs uppercase font-bold text-[#202522]">
                    Error Comparison: Baseline vs. Regression Model MAE
                  </span>
                  <span className="text-xs font-mono text-[#385E48] font-bold">
                    78.56% Error Reduction
                  </span>
                </div>

                <div className="space-y-4 pt-2">
                  {/* Baseline MAE Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[#5A6860]">Baseline Model MAE (Uncalibrated)</span>
                      <span className="font-bold text-[#202522] tabular-nums">17.876°C</span>
                    </div>
                    <div className="h-7 w-full bg-[#F7F7F3] rounded-md overflow-hidden border border-[#E5E5DC] relative">
                      <div
                        className="h-full bg-[#94A3B8] rounded-r transition-all"
                        style={{ width: `${(17.876 / 20) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Regression MAE Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-semibold text-[#274333] flex items-center gap-1.5">
                        <TrendingDown className="w-3.5 h-3.5 text-[#385E48]" />
                        Regression Model MAE (Trained Estimator)
                      </span>
                      <span className="font-bold text-[#274333] tabular-nums">3.832°C</span>
                    </div>
                    <div className="h-7 w-full bg-[#F7F7F3] rounded-md overflow-hidden border border-[#E5E5DC] relative">
                      <div
                        className="h-full bg-[#385E48] rounded-r transition-all"
                        style={{ width: `${(3.832 / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Explanation of Scene-Level Scope */}
                <div className="p-3 bg-[#F7F7F3] rounded-lg border border-[#E5E5DC] text-xs text-[#5A6860] leading-relaxed space-y-2">
                  <p>
                    <strong>Model Scope Disclosure:</strong> The regression model estimates scene-average
                    land-surface temperature using contemporaneous ERA5-Land daily mean air temperature across
                    seven chronological satellite overpasses, reducing mean absolute error from 17.876°C to
                    3.832°C (RMSE 4.361°C; a 78.56% reduction).
                  </p>
                  <p>
                    <strong>Limitations:</strong> It is not a future weather forecast, street-level temperature
                    model or pedestrian microclimate predictor. The evaluation is preliminary and uses seven
                    chronological test scenes from a single city and study year.
                  </p>
                </div>
              </div>

              {/* Expandable Model Limitations Note */}
              <div className="border border-[#E5E5DC] rounded-xl bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleNote('ml')}
                  className="w-full text-left p-4 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#202522] hover:bg-[#F7F7F3] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-[#385E48]" />
                    <span>Scientific Context: Chronological Testing & Data Boundaries</span>
                  </span>
                  {expandedNotes.ml ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandedNotes.ml && (
                  <div className="p-4 border-t border-[#E5E5DC] text-xs text-[#5A6860] space-y-2 leading-relaxed bg-[#F7F7F3]">
                    <p>
                      The machine-learning evaluation was conducted on a held-out chronological test partition of 7
                      Landsat scenes to prevent temporal data leakage. The regression model estimates scene-average
                      land-surface temperature using contemporaneous ERA5-Land daily mean air temperature.
                    </p>
                    <p>
                      It is not a future weather forecast, street-level temperature model or pedestrian microclimate
                      predictor. The evaluation is preliminary and uses seven chronological test scenes from a single
                      city and study year. Future work entails edge-level spatial regression incorporating LiDAR-derived
                      urban building heights and high-resolution micro-meteorological sensor meshes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};