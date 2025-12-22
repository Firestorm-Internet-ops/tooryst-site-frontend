'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

// Generate a simple blur placeholder
const generateBlurDataURL = (width = 8, height = 8) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, width, height);
  }
  return canvas.toDataURL();
};

// Static blur data URL for SSR compatibility
const BLUR_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

export function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  sizes,
  priority = false,
  quality = 85,
  placeholder = 'blur',
  blurDataURL = BLUR_DATA_URL,
  onLoad,
  onError,
  fallbackSrc,
}: OptimizedImageProps) {
  // Validate and normalize URL before using it
  const normalizeImageSrc = (url: string): string => {
    if (!url || url.trim() === '') {
      return fallbackSrc || '/images/placeholder.jpg';
    }

    try {
      // Check if it's already a valid absolute URL
      new URL(url);
      return url;
    } catch {
      // Handle relative paths - convert to absolute paths
      if (url.startsWith('./')) {
        return url.replace('./', '/');
      } else if (url.startsWith('../')) {
        // For now, treat ../ as invalid and use fallback
        return fallbackSrc || '/images/placeholder.jpg';
      } else if (url.startsWith('/')) {
        return url;
      } else {
        // Assume it's a relative path and prepend /
        return `/${url}`;
      }
    }
  };

  const validSrc = normalizeImageSrc(src);
  const [imgSrc, setImgSrc] = useState(validSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setHasError(false);
      setIsLoading(true);
    }
    onError?.();
  };

  const imageProps = {
    src: imgSrc,
    alt,
    className: cn(
      'transition-opacity duration-300',
      isLoading && 'opacity-0',
      !isLoading && 'opacity-100',
      className
    ),
    onLoad: handleLoad,
    onError: handleError,
    quality,
    placeholder,
    blurDataURL,
    ...(fill ? { fill: true } : { width, height }),
    ...(sizes && { sizes }),
    ...(priority && { priority: true }),
  };

  return (
    <>
      <Image {...imageProps} />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Image unavailable</div>
        </div>
      )}
    </>
  );
}