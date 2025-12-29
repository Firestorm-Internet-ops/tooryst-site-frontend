'use client';

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

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
    // Initial progress
    const timer = setTimeout(() => setProgress(30), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Update progress when either loads
    if (heroLoaded || dataLoaded) {
      setProgress(70);
    }

    // Complete when both are loaded
    if (heroLoaded && dataLoaded) {
      setProgress(100);

      // Defer hiding to avoid hydration issues
      const hideTimer = setTimeout(() => {
        setIsLoading(false);
      }, 400);

      return () => clearTimeout(hideTimer);
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
