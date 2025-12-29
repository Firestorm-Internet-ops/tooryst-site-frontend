'use client';

import { useEffect, useState } from 'react';
import { useLoading } from '@/components/providers/LoadingProvider';

export default function SplashScreen() {
  const { isLoading, progress } = useLoading();
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Wait for fade-out animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500); // Match fade-out duration
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gray-50 transition-opacity duration-500 ${
        isLoading ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="flex flex-col items-center">
        {/* Logo with subtle pulse animation */}
        <div className="mb-8 animate-pulse">
          <img
            src="/logo.svg"
            alt="Tooryst"
            className="w-24 h-24 md:w-32 md:h-32"
          />
        </div>

        {/* Minimal loading indicator */}
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
}
