'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Share2 } from 'lucide-react';
import { useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { config } from '@/lib/config';

interface CityHeroCollageProps {
  city: {
    name: string;
    slug: string;
    country: string;
    attraction_count: number;
    lat?: number | null;
    lng?: number | null;
  };
  attractionImages: string[];
  averageRating?: number;
  visitorType?: string;
  onMapClick?: () => void;
}

export function CityHeroCollage({
  city,
  attractionImages,
  averageRating,
  visitorType,
  onMapClick,
}: CityHeroCollageProps) {
  const isShareInProgress = useRef(false);

  const handleShare = async () => {
    // Prevent concurrent share operations
    if (isShareInProgress.current) {
      return;
    }

    isShareInProgress.current = true;

    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `${city.name} • Toorysts`,
            text: `Discover attractions in ${city.name}`,
            url: typeof window !== 'undefined' ? `${window.location.origin}/${city.slug}` : `/${city.slug}`,
          });
        } catch (error: any) {
          // User canceled the share dialog or share failed
          // AbortError is expected when user cancels, so we silently handle it
          if (error.name !== 'AbortError') {
            // Only log non-cancel errors
            console.error('Error sharing:', error);
          }
          // Silently handle cancel - no need to show error to user
        }
      } else {
        // Fallback: Copy to clipboard if share API not available
        const url = typeof window !== 'undefined' ? `${window.location.origin}/${city.slug}` : `/${city.slug}`;
        try {
          await navigator.clipboard.writeText(url);
          // Optionally show a toast notification here
        } catch (err) {
          console.error('Failed to copy URL to clipboard:', err);
        }
      }
    } finally {
      isShareInProgress.current = false;
    }
  };

  // Take up to configured limit of images for the collage
  const imagesToShow = attractionImages.slice(0, config.ui.collageImageLimit);
  const hasImages = imagesToShow.length > 0;

  // Create a grid layout based on number of images
  const getGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-3';
    if (count === 4) return 'grid-cols-2 grid-rows-2';
    if (count === 5) return 'grid-cols-3 grid-rows-2';
    return 'grid-cols-3 grid-rows-2';
  };

  return (
    <section className="relative w-full h-[420px] sm:h-[55vh] sm:min-h-[480px] max-h-[700px] overflow-hidden">
      {/* Collage Background */}
      <div className="absolute inset-0">
        {hasImages ? (
          <div className={`grid ${getGridClass(imagesToShow.length)} h-full gap-1`}>
            {imagesToShow.map((imageUrl, index) => (
              <div key={index} className="relative overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={`${city.name} attraction ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
            {/* Fill remaining grid cells with last image if needed */}
            {imagesToShow.length === 5 && (
              <div className="relative overflow-hidden col-span-1">
                <Image
                  src={imagesToShow[imagesToShow.length - 1]}
                  alt={`${city.name} attraction`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            )}
          </div>
        ) : (
          <Image
            src={config.images.fallbackCity}
            alt={`${city.name} skyline`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30" />

      <div className="relative h-full flex flex-col">
        {/* Breadcrumb Navigation */}
        <div className="px-4 md:px-8 pt-6 md:pt-8">
          <nav className="text-xs md:text-sm uppercase tracking-wide text-gray-300 flex flex-wrap items-center gap-2 max-w-7xl mx-auto">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-gray-500">/</span>
            <Link href="/cities" className="hover:text-white transition-colors">
              Cities
            </Link>
            <span className="text-gray-500">/</span>
            <span className="font-semibold text-white">{city.name}</span>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center text-white p-4 md:p-8 gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight">
              {city.name}
            </h1>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="light" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm font-semibold">
              <svg className="w-4 h-4 mr-2 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {city.attraction_count} attractions
            </Badge>
            {typeof averageRating === 'number' && (
              <Badge variant="light" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm font-semibold">
                <svg className="w-4 h-4 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {averageRating.toFixed(1)} avg rating
              </Badge>
            )}
            {visitorType && (
              <Badge variant="light" className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-4 py-2 text-sm font-semibold">
                {visitorType} friendly
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button
              variant="secondary"
              size="large"
              onClick={onMapClick}
              aria-label="View on map"
              className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all px-6 py-3"
            >
              <MapPin className="h-5 w-5 mr-2" />
              View on Map
            </Button>
            <Button
              variant="ghost"
              size="large"
              onClick={handleShare}
              aria-label="Share"
              className="border-2 border-white/40 text-white hover:bg-white/20 backdrop-blur-sm transition-all px-6 py-3"
            >
              <Share2 className="h-5 w-5 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

