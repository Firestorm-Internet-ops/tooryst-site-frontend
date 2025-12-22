import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, MapPinned } from 'lucide-react';
import type { City, PaginatedResponse } from '@/types/api';
import { config } from '@/lib/config';
import citiesData from '@/data/cities.json';

const API_BASE_URL = config.apiBaseUrl;
const APP_URL = config.appUrl;
const REVALIDATE_SECONDS = config.revalidateSeconds;

async function fetchCities(): Promise<City[]> {
  const url = `${API_BASE_URL}/cities?limit=${config.pagination.citiesFetchLimit}`;
  
  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    
    if (!response.ok) {
      console.error(`[Cities] API returned ${response.status}: ${response.statusText} for ${url}`);
      return [];
    }
    
    const payload = (await response.json()) as PaginatedResponse<City> | City[];
    if (Array.isArray(payload)) {
      return payload;
    }
    return payload.items || [];
  } catch (error) {
    // Log error for debugging
    if (error instanceof Error) {
      console.error(`[Cities] Fetch error for ${url}:`, error.message);
      console.error(`[Cities] Error details:`, error);
    } else {
      console.error(`[Cities] Unknown fetch error:`, error);
    }
    return [];
  }
}

export const metadata: Metadata = {
  title: 'Explore Cities | Storyboard',
  description: 'Discover travel intelligence for cities worldwide. Find crowd levels, weather insights, and visitor sentiment.',
  keywords: ['cities', 'destinations', 'travel', 'crowd levels', 'weather'],
  openGraph: {
    title: 'Explore Cities | Storyboard',
    description: 'Discover travel intelligence for cities worldwide.',
    url: `${APP_URL}/cities`,
    siteName: 'Storyboard',
    type: 'website',
  },
};

export default async function CitiesPage() {
  const cities = await fetchCities();

  return (
    <main className="bg-gradient-to-b from-white via-slate-50 to-white text-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-b from-blue-50 via-white to-blue-100 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <MapPinned className="w-12 h-12 text-primary-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-gray-900">
              {citiesData.hero.title}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {citiesData.hero.description} {cities.length}+ cities worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Cities Grid */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        {cities.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-gray-900">{citiesData.emptyState.title}</h2>
            <p className="text-gray-600">{citiesData.emptyState.message}</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-gray-600 text-sm">
                Showing {cities.length} cities
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/${city.slug}`}
                  className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:border-primary-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-primary-50 to-blue-50 transition-opacity duration-300" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {city.name}
                        </h3>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-50 text-primary-600 group-hover:bg-primary-100 transition-colors">
                          <MapPin className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-400/80" />
                        <span>
                          {city.attraction_count} {city.attraction_count === 1 ? 'attraction' : 'attractions'}
                        </span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-100 flex items-center gap-2 text-sm font-medium text-primary-600 group-hover:text-primary-500 transition-colors">
                      <span>Explore</span>
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Info Section */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-20">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 md:p-12 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-display font-semibold mb-4 text-gray-900">
            {citiesData.infoSection.title}
          </h2>
          <p className="text-gray-600 mb-6">
            {citiesData.infoSection.description}
          </p>
          <ul className="grid md:grid-cols-2 gap-4">
            {citiesData.infoSection.features.map((feature, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-primary-500 flex-shrink-0">•</span>
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
