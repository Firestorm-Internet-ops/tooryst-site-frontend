import { permanentRedirect, notFound } from 'next/navigation';
import { config } from '@/lib/config';
import { cityNameToSlug } from '@/lib/slug-utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getAttractionCity(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`${config.apiBaseUrl}/attractions/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.city || null;
  } catch {
    return null;
  }
}

export default async function AttractionRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  const city = await getAttractionCity(slug);

  if (!city) {
    notFound();
  }

  const citySlug = cityNameToSlug(city);

  // 301 permanent redirect to the new URL structure
  permanentRedirect(`/${citySlug}/${slug}`);
}
