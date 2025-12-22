import type { Metadata } from 'next';

import { HomePageClient, FeaturedCity } from './HomePageClient';
import homeContent from '@/content/home.json';
import type { AttractionSummary, City } from '@/types/api';
import { config } from '@/lib/config';
import { seoManager } from '@/lib/seo-manager';
import { OrganizationStructuredData, WebsiteStructuredData } from '@/components/seo/StructuredData';

const API_BASE_URL = config.apiBaseUrl;
const APP_URL = config.appUrl;
const REVALIDATE_SECONDS = config.revalidateSeconds;

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

function extractItems<T>(payload: PaginatedPayload<T> | T[]): T[] {
  if (Array.isArray(payload)) return payload;
  if ('items' in payload && Array.isArray(payload.items)) return payload.items;
  if ('data' in payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

async function fetchFromApi<T>(path: string, fallback: T): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);
    
    try {
      const response = await fetch(url, {
        next: { revalidate: REVALIDATE_SECONDS },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        return fallback;
      }
      const data = await response.json();
      return data as T;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch {
    return fallback;
  }
}

function cityImageForIndex(index: number): string {
  return `${config.images.fallbackCity}&sat=${index}`;
}

async function getFeaturedCities(): Promise<FeaturedCity[]> {
  // Fetch a larger pool of cities, then pick the top 10 by attraction_count
  const payload = await fetchFromApi<PaginatedPayload<City>>(`/cities?limit=${config.pagination.citiesFetchLimit}`, { items: [] });
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
  const payload = await fetchFromApi<PaginatedPayload<AttractionSummary>>(
    `/attractions?limit=${limit}`,
    { items: [] }
  );
  const attractions = extractItems(payload).slice(0, limit);
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