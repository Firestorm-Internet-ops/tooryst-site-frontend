/**
 * Image Optimization Hooks
 * Feature: frontend-quality-improvements, Task 4.1: Optimize Image Handling and Lazy Loading
 * 
 * React hooks for image optimization including:
 * - Lazy loading with intersection observer
 * - Image preloading and caching
 * - Performance monitoring
 * - Responsive image handling
 * - Error handling and fallbacks
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { 
  preloadImage, 
  preloadImages, 
  getLazyImageManager,
  generateResponsiveImageUrl,
  getResponsiveImageUrls
} from '@/lib/image-utils';
import { PerformanceMonitor } from '@/utils/performance-monitoring';

/**
 * Hook for lazy loading images with intersection observer
 */
export function useLazyImage(src: string, options: IntersectionObserverInit = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const loadStartTime = useRef<number>(0);

  const load = useCallback(async () => {
    if (isLoaded || isLoading) return;

    setIsLoading(true);
    setError(null);
    loadStartTime.current = performance.now();

    try {
      await preloadImage(src);
      const loadTime = performance.now() - loadStartTime.current;
      
      // Track performance
      PerformanceMonitor.trackImageLoad('lazy-image', loadTime);
      
      setIsLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load image'));
    } finally {
      setIsLoading(false);
    }
  }, [src, isLoaded, isLoading]);

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement || typeof window === 'undefined') return;

    const lazyManager = getLazyImageManager();
    
    // Set up lazy loading
    imgElement.dataset.src = src;
    
    const handleLazyLoad = () => {
      load();
    };

    imgElement.addEventListener('lazyload', handleLazyLoad);
    lazyManager.observe(imgElement);

    return () => {
      imgElement.removeEventListener('lazyload', handleLazyLoad);
      lazyManager.unobserve(imgElement);
    };
  }, [src, load]);

  return {
    imgRef,
    isLoaded,
    isLoading,
    error,
    load,
  };
}

/**
 * Hook for preloading images
 */
export function useImagePreloader() {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [preloadingImages, setPreloadingImages] = useState<Set<string>>(new Set());
  const [preloadErrors, setPreloadErrors] = useState<Map<string, Error>>(new Map());

  const preloadSingle = useCallback(async (src: string) => {
    if (preloadedImages.has(src) || preloadingImages.has(src)) {
      return;
    }

    setPreloadingImages(prev => new Set([...prev, src]));
    setPreloadErrors(prev => {
      const newMap = new Map(prev);
      newMap.delete(src);
      return newMap;
    });

    const startTime = performance.now();

    try {
      await preloadImage(src);
      const loadTime = performance.now() - startTime;
      
      // Track performance
      PerformanceMonitor.trackImageLoad('preload-image', loadTime);
      
      setPreloadedImages(prev => new Set([...prev, src]));
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to preload image');
      setPreloadErrors(prev => new Map([...prev, [src, err]]));
    } finally {
      setPreloadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(src);
        return newSet;
      });
    }
  }, [preloadedImages, preloadingImages]);

  const preloadMultiple = useCallback(async (urls: string[]) => {
    const startTime = performance.now();
    
    try {
      await preloadImages(urls);
      const loadTime = performance.now() - startTime;
      
      // Track performance
      PerformanceMonitor.trackCustomMetric('preload-multiple-images', loadTime);
      
      setPreloadedImages(prev => new Set([...prev, ...urls]));
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }
  }, []);

  const isPreloaded = useCallback((src: string) => {
    return preloadedImages.has(src);
  }, [preloadedImages]);

  const isPreloading = useCallback((src: string) => {
    return preloadingImages.has(src);
  }, [preloadingImages]);

  const getPreloadError = useCallback((src: string) => {
    return preloadErrors.get(src);
  }, [preloadErrors]);

  return {
    preloadSingle,
    preloadMultiple,
    isPreloaded,
    isPreloading,
    getPreloadError,
    preloadedImages: Array.from(preloadedImages),
    preloadingImages: Array.from(preloadingImages),
  };
}

/**
 * Hook for responsive image handling
 */
export function useResponsiveImage(src: string, quality = 75) {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [optimizedSrc, setOptimizedSrc] = useState(src);

  // Generate responsive URLs
  const responsiveUrls = getResponsiveImageUrls(src);

  // Update breakpoint based on window size
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setCurrentBreakpoint('mobile');
      } else if (width < 1024) {
        setCurrentBreakpoint('tablet');
      } else {
        setCurrentBreakpoint('desktop');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);

    return () => {
      window.removeEventListener('resize', updateBreakpoint);
    };
  }, []);

  // Update optimized source based on breakpoint
  useEffect(() => {
    const widths = {
      mobile: 640,
      tablet: 1024,
      desktop: 1920,
    };

    const newSrc = generateResponsiveImageUrl(src, widths[currentBreakpoint], quality);
    setOptimizedSrc(newSrc);
  }, [src, currentBreakpoint, quality]);

  return {
    optimizedSrc,
    currentBreakpoint,
    responsiveUrls,
  };
}

/**
 * Hook for image error handling and fallbacks
 */
export function useImageFallback(src: string, fallbackSrc?: string) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleError = useCallback(() => {
    if (retryCount < maxRetries) {
      // Retry loading the original image
      setRetryCount(prev => prev + 1);
      setTimeout(() => {
        setCurrentSrc(`${src}?retry=${retryCount + 1}`);
      }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
    } else if (fallbackSrc && currentSrc !== fallbackSrc) {
      // Use fallback image
      setCurrentSrc(fallbackSrc);
      setRetryCount(0);
    } else {
      // No more options, mark as error
      setHasError(true);
    }
  }, [src, fallbackSrc, currentSrc, retryCount, maxRetries]);

  const reset = useCallback(() => {
    setCurrentSrc(src);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  // Reset when src changes
  useEffect(() => {
    reset();
  }, [src, reset]);

  return {
    currentSrc,
    hasError,
    retryCount,
    handleError,
    reset,
  };
}

/**
 * Hook for image loading performance monitoring
 */
export function useImagePerformance(imageName: string) {
  const loadStartTime = useRef<number>(0);
  const [loadTime, setLoadTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = useCallback(() => {
    loadStartTime.current = performance.now();
    setIsLoading(true);
    setLoadTime(null);
  }, []);

  const finishLoading = useCallback(() => {
    const duration = performance.now() - loadStartTime.current;
    setLoadTime(duration);
    setIsLoading(false);
    
    // Track performance
    PerformanceMonitor.trackImageLoad(imageName, duration);
  }, [imageName]);

  const handleLoadStart = useCallback(() => {
    startLoading();
  }, [startLoading]);

  const handleLoad = useCallback(() => {
    finishLoading();
  }, [finishLoading]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    // Track error but don't record load time
  }, []);

  return {
    loadTime,
    isLoading,
    handleLoadStart,
    handleLoad,
    handleError,
  };
}

/**
 * Hook for image intersection observer
 */
export function useImageIntersection(options: IntersectionObserverInit = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return {
    elementRef,
    isIntersecting,
    hasIntersected,
  };
}

/**
 * Hook for image gallery optimization
 */
export function useImageGallery(images: string[], options: {
  preloadCount?: number;
  lazyLoadThreshold?: number;
} = {}) {
  const { preloadCount = 3, lazyLoadThreshold = 5 } = options;
  const { preloadMultiple, isPreloaded } = useImagePreloader();
  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());

  // Preload first few images
  useEffect(() => {
    const imagesToPreload = images.slice(0, preloadCount);
    if (imagesToPreload.length > 0) {
      preloadMultiple(imagesToPreload);
    }
  }, [images, preloadCount, preloadMultiple]);

  const markImageVisible = useCallback((index: number) => {
    setVisibleImages(prev => new Set([...prev, index]));
    
    // Preload next few images when an image becomes visible
    const nextImages = images.slice(index + 1, index + 1 + lazyLoadThreshold);
    if (nextImages.length > 0) {
      preloadMultiple(nextImages);
    }
  }, [images, lazyLoadThreshold, preloadMultiple]);

  const shouldLoadImage = useCallback((index: number) => {
    return index < preloadCount || visibleImages.has(index) || isPreloaded(images[index]);
  }, [preloadCount, visibleImages, isPreloaded, images]);

  return {
    markImageVisible,
    shouldLoadImage,
    visibleImages: Array.from(visibleImages),
  };
}

/**
 * Hook for image caching
 */
export function useImageCache() {
  const cache = useRef<Map<string, HTMLImageElement>>(new Map());

  const getCachedImage = useCallback((src: string) => {
    return cache.current.get(src);
  }, []);

  const setCachedImage = useCallback((src: string, img: HTMLImageElement) => {
    cache.current.set(src, img);
  }, []);

  const preloadAndCache = useCallback(async (src: string) => {
    if (cache.current.has(src)) {
      return cache.current.get(src)!;
    }

    const img = new Image();
    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
    });

    img.src = src;
    const loadedImg = await promise;
    
    cache.current.set(src, loadedImg);
    return loadedImg;
  }, []);

  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  const getCacheSize = useCallback(() => {
    return cache.current.size;
  }, []);

  return {
    getCachedImage,
    setCachedImage,
    preloadAndCache,
    clearCache,
    getCacheSize,
  };
}