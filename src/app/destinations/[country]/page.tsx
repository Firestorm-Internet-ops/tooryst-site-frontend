import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CountryPageClient } from './CountryPageClient';
import { CountryOverview } from '@/types/api';
import { config } from '@/lib/config';
import { seoManager } from '@/lib/seo-manager';

interface CountryPageProps {
  params: Promise<{ country: string }>;
}

const API_BASE_URL = config.apiBaseUrl;

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
  const resolvedParams = await params;
  const countryParam = resolvedParams.country?.toLowerCase();

  if (!countryParam) {
    return {
      title: 'Destination not found | Tooryst',
    };
  }

  const country = await fetchCountry(countryParam);

  if (!country) {
    return {
      title: 'Destination not found | Tooryst',
      description: 'Explore verified travel intelligence on Tooryst.',
    };
  }

  return seoManager.generateCountryMetadata({
    name: country.name,
    slug: countryParam,
    citiesCount: country.citiesCount,
    attractionsCount: country.attractionsCount,
  });
}

export default async function CountryPage({ params }: CountryPageProps) {
  const resolvedParams = await params;
  const countryParam = resolvedParams.country?.toLowerCase();
  if (!countryParam) {
    notFound();
  }
  return <CountryPageClient countryCode={countryParam} />;
}

