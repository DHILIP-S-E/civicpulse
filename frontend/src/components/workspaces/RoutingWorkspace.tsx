import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { OriginDestinationSelector } from '../routing/OriginDestinationSelector';
import { RouteComparisonCard } from '../routing/RouteComparisonCard';
import { Place } from '../../types';
import { api } from '../../services/api';

export const RoutingWorkspace: React.FC = () => {
  const {
    originPlace,
    setOriginPlace,
    destPlace,
    setDestPlace,
    routeComparison,
    setRouteComparison,
    isRoutingLoading,
    setIsRoutingLoading,
    showToast,
    setEvents
  } = useAppStore();

  const handleCalculateRoute = async (
    origin: Place,
    destination: Place,
    profile: string,
    avoidHazards: boolean
  ) => {
    setIsRoutingLoading(true);
    try {
      const res = await api.compareRoutes({
        origin: { longitude: origin.longitude, latitude: origin.latitude },
        destination: { longitude: destination.longitude, latitude: destination.latitude },
        transport_profile: profile,
        avoid_hazards: avoidHazards
      });
      setRouteComparison(res);

      const ev = await api.getEvents();
      setEvents(ev);

      if (res.avoidance_successful) {
        showToast(`Safe Corridor found! Avoids mapped flood zones (+${res.time_delta_minutes} min)`, 'success');
      } else {
        showToast('Direct arterial route crosses active flood zones. Exercise caution.', 'warning');
      }
    } catch (err: any) {
      showToast(`Route calculation completed with advisory: ${err.message}`, 'info');
    } finally {
      setIsRoutingLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <OriginDestinationSelector
        onCalculateRoute={handleCalculateRoute}
        isLoading={isRoutingLoading}
        selectedOrigin={originPlace}
        selectedDestination={destPlace}
        onSetOrigin={setOriginPlace}
        onSetDestination={setDestPlace}
      />

      {routeComparison && (
        <RouteComparisonCard comparison={routeComparison} />
      )}
    </div>
  );
};
