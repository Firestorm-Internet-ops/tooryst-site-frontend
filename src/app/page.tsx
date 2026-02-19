import type { Metadata } from 'next';

import { HeroSection } from '@/components/sections/HeroSection';
import { TrendingAttractionsSection, FeaturedCitiesSection, GlobeSection } from '@/components/home/HomeSections';
import { getFeaturedCities, getTrendingAttractions } from '@/lib/home-data';
import homeContent from '@/content/home.json';
import { seoManager } from '@/lib/seo-manager';
import { OrganizationStructuredData, WebsiteStructuredData } from '@/components/seo/StructuredData';
import { ComponentErrorBoundary } from '@/components/error-boundaries/ErrorBoundary';

export const metadata: Metadata = seoManager.generateHomepageMetadata();

export default async function HomePage() {
  // Await both fetches so Googlebot receives real content in the initial HTML
  const [featuredCities, trendingAttractions] = await Promise.all([
    getFeaturedCities(),
    getTrendingAttractions(),
  ]);

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

        <TrendingAttractionsSection promise={Promise.resolve(trendingAttractions)} />
        <FeaturedCitiesSection promise={Promise.resolve(featuredCities)} />
        <GlobeSection promise={Promise.resolve(featuredCities)} />
      </main>
      <OrganizationStructuredData />
      <WebsiteStructuredData />
    </>
  );
}