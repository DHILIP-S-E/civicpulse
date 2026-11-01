import React from 'react';
import {
  LayoutDashboard,
  Navigation,
  AlertTriangle,
  History,
  Truck,
  BarChart3,
  Server,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAppStore, WorkspaceId } from '../../store/useAppStore';

interface NavItem {
  id: WorkspaceId;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'command', label: 'Command Center', icon: LayoutDashboard },
  { id: 'routing', label: 'Routing & Detours', icon: Navigation },
  { id: 'hazards', label: 'Hazard Registry', icon: AlertTriangle },
  { id: 'timeline', label: 'Historical Timeline', icon: History },
  { id: 'operations', label: 'Municipal Fleet', icon: Truck },
  { id: 'analytics', label: 'Analytics & Triage', icon: BarChart3 },
  { id: 'architecture', label: 'Cloud Architecture', icon: Server },
];

export const Sidebar: React.FC = () => {
  const {
    activeWorkspace,
    setActiveWorkspace,
    sidebarCollapsed,
    toggleSidebar,
    hazards,
    priorities
  } = useAppStore();

  const urgentHazardsCount = hazards.filter(h => h.severity === 'CRITICAL' && h.status !== 'RESOLVED').length;

  return (
    <aside
      className={`h-full bg-white border-r border-[#E2E8F0] flex flex-col justify-between transition-all duration-300 z-30 select-none ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Navigation Top Section */}
      <div className="flex flex-col py-3">
        {/* Navigation Item List */}
        <nav className="space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeWorkspace === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveWorkspace(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-lg transition-all text-xs font-medium cursor-pointer ${
                  sidebarCollapsed
                    ? 'justify-center p-3'
                    : 'px-3 py-2.5 space-x-3'
                } ${
                  isActive
                    ? 'bg-[#EAF3FF] text-[#1677FF] font-semibold'
                    : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#172033]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1677FF]' : 'text-[#64748B]'}`} />

                {!sidebarCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!sidebarCollapsed && item.id === 'hazards' && urgentHazardsCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20">
                    {urgentHazardsCount}
                  </span>
                )}

                {!sidebarCollapsed && item.id === 'operations' && priorities.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF3FF] text-[#1677FF] border border-[#1677FF]/20">
                    {priorities.filter(p => p.severity !== 'LOW').length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Collapse / Expand Toggle Button */}
      <div className="p-3 border-t border-[#E2E8F0] flex justify-end">
        <button
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          className="p-1.5 rounded-lg text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9] transition-colors w-full flex items-center justify-center cursor-pointer"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <div className="flex items-center space-x-2 text-xs font-medium text-[#64748B]">
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
