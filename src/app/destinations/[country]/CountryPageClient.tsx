'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useCountry } from '@/hooks/useCountry';
import { CountryHero } from '@/components/pages/CountryHero';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CountryMap } from '@/components/sections/CountryMap';
import { AttractionsGrid } from '@/components/sections/AttractionsGrid';
import { Card } from '@/components/ui/Card';

export function CountryPageClient({ countryCode }: { countryCode: string }) {
  const router = useRouter();
  const { country, attractions, markers, isLoading, isError } = useCountry(countryCode);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner label="Loading country..." />
      </div>
    );
  }

  if (isError || !country) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-center">
        <h2 className="text-2xl font-display">Country not found</h2>
        <p className="text-gray-600">We couldn’t load this destination. Try searching from the home page.</p>
        <Link href="/" className="text-primary-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const cityTotals =
    attractions?.items?.reduce<
      Record<string, { count: number; slug: string; latSum: number; lngSum: number }>
    >((acc, attraction) => {
      const cityName = attraction.city;
      if (!cityName) {
        return acc;
      }
      const slug = cityName.toLowerCase().replace(/\s+/g, '-');
      if (!acc[cityName]) {
        acc[cityName] = { count: 0, slug, latSum: 0, lngSum: 0 };
      }
      acc[cityName].count += 1;
      if (typeof attraction.latitude === 'number') {
        acc[cityName].latSum += attraction.latitude;
      }
      if (typeof attraction.longitude === 'number') {
        acc[cityName].lngSum += attraction.longitude;
      }
      return acc;
    }, {}) ?? {};

  const cities = Object.entries(cityTotals).map(([name, value]) => {
    const avgLat = value.count ? value.latSum / value.count : country.latitude ?? 0;
    const avgLng = value.count ? value.lngSum / value.count : country.longitude ?? 0;
    return {
      name,
      slug: value.slug,
      count: value.count,
      lat: avgLat,
      lng: avgLng,
    };
  });

  const topAttractions = attractions?.items?.slice(0, 12) ?? [];

  const handleCityNavigate = React.useCallback(
    (slug: string) => {
      router.push(`/${slug}`);
    },
    [router]
  );

  const handleAttractionNavigate = React.useCallback(
    (slug: string) => {
      // For now, keep using the old URL structure since we don't have city slug here
      // TODO: Update this when we have city slug in attraction data
      router.push(`/attractions/${slug}`);
    },
    [router]
  );

  return (
    <div className="space-y-10">
      <CountryHero
        country={country}
        mostVisitedCity={country.mostVisitedCity}
      />

      <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 space-y-12">
        <section>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary-600 font-semibold">
                Explore by City
              </p>
              <h2 className="text-2xl md:text-3xl font-display font-semibold text-gray-900">
                Cities across {country.name}
              </h2>
              <p className="text-gray-600 mt-1">
                Pick a city to dive into detailed attraction storyboards.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city) => (
              <Card key={city.slug} className="p-4 flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{city.name}</h3>
                <p className="text-sm text-gray-500">{city.count} attractions</p>
                <Link
                  href={`/${city.slug}`}
                  className="text-primary-600 text-sm font-medium hover:underline mt-2"
                >
                  View city →
                </Link>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <header>
            <h2 className="text-2xl font-display font-semibold text-gray-900">
              Country Map
            </h2>
            <p className="text-gray-600">
              View all major cities and attractions across {country.name}.
            </p>
          </header>
          <CountryMap
            country={{
              name: country.name,
              lat: country.latitude ?? null,
              lng: country.longitude ?? null,
            }}
            cities={cities.map((city) => ({
              name: city.name,
              slug: city.slug,
              lat: city.lat,
              lng: city.lng,
              attractionCount: city.count,
            }))}
            attractions={markers}
            onCityClick={handleCityNavigate}
            onAttractionClick={handleAttractionNavigate}
          />
        </section>

        <section className="space-y-4">
          <header>
            <h2 className="text-2xl font-display font-semibold text-gray-900">
              Top Attractions
            </h2>
            <p className="text-gray-600">
              Curated highlights across {country.name}.
            </p>
          </header>
          <AttractionsGrid
            attractions={topAttractions}
            onAttractionClick={handleAttractionNavigate}
          />
        </section>
      </div>
    </div>
  );
}

