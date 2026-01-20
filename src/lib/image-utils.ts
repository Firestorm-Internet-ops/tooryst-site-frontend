/**
 * Image optimization utilities
 */

// Preload critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Preload multiple images
export const preloadImages = async (urls: string[]): Promise<void> => {
  try {
    await Promise.all(urls.map(preloadImage));
  } catch (error) {
    console.warn('Some images failed to preload:', error);
  }
};

// Generate responsive image URLs for different screen sizes
export const generateResponsiveImageUrl = (
  baseUrl: string,
  width: number,
  quality = 75 // Reduced from 85% to 75% for better performance
): string => {
  if (baseUrl.includes('unsplash.com')) {
    return `${baseUrl}&w=${width}&q=${quality}&auto=format&fit=crop`;
  }

  // For local images, use Next.js Image Optimization API
  if (baseUrl.startsWith('/images/')) {
    return `/_next/image?url=${encodeURIComponent(baseUrl)}&w=${width}&q=${quality}`;
  }

  // For other external image services, return original URL
  // In production, you might want to use your own image optimization service
  return baseUrl;
};

// Get optimized image URLs for different breakpoints
export const getResponsiveImageUrls = (baseUrl: string) => ({
  mobile: generateResponsiveImageUrl(baseUrl, 640),
  tablet: generateResponsiveImageUrl(baseUrl, 1024),
  desktop: generateResponsiveImageUrl(baseUrl, 1920),
  thumbnail: generateResponsiveImageUrl(baseUrl, 384),
});

// Intersection Observer for lazy loading with enhanced options
export const createImageObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '200px', // Increased from 100px for better prefetching
    threshold: 0.01,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, defaultOptions);
};

// Advanced lazy loading manager
export class LazyImageManager {
  private observer: IntersectionObserver | null = null;
  private loadedImages = new Set<string>();
  private loadingImages = new Set<string>();

  constructor(options: IntersectionObserverInit = {}) {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = createImageObserver(
        this.handleIntersection.bind(this),
        {
          rootMargin: '200px',
          threshold: 0.01,
          ...options,
        }
      );
    }
  }

  private handleIntersection(entry: IntersectionObserverEntry): void {
    if (entry.isIntersecting) {
      const img = entry.target as HTMLImageElement;
      const src = img.dataset.src;

      if (src) {
        this.loadImage(img, src);
      }
    }
  }

  private async loadImage(img: HTMLImageElement, src: string): Promise<void> {
    this.loadingImages.add(src);

    try {
      // Preload the image
      await preloadImage(src);

      // Update the image source
      img.src = src;
      img.classList.add('loaded');
      img.classList.remove('loading');

      // Mark as loaded
      this.loadedImages.add(src);
      this.loadingImages.delete(src);

      // Stop observing this image
      if (this.observer) {
        this.observer.unobserve(img);
      }

      // Dispatch load event
      img.dispatchEvent(new Event('lazyload'));
    } catch (error) {
      console.warn('Failed to load lazy image:', src, error);
      this.loadingImages.delete(src);
      img.classList.add('error');
      img.classList.remove('loading');
    }
  }

  observe(img: HTMLImageElement): void {
    if (this.observer) {
      img.classList.add('lazy', 'loading');
      this.observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      const src = img.dataset.src;
      if (src) {
        this.loadImage(img, src);
      }
    }
  }

  unobserve(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.unobserve(img);
    }
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.loadedImages.clear();
    this.loadingImages.clear();
  }
}

// Global lazy image manager instance
let globalLazyManager: LazyImageManager | null = null;

export const getLazyImageManager = (): LazyImageManager => {
  if (!globalLazyManager) {
    globalLazyManager = new LazyImageManager();
  }
  return globalLazyManager;
};

// Check if image is in viewport
export const isImageInViewport = (element: Element): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Generate blur data URL for placeholder
export const generateBlurDataURL = (color = '#f3f4f6'): string => {
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="${color}"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Image loading priority based on position
export const getImagePriority = (index: number, isAboveFold = false): boolean => {
  // Prioritize first 3 images above the fold
  return isAboveFold && index < 3;
};

// Optimized sizes attribute for responsive images
export const getImageSizes = (variant: 'card' | 'hero' | 'thumbnail' | 'full'): string => {
  switch (variant) {
    case 'card':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    case 'hero':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw';
    case 'thumbnail':
      return '(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px';
    case 'full':
      return '100vw';
    default:
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  }
};