'use client';

import * as React from 'react';
import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { useCity } from '@/hooks/useCity';
import { CityHeroCollage } from '@/components/pages/CityHeroCollage';
import { BentoGridLayout } from '@/components/layout/BentoGridLayout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AttractionsGrid } from '@/components/sections/AttractionsGrid';
import { Pagination } from '@/components/ui/Pagination';
import { apiClient } from '@/lib/api';
import { AttractionSummary, PaginatedResponse } from '@/types/api';
import dynamic from 'next/dynamic';

// Dynamically import CityMap to avoid SSR issues with Leaflet
const CityMap = dynamic(
  () => import('@/components/sections/CityMap').then((mod) => ({ default: mod.CityMap })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-200 bg-white h-96 lg:h-[500px] flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    ),
  }
);

interface CityPageClientProps {
  slug: string;
  initialPage: number;
}

export function CityPageClient({ slug, initialPage }: CityPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lockRef = React.useRef(false);
  const [currentPage, setCurrentPage] = React.useState(initialPage);

  // Fetch ALL attractions for collage, rating, map, and grid (not paginated)
  const {
    data: allAttractionsData,
    isLoading: isLoadingAllAttractions,
    isError,
  } = useQuery<PaginatedResponse<AttractionSummary>>({
    queryKey: ['city-all-attractions', slug],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<AttractionSummary>>(
        `/cities/${slug}/attractions`,
        {
          params: { skip: 0, limit: 1000 }, // Reasonable limit for city pages
        }
      );
      return response.data;
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
  });

  // Get city data separately
  const {
    city,
    isLoadingCity,
  } = useCity(slug, { initialPage });

  // Client-side pagination from all attractions
  const allAttractionsList = allAttractionsData?.items ?? [];
  const totalAttractions = allAttractionsList.length;
  const pageSize = 12; // Match the pagination size
  const totalPages = Math.ceil(totalAttractions / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAttractions = allAttractionsList.slice(startIndex, endIndex);
  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const updatePageQuery = React.useCallback(
    (page: number) => {
      if (!router || !pathname) {
        return;
      }
      const params = new URLSearchParams(searchParams.toString());
      if (page <= 1) {
        params.delete('page');
      } else {
        params.set('page', page.toString());
      }
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [router, pathname, searchParams]
  );

  const handlePageChange = React.useCallback(
    (page: number) => {
      if (lockRef.current || isLoadingAllAttractions) {
        return;
      }
      lockRef.current = true;
      setCurrentPage(page);
      updatePageQuery(page);
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        lockRef.current = false;
      }, 250);
    },
    [isLoadingAllAttractions, updatePageQuery]
  );

  const handleAttractionNavigate = React.useCallback(
    (attractionSlug: string) => {
      if (router) {
        router.push(`/${slug}/${attractionSlug}`);
      } else {
        window.location.href = `/${slug}/${attractionSlug}`;
      }
    },
    [router, slug]
  );

  if (isLoadingCity) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner label="Loading city..." />
      </div>
    );
  }

  if (isError || !city) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center">
        <h2 className="text-2xl font-display">City not found</h2>
        <p className="text-gray-600">
          We couldn't find that city. Try exploring our destinations list.
        </p>
        <Link href="/" className="text-primary-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const attractionsList = paginatedAttractions;

  // Extract first images from ALL attractions for collage
  const attractionImages = useMemo(() => {
    return allAttractionsList
      .map((attraction) => attraction.hero_image)
      .filter((url): url is string => Boolean(url));
  }, [allAttractionsList]);

  // Calculate average rating from ALL attractions
  const averageRating = useMemo(() => {
    const ratings = allAttractionsList
      .map((a) => a.average_rating)
      .filter((r): r is number => r !== null && r !== undefined);
    if (ratings.length === 0) return undefined;
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  }, [allAttractionsList]);

  // Handle scroll to map section
  const handleMapClick = React.useCallback(() => {
    const mapSection = document.getElementById('city-map-section');
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative">
        <CityHeroCollage 
          city={city} 
          attractionImages={attractionImages}
          averageRating={averageRating}
          onMapClick={handleMapClick}
        />
      </div>

      {/* Main Content */}
      <BentoGridLayout>
        {/* Quick Stats Section */}
        <section className="mt-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200/50 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-primary-700 font-medium">Total Attractions</p>
                  <p className="text-2xl font-bold text-primary-900">{city.attraction_count || 0}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/50 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-700 font-medium">Average Rating</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {averageRating ? averageRating.toFixed(1) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200/50 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
            <div>
                  <p className="text-sm text-emerald-700 font-medium">Updated Daily</p>
                  <p className="text-lg font-bold text-emerald-900">Live Data</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Attractions Section */}
        <section className="space-y-8 mb-12">
          <header className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="h-px w-12 bg-gradient-to-r from-primary-500 to-transparent" />
              <p className="text-sm uppercase tracking-widest text-primary-600 font-semibold">
                Explore
              </p>
              <div className="h-px flex-1 bg-gradient-to-r from-primary-500/50 to-transparent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3">
                Attractions in {city.name}
              </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              Discover {city.attraction_count || 0} amazing experiences, updated daily with real-time data, reviews, and insights.
              </p>
          </header>

          <AttractionsGrid
            attractions={attractionsList}
            loading={isLoadingAllAttractions}
          />

          {totalPages > 1 && (
            <div className="flex justify-center pt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoadingAllAttractions}
            />
          </div>
          )}
        </section>

        {/* Map Section */}
        <section id="city-map-section" className="space-y-6 mb-12">
          <header className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="h-px w-12 bg-gradient-to-r from-blue-500 to-transparent" />
              <p className="text-sm uppercase tracking-widest text-blue-600 font-semibold">
                Location
              </p>
              <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-3">
              Explore on Map
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl">
              See where {city.name} is located and discover all attractions on an interactive map.
            </p>
          </header>
          
          <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-200 bg-white">
          {isLoadingAllAttractions ? (
            <div className="h-96 lg:h-[500px] flex items-center justify-center">
              <div className="text-gray-500">Loading map data...</div>
            </div>
          ) : (
          <CityMap
              lat={city.latitude ?? null}
              lng={city.longitude ?? null}
              cityName={city.name}
              attractions={allAttractionsList
                .filter((attraction) => 
                  typeof attraction.latitude === 'number' && 
                  typeof attraction.longitude === 'number' &&
                  !isNaN(attraction.latitude) && 
                  !isNaN(attraction.longitude) &&
                  isFinite(attraction.latitude) &&
                  isFinite(attraction.longitude)
                )
                .map((attraction) => ({
                  lat: attraction.latitude,
                  lng: attraction.longitude,
              name: attraction.name,
              slug: attraction.slug,
                  rating: attraction.average_rating,
                  firstImageUrl: attraction.hero_image ?? null,
                  city_name: city.name,
                  review_count: attraction.total_reviews,
            }))}
            onMarkerClick={handleAttractionNavigate}
          />
          )}
          </div>
        </section>
      </BentoGridLayout>
    </div>
  );
}