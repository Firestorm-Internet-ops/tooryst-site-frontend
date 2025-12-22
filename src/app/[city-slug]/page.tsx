import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CityPageClient } from './CityPageClient';
import { CityDetail } from '@/types/api';
import { config } from '@/lib/config';
import { seoManager } from '@/lib/seo-manager';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CityPageProps {
  params: { 'city-slug': string };
  searchParams?: Record<string, string | string[] | undefined>;
}

const API_BASE_URL = config.apiBaseUrl;

async function fetchCity(slug: string): Promise<CityDetail | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/cities/${slug}`, {
      cache: 'no-store', // Always fetch fresh data
    });
    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      console.error(`Failed to fetch city ${slug}: ${res.status} ${res.statusText}`);
      return null;
    }
    return res.json();
  } catch (error) {
    console.error(`Error fetching city ${slug}:`, error);
    return null;
  }
}

export async function generateMetadata(
  { params }: CityPageProps
): Promise<Metadata> {
  // Handle Next.js 15+ where params might be a promise
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.['city-slug']?.toLowerCase();
  if (!slug) {
    return {
      title: 'City not found | Tooryst',
    };
  }

  const city = await fetchCity(slug);
  if (!city) {
    return {
      title: 'City not found | Tooryst',
      description: 'Explore verified travel intelligence on Tooryst.',
    };
  }

  // Use the new SEO manager to generate metadata
  return await seoManager.generateCityMetadata({
    name: city.name,
    slug: city.slug,
    attraction_count: city.attraction_count,
    description: undefined, // CityDetail doesn't have description
    latitude: city.latitude || city.lat || undefined,
    longitude: city.longitude || city.lng || undefined,
    country: city.country,
    hero_image: undefined, // CityDetail doesn't have hero_image, will use collage
  });
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  // Handle Next.js 15+ where params might be a promise
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.['city-slug']?.toLowerCase();
  
  if (!slug) {
    notFound();
  }
  
  // Pre-fetch the city to check if it exists
  const city = await fetchCity(slug);
  if (!city) {
    notFound();
  }
  
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const pageParam = resolvedSearchParams?.page;
  const initialPage =
    typeof pageParam === 'string' ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  return <CityPageClient slug={slug} initialPage={initialPage} />;
}