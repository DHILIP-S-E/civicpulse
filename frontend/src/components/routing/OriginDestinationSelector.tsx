import React, { useState } from 'react';
import { Place } from '../../types';
import {
  Navigation,
  ArrowUpDown,
  Car,
  Footprints,
  Truck,
  Check,
  Compass
} from 'lucide-react';

interface RoutePreset {
  id: string;
  name: string;
  origin: Place;
  destination: Place;
}

export const MADURAI_PRESETS: RoutePreset[] = [
  {
    id: 'preset-1',
    name: 'Periyar Bus Stand -> Mattuthavani',
    origin: {
      place_id: 'MDU-PLC-001',
      name: 'Periyar Bus Stand',
      address: 'West Veli St, Madurai',
      category: 'Transit Hub',
      longitude: 78.1135,
      latitude: 9.9175
    },
    destination: {
      place_id: 'MDU-PLC-006',
      name: 'Mattuthavani Bus Terminus',
      address: 'Melur Rd, Madurai',
      category: 'Major Terminal',
      longitude: 78.1632,
      latitude: 9.9498
    }
  },
  {
    id: 'preset-2',
    name: 'Arapalayam -> Goripalayam',
    origin: {
      place_id: 'MDU-PLC-005',
      name: 'Arapalayam Bus Stand',
      address: 'Bypass Road, Madurai',
      category: 'Intercity Terminal',
      longitude: 78.1065,
      latitude: 9.9345
    },
    destination: {
      place_id: 'MDU-PLC-003',
      name: 'Goripalayam Junction',
      address: 'Gokhale Rd, Madurai',
      category: 'Arterial Junction',
      longitude: 78.1325,
      latitude: 9.9328
    }
  },
  {
    id: 'preset-3',
    name: 'Kalavasal -> Vandiyur Teppakulam',
    origin: {
      place_id: 'MDU-PLC-008',
      name: 'Kalavasal 4-Roads',
      address: 'Theni Main Rd, Madurai',
      category: 'Highway Junction',
      longitude: 78.0935,
      latitude: 9.9262
    },
    destination: {
      place_id: 'MDU-PLC-007',
      name: 'Vandiyur Teppakulam',
      address: 'Kamarajar Salai, Madurai',
      category: 'Heritage Landmark',
      longitude: 78.1488,
      latitude: 9.9142
    }
  }
];

interface OriginDestinationSelectorProps {
  onCalculateRoute: (
    origin: Place,
    destination: Place,
    profile: string,
    avoidHazards: boolean
  ) => void;
  isLoading: boolean;
  selectedOrigin: Place | null;
  selectedDestination: Place | null;
  onSetOrigin: (p: Place) => void;
  onSetDestination: (p: Place) => void;
}

export const OriginDestinationSelector: React.FC<OriginDestinationSelectorProps> = ({
  onCalculateRoute,
  isLoading,
  selectedOrigin,
  selectedDestination,
  onSetOrigin,
  onSetDestination,
}) => {
  const [profile, setProfile] = useState<'Car' | 'Walking' | 'Truck'>('Car');

  React.useEffect(() => {
    if (!selectedOrigin && !selectedDestination) {
      onSetOrigin(MADURAI_PRESETS[0].origin);
      onSetDestination(MADURAI_PRESETS[0].destination);
    }
  }, []);

  const handleApplyPreset = (preset: RoutePreset) => {
    onSetOrigin(preset.origin);
    onSetDestination(preset.destination);
  };

  const handleSwap = () => {
    if (selectedOrigin && selectedDestination) {
      const temp = selectedOrigin;
      onSetOrigin(selectedDestination);
      onSetDestination(temp);
    }
  };

  const handleCalculate = () => {
    if (selectedOrigin && selectedDestination) {
      onCalculateRoute(selectedOrigin, selectedDestination, profile, true);
    }
  };

  return (
    <div className="bg-[#111827] rounded-xl p-4 border border-[rgba(148,163,184,0.15)] space-y-4 shadow-md">
      {/* Header */}
      <div>
        <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
          <Compass className="w-4 h-4 text-blue-400" />
          <span>Plan Safe Route</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Find safe corridors avoiding real-time flood zones across Madurai
        </p>
      </div>

      {/* Popular Commute Presets */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          Popular Corridors
        </label>
        <div className="space-y-1.5">
          {MADURAI_PRESETS.map((preset) => {
            const isSelected =
              selectedOrigin?.place_id === preset.origin.place_id &&
              selectedDestination?.place_id === preset.destination.place_id;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/50 text-white font-medium'
                    : 'bg-[#0B0F19] hover:bg-slate-800/60 border-[rgba(148,163,184,0.15)] text-slate-300'
                }`}
              >
                <span className="truncate">{preset.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-1.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* FROM and TO Fields */}
      <div className="space-y-2 relative">
        {/* Origin */}
        <div className="p-3 bg-[#0B0F19] rounded-lg border border-[rgba(148,163,184,0.15)]">
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-blue-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>STARTING FROM (ORIGIN)</span>
          </div>
          <div className="text-xs font-semibold text-white truncate">
            {selectedOrigin?.name || 'Select starting point'}
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            {selectedOrigin?.address}
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2.5 relative z-10">
          <button
            onClick={handleSwap}
            className="p-1.5 bg-[#1F2937] hover:bg-slate-700 text-slate-300 hover:text-white border border-[rgba(148,163,184,0.2)] rounded-full transition-colors shadow-md cursor-pointer"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination */}
        <div className="p-3 bg-[#0B0F19] rounded-lg border border-[rgba(148,163,184,0.15)]">
          <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-emerald-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>GOING TO (DESTINATION)</span>
          </div>
          <div className="text-xs font-semibold text-white truncate">
            {selectedDestination?.name || 'Select destination'}
          </div>
          <div className="text-[11px] text-slate-400 truncate mt-0.5">
            {selectedDestination?.address}
          </div>
        </div>
      </div>

      {/* Mode of Travel */}
      <div>
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          Travel Mode
        </label>
        <div className="grid grid-cols-3 gap-1.5 bg-[#0B0F19] p-1 rounded-lg border border-[rgba(148,163,184,0.15)]">
          <button
            onClick={() => setProfile('Car')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
              profile === 'Car' ? 'bg-[#1F2937] text-white font-semibold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Car</span>
          </button>
          <button
            onClick={() => setProfile('Walking')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
              profile === 'Walking' ? 'bg-[#1F2937] text-white font-semibold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Walk</span>
          </button>
          <button
            onClick={() => setProfile('Truck')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 rounded text-xs transition-colors cursor-pointer ${
              profile === 'Truck' ? 'bg-[#1F2937] text-white font-semibold shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Heavy</span>
          </button>
        </div>
      </div>

      {/* Prominent Action Button */}
      <button
        onClick={handleCalculate}
        disabled={isLoading || !selectedOrigin || !selectedDestination}
        className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow hover:shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
      >
        <Navigation className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{isLoading ? 'Scanning Safe Routes...' : 'Compare Safe Corridors'}</span>
      </button>
    </div>
  );
};
