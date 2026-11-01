import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { AppShell } from './components/layout/AppShell';
import { api } from './services/api';

export const App: React.FC = () => {
  const {
    setHazards,
    setSelectedHazard,
    setSnapshots,
    setPriorities,
    setEvents,
    setIsBackendHealthy,
    setIsLocationConnected,
    setIsIcebergConnected,
    setOperatingMode
  } = useAppStore();

  useEffect(() => {
    const initialize = async () => {
      try {
        const health = await api.getHealth();
        setIsBackendHealthy(health?.status === 'healthy');

        const awsHealth = await api.getAwsHealth().catch(() => null);
        if (awsHealth && (awsHealth.overall_status === 'CONNECTED' || awsHealth.configured_mode === 'live')) {
          setIsLocationConnected(true);
          setIsIcebergConnected(true);
          setOperatingMode('live');
        }

        const sn = await api.getSnapshots();
        setSnapshots(sn);

        const hz = await api.getHazards();
        setHazards(hz);

        const prio = await api.getPriorities();
        setPriorities(prio);

        const ev = await api.getEvents();
        setEvents(ev);

        // Pre-select first hazard for immediate visual context
        if (hz.length > 0) {
          setSelectedHazard(hz[0]);
        }
      } catch (err) {
        console.warn('Initial data load warning:', err);
      }
    };

    initialize();

    // Auto-refresh operational event log every 8s
    const eventPoll = setInterval(async () => {
      try {
        const ev = await api.getEvents();
        setEvents(ev);
      } catch (_) {}
    }, 8000);

    return () => clearInterval(eventPoll);
  }, []);

  return <AppShell />;
};

export default App;
