'use client';

import { useEffect } from 'react';
import { initializeMonitoring } from '@/utils/monitoring-init';

interface MonitoringProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes monitoring systems
 */
export function MonitoringProvider({ children }: MonitoringProviderProps) {
  useEffect(() => {
    // Initialize monitoring systems on client side
    initializeMonitoring();
  }, []);

  return <>{children}</>;
}