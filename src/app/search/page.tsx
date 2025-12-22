import type { Metadata } from 'next';

import { SearchPageClient, SearchFilter } from '@/app/search/SearchPageClient';
import type { SearchResults, City, AttractionSummary, PaginatedResponse } from '@/types/api';
import { config } from '@/lib/config';

const API_BASE_URL = config.apiBaseUrl;
const REVALIDATE_SECONDS = config.revalidateSeconds;

const EMPTY_RESULTS: SearchResults = {
  cities: [],
  attractions: [],
  stories: [],
};

async function fetchAllCities(): Promise<City[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/cities`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }
    const payload = (await response.json()) as PaginatedResponse<City> | City[];
    if (Array.isArray(payload)) {
      return payload;
    }
    return payload.items || [];
  } catch {
    return [];
  }
}

async function fetchAllAttractions(): Promise<AttractionSummary[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/attractions`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch attractions');
    }
    const payload = (await response.json()) as PaginatedResponse<AttractionSummary> | AttractionSummary[];
    if (Array.isArray(payload)) {
      return payload;
    }
    return payload.items || [];
  } catch {
    return [];
  }
}

async function fetchSearchResults(query: string): Promise<SearchResults> {
  if (!query.trim()) {
    // When no query, return all cities and attractions
    const [cities, attractions] = await Promise.all([
      fetchAllCities(),
      fetchAllAttractions(),
    ]);
    return {
      cities,
      attractions,
      stories: [],
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query.trim())}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      throw new Error('Search request failed');
    }
    const payload = (await response.json()) as Partial<SearchResults>;
    return {
      cities: Array.isArray(payload.cities) ? payload.cities : [],
      attractions: Array.isArray(payload.attractions) ? payload.attractions : [],
      stories: Array.isArray(payload.stories) ? payload.stories : [],
    };
  } catch {
    return EMPTY_RESULTS;
  }
}

interface SearchPageProps {
  searchParams?: Promise<{
    q?: string;
    filter?: string;
    page?: string;
  }>;
}

const sanitizeFilter = (filter?: string): SearchFilter => {
  if (filter === 'cities' || filter === 'attractions') {
    return filter;
  }
  return 'attractions';
};

const sanitizePage = (value?: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
};

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params?.q?.trim();

  if (!query) {
    return {
      title: 'Search | Storyboard',
      description: 'Search cities and attractions on Storyboard.',
      robots: { index: false, follow: true },
    };
  }

  const results = await fetchSearchResults(query);
  const total =
    results.cities.length + results.attractions.length;

  return {
    title: `Search results for "${query}" | Storyboard`,
    description:
      total > 0
        ? `Found ${total} results matching “${query}”.`
        : `No destinations matched “${query}”.`,
    robots: { index: false, follow: true },
    openGraph: {
      title: `Search results for "${query}" | Storyboard`,
      description:
        total > 0
          ? `Explore ${total} destinations matching “${query}”.`
          : `No destinations matched “${query}”.`,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params?.q?.trim() ?? '';
  const initialFilter = sanitizeFilter(params?.filter);
  const initialPage = sanitizePage(params?.page);

  // Always fetch all cities and attractions on page load
  const initialResults = await fetchSearchResults(query);

  return (
    <main className="bg-gray-50 px-4 py-10 text-gray-900 md:px-8">
      <div id="search">
        <SearchPageClient
          initialQuery={query}
          initialFilter={initialFilter}
          initialPage={initialPage}
          initialResults={initialResults}
        />
      </div>
    </main>
  );
}

