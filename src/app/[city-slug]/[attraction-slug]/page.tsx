import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { config } from '@/lib/config';
import { AttractionPageResponse } from '@/types/attraction-page';
import { AttractionPageClient } from '@/components/attractions/AttractionPageClient';
import { transformAttractionData } from '@/lib/attraction-transformer';
import { seoManager } from '@/lib/seo-manager';
import { AttractionStructuredData } from '@/components/seo/StructuredData';
import { cityNameToSlug } from '@/lib/slug-utils';

async function getAttraction(slug: string): Promise<AttractionPageResponse> {
  try {
    const res = await fetch(`${config.apiBaseUrl}/attractions/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) {
        notFound();
      }
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`Failed to load attraction page: ${res.status} ${res.statusText}. ${errorText}`);
    }

    const data = await res.json();
    return transformAttractionData(data);
  } catch (error) {
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { 'city-slug': citySlug, 'attraction-slug': attractionSlug } = await params;

  try {
    const pageData = await getAttraction(attractionSlug);

    // Check if pageData exists and has required properties
    if (!pageData || !pageData.name) {
      console.error('Invalid attraction data:', pageData);
      return {
        title: 'Attraction not found | Tooryst',
        description: 'Explore verified travel intelligence on Tooryst.',
      };
    }

    // Validate that the city-slug in the URL matches the attraction's actual city
    const expectedCitySlug = pageData.city ? cityNameToSlug(pageData.city) : null;
    if (!expectedCitySlug || citySlug !== expectedCitySlug) {
      return {
        title: 'Attraction not found | Tooryst',
        description: 'Explore verified travel intelligence on Tooryst.',
      };
    }

    // Debug: Log the hero image URL
    const heroImageUrl = pageData.cards?.hero_images?.images?.[0]?.url;

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
  } catch (error) {
    console.error('Error generating attraction metadata:', error);
    return {
      title: 'Attraction not found | Tooryst',
      description: 'Explore verified travel intelligence on Tooryst.',
    };
  }
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
  const pageData = await getAttraction(attractionSlug);

  // Check if pageData exists
  if (!pageData || !pageData.name) {
    notFound();
  }

  // Validate that the city-slug in the URL matches the attraction's actual city
  // This ensures URLs like /attractions/some-attraction return 404
  const expectedCitySlug = pageData.city ? cityNameToSlug(pageData.city) : null;
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
    </>
  );
}