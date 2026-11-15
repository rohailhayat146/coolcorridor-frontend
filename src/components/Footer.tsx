import React from 'react';

export const Footer: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t border-[#E5E5DC] bg-[#F7F7F3] py-12 md:py-16 text-xs text-[#5A6860]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#385E48] text-[#F7F7F3] flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 17c3-3 6-4 9-2s6 1 9-2" />
                  <circle cx="12" cy="15" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <span className="font-display font-bold text-base tracking-tight text-[#202522]">
                CoolCorridor
              </span>
            </div>
            <p className="text-xs text-[#5A6860] max-w-sm leading-relaxed">
              Walk smarter. Navigate the heat. An environmental urban mobility platform for
              pedestrians in Downtown Phoenix, Arizona.
            </p>
            <div className="text-[11px] font-mono text-[#5A6860]">
              Initial Study Area · 10×10 km · Downtown Phoenix, AZ
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-2">
            <div className="font-mono text-xs uppercase font-bold text-[#202522] mb-3">
              Application
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => scrollTo('planner')}
                  className="hover:text-[#202522] transition-colors cursor-pointer"
                >
                  Interactive Route Planner
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('key-findings')}
                  className="hover:text-[#202522] transition-colors cursor-pointer"
                >
                  Key Findings Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('how-it-works')}
                  className="hover:text-[#202522] transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('research')}
                  className="hover:text-[#202522] transition-colors cursor-pointer"
                >
                  Routing Model & Weights
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('methodology')}
                  className="hover:text-[#202522] transition-colors cursor-pointer"
                >
                  Scientific Limitations
                </button>
              </li>
            </ul>
          </div>

          {/* Data Sources */}
          <div className="md:col-span-4 space-y-2">
            <div className="font-mono text-xs uppercase font-bold text-[#202522] mb-3">
              Data Sources & Attribution
            </div>
            <p className="text-[11px] text-[#5A6860] leading-relaxed">
              Thermal observations and vegetation indices derived from USGS/NASA Landsat 8 & 9
              Level-2 surface reflectance products. Pedestrian street-network graphs derived from
              OpenStreetMap. Meteorological context via ECMWF ERA5-Land. Cartographic tiles courtesy
              of OpenStreetMap & CARTO.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#E5E5DC] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-[#5A6860]">
          <div>
            &copy; {new Date().getFullYear()} CoolCorridor · Urban Climate Research Initiative
          </div>
          <div className="text-center sm:text-right">
            Always stay hydrated. During excessive heat warnings, limit outdoor exposure.
          </div>
        </div>
      </div>
    </footer>
  );
};
