import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CountryPageClient } from './CountryPageClient';
import { CountryOverview } from '@/types/api';
import { config } from '@/lib/config';

interface CountryPageProps {
  params: { country: string };
}

const API_BASE_URL = config.apiBaseUrl;
const APP_BASE_URL = config.appUrl;

async function fetchCountry(country: string): Promise<CountryOverview | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/destinations/${country}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(
  { params }: CountryPageProps
): Promise<Metadata> {
  const countryParam = params.country?.toLowerCase();
  if (!countryParam) {
    return {
      title: 'Destination not found | Storyboard',
    };
  }

  const country = await fetchCountry(countryParam);
  if (!country) {
    return {
      title: 'Destination not found | Storyboard',
      description: 'Explore verified travel intelligence on Storyboard.',
    };
  }

  const title = `${country.name} Travel Guide | Storyboard`;
  const description = `Explore ${country.citiesCount ?? 'the top'} cities and ${country.attractionsCount ?? 'countless'} attractions across ${country.name}.`;
  const canonical = `${APP_BASE_URL}/destinations/${countryParam}`;
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
          alt: `${country.name} landscape`,
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

export default function CountryPage({ params }: CountryPageProps) {
  const countryParam = params.country?.toLowerCase();
  if (!countryParam) {
    notFound();
  }
  return <CountryPageClient countryCode={countryParam} />;
}

