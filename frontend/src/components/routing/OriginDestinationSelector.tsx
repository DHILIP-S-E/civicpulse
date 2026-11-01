import React, { useState } from 'react';
import { Place } from '../../types';
import {
  Navigation,
  ArrowUpDown,
  Car,
  Footprints,
  Truck,
  ShieldCheck,
  Search,
  CheckCircle2
} from 'lucide-react';

interface RoutePreset {
  id: string;
  name: string;
  origin: Place;
  destination: Place;
}

const MADURAI_PRESETS: RoutePreset[] = [
  {
    id: 'preset-1',
    name: 'Periyar Bus Stand → Mattuthavani',
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
    name: 'Arapalayam → Goripalayam',
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
    name: 'Kalavasal → Vandiyur Teppakulam',
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
  const [avoidHazards, setAvoidHazards] = useState(true);

  // Initialize with Preset 1 if unset
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
      onCalculateRoute(selectedOrigin, selectedDestination, profile, avoidHazards);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Route Presets Carousel / Quick Buttons */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5 block">
          Madurai Route Corridors
        </label>
        <div className="space-y-1">
          {MADURAI_PRESETS.map((preset) => {
            const isSelected =
              selectedOrigin?.place_id === preset.origin.place_id &&
              selectedDestination?.place_id === preset.destination.place_id;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-200'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 border-border-subtle text-gray-300'
                }`}
              >
                <span className="truncate">{preset.name}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Origin & Destination Boxes */}
      <div className="space-y-2 relative">
        {/* Origin */}
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-border-subtle">
          <div className="flex items-center space-x-2 text-[11px] text-blue-400 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>ORIGIN POINT</span>
          </div>
          <div className="text-xs font-medium text-white truncate">
            {selectedOrigin?.name || 'Select origin on map'}
          </div>
          <div className="text-[11px] text-gray-400 truncate">
            {selectedOrigin?.address}
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={handleSwap}
            className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-300 border border-border-subtle transition-transform hover:scale-110 shadow"
            title="Swap Origin & Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination */}
        <div className="p-2.5 rounded-lg bg-slate-900/90 border border-border-subtle">
          <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>DESTINATION POINT</span>
          </div>
          <div className="text-xs font-medium text-white truncate">
            {selectedDestination?.name || 'Select destination on map'}
          </div>
          <div className="text-[11px] text-gray-400 truncate">
            {selectedDestination?.address}
          </div>
        </div>
      </div>

      {/* Transport Profile Selector */}
      <div>
        <label className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5 block">
          Transport Mode
        </label>
        <div className="grid grid-cols-3 gap-1 bg-slate-900/90 p-1 rounded-lg border border-border-subtle">
          <button
            onClick={() => setProfile('Car')}
            className={`flex items-center justify-center space-x-1 py-1.5 rounded text-xs transition-colors ${
              profile === 'Car' ? 'bg-blue-600 text-white font-medium' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Car</span>
          </button>
          <button
            onClick={() => setProfile('Walking')}
            className={`flex items-center justify-center space-x-1 py-1.5 rounded text-xs transition-colors ${
              profile === 'Walking' ? 'bg-blue-600 text-white font-medium' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Walking</span>
          </button>
          <button
            onClick={() => setProfile('Truck')}
            className={`flex items-center justify-center space-x-1 py-1.5 rounded text-xs transition-colors ${
              profile === 'Truck' ? 'bg-blue-600 text-white font-medium' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Truck</span>
          </button>
        </div>
      </div>

      {/* Hazard Avoidance Toggle */}
      <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-900/60 border border-border-subtle text-xs">
        <span className="flex items-center space-x-1.5 text-gray-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Avoid Mapped Hazards</span>
        </span>
        <input
          type="checkbox"
          checked={avoidHazards}
          onChange={(e) => setAvoidHazards(e.target.checked)}
          className="rounded border-gray-700 text-blue-600 focus:ring-0 bg-slate-800 cursor-pointer w-4 h-4"
        />
      </div>

      {/* Compare Route Trigger */}
      <button
        onClick={handleCalculate}
        disabled={isLoading || !selectedOrigin || !selectedDestination}
        className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs tracking-wide uppercase transition-all shadow-md flex items-center justify-center space-x-2"
      >
        <Navigation className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        <span>{isLoading ? 'Verifying Corridors...' : 'Compare Safe Corridors'}</span>
      </button>
    </div>
  );
};

