'use client';

import { AttractionPageResponse } from '@/types/attraction-page';
import { SectionShell } from './SectionShell';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from 'react';

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
  const nearbyAttractions = data.nearby_attractions || [];
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

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      return () => container.removeEventListener('scroll', checkScrollability);
    }
  }, [nearbyAttractions]);

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
            const href =
              attraction.link ??
              (attraction.slug ? `/attractions/${attraction.slug}` : '#');
            const isExternal = href.startsWith('http');

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
                      <Image
                        src={getSafeImageUrl(attraction.image_url)!}
                        alt={attraction.name}
                        fill
                        className="object-cover group-hover/card:scale-110 transition-transform duration-700"
                        sizes="340px"
                      />
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
          )})}
        </div>
      </div>
    </SectionShell>
  );
}
