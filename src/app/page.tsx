import { Suspense } from 'react';
import type { Metadata } from 'next';

import { HeroSection } from '@/components/sections/HeroSection';
import { TrendingAttractionsSection, FeaturedCitiesSection, GlobeSection } from '@/components/home/HomeSections';
import { getFeaturedCities, getTrendingAttractions } from '@/lib/home-data';
import homeContent from '@/content/home.json';
import { seoManager } from '@/lib/seo-manager';
import { OrganizationStructuredData, WebsiteStructuredData } from '@/components/seo/StructuredData';
import { ComponentErrorBoundary } from '@/components/error-boundaries/ErrorBoundary';

export const metadata: Metadata = seoManager.generateHomepageMetadata();

function LoadingSection({ height = "h-96" }: { height?: string }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 md:px-6 ${height} animate-pulse bg-gray-50 rounded-3xl border border-gray-100/50`} />
  );
}

export default function HomePage() {
  // Start fetches immediately without awaiting them
  // This allows the initial HTML to be sent immediately while data loads
  const featuredCitiesPromise = getFeaturedCities();
  const trendingAttractionsPromise = getTrendingAttractions();

  return (
    <>
      <main className="bg-gradient-to-b from-white via-slate-50 to-white text-gray-900 flex flex-col gap-12 pb-12">
        <ComponentErrorBoundary context={{ component: 'hero-section' }}>
          <HeroSection
            backgroundImage={homeContent.hero.backgroundImage}
            eyebrow={homeContent.hero.eyebrow}
            heading={homeContent.hero.heading}
            subheading={homeContent.hero.subheading}
            highlights={homeContent.hero.pillars}
            searchPlaceholder={homeContent.hero.inputPlaceholder}
          />
        </ComponentErrorBoundary>

        <Suspense fallback={<LoadingSection height="h-[600px]" />}>
          <TrendingAttractionsSection promise={trendingAttractionsPromise} />
        </Suspense>

        <Suspense fallback={<LoadingSection height="h-48" />}>
          <FeaturedCitiesSection promise={featuredCitiesPromise} />
        </Suspense>

        <Suspense fallback={<LoadingSection height="h-[600px]" />}>
          <GlobeSection promise={featuredCitiesPromise} />
        </Suspense>
      </main>
      <OrganizationStructuredData />
      <WebsiteStructuredData />
    </>
  );
}