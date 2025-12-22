'use client';

import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { SearchInput } from '@/components/form/SearchInput';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useImagePreloader } from '@/hooks/useImagePreloader';
import { getImageSizes, generateBlurDataURL } from '@/lib/image-utils';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  backgroundImage?: string;
  onSearch?: (query: string) => void;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  highlights?: string[];
  searchPlaceholder?: string;
}

const DEFAULT_CONTENT = {
  eyebrow: 'Travel Intelligence',
  heading: 'Skip lines. Save time. See more.',
  subheading: 'Discover the best time to visit any attraction—plus crowd levels, reviews, weather, tips, and nearby must-sees.',
  searchPlaceholder: 'Search cities, attractions, or stories',
};

export function HeroSection({
  backgroundImage,
  onSearch,
  eyebrow = DEFAULT_CONTENT.eyebrow,
  heading = DEFAULT_CONTENT.heading,
  subheading = DEFAULT_CONTENT.subheading,
  highlights = [],
  searchPlaceholder,
}: HeroSectionProps) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Validate background image URL
  const isValidImageUrl = backgroundImage && backgroundImage.trim() !== '';

  // Preload the hero image for faster loading
  const { isLoading: preloading } = useImagePreloader(
    isValidImageUrl ? [backgroundImage] : [],
    { enabled: !!isValidImageUrl, priority: true }
  );

  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (onSearch) {
      onSearch(trimmed);
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <section
      data-testid="hero-section"
      className="relative w-full min-h-[80vh] bg-gradient-to-b from-blue-600 to-blue-800 overflow-hidden"
    >
      {/* Background Image */}
      {isValidImageUrl && (
        <div className="absolute inset-0">
          <OptimizedImage
            src={backgroundImage}
            alt="Hero background"
            fill
            className={cn(
              'object-cover transition-opacity duration-700',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            sizes={getImageSizes('hero')}
            priority
            quality={90}
            placeholder="blur"
            blurDataURL={generateBlurDataURL('#1e40af')}
            onLoad={handleImageLoad}
          />
        </div>
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
      
      {/* Content */}
      <div className="relative z-10 mx-auto flex min-h-[80vh] w-full max-w-5xl flex-col items-center justify-center px-5 py-12 text-white sm:px-8">
        <div className="flex w-full flex-col items-center gap-4 text-center sm:gap-6">
          <p className="text-xs uppercase tracking-[0.4em] text-primary-100 sm:text-sm">{eyebrow}</p>
          <h1 className="text-3xl font-display font-bold leading-tight sm:text-4xl lg:text-5xl">{heading}</h1>
          <p className="max-w-3xl text-sm text-white/80 sm:text-base">{subheading}</p>
          <div className="mt-6 sm:mt-8 w-full max-w-2xl mx-auto px-2 sm:px-0">
            <SearchInput
              onSearch={handleSearch}
              placeholder={searchPlaceholder ?? DEFAULT_CONTENT.searchPlaceholder}
            />
        </div>
        {highlights.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 px-4 sm:px-0">
            {highlights.map((highlight) => (
              <span key={highlight} className="rounded-full border border-white/20 px-2.5 sm:px-3 py-1 text-xs sm:text-xs text-white/80">
                {highlight}
              </span>
            ))}
          </div>
        )}
        </div>
        <div className="mt-12 sm:mt-16 flex flex-col items-center gap-2 text-white/70 pb-4">
          <span className="text-xs uppercase tracking-[0.3em]">Scroll down</span>
          <ChevronDown className="h-5 w-5 animate-bounce" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}

