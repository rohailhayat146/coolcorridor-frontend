import React from 'react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Choose your journey',
      description:
        'Enter your starting point and destination within the Phoenix study area, or select from curated research landmarks.',
    },
    {
      num: '02',
      title: 'Compare the environment',
      description:
        'CoolCorridor evaluates walking-network segments using satellite-derived environmental indicators (70% LST percentile + 30% inverse NDVI).',
    },
    {
      num: '03',
      title: 'Choose your route',
      description:
        'Compare the shortest route with alternatives that prioritize lower relative environmental scores and trade extra walking distance for reduced exposure.',
    },
  ];

  return (
    <section id="how-it-works" className="py-14 md:py-20 border-t border-[#E5E5DC] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="text-xs font-mono uppercase tracking-wider text-[#5A6860] mb-2">
            METHODOLOGY IN ACTION
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#202522]">
            How CoolCorridor routes through urban heat
          </h2>
          <p className="text-sm sm:text-base text-[#5A6860] mt-2 leading-relaxed">
            By integrating high-resolution pedestrian network graphs with satellite remote sensing,
            CoolCorridor computes Pareto-optimal walking trajectories that minimize exposure to harsh
            surface thermal anomalies.
          </p>
        </div>

        {/* 3 Editorial Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="relative p-6 rounded-xl border border-[#E5E5DC] bg-[#F7F7F3] flex flex-col justify-between"
            >
              <div>
                {/* Step Number */}
                <div className="font-mono text-xs font-bold text-[#385E48] tracking-widest uppercase mb-3">
                  STEP {step.num}
                </div>

                {/* Step Title */}
                <h3 className="font-display text-lg font-bold text-[#202522] mb-2">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-sm text-[#5A6860] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Subtle hairline index marker */}
              <div className="pt-6 mt-6 border-t border-[#E5E5DC] text-[11px] font-mono text-[#5A6860] flex items-center justify-between">
                <span>Phase {idx + 1} of 3</span>
                <span className="text-[#385E48]">Phoenix Study Grid</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
