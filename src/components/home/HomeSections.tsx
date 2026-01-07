
import Link from 'next/link';
import { AttractionsGrid } from '@/components/sections/AttractionsGrid';
import { config } from '@/lib/config';
import { ComponentErrorBoundary, AsyncErrorBoundary } from '@/components/error-boundaries/ErrorBoundary';
import { GlobeWrapper } from './GlobeWrapper';
import type { AttractionSummary } from '@/types/api';
import type { FeaturedCity } from '@/lib/home-data';

export async function TrendingAttractionsSection({
    promise,
}: {
    promise: Promise<AttractionSummary[]>;
}) {
    const trendingAttractions = await promise;

    return (
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 md:px-6">
            <div className="flex flex-col gap-2">
                <p className="text-xs uppercase tracking-[0.4em] text-primary-600">{config.text.trending.eyebrow}</p>
                <h2 className="text-2xl font-display font-semibold md:text-3xl text-gray-900">{config.text.trending.heading}</h2>
                <p className="text-sm text-gray-600">{config.text.trending.subheading}</p>
            </div>
            {trendingAttractions.length > 0 ? (
                <ComponentErrorBoundary context={{ component: 'attractions-grid' }}>
                    <AttractionsGrid attractions={trendingAttractions} />
                </ComponentErrorBoundary>
            ) : (
                <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm">
                    {config.text.trending.empty}
                </div>
            )}
        </section>
    );
}

export async function FeaturedCitiesSection({
    promise,
}: {
    promise: Promise<FeaturedCity[]>;
}) {
    const allCities = await promise;
    const featuredCities = allCities.slice(0, 10);

    return (
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
    );
}

export async function GlobeSection({
    promise,
}: {
    promise: Promise<FeaturedCity[]>;
}) {
    const cities = await promise;

    const globeCities = cities
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

    if (globeCities.length === 0) {
        return null;
    }

    return (
        <section className="mx-auto w-full max-w-6xl flex flex-col gap-6 px-4 md:px-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-primary-600">{config.text.globe.eyebrow}</p>
                    <h2 className="text-2xl font-display font-semibold text-gray-900 md:text-3xl">{config.text.globe.heading}</h2>
                </div>
            </div>
            <AsyncErrorBoundary context={{ component: 'globe-3d' }}>
                <GlobeWrapper cities={globeCities} />
            </AsyncErrorBoundary>
        </section>
    );
}
