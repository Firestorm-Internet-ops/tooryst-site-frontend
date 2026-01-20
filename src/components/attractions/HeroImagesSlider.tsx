'use client';

import React from 'react';
import Image from 'next/image';
import { HeroImage } from '@/types/attraction-page';
import { getImageSizes, generateBlurDataURL, preloadImages } from '@/lib/image-utils';
import { getCDNImageURL } from '@/lib/cdn-image';
import { useHeroImages } from '@/hooks/useHeroImages';

interface HeroImageSliderProps {
  id?: number;
  name: string;
  city?: string;
  country?: string;
  images: HeroImage[];
}

export function HeroImageSlider({
  id,
  name,
  city,
  country,
  images: initialImages,
}: HeroImageSliderProps) {
  // Fetch additional hero images from Redis cache/API
  const { images: fetchedHeroImages, isLoading } = useHeroImages(id || 0);

  // Combine initial images (GCS/DB) with fetched images (Redis/API)
  const sorted = React.useMemo(() => {
    // Start with initial images
    let baseImages = [...initialImages];

    // If we have fetched images and they are different, prefer them as they are optimized
    if (fetchedHeroImages && fetchedHeroImages.length > 0) {
      // Create objects that match the HeroImage type
      const mappedFetched = fetchedHeroImages.map((img: any) => ({
        url: img.data, // This is the base64 WebP
        alt: img.alt || name,
        position: img.position
      }));

      // Merge: Keep initial first image (for LCP) but use fetched for others
      // or just use fetched if available. Actually, the plan says:
      // "Replace GCS image with full carousel once loaded"
      baseImages = mappedFetched;
    }

    return baseImages
      .filter((img) => img?.url && typeof img.url === 'string' && img.url.trim().length > 0)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .slice(0, 10);
  }, [initialImages, fetchedHeroImages, name]);

  const [index, setIndex] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [imagesPreloaded, setImagesPreloaded] = React.useState(false);

  // Preload next few images for smooth transitions
  React.useEffect(() => {
    if (sorted.length > 1) {
      const nextImages = sorted.slice(1, 4).map(img => img.url);
      preloadImages(nextImages).then(() => {
        setImagesPreloaded(true);
      });
    }
  }, [sorted]);

  const goNext = React.useCallback(() => {
    setIndex((prev) => (prev + 1) % sorted.length);
  }, [sorted.length]);

  const goPrev = () => {
    setIndex((prev) => (prev - 1 + sorted.length) % sorted.length);
  };

  // Auto-scroll effect
  React.useEffect(() => {
    if (sorted.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % sorted.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [sorted.length, isPaused]);

  if (!sorted.length) return null;

  const current = sorted[index];

  // Helper to determine if we should use CDN URL or standard URL (for base64)
  const getImageUrl = (url: string) => {
    if (url.startsWith('data:')) return url;
    return getCDNImageURL(url, { width: 1200, quality: 85, format: 'webp' });
  };

  return (
    <article
      className="relative rounded-3xl overflow-hidden bg-slate-900/60 border border-slate-800 h-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative h-full min-h-[320px] md:min-h-[384px]">
        <Image
          src={getImageUrl(current.url)}
          alt={current.alt || name}
          fill
          className="object-cover"
          priority={true}
          loading="eager"
          fetchPriority="high"
          placeholder={current.url.startsWith('data:') ? undefined : "blur"}
          blurDataURL={current.url.startsWith('data:') ? undefined : generateBlurDataURL()}
          sizes={getImageSizes('hero')}
          quality={90}
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Content overlay */}
        <div className="absolute top-4 left-4 z-10">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-1">
            {name}
          </h1>
          {(city) && (
            <p className="text-sm md:text-base text-slate-200">
              {[city].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        {/* Slider controls */}
        {sorted.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 backdrop-blur px-2 py-1 text-xs text-white hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              ‹
            </button>
            <button
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 backdrop-blur px-2 py-1 text-xs text-white hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex justify-center gap-1">
              {sorted.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`h-1.5 w-1.5 rounded-full transition-all ${i === index ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
                    }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </article>
  );
}

