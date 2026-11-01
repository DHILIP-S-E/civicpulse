import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Hazard } from '../../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Droplets,
  CheckCircle2,
  MapPin,
  Eye
} from 'lucide-react';

export const HazardManagementWorkspace: React.FC = () => {
  const {
    hazards,
    selectedHazard,
    setSelectedHazard
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<'depth' | 'name' | 'severity'>('depth');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const filteredHazards = hazards
    .filter((h) => {
      const matchSearch =
        h.location_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        h.hazard_id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSeverity = severityFilter === 'ALL' || h.severity === severityFilter;
      const matchStatus = statusFilter === 'ALL' || h.status === statusFilter;
      return matchSearch && matchSeverity && matchStatus;
    })
    .sort((a, b) => {
      if (sortField === 'depth') {
        const dA = a.water_depth_cm || 0;
        const dB = b.water_depth_cm || 0;
        return sortAsc ? dA - dB : dB - dA;
      }
      if (sortField === 'name') {
        return sortAsc
          ? a.location_name.localeCompare(b.location_name)
          : b.location_name.localeCompare(a.location_name);
      }
      return 0;
    });

  const handleRowClick = (h: Hazard) => {
    setSelectedHazard(h);
  };

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] space-y-3 shadow-xs">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search location or ID (e.g. Sellur, HAZ-MDU-001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#172033] placeholder-[#94A3B8] focus:outline-none focus:border-[#1677FF]"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1">
              Severity
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full p-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs text-[#172033] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="MODERATE">Moderate Only</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-[#64748B] uppercase block mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md text-xs text-[#172033] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Incidents</option>
              <option value="RESOLVED">Resolved Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* GIS Data Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-xs">
        <div className="px-3.5 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between text-xs">
          <span className="font-semibold text-[#172033]">
            {filteredHazards.length} Incidents Registered
          </span>
          <div className="flex items-center space-x-2 text-[11px] text-[#64748B]">
            <button
              onClick={() => {
                setSortField('depth');
                setSortAsc(!sortAsc);
              }}
              className="hover:text-[#172033] flex items-center space-x-1 cursor-pointer"
            >
              <span>Depth</span>
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto divide-y divide-[#E2E8F0]">
          {filteredHazards.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#64748B]">
              No hazards matching current filters.
            </div>
          ) : (
            filteredHazards.map((h) => {
              const isSelected = selectedHazard?.hazard_id === h.hazard_id;
              const isCritical = h.severity === 'CRITICAL';
              const isResolved = h.status === 'RESOLVED';

              return (
                <div
                  key={h.hazard_id}
                  onClick={() => handleRowClick(h)}
                  className={`p-3 text-xs transition-colors cursor-pointer flex flex-col space-y-1.5 ${
                    isSelected
                      ? 'bg-[#EAF3FF] border-l-4 border-l-[#1677FF]'
                      : 'hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#64748B]">
                      {h.hazard_id}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        isResolved
                          ? 'bg-[#F0FDF4] text-[#16A34A] border-[#16A34A]/30'
                          : isCritical
                          ? 'bg-[#FEF2F2] text-[#DC2626] border-[#DC2626]/30'
                          : 'bg-[#FFFBEB] text-[#D97706] border-[#D97706]/30'
                      }`}
                    >
                      {isResolved ? 'Resolved' : h.severity}
                    </span>
                  </div>

                  <div className="font-semibold text-[#172033] leading-snug">
                    {h.location_name}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5">
                    <span className="flex items-center space-x-1">
                      <Droplets className="w-3 h-3 text-[#1677FF]" />
                      <span className="font-semibold text-[#172033] tabular-nums">
                        {h.water_depth_cm || 0} cm
                      </span>
                    </span>

                    <span className="flex items-center space-x-1 text-[#1677FF] font-medium">
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

