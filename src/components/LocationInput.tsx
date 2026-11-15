import React, { useState, useEffect, useRef } from 'react';
import { LocationPoint } from '../types/routes';
import {
  PHOENIX_LANDMARKS,
  searchLocations,
  isWithinPhoenixStudyArea,
  parseCoordinates,
} from '../services/geocoding';
import {
  ArrowUpDown,
  Compass,
  MapPin,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface LocationInputProps {
  origin: LocationPoint | null;
  destination: LocationPoint | null;
  onOriginChange: (point: LocationPoint | null) => void;
  onDestinationChange: (point: LocationPoint | null) => void;
  onSwap: () => void;
  disabled?: boolean;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  origin,
  destination,
  onOriginChange,
  onDestinationChange,
  onSwap,
  disabled = false,
}) => {
  // Input text values
  const [originText, setOriginText] = useState(origin?.label || '');
  const [destText, setDestText] = useState(destination?.label || '');

  // Coordinate recognized indicators
  const [originIsCoords, setOriginIsCoords] = useState(false);
  const [destIsCoords, setDestIsCoords] = useState(false);

  // Dropdown suggestions
  const [originSuggestions, setOriginSuggestions] = useState<LocationPoint[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<LocationPoint[]>([]);
  const [showOriginDropdown, setShowOriginDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const originWrapperRef = useRef<HTMLDivElement>(null);
  const destWrapperRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external prop changes
  useEffect(() => {
    if (origin) {
      setOriginText(origin.label);
    } else {
      setOriginText('');
    }
  }, [origin]);

  useEffect(() => {
    if (destination) {
      setDestText(destination.label);
    } else {
      setDestText('');
    }
  }, [destination]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        originWrapperRef.current &&
        !originWrapperRef.current.contains(event.target as Node)
      ) {
        setShowOriginDropdown(false);
      }
      if (
        destWrapperRef.current &&
        !destWrapperRef.current.contains(event.target as Node)
      ) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Search for Origin
  const handleOriginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOriginText(val);
    setLocationError(null);

    // Check if input is direct coordinate format: "lat, lng"
    const coords = parseCoordinates(val);
    if (coords) {
      setOriginIsCoords(true);
      setShowOriginDropdown(false);
      const point: LocationPoint = {
        label: `Coords: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: 'Direct coordinate entry',
      };
      onOriginChange(point);
      if (!isWithinPhoenixStudyArea(coords.latitude, coords.longitude)) {
        setLocationError(
          'Entered coordinates are outside the Downtown Phoenix study network (10×10 km).'
        );
      }
      return;
    } else {
      setOriginIsCoords(false);
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!val.trim()) {
      setOriginSuggestions(PHOENIX_LANDMARKS.slice(0, 5));
      setShowOriginDropdown(true);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchLocations(val);
      setOriginSuggestions(results);
      setShowOriginDropdown(true);
      setIsSearching(false);
    }, 300);
  };

  // Handle Search for Destination
  const handleDestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDestText(val);
    setLocationError(null);

    // Check if input is direct coordinate format: "lat, lng"
    const coords = parseCoordinates(val);
    if (coords) {
      setDestIsCoords(true);
      setShowDestDropdown(false);
      const point: LocationPoint = {
        label: `Coords: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`,
        latitude: coords.latitude,
        longitude: coords.longitude,
        address: 'Direct coordinate entry',
      };
      onDestinationChange(point);
      if (!isWithinPhoenixStudyArea(coords.latitude, coords.longitude)) {
        setLocationError(
          'Entered coordinates are outside the Downtown Phoenix study network (10×10 km).'
        );
      }
      return;
    } else {
      setDestIsCoords(false);
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!val.trim()) {
      setDestSuggestions(PHOENIX_LANDMARKS.slice(0, 5));
      setShowDestDropdown(true);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchLocations(val);
      setDestSuggestions(results);
      setShowDestDropdown(true);
      setIsSearching(false);
    }, 300);
  };

  // Select point
  const handleSelectOrigin = (point: LocationPoint) => {
    setOriginIsCoords(false);
    onOriginChange(point);
    setOriginText(point.label);
    setShowOriginDropdown(false);
    if (!isWithinPhoenixStudyArea(point.latitude, point.longitude)) {
      setLocationError(
        'Selected location appears outside Downtown Phoenix. Routing may fail if outside the 10×10 km pedestrian network.'
      );
    }
  };

  const handleSelectDestination = (point: LocationPoint) => {
    setDestIsCoords(false);
    onDestinationChange(point);
    setDestText(point.label);
    setShowDestDropdown(false);
    if (!isWithinPhoenixStudyArea(point.latitude, point.longitude)) {
      setLocationError(
        'Selected location appears outside Downtown Phoenix. Routing may fail if outside the 10×10 km pedestrian network.'
      );
    }
  };

  // Geolocation Handler
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (isWithinPhoenixStudyArea(lat, lng)) {
          handleSelectOrigin({
            label: 'My Current Location',
            latitude: lat,
            longitude: lng,
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
          });
        } else {
          setLocationError(
            'Your current GPS location is outside the Downtown Phoenix study network (10×10 km). Please select a Phoenix landmark.'
          );
        }
      },
      (err) => {
        setLocationError(`Location permission denied: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-4">
      {/* Scope Tag */}
      <div className="flex items-center justify-between text-xs font-mono text-[#5A6860] pb-1">
        <span className="flex items-center gap-1.5 font-semibold text-[#202522]">
          <MapPin className="w-3.5 h-3.5 text-[#385E48]" />
          PHOENIX STUDY AREA
        </span>
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="flex items-center gap-1 text-[#385E48] hover:text-[#274333] transition-colors cursor-pointer"
          title="Use browser GPS location"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Use my location</span>
        </button>
      </div>

      {/* Input container with swap button */}
      <div className="relative space-y-3">
        {/* Origin Field */}
        <div ref={originWrapperRef} className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#5A6860]">
              Origin (A)
            </label>
            {originIsCoords && (
              <span className="text-[11px] font-mono text-[#385E48] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Coordinates recognized
              </span>
            )}
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3 w-5 h-5 rounded-full bg-[#202522] text-white flex items-center justify-center font-mono text-xs font-bold pointer-events-none">
              A
            </span>
            <input
              type="text"
              value={originText}
              onChange={handleOriginInputChange}
              onFocus={() => {
                if (!originText && !originIsCoords) setOriginSuggestions(PHOENIX_LANDMARKS.slice(0, 5));
                if (!originIsCoords) setShowOriginDropdown(true);
              }}
              placeholder="Search a Phoenix location or enter latitude, longitude"
              disabled={disabled}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#E5E5DC] rounded-lg text-[#202522] placeholder:text-[#5A6860]/60 focus:outline-none focus:border-[#385E48] focus:ring-1 focus:ring-[#385E48] transition-all"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {origin && (
                <button
                  type="button"
                  onClick={() => {
                    onOriginChange(null);
                    setOriginText('');
                    setOriginIsCoords(false);
                  }}
                  className="p-1 text-[#5A6860] hover:text-[#202522] rounded cursor-pointer"
                  title="Clear origin"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Origin Suggestions Dropdown */}
          {showOriginDropdown && !originIsCoords && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-[#E5E5DC] rounded-lg shadow-lg max-h-56 overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-mono uppercase text-[#5A6860] bg-[#F7F7F3] border-b border-[#E5E5DC]">
                {originText.trim() ? 'Search Results' : 'Suggested Landmarks'}
              </div>
              {originSuggestions.length > 0 ? (
                originSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOrigin(item)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#F1F1EB] transition-colors border-b border-[#E5E5DC]/50 last:border-none flex flex-col cursor-pointer"
                  >
                    <span className="font-medium text-[#202522]">{item.label}</span>
                    {item.address && (
                      <span className="text-[11px] text-[#5A6860] truncate">
                        {item.address}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-xs text-[#5A6860] text-center">
                  {isSearching ? 'Searching...' : 'No Phoenix locations found'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Swap Origin & Destination Button */}
        <div className="flex justify-center -my-1">
          <button
            type="button"
            onClick={onSwap}
            disabled={disabled}
            className="p-1.5 bg-white border border-[#E5E5DC] rounded-full text-[#5A6860] hover:text-[#202522] hover:bg-[#F7F7F3] shadow-2xs transition-transform hover:rotate-180 duration-200 cursor-pointer"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination Field */}
        <div ref={destWrapperRef} className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#5A6860]">
              Destination (B)
            </label>
            {destIsCoords && (
              <span className="text-[11px] font-mono text-[#385E48] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Coordinates recognized
              </span>
            )}
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3 w-5 h-5 rounded-full bg-[#274333] text-white flex items-center justify-center font-mono text-xs font-bold pointer-events-none">
              B
            </span>
            <input
              type="text"
              value={destText}
              onChange={handleDestInputChange}
              onFocus={() => {
                if (!destText && !destIsCoords) setDestSuggestions(PHOENIX_LANDMARKS.slice(0, 5));
                if (!destIsCoords) setShowDestDropdown(true);
              }}
              placeholder="Search a Phoenix location or enter latitude, longitude"
              disabled={disabled}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-[#E5E5DC] rounded-lg text-[#202522] placeholder:text-[#5A6860]/60 focus:outline-none focus:border-[#385E48] focus:ring-1 focus:ring-[#385E48] transition-all"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {destination && (
                <button
                  type="button"
                  onClick={() => {
                    onDestinationChange(null);
                    setDestText('');
                    setDestIsCoords(false);
                  }}
                  className="p-1 text-[#5A6860] hover:text-[#202522] rounded cursor-pointer"
                  title="Clear destination"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Destination Suggestions Dropdown */}
          {showDestDropdown && !destIsCoords && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-[#E5E5DC] rounded-lg shadow-lg max-h-56 overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-mono uppercase text-[#5A6860] bg-[#F7F7F3] border-b border-[#E5E5DC]">
                {destText.trim() ? 'Search Results' : 'Suggested Landmarks'}
              </div>
              {destSuggestions.length > 0 ? (
                destSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDestination(item)}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-[#F1F1EB] transition-colors border-b border-[#E5E5DC]/50 last:border-none flex flex-col cursor-pointer"
                  >
                    <span className="font-medium text-[#202522]">{item.label}</span>
                    {item.address && (
                      <span className="text-[11px] text-[#5A6860] truncate">
                        {item.address}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-3 text-xs text-[#5A6860] text-center">
                  {isSearching ? 'Searching...' : 'No Phoenix locations found'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Location warning if applicable */}
      {locationError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Quick Select Phoenix Landmark Preset Chips */}
      <div className="pt-1">
        <span className="block text-[11px] font-mono uppercase text-[#5A6860] mb-1.5">
          Quick Preset Routes:
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => {
              setOriginIsCoords(false);
              setDestIsCoords(false);
              handleSelectOrigin(PHOENIX_LANDMARKS[2]); // Roosevelt Row
              handleSelectDestination(PHOENIX_LANDMARKS[4]); // Chase Field
            }}
            className="px-2.5 py-1 text-xs bg-white hover:bg-[#F1F1EB] border border-[#E5E5DC] rounded text-[#202522] transition-colors cursor-pointer"
          >
            Roosevelt Row → Chase Field
          </button>
          <button
            type="button"
            onClick={() => {
              setOriginIsCoords(false);
              setDestIsCoords(false);
              handleSelectOrigin(PHOENIX_LANDMARKS[0]); // City Hall
              handleSelectDestination(PHOENIX_LANDMARKS[6]); // Margaret T. Hance Park
            }}
            className="px-2.5 py-1 text-xs bg-white hover:bg-[#F1F1EB] border border-[#E5E5DC] rounded text-[#202522] transition-colors cursor-pointer"
          >
            City Hall → Hance Park
          </button>
          <button
            type="button"
            onClick={() => {
              setOriginIsCoords(false);
              setDestIsCoords(false);
              handleSelectOrigin(PHOENIX_LANDMARKS[1]); // ASU Downtown
              handleSelectDestination(PHOENIX_LANDMARKS[3]); // Convention Center
            }}
            className="px-2.5 py-1 text-xs bg-white hover:bg-[#F1F1EB] border border-[#E5E5DC] rounded text-[#202522] transition-colors cursor-pointer"
          >
            ASU Downtown → Conv. Center
          </button>
        </div>
      </div>
    </div>
  );
};
