'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  progress: number;
  setProgress: (progress: number) => void;
  markHeroLoaded: () => void;
  markDataLoaded: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    // Simulate initial progress
    const timer = setTimeout(() => setProgress(30), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Hide loading screen when both hero image and initial data are ready
    if (heroLoaded && dataLoaded) {
      setProgress(100);
      // Small delay before hiding to show 100% completion
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    } else if (heroLoaded || dataLoaded) {
      // Update progress to 70% when one is loaded
      setProgress(70);
    }
  }, [heroLoaded, dataLoaded]);

  const markHeroLoaded = () => {
    console.log('✓ Hero image loaded');
    setHeroLoaded(true);
  };

  const markDataLoaded = () => {
    console.log('✓ Initial data loaded');
    setDataLoaded(true);
  };

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        setIsLoading,
        progress,
        setProgress,
        markHeroLoaded,
        markDataLoaded,
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}
