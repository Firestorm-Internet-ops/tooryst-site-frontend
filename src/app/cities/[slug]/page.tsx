import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CityPageClient } from './CityPageClient';
import { CityDetail } from '@/types/api';
import { config } from '@/lib/config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CityPageProps {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

const API_BASE_URL = config.apiBaseUrl;
const APP_BASE_URL = config.appUrl;

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
  const resolvedParams = params && typeof params === 'object' && 'then' in params ? await params : params;
  const slug = resolvedParams?.slug?.toLowerCase();
  if (!slug) {
    return {
      title: 'City not found | Storyboard',
    };
  }

  const city = await fetchCity(slug);
  if (!city) {
    return {
      title: 'City not found | Storyboard',
      description: 'Explore verified travel intelligence on Storyboard.',
    };
  }

  const title = `${city.name} | Storyboard Travel Guide`;
  const description = `Discover ${city.attraction_count ?? 'the best'} attractions, maps, and live travel intel for ${city.name}.`;
  const canonical = `${APP_BASE_URL}/cities/${slug}`;
  const imageUrl = config.images.fallbackCity;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${city.name} skyline`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function CityPage({ params, searchParams }: CityPageProps) {
  // Handle Next.js 15+ where params might be a promise
  const resolvedParams = params && typeof params === 'object' && 'then' in params ? await params : params;
  const slug = resolvedParams?.slug?.toLowerCase();
  
  if (!slug) {
    notFound();
  }
  
  // Pre-fetch the city to check if it exists
  const city = await fetchCity(slug);
  if (!city) {
    notFound();
  }
  
  const resolvedSearchParams = searchParams && typeof searchParams === 'object' && 'then' in searchParams 
    ? await searchParams 
    : searchParams;
  const pageParam = resolvedSearchParams?.page;
  const initialPage =
    typeof pageParam === 'string' ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;
  return <CityPageClient slug={slug} initialPage={initialPage} />;
}

