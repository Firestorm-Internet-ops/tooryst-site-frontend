import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { config } from '@/lib/config';
import { AttractionPageResponse } from '@/types/attraction-page';
import { AttractionPageClient } from '@/components/attractions/AttractionPageClient';
import { transformAttractionData } from '@/lib/attraction-transformer';
import { seoManager } from '@/lib/seo-manager';
import { AttractionStructuredData } from '@/components/seo/StructuredData';
import { BreadcrumbStructuredData } from '@/components/seo/FAQStructuredData';
import { cityNameToSlug } from '@/lib/slug-utils';

async function getAttraction(slug: string): Promise<AttractionPageResponse | null> {
  const res = await fetch(`${config.apiBaseUrl}/attractions/${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`Failed to load attraction page: ${res.status} ${res.statusText}. ${errorText}`);
  }

  const data = await res.json();
  return transformAttractionData(data);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { 'city-slug': citySlug, 'attraction-slug': attractionSlug } = await params;

  // Handle "null" literal in URL (Issue 6)
  if (attractionSlug === 'null') {
    notFound();
  }

  // Fetch attraction data - errors (500, network) are caught, 404 returns null
  let pageData: AttractionPageResponse | null = null;
  try {
    pageData = await getAttraction(attractionSlug);
  } catch (error) {
    // Backend returned a non-404 error (500, timeout, etc.)
    // Return noindex metadata — the page component will also fail and show error.tsx
    console.error('Error fetching attraction for metadata:', error);
    return {
      title: 'Attraction not found | Tooryst',
      description: 'Explore verified travel intelligence on Tooryst.',
      robots: { index: false, follow: false },
    };
  }

  // Attraction not found — call notFound() OUTSIDE try-catch so it propagates to Next.js
  if (!pageData || !pageData.name) {
    notFound();
  }

  // Validate that the city-slug in the URL matches the attraction's actual city
  // Prefer city_slug from backend (exact DB value) over regenerating from city name
  const expectedCitySlug = pageData.city_slug || (pageData.city ? cityNameToSlug(pageData.city) : null);
  if (!expectedCitySlug || citySlug !== expectedCitySlug) {
    notFound();
  }

  // Use the SEO manager to generate metadata
  return await seoManager.generateAttractionMetadata({
    name: pageData.name,
    slug: attractionSlug,
    city_name: pageData.city || 'Unknown City',
    city_slug: citySlug,
    description: pageData.cards?.about?.short_description || pageData.cards?.about?.long_description || `Discover ${pageData.name} with real-time crowd data and travel insights.`,
    latitude: pageData.cards?.map?.latitude,
    longitude: pageData.cards?.map?.longitude,
    country: pageData.country,
    hero_image: pageData.cards?.hero_images?.images?.[0]?.url,
    rating: pageData.cards?.review?.overall_rating ?? undefined,
    review_count: pageData.cards?.review?.review_count ?? undefined,
    opening_hours: pageData.cards?.best_time?.today_opening_hours_local ?? undefined,
  });
}

// Remove the static metadata
// export const metadata: Metadata = {
//   title: 'Tooryst',
//   description: 'Best time to visit, weather, reviews and tips.',
// };

interface PageProps {
  params: Promise<{ 'city-slug': string; 'attraction-slug': string }>;
}

export default async function AttractionPage({ params }: PageProps) {
  const { 'city-slug': citySlug, 'attraction-slug': attractionSlug } = await params;

  // Handle "null" literal in URL (Issue 6)
  if (attractionSlug === 'null') {
    notFound();
  }
  const pageData = await getAttraction(attractionSlug);

  // Return 404 for missing attractions or invalid data
  if (!pageData || !pageData.name) {
    notFound();
  }

  // Validate that the city-slug in the URL matches the attraction's actual city
  // Prefer city_slug from backend (exact DB value) over regenerating from city name
  const expectedCitySlug = pageData.city_slug || (pageData.city ? cityNameToSlug(pageData.city) : null);
  if (!expectedCitySlug || citySlug !== expectedCitySlug) {
    notFound();
  }

  return (
    <>
      <AttractionPageClient pageData={pageData} />
      <AttractionStructuredData
        attractionName={pageData.name}
        attractionDescription={pageData.cards?.about?.short_description || pageData.cards?.about?.long_description || `Discover ${pageData.name}`}
        attractionImage={pageData.cards?.hero_images?.images?.[0]?.url}
        attractionLatitude={pageData.cards?.map?.latitude}
        attractionLongitude={pageData.cards?.map?.longitude}
        cityName={pageData.city || 'Unknown City'}
        countryName={pageData.country}
        openingHours={pageData.visitor_info?.opening_hours ?? undefined}
        rating={pageData.cards?.review?.overall_rating ?? undefined}
        reviewCount={pageData.cards?.review?.review_count ?? undefined}
      />
      <BreadcrumbStructuredData
        items={[
          { name: 'Home', url: config.appUrl },
          { name: pageData.city || citySlug, url: `${config.appUrl}/${citySlug}` },
          { name: pageData.name, url: `${config.appUrl}/${citySlug}/${attractionSlug}` },
        ]}
      />
    </>
  );
}