
import { config } from '@/lib/config';
import { safeFetchFromApi, extractItems } from '@/lib/api-utils';
import type { AttractionSummary, City } from '@/types/api';

export interface FeaturedCity extends City {
    heroImage: string;
    description?: string;
    rating?: number | null;
    lat?: number | null;
    lng?: number | null;
    latitude?: number | null;
    longitude?: number | null;
}

export type PaginatedPayload<T> = {
    items?: T[];
    data?: T[];
};

function cityImageForIndex(index: number): string {
    return `${config.images.fallbackCity}&sat=${index}`;
}

export async function getFeaturedCities(): Promise<FeaturedCity[]> {
    // Fetch a larger pool of cities, then pick the top 10 by attraction_count
    const payload = await safeFetchFromApi<PaginatedPayload<City>>(
        `/cities?limit=${config.pagination.citiesFetchLimit}`,
        { items: [] },
        { timeout: 10000, revalidate: config.revalidateSeconds }
    );
    const allCities = extractItems<City>(payload);

    // Return empty array if no cities found
    if (allCities.length === 0) {
        return [];
    }

    const sortedCities = allCities
        .slice()
        .sort((a, b) => (b.attraction_count ?? 0) - (a.attraction_count ?? 0));

    return sortedCities.map((city, index) => ({
        ...city,
        heroImage: cityImageForIndex(index),
        description: `${city.name}`,
        rating: city.rating ?? null,
        lat: city.latitude ?? city.lat ?? null,
        lng: city.longitude ?? city.lng ?? null,
    }));
}

export async function getTrendingAttractions(): Promise<AttractionSummary[]> {
    const limit = config.pagination.attractionsFetchLimit;
    const payload = await safeFetchFromApi<PaginatedPayload<AttractionSummary>>(
        `/attractions?limit=${limit}`,
        { items: [] },
        { timeout: 10000, revalidate: config.revalidateSeconds }
    );
    const attractions = extractItems<AttractionSummary>(payload).slice(0, 12); // Show only 12 attraction cards on homepage
    return attractions;
}
