import { useEffect, useState } from 'react';

interface UseImagePreloaderOptions {
  enabled?: boolean;
  priority?: boolean;
}

export function useImagePreloader(
  imageUrls: string[],
  options: UseImagePreloaderOptions = {}
) {
  const { enabled = true, priority = false } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled || imageUrls.length === 0) {
      setIsLoading(false);
      return;
    }

    const preloadWithProgress = async () => {
      setIsLoading(true);
      setLoadedCount(0);
      setErrors([]);

      const promises = imageUrls.map(async (url, index) => {
        try {
          await new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              setLoadedCount(prev => prev + 1);
              resolve();
            };
            img.onerror = () => {
              setErrors(prev => [...prev, url]);
              reject(new Error(`Failed to load image: ${url}`));
            };
            img.src = url;
          });
        } catch (error) {
          console.warn(`Failed to preload image ${index}:`, error);
        }
      });

      try {
        await Promise.allSettled(promises);
      } finally {
        setIsLoading(false);
      }
    };

    // Delay preloading for non-priority images to avoid blocking critical resources
    const delay = priority ? 0 : 100;
    const timeoutId = setTimeout(preloadWithProgress, delay);

    return () => clearTimeout(timeoutId);
  }, [imageUrls, enabled, priority]);

  return {
    isLoading,
    loadedCount,
    totalCount: imageUrls.length,
    progress: imageUrls.length > 0 ? (loadedCount / imageUrls.length) * 100 : 100,
    errors,
    hasErrors: errors.length > 0,
  };
}