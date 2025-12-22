import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { config } from '@/lib/config';
import { AttractionPageResponse } from '@/types/attraction-page';
import { AttractionPageClient } from '@/components/attractions/AttractionPageClient';
import { transformAttractionData } from '@/lib/attraction-transformer';

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
    console.log('API Response:', data);
    return transformAttractionData(data);
  } catch (error) {
    throw error;
  }
}


export const metadata: Metadata = {
  title: 'Attraction Storyboard',
  description: 'Best time to visit, weather, reviews and tips.',
};

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
