/**
 * Optimized Image Component with Lazy Loading and Skeleton Fallbacks
 * Feature: frontend-quality-improvements, Task 4.1: Optimize Image Handling and Lazy Loading
 * 
 * Enhanced image component with:
 * - Lazy loading with intersection observer
 * - Skeleton loading states
 * - Responsive image optimization
 * - Error handling and fallbacks

 * - Performance monitoring integration
 */

'use client';

import * as React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import {
  generateResponsiveImageUrl,
  getResponsiveImageUrls,
  generateBlurDataURL,
  getImageSizes,
  getImagePriority,
  getLazyImageManager
} from '@/lib/image-utils';
import { PerformanceMonitor } from '@/utils/performance-monitoring';
import { getCDNImageURL } from '@/lib/cdn-image';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  variant?: 'card' | 'hero' | 'thumbnail' | 'full';
  lazy?: boolean;
  showSkeleton?: boolean;
  skeletonClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  placeholder?: 'blur' | 'empty';
  unoptimized?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
}

interface ImageSkeletonProps {
  className?: string;
  variant?: 'card' | 'hero' | 'thumbnail' | 'full';
  aspectRatio?: string;
}

/**
 * Image skeleton component for loading states
 */
function ImageSkeleton({ className, variant = 'card', aspectRatio }: ImageSkeletonProps) {
  const skeletonClasses = cn(
    'animate-pulse bg-gray-200 dark:bg-gray-700',
    {
      'aspect-video': variant === 'hero' && !aspectRatio,
      'aspect-square': variant === 'thumbnail' && !aspectRatio,
      'aspect-[4/3]': variant === 'card' && !aspectRatio,
      'w-full h-full': variant === 'full',
    },
    className
  );

  const style = aspectRatio ? { aspectRatio } : undefined;

  return (
    <div className={skeletonClasses} style={style}>
      <div className="flex items-center justify-center h-full">
        <svg
          className="w-8 h-8 text-gray-400 dark:text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * Optimized image component with lazy loading and performance monitoring
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  variant = 'card',
  lazy = true,
  showSkeleton = true,
  skeletonClassName,
  onLoad,
  onError,
  fallbackSrc,
  blurDataURL,
  sizes,
  fill = false,
  objectFit = 'cover',
  objectPosition = 'center',
  placeholder = 'blur',
  unoptimized = false,
  fetchPriority,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(src);
  const loadStartTime = React.useRef<number>(0);
  const imageRef = React.useRef<HTMLImageElement>(null);

  // Automatically unoptimize Google Photos to prevent 403 errors
  const isGooglePhoto = src.includes('googleusercontent.com') || src.includes('ggpht.com');
  const shouldUnoptimize = unoptimized || isGooglePhoto;

  // Generate optimized image URLs
  const optimizedSrc = React.useMemo(() => {
    if (shouldUnoptimize) return src;

    if (width) {
      return getCDNImageURL(src, { width, quality, format: 'webp' });
    }

    // Use default width based on variant
    const defaultWidths = {
      thumbnail: 384,
      card: 640,
      hero: 1920,
      full: 1920,
    };

    return getCDNImageURL(src, { width: defaultWidths[variant], quality, format: 'webp' });
  }, [src, width, quality, variant, shouldUnoptimize]);

  // Generate responsive URLs for different breakpoints
  const responsiveUrls = React.useMemo(() => {
    if (shouldUnoptimize) return null;
    // Use CDN for responsive images
    const sizes = [640, 750, 828, 1080, 1200, 1920];
    return sizes
      .map(width => `${getCDNImageURL(src, { width, quality, format: 'webp' })} ${width}w`)
      .join(', ');
  }, [src, quality, shouldUnoptimize]);

  // Generate blur placeholder
  const blurPlaceholder = React.useMemo(() => {
    if (blurDataURL) return blurDataURL;
    if (placeholder === 'blur') return generateBlurDataURL();
    return undefined;
  }, [blurDataURL, placeholder]);

  // Get appropriate sizes attribute
  const imageSizes = sizes || getImageSizes(variant);

  // Handle image load
  const handleLoad = React.useCallback(() => {
    setIsLoading(false);
    onLoad?.();

    const endTime = performance.now();

    // Defer performance tracking to reduce TBT
    setTimeout(() => {
      const loadTime = endTime - loadStartTime.current;
      PerformanceMonitor.trackImageLoad(alt || 'image', loadTime);
    }, 2000); // Defer by 2 seconds
  }, [alt, onLoad]);

  // Handle image error
  const handleError = React.useCallback(() => {
    setHasError(true);
    setIsLoading(false);

    // Try fallback image if available
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
      return;
    }

    onError?.();
  }, [fallbackSrc, currentSrc, onError]);

  // Handle load start
  const handleLoadStart = React.useCallback(() => {
    loadStartTime.current = performance.now();
    setIsLoading(true);
    setHasError(false);
  }, []);

  // Set up lazy loading if enabled
  React.useEffect(() => {
    if (!lazy || priority || typeof window === 'undefined') return;

    const lazyManager = getLazyImageManager();
    const imgElement = imageRef.current;

    if (imgElement) {
      // Set up data-src for lazy loading
      imgElement.dataset.src = optimizedSrc;
      lazyManager.observe(imgElement);
    }
  }, [lazy, priority, optimizedSrc]);

  // Error fallback component
  if (hasError && !fallbackSrc) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600',
          {
            'aspect-video': variant === 'hero',
            'aspect-square': variant === 'thumbnail',
            'aspect-[4/3]': variant === 'card',
            'w-full h-full': variant === 'full' || fill,
          },
          className
        )}
      >
        <svg
          className="w-8 h-8"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className, { 'w-full h-full': fill })}>
      {/* Skeleton loading state */}
      {isLoading && showSkeleton && (
        <ImageSkeleton
          className={cn('absolute inset-0 z-10', skeletonClassName)}
          variant={variant}
        />
      )}

      {/* Next.js optimized image */}
      <Image
        ref={imageRef}
        src={lazy && !priority ? blurPlaceholder || '' : currentSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={imageSizes}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurPlaceholder}
        fetchPriority={fetchPriority}
        className={cn(
          'transition-opacity duration-300',
          {
            'opacity-0': isLoading,
            'opacity-100': !isLoading,
            'object-cover': objectFit === 'cover',
            'object-contain': objectFit === 'contain',
            'object-fill': objectFit === 'fill',
            'object-none': objectFit === 'none',
            'object-scale-down': objectFit === 'scale-down',
          }
        )}
        style={{
          objectPosition,
        }}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />

      {/* Loading indicator for non-skeleton loading */}
      {isLoading && !showSkeleton && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  );
}

/**
 * Optimized image with responsive breakpoints
 */
export function ResponsiveImage({
  src,
  alt,
  className,
  variant = 'card',
  ...props
}: Omit<OptimizedImageProps, 'sizes'> & {
  breakpoints?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
}) {
  const breakpoints = props.breakpoints || {
    mobile: 640,
    tablet: 1024,
    desktop: 1920,
  };

  const sizes = `(max-width: ${breakpoints.mobile}px) 100vw, (max-width: ${breakpoints.tablet}px) 50vw, 33vw`;

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      variant={variant}
      sizes={sizes}
      {...props}
    />
  );
}

/**
 * Image gallery component with lazy loading
 */
export interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  className?: string;
  imageClassName?: string;
  variant?: 'card' | 'thumbnail';
  columns?: number;
  gap?: number;
  lazy?: boolean;
}

export function ImageGallery({
  images,
  className,
  imageClassName,
  variant = 'card',
  columns = 3,
  gap = 4,
  lazy = true,
}: ImageGalleryProps) {
  return (
    <div
      className={cn(
        'grid',
        {
          'grid-cols-1': columns === 1,
          'grid-cols-2': columns === 2,
          'grid-cols-3': columns === 3,
          'grid-cols-4': columns === 4,
          'grid-cols-5': columns === 5,
          'grid-cols-6': columns === 6,
          'gap-1': gap === 1,
          'gap-2': gap === 2,
          'gap-3': gap === 3,
          'gap-4': gap === 4,
          'gap-6': gap === 6,
          'gap-8': gap === 8,
        },
        className
      )}
    >
      {images.map((image, index) => (
        <OptimizedImage
          key={`${image.src}-${index}`}
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          className={imageClassName}
          variant={variant}
          lazy={lazy}
          priority={getImagePriority(index, true)}
        />
      ))}
    </div>
  );
}

/**
 * Hero image component with optimized loading
 */
export interface HeroImageProps extends Omit<OptimizedImageProps, 'variant'> {
  overlay?: boolean;
  overlayClassName?: string;
  children?: React.ReactNode;
}

export function HeroImage({
  overlay = false,
  overlayClassName,
  children,
  className,
  ...props
}: HeroImageProps) {
  return (
    <div className={cn('relative', className)}>
      <OptimizedImage
        variant="hero"
        priority={true}
        lazy={false}
        fill
        fetchPriority="high"
        {...props}
      />

      {overlay && (
        <div
          className={cn(
            'absolute inset-0 bg-black bg-opacity-40',
            overlayClassName
          )}
        />
      )}

      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}