import React, { useState } from 'react';
import { Place } from '../../types';
import {
  Navigation,
  ArrowUpDown,
  Car,
  Footprints,
  Truck,
  ShieldCheck,
  Check
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
    <div className="space-y-4">
      {/* Route Corridors Selection */}
      <div>
        <div className="text-[11px] font-medium text-terminal-muted uppercase tracking-wider mb-2">
          Route Corridor Presets
        </div>
        <div className="space-y-1">
          {MADURAI_PRESETS.map((preset) => {
            const isSelected =
              selectedOrigin?.place_id === preset.origin.place_id &&
              selectedDestination?.place_id === preset.destination.place_id;
            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                className={`w-full text-left px-2.5 py-1.5 text-xs transition-colors flex items-center justify-between border ${
                  isSelected
                    ? 'bg-raised border-terminal-border text-white border-l-2 border-l-accent'
                    : 'bg-surface hover:bg-raised border-terminal-border text-terminal-muted hover:text-white'
                }`}
              >
                <span className="truncate">{preset.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-accent shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Origin & Destination Inputs */}
      <div className="space-y-2 relative">
        {/* Origin */}
        <div className="p-2.5 bg-surface border border-terminal-border">
          <div className="flex items-center space-x-1.5 text-[11px] text-terminal-muted mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
            <span>Origin</span>
          </div>
          <div className="text-xs font-semibold text-white truncate">
            {selectedOrigin?.name || 'Select origin on map'}
          </div>
          <div className="text-[11px] text-terminal-muted truncate mt-0.5">
            {selectedOrigin?.address}
          </div>
        </div>

        {/* Swap Control */}
        <div className="flex justify-end pr-2 -my-2.5 relative z-10">
          <button
            onClick={handleSwap}
            className="p-1 bg-raised hover:bg-[#26262c] text-terminal-muted hover:text-white border border-terminal-border rounded-sm transition-colors"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination */}
        <div className="p-2.5 bg-surface border border-terminal-border">
          <div className="flex items-center space-x-1.5 text-[11px] text-terminal-muted mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-hazard-resolved"></span>
            <span>Destination</span>
          </div>
          <div className="text-xs font-semibold text-white truncate">
            {selectedDestination?.name || 'Select destination on map'}
          </div>
          <div className="text-[11px] text-terminal-muted truncate mt-0.5">
            {selectedDestination?.address}
          </div>
        </div>
      </div>

      {/* Transport Profile Selection */}
      <div>
        <div className="text-[11px] font-medium text-terminal-muted uppercase tracking-wider mb-1.5">
          Transport Mode
        </div>
        <div className="grid grid-cols-3 gap-1 bg-surface p-1 border border-terminal-border">
          <button
            onClick={() => setProfile('Car')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 text-xs transition-colors ${
              profile === 'Car' ? 'bg-raised text-white font-medium' : 'text-terminal-muted hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Car</span>
          </button>
          <button
            onClick={() => setProfile('Walking')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 text-xs transition-colors ${
              profile === 'Walking' ? 'bg-raised text-white font-medium' : 'text-terminal-muted hover:text-white'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            <span>Walking</span>
          </button>
          <button
            onClick={() => setProfile('Truck')}
            className={`flex items-center justify-center space-x-1.5 py-1.5 text-xs transition-colors ${
              profile === 'Truck' ? 'bg-raised text-white font-medium' : 'text-terminal-muted hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Truck</span>
          </button>
        </div>
      </div>

      {/* Hazard Avoidance Toggle */}
      <div className="flex items-center justify-between px-3 py-2 bg-surface border border-terminal-border text-xs">
        <label htmlFor="avoid-hazards" className="flex items-center space-x-2 text-terminal-muted cursor-pointer">
          <ShieldCheck className="w-3.5 h-3.5 text-hazard-resolved" />
          <span>Avoid Verified Hazard Polygons</span>
        </label>
        <input
          id="avoid-hazards"
          type="checkbox"
          checked={avoidHazards}
          onChange={(e) => setAvoidHazards(e.target.checked)}
          className="cursor-pointer accent-accent w-4 h-4"
        />
      </div>

      {/* Action Trigger */}
      <button
        onClick={handleCalculate}
        disabled={isLoading || !selectedOrigin || !selectedDestination}
        className="w-full py-2 bg-raised hover:bg-[#25252c] disabled:opacity-40 text-white font-medium text-xs border border-terminal-border transition-colors flex items-center justify-center space-x-2"
      >
        <Navigation className={`w-3.5 h-3.5 text-accent ${isLoading ? 'animate-spin' : ''}`} />
        <span>{isLoading ? 'Verifying Polygons...' : 'Compare Corridors'}</span>
      </button>
    </div>
  );
};
