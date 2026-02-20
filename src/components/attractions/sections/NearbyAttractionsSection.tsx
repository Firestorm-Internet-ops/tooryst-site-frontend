'use client';

import { AttractionPageResponse, NearbyAttraction } from '@/types/attraction-page';
import { SectionShell } from './SectionShell';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';
import { getCDNImageURL } from '@/lib/cdn-image';
import { EnhancedAPIClient } from '@/lib/api';
import { config } from '@/lib/config';
import { cityNameToSlug } from '@/lib/slug-utils';

interface NearbyAttractionsSectionProps {
  data: AttractionPageResponse;
}

function formatReviewCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

export function NearbyAttractionsSection({ data }: NearbyAttractionsSectionProps) {
  const initialAttractions = data.nearby_attractions || [];
  const [nearbyAttractions, setNearbyAttractions] = useState<NearbyAttraction[]>(initialAttractions);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentComplete, setEnrichmentComplete] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const lastScrollCheckTime = useRef<number>(0);

  const getSafeImageUrl = (url?: string | null) => {
    if (!url) return null;
    return url;
  };

  const checkScrollability = useCallback(() => {
    const now = Date.now();
    // Throttle to run at most once every 100ms
    if (now - lastScrollCheckTime.current < 100) {
      return;
    }
    lastScrollCheckTime.current = now;

    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  // Phase 1: Console.log initial data
  useEffect(() => {
    console.log('=== PHASE 1: Initial attraction data loaded ===');
    console.log('Attraction:', data.name);
    console.log('Initial nearby attractions:', initialAttractions);
    console.log('Total nearby attractions:', initialAttractions.length);

    const googlePlacesCount = initialAttractions.filter(
      a => a.link && a.link.includes('google.com/maps')
    ).length;
    console.log('Google Places attractions to enrich:', googlePlacesCount);

    if (googlePlacesCount > 0) {
      console.log('Google Places attractions:',
        initialAttractions
          .filter(a => a.link && a.link.includes('google.com/maps'))
          .map(a => ({ name: a.name, link: a.link, current_image: a.image_url }))
      );
    }
  }, []); // Only run once on mount

  // Phase 2: Console.log enrichment
  useEffect(() => {
    if (enrichmentComplete) return; // Don't re-run if already enriched

    const enrichAttractions = async () => {
      // Check if there are Google Places to enrich
      const hasGooglePlaces = initialAttractions.some(
        a => a.link && a.link.includes('google.com/maps')
      );

      if (!hasGooglePlaces) {
        console.log('=== No Google Places to enrich, skipping Phase 2 ===');
        return;
      }

      console.log('=== PHASE 2: Starting Google Places enrichment ===');
      console.log('Making API call to:', `${config.apiBaseUrl}/attractions/${data.slug}/sections`);
      setIsEnriching(true);

      try {
        // Make second API call to get enriched data
        const response = await EnhancedAPIClient.get<any>(
          `/attractions/${data.slug}/sections`,
          {},
          { retries: 1, useCircuitBreaker: false }
        );

        console.log('=== PHASE 2: API response received ===');
        console.log('Full API response:', response);

        // Extract nearby attractions from sections
        const nearbySection = response.sections?.find(
          (s: any) => s.section_type === 'nearby_attractions'
        );

        if (nearbySection?.content?.items) {
          const enrichedAttractions = nearbySection.content.items;

          console.log('=== PHASE 2: Enriched nearby attractions loaded ===');
          console.log('Enriched attractions:', enrichedAttractions);

          // Log comparison
          const enrichedCount = enrichedAttractions.filter(
            (a: NearbyAttraction) =>
              a.image_url && a.image_url.includes('places.googleapis.com')
          ).length;
          console.log(`Successfully enriched ${enrichedCount} attractions with fresh Google Places images`);

          if (enrichedCount > 0) {
            console.log('Enriched Google Places attractions:',
              enrichedAttractions
                .filter((a: NearbyAttraction) => a.image_url && a.image_url.includes('places.googleapis.com'))
                .map((a: NearbyAttraction) => ({ name: a.name, enriched_image: a.image_url }))
            );
          }

          // Update state with enriched data
          setNearbyAttractions(enrichedAttractions);
          setEnrichmentComplete(true);
        } else {
          console.warn('=== PHASE 2: No nearby attractions found in response ===');
        }
      } catch (error) {
        console.error('=== PHASE 2: Enrichment failed ===', error);
        // Keep using initial data on error
      } finally {
        setIsEnriching(false);
      }
    };

    // Delay enrichment slightly to ensure Phase 1 logs appear first
    const timer = setTimeout(enrichAttractions, 500);
    return () => clearTimeout(timer);
  }, [initialAttractions, data.slug, enrichmentComplete]);

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      return () => container.removeEventListener('scroll', checkScrollability);
    }
  }, [nearbyAttractions, checkScrollability]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (nearbyAttractions.length === 0) return null;

  return (
    <SectionShell
      id="nearby-attractions"
      title="Nearby attractions"
      subtitle="Other places to explore in the area."
    >
      <div className="relative group h-full flex flex-col min-h-0">
        {/* Enrichment Loading Indicator */}
        {isEnriching && (
          <div className="mb-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            <span className="text-sm text-blue-700 font-medium">
              Enriching Google Places images...
            </span>
          </div>
        )}

        {/* Navigation Buttons */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-3 shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-3 shadow-lg border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        )}

        {/* 3D Slider Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden min-h-0"
          style={{
            perspective: '1000px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {nearbyAttractions.map((attraction, idx) => {
            const citySlug = data.city ? cityNameToSlug(data.city) : 'unknown';
            const externalLink = attraction.link?.startsWith('http') ? attraction.link : null;
            const href =
              externalLink ??
              (attraction.slug ? `/${citySlug}/${attraction.slug}` : '#');
            const isExternal = !!externalLink;

            const wrapperProps = {
              className: 'group/card relative flex-shrink-0 w-[340px] snap-center',
              style: { transformStyle: 'preserve-3d' as const },
            };

            const Wrapper = ({ children }: { children: React.ReactNode }) =>
              isExternal ? (
                <a href={href} target="_blank" rel="noopener noreferrer" {...wrapperProps}>
                  {children}
                </a>
              ) : (
                <Link href={href} {...wrapperProps}>
                  {children}
                </Link>
              );

            return (
              <Wrapper key={idx}>
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-primary-300 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                  style={{
                    transformStyle: 'preserve-3d',
                    transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                  }}
                >
                  {getSafeImageUrl(attraction.image_url) ? (
                    <>
                      <div className="relative h-56 w-full overflow-hidden">
                        {(() => {
                          const rawUrl = getSafeImageUrl(attraction.image_url)!;
                          const isGoogleMaps = typeof rawUrl === 'string' && rawUrl.includes('maps.googleapis.com');
                          const imageUrl = isGoogleMaps ? rawUrl : getCDNImageURL(rawUrl, { width: 680, quality: 85, format: 'webp' });

                          return (
                            <Image
                              src={imageUrl}
                              alt={attraction.name}
                              fill
                              className="object-cover group-hover/card:scale-110 transition-transform duration-700"
                              sizes="340px"
                              loading="lazy"
                              unoptimized={!attraction.slug || isGoogleMaps}
                            />
                          );
                        })()}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                        {/* Rating Badge */}
                        {attraction.rating && (
                          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <div className="flex flex-col items-start leading-none">
                              <span className="text-sm font-bold text-gray-900">
                                {attraction.rating.toFixed(1)}
                              </span>
                              {attraction.review_count && attraction.review_count > 0 && (
                                <span className="text-[10px] text-gray-600">
                                  {formatReviewCount(attraction.review_count)}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 to-transparent">
                        <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 drop-shadow-lg">
                          {attraction.name}
                        </h3>

                        <div className="flex flex-wrap gap-2">
                          {attraction.distance_km && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30">
                              <MapPin className="h-3.5 w-3.5" />
                              {attraction.distance_km.toFixed(1)} km
                            </span>
                          )}
                          {attraction.walking_time_minutes && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30">
                              <Clock className="h-3.5 w-3.5" />
                              {attraction.walking_time_minutes} min
                            </span>
                          )}
                        </div>

                        {attraction.vicinity && (
                          <p className="text-xs text-white/80 mt-2 line-clamp-1 drop-shadow">
                            {attraction.vicinity}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-5 h-56 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-3">
                          {attraction.name}
                        </h3>

                        {attraction.vicinity && (
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                            {attraction.vicinity}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {attraction.distance_km && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                              <MapPin className="h-3.5 w-3.5" />
                              {attraction.distance_km.toFixed(1)} km
                            </span>
                          )}
                          {attraction.walking_time_minutes && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                              <Clock className="h-3.5 w-3.5" />
                              {attraction.walking_time_minutes} min
                            </span>
                          )}
                        </div>

                        {attraction.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold text-gray-900">
                              {attraction.rating.toFixed(1)}
                            </span>
                            {attraction.review_count && attraction.review_count > 0 && (
                              <span className="text-xs text-gray-500">
                                ({formatReviewCount(attraction.review_count)})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Wrapper>
            )
          })}
        </div>
      </div>
    </SectionShell>
  );
}
