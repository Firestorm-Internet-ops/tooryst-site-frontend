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
  quality = 85
): string => {
  if (baseUrl.includes('unsplash.com')) {
    return `${baseUrl}&w=${width}&q=${quality}&auto=format&fit=crop`;
  }
  
  // For other image services, return original URL
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

// Intersection Observer for lazy loading
export const createImageObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver => {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, defaultOptions);
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