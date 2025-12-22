'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

export function useNavigationLoading() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const navigateWithLoading = useCallback(
    async (href: string, options?: { replace?: boolean }) => {
      setIsLoading(true);
      
      try {
        if (options?.replace) {
          router.replace(href);
        } else {
          router.push(href);
        }
        
        // Keep loading state for a minimum time to show feedback
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      } catch (error) {
        setIsLoading(false);
        throw error;
      }
    },
    [router]
  );

  return {
    isLoading,
    navigateWithLoading,
  };
}