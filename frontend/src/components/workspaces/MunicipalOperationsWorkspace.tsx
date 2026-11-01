import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { MunicipalDispatchPanel } from '../municipal/MunicipalDispatchPanel';
import { PriorityRanking } from '../municipal/PriorityRanking';
import { EventStream } from '../layout/EventStream';
import { api } from '../../services/api';

export const MunicipalOperationsWorkspace: React.FC = () => {
  const {
    activeDispatch,
    setActiveDispatch,
    selectedHazard,
    setSelectedHazard,
    priorities,
    setPriorities,
    hazards,
    setHazards,
    isResolving,
    setIsResolving,
    vehiclePosition,
    setVehiclePosition,
    events,
    setEvents,
    showToast
  } = useAppStore();

  const handleDispatch = async (hazardId: string) => {
    try {
      const target = hazards.find(h => h.hazard_id === hazardId) || null;
      if (target) setSelectedHazard(target);

      const record = await api.createDispatch({
        hazard_id: hazardId,
        truck_type: 'SUPER_SUCKER',
        crew_id: 'CREW-MDU-WEST-04'
      });
      setActiveDispatch(record);

      if (record.vehicle_path && record.vehicle_path.length > 0) {
        let step = 0;
        setVehiclePosition(record.vehicle_path[0]);
        const interval = setInterval(() => {
          step++;
          if (step < record.vehicle_path.length) {
            setVehiclePosition(record.vehicle_path[step]);
          } else {
            clearInterval(interval);
          }
        }, 120);
      }

      const ev = await api.getEvents();
      setEvents(ev);

      showToast(`Super-sucker unit dispatched to ${target?.location_name || 'hazard'}`, 'success');
    } catch (err: any) {
      showToast(`Dispatch error: ${err.message}`, 'warning');
    }
  };

  const handleResolveHazard = async (hazardId: string, dispatchId?: string) => {
    setIsResolving(true);
    try {
      await api.resolveHazard({
        hazard_id: hazardId,
        dispatch_id: dispatchId,
        notes: 'Cleared by Madurai Corporation Dewatering Tanker Unit 04'
      });

      const hz = await api.getHazards();
      setHazards(hz);

      const prio = await api.getPriorities();
      setPriorities(prio);

      if (selectedHazard && selectedHazard.hazard_id === hazardId) {
        const updated = hz.find(h => h.hazard_id === hazardId);
        if (updated) setSelectedHazard(updated);
      }

      const ev = await api.getEvents();
      setEvents(ev);

      showToast('Road cleared! City map updated and safe corridor reopened.', 'success');
    } catch (err: any) {
      showToast(`Resolution error: ${err.message}`, 'warning');
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Crew Dispatch Tracker Panel */}
      <MunicipalDispatchPanel
        dispatch={activeDispatch}
        targetHazard={selectedHazard}
        onResolveHazard={handleResolveHazard}
        isResolving={isResolving}
        onResetDispatch={() => {
          setActiveDispatch(null);
          setVehiclePosition(null);
        }}
      />

      {/* Response Priority Queue */}
      <PriorityRanking
        priorities={priorities}
        onSelectHazardById={(id) => {
          const h = hazards.find(item => item.hazard_id === id);
          if (h) setSelectedHazard(h);
        }}
        onDispatch={handleDispatch}
        selectedHazardId={selectedHazard?.hazard_id}
      />

      {/* Real-time Operational Event Stream */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <EventStream events={events} />
      </div>
    </div>
  );
};
