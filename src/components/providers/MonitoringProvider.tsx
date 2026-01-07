'use client';

import { useEffect } from 'react';

interface MonitoringProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes monitoring systems
 */
export function MonitoringProvider({ children }: MonitoringProviderProps) {
  useEffect(() => {
    // Dynamically import and initialize monitoring to keep it out of the critical path
    import('@/utils/monitoring-init').then(({ initializeMonitoring }) => {
      initializeMonitoring();
    });
  }, []);

  return <>{children}</>;
}