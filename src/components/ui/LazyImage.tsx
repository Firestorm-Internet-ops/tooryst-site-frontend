import Image, { ImageProps } from 'next/image';
import { useState } from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';

interface LazyImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallback?: string;
  skeletonClassName?: string;
}

/**
 * Lazy-loaded image component using Intersection Observer
 * Only loads image when it enters viewport
 */
export function LazyImage({
  src,
  fallback,
  alt,
  skeletonClassName,
  className,
  ...props
}: LazyImageProps) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div ref={ref} className="relative overflow-hidden">
      {!isLoaded && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-200 animate-pulse',
            skeletonClassName
          )}
        />
      )}
      {isVisible && (
        <Image
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={cn('transition-opacity duration-300', {
            'opacity-0': !isLoaded,
            'opacity-100': isLoaded,
          }, className)}
          {...props}
        />
      )}
      {!isVisible && fallback && (
        <Image
          src={fallback}
          alt={alt}
          className={className}
          {...props}
        />
      )}
    </div>
  );
}
