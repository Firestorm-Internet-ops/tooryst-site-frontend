import type { Metadata } from 'next';

import { HomePageClient, FeaturedCity } from './HomePageClient';
import homeContent from '@/content/home.json';
import type { AttractionSummary, City } from '@/types/api';
import { config } from '@/lib/config';
import { seoManager } from '@/lib/seo-manager';
import { OrganizationStructuredData, WebsiteStructuredData } from '@/components/seo/StructuredData';
import { safeFetchFromApi, extractItems } from '@/lib/api-utils';

type PaginatedPayload<T> = {
  items?: T[];
  data?: T[];
};

type DestinationMarker = {
  name: string;
  region?: string;
  country?: string;
  lat?: number;
  lng?: number;
  slug?: string;
  attractionCount?: number;
};

function cityImageForIndex(index: number): string {
  return `${config.images.fallbackCity}&sat=${index}`;
}

async function getFeaturedCities(): Promise<FeaturedCity[]> {
  // Fetch a larger pool of cities, then pick the top 10 by attraction_count
  const payload = await safeFetchFromApi<PaginatedPayload<City>>(
    `/cities?limit=${config.pagination.citiesFetchLimit}`, 
    { items: [] },
    { timeout: 10000, revalidate: config.revalidateSeconds }
  );
  const allCities = extractItems(payload);

  // Return empty array if no cities found
  if (allCities.length === 0) {
    return [];
  }

  const topCities = allCities
    .slice()
    .sort((a, b) => (b.attraction_count ?? 0) - (a.attraction_count ?? 0))
    .slice(0, 10);

  return topCities.map((city, index) => ({
    ...city,
    heroImage: cityImageForIndex(index),
    description: `${city.name}`,
    rating: city.rating ?? null,
    lat: city.latitude ?? city.lat ?? null,
    lng: city.longitude ?? city.lng ?? null,
  }));
}

async function getTrendingAttractions(): Promise<AttractionSummary[]> {
  const limit = config.pagination.attractionsFetchLimit;
  const payload = await safeFetchFromApi<PaginatedPayload<AttractionSummary>>(
    `/attractions?limit=${limit}`,
    { items: [] },
    { timeout: 10000, revalidate: config.revalidateSeconds }
  );
  const attractions = extractItems(payload).slice(0, 12); // Show only 12 attraction cards on homepage
  return attractions;
}

function buildDestinations(cities: FeaturedCity[]): DestinationMarker[] {
  return cities.map((city) => ({
    name: city.name,
    region: city.country,
    country: city.country,
    lat: city.latitude ?? city.lat ?? undefined,
    lng: city.longitude ?? city.lng ?? undefined,
    slug: city.slug,
    attractionCount: city.attraction_count,
  }));
}

export const metadata: Metadata = seoManager.generateHomepageMetadata();

export default async function HomePage() {
  const [featuredCities, trendingAttractions] = await Promise.all([
    getFeaturedCities(),
    getTrendingAttractions(),
  ]);

  const destinations = buildDestinations(featuredCities);

  return (
    <>
      <main className="bg-white text-gray-900">
        <HomePageClient
          heroContent={homeContent.hero}
          featuredCities={featuredCities}
          trendingAttractions={trendingAttractions}
          destinations={destinations}
        />
      </main>
      <OrganizationStructuredData />
      <WebsiteStructuredData />
    </>
  );
}