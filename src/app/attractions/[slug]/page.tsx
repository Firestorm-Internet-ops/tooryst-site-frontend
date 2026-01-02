import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { config } from '@/lib/config';
import { AttractionPageResponse } from '@/types/attraction-page';
import { AttractionPageClient } from '@/components/attractions/AttractionPageClient';
import { transformAttractionData } from '@/lib/attraction-transformer';

async function getAttraction(slug: string): Promise<AttractionPageResponse> {
  try {
    // Use force-cache with revalidation for better performance
    // Data will be cached and revalidated every 5 minutes
    const res = await fetch(`${config.apiBaseUrl}/attractions/${slug}`, {
      next: {
        revalidate: 300, // 5 minutes cache
        tags: [`attraction-${slug}`] // Tag for cache invalidation
      },
    });

    if (!res.ok) {
      if (res.status === 404) {
        notFound();
      }
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`Failed to load attraction page: ${res.status} ${res.statusText}. ${errorText}`);
    }

    const data = await res.json();
    console.log('API Response:', data);
    console.log('API Response - best_time field:', data.best_time);
    const transformed = transformAttractionData(data);
    console.log('Transformed data - cards.best_time:', transformed.cards.best_time);
    return transformed;
  } catch (error) {
    throw error;
  }
}


// Generate metadata dynamically based on attraction data
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const pageData = await getAttraction(slug);
    const attractionName = pageData.attraction?.name || 'Attraction';
    const city = pageData.attraction?.city || '';

    return {
      title: `${attractionName} ${city ? `- ${city}` : ''} | Tooryst`,
      description: `Best time to visit ${attractionName}. Get weather insights, crowd updates, reviews and travel tips.`,
      openGraph: {
        title: `${attractionName} ${city ? `- ${city}` : ''}`,
        description: `Discover the best time to visit ${attractionName} with real-time insights.`,
      },
    };
  } catch (error) {
    return {
      title: 'Tooryst',
      description: 'Best time to visit, weather, reviews and tips.',
    };
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AttractionPage({ params }: PageProps) {
  const { slug } = await params;
  const pageData = await getAttraction(slug);

  return (
    <AttractionPageClient pageData={pageData} />
  );
}
