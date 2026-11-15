import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, AlertTriangle } from 'lucide-react';

export const MethodologySection: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const facts = [
    {
      title: '1. Land Surface Temperature (LST) vs. Air Temperature',
      summary: 'Landsat measures radiative skin temperature of surfaces, not ambient air temperature.',
      detail:
        'LST measures how hot the ground, asphalt, and rooftops feel to the satellite sensor. On summer afternoons in Phoenix, pavement can exceed 50°C–65°C while air temperature is 40°C–45°C. LST serves as a spatial indicator of thermal radiation, not a replacement for weather-station air temperature.',
    },
    {
      title: '2. NDVI as a Vegetation Proxy, Not Direct Shade',
      summary: 'NDVI measures canopy greenness, not the physical presence of cast shadows.',
      detail:
        'The Normalized Difference Vegetation Index captures chlorophyll density in satellite pixels. While healthy street trees correlate with cooler sidewalks, NDVI does not calculate building shadows, shade structures, or time-of-day solar azimuth.',
    },
    {
      title: '3. Satellite Sensor Resolution (100m Native Thermal)',
      summary: 'Landsat thermal bands have ~100m native resolution resampled to 30m.',
      detail:
        'Thermal infrared instruments on Landsat 8 and 9 collect data at approximately 100m ground resolution, which is subsequently interpolated and resampled to the 30m USGS Level-2 grid. Narrow street-canyon variations smaller than 30m are smoothed.',
    },
    {
      title: '4. Macro-Scale ERA5-Land Atmospheric Data',
      summary: 'Reanalysis data provides regional meteorological context at ~0.1° resolution.',
      detail:
        'ERA5-Land reanalysis provides contextual meteorological variables at approximately 9 km resolution across the Sonoran desert basin. It is not intended to model microclimatic wind tunnels between downtown high-rises.',
    },
    {
      title: '5. Pooled Summer Overpasses (May–September)',
      summary: 'Environmental layers represent composite summer satellite observations.',
      detail:
        'Satellite data aggregates 44 clear-sky Landsat overpasses across summer months (May through September). Scores reflect chronic, recurring summertime spatial heating patterns rather than real-time hourly weather updates.',
    },
    {
      title: '6. Relative Spatial Proxy Within Phoenix Only',
      summary: 'Scores are comparative percentiles within the 10×10 km Phoenix study area.',
      detail:
        'A score of 30 does not mean "30 degrees" or a medical threshold. It indicates that the street segment ranks lower in combined heat and barrenness than segments scored 70 or 80 within the Phoenix network.',
    },
    {
      title: '7. Exposure Proxy as Score-Weighted Distance',
      summary: 'Exposure proxy is distance × score, not a biological heat dose.',
      detail:
        'The metric represents length integrated over relative environmental score. It quantifies how much total segment exposure is accumulated along the journey, but does not calculate human metabolic rate, heart rate, or physiological heat stress.',
    },
    {
      title: '8. Assumed Pedestrian Walking Speed (1.2 m/s)',
      summary: 'Travel times are standard pedestrian baselines (~4.3 km/h).',
      detail:
        'Walking durations are calculated assuming an average pedestrian pace of 1.2 metres per second. High ambient heat, age, mobility aids, and crosswalk wait times can substantially alter actual traversal time.',
    },
    {
      title: '9. Sidewalk Side & Micro-Scale Shade Variability',
      summary: 'Greenness in a 30m pixel does not guarantee shade on both sidewalks.',
      detail:
        'A street centerline may overlap canopy on the north sidewalk while the south sidewalk remains in full desert sun. Pedestrians should exercise situational awareness when choosing which side of the street to walk.',
    },
    {
      title: '10. Model Scope & Safety Advisory',
      summary: 'CoolCorridor does not guarantee thermal comfort or safety.',
      detail:
        'During extreme heat advisories (excessive heat warnings in Phoenix), walking outdoors carries severe health risks. CoolCorridor helps choose less environmentally hostile walking paths, but cannot prevent heat exhaustion or dehydration.',
    },
  ];

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  return (
    <section id="methodology" className="py-14 md:py-20 border-t border-[#E5E5DC] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#5A6860] mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#385E48]" />
            <span>TRANSPARENCY & SCIENTIFIC RIGOR</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#202522]">
            Understanding the Data & Limitations
          </h2>
          <p className="text-sm sm:text-base text-[#5A6860] mt-2 leading-relaxed">
            Responsible climate-tech requires transparent disclosure. CoolCorridor uses
            satellite-derived proxies to evaluate urban corridors, but it is not a direct
            physiological measurement of individual pedestrian safety.
          </p>
        </div>

        {/* Primary Methodology Disclosure Box */}
        <div className="p-6 rounded-xl bg-[#F7F7F3] border border-[#E5E5DC] mb-10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#385E48] shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-[#202522]">
                Methodology Disclosure
              </h3>
              <p className="text-sm text-[#5A6860] leading-relaxed">
                CoolCorridor combines satellite-derived land-surface temperature, vegetation
                indicators, and pedestrian street-network data to compare walking routes. Its
                environmental scores represent relative spatial proxies within the Phoenix study
                area. They should not be interpreted as direct measurements of pedestrian-level
                temperature, shade, or personal heat exposure.
              </p>
            </div>
          </div>
        </div>

        {/* 10 Fact Accordion */}
        <div className="space-y-3">
          {facts.map((fact, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <div
                key={index}
                className="border border-[#E5E5DC] rounded-xl overflow-hidden bg-[#F7F7F3] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(index)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#F1F1EB] transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="font-display text-sm sm:text-base font-bold text-[#202522]">
                      {fact.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#5A6860]">{fact.summary}</p>
                  </div>
                  <div className="p-1 text-[#5A6860]">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-[#E5E5DC]/60 text-xs sm:text-sm text-[#5A6860] leading-relaxed bg-white">
                    <p>{fact.detail}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
