'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

import { HeroSection } from '@/components/sections/HeroSection';
import { AttractionsGrid } from '@/components/sections/AttractionsGrid';
import type { AttractionSummary, City } from '@/types/api';
import { config } from '@/lib/config';

// Dynamically import Globe3D to avoid SSR issues with three-globe
const Globe3D = dynamic(
  () => import('@/components/sections/Globe3D').then((mod) => ({ default: mod.Globe3D })),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center border border-blue-100">
        <div className="text-blue-600">{config.text.loading.globe}</div>
      </div>
    ),
  }
);

interface HeroContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  inputPlaceholder?: string;
  cta?: string;
  pillars?: string[];
  backgroundImage?: string;
}

export interface FeaturedCity extends City {
  heroImage: string;
  description?: string;
  rating?: number | null;
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface HomePageClientProps {
  heroContent: HeroContent;
  featuredCities: FeaturedCity[];
  trendingAttractions: AttractionSummary[];
  destinations?: Array<{ name: string; lat?: number; lng?: number; region?: string; slug?: string; country?: string; attractionCount?: number }>;
}

export function HomePageClient({
  heroContent,
  featuredCities,
  trendingAttractions,
  destinations,
}: HomePageClientProps) {
  const router = useRouter();

  const handleSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const globeCities = useMemo(() => {
    if (destinations && destinations.length > 0) {
      return destinations;
    }

    const cities = featuredCities
      .filter((city) => {
        const lat = city.latitude ?? city.lat;
        const lng = city.longitude ?? city.lng;
        return lat !== null && lng !== null && lat !== undefined && lng !== undefined;
      })
      .map((city) => {
        const lat = city.latitude ?? city.lat;
        const lng = city.longitude ?? city.lng;
        return {
          name: city.name,
          region: city.country,
          country: city.country,
          lat: lat as number,
          lng: lng as number,
          slug: city.slug,
          attractionCount: city.attraction_count,
        };
      });
    
    return cities;
  }, [destinations, featuredCities]);

  // Show empty state if no data
  const hasData = featuredCities.length > 0 || trendingAttractions.length > 0;

  if (!hasData) {
    return (
      <div className="flex flex-col gap-12 bg-gradient-to-b from-white via-slate-50 to-white text-gray-900 min-h-screen">
        <HeroSection
          backgroundImage={heroContent.backgroundImage}
          onSearch={handleSearch}
          eyebrow={heroContent.eyebrow}
          heading={heroContent.heading}
          subheading={heroContent.subheading}
          highlights={heroContent.pillars}
          searchPlaceholder={heroContent.inputPlaceholder}
        />
        
        <section className="mx-auto w-full max-w-4xl px-4 md:px-6 py-12">
          <div className="rounded-3xl border-2 border-dashed border-gray-300 bg-white shadow-sm">
            <div className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-semibold text-gray-900 mb-3">
                  {config.text.emptyState.heading}
                </h2>
                <div className="max-w-2xl mx-auto">
                  <p className="text-base text-gray-600">
                    {config.text.emptyState.message}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <p className="font-semibold text-gray-900 mb-4 text-center">
                  📋 {config.text.emptyState.setupTitle}
                </p>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-semibold text-xs">
                      1
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Add attractions data</p>
                      <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 mt-1 inline-block">
                        backend/data/attractions.xlsx
                      </code>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-semibold text-xs">
                      2
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Import to database</p>
                      <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 mt-1 inline-block">
                        python scripts/02_import_attractions.py
                      </code>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-semibold text-xs">
                      3
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Fetch all data</p>
                      <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 mt-1 inline-block">
                        python scripts/00_fetch_all_data.py
                      </code>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12 bg-gradient-to-b from-white via-slate-50 to-white text-gray-900">
      <HeroSection
        backgroundImage={heroContent.backgroundImage}
        onSearch={handleSearch}
        eyebrow={heroContent.eyebrow}
        heading={heroContent.heading}
        subheading={heroContent.subheading}
        highlights={heroContent.pillars}
        searchPlaceholder={heroContent.inputPlaceholder}
      />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 md:px-6">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.4em] text-primary-600">{config.text.trending.eyebrow}</p>
          <h2 className="text-2xl font-display font-semibold md:text-3xl text-gray-900">{config.text.trending.heading}</h2>
          <p className="text-sm text-gray-600">{config.text.trending.subheading}</p>
        </div>
        {trendingAttractions.length > 0 ? (
          <AttractionsGrid attractions={trendingAttractions} />
        ) : (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm">
            {config.text.trending.empty}
          </div>
        )}
      </section>

      <section className="mx-auto w-full max-w-6xl flex flex-col gap-4 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-primary-600">{config.text.cities.eyebrow}</p>
            <h2 className="text-2xl font-display font-semibold md:text-3xl text-gray-900">{config.text.cities.heading}</h2>
          </div>
          {featuredCities.length > 0 && (
            <Link
              href="/cities"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors underline"
            >
              {config.text.cities.seeAll}
            </Link>
          )}
        </div>
        {featuredCities.length > 0 ? (
          <div className="flex flex-wrap gap-3 md:gap-4">
            {featuredCities.map((city, index) => {
              const citySlug = city.slug || city.name.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={city.slug || `city-${index}`}
                  href={`/${citySlug}`}
                  className="rounded-full border border-gray-200 bg-white px-5 py-2.5 md:px-6 md:py-3 text-base md:text-lg font-medium text-gray-900 shadow-sm hover:border-primary-200 hover:bg-primary-50/80 transition-all duration-200"
                >
                  {city.name}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm">
            {config.text.cities.empty}
          </div>
        )}
      </section>

      {globeCities.length > 0 && (
        <section className="mx-auto w-full max-w-6xl flex flex-col gap-6 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-primary-600">{config.text.globe.eyebrow}</p>
              <h2 className="text-2xl font-display font-semibold text-gray-900 md:text-3xl">{config.text.globe.heading}</h2>
            </div>
          </div>
          <Globe3D cities={globeCities} />
        </section>
      )}
    </div>
  );
}

