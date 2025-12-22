'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Start loading when navigation begins
    setIsNavigating(true);
    setProgress(0);

    // Simulate progress
    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressTimer);
          return 90;
        }
        return prev + Math.random() * 30;
      });
    }, 100);

    // Complete loading after a short delay
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);
    }, 300);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(completeTimer);
    };
  }, [pathname, searchParams]);

  if (!isNavigating) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-1"
      role="progressbar"
      aria-label="Page loading"
      aria-valuetext="Loading"
    >
      <div 
        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-loading-bar" />
    </div>
  );
}
