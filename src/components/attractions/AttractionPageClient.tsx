'use client';

import dynamic from 'next/dynamic';
import { AttractionPageResponse } from '@/types/attraction-page';
import { StoryboardCardsGrid } from '@/components/attractions/storyboard/StoryboardCardsGrid';
import { SectionsNavbar } from '@/components/attractions/sections/SectionsNavbar';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { GetYourGuideScript } from '@/components/attractions/GetYourGuideScript';

// Dynamically import Three.js components to avoid SSR issues
const TicketAnimation = dynamic(() => import('./TicketAnimation').then(mod => ({ default: mod.TicketAnimation })), {
  ssr: false,
  loading: () => null,
});

const TicketAnimationEmerald = dynamic(() => import('./TicketAnimationEmerald').then(mod => ({ default: mod.TicketAnimationEmerald })), {
  ssr: false,
  loading: () => null,
});

// Dynamically import sections for code splitting
const BestTimesSection = dynamic(() => import('@/components/attractions/sections/BestTimesSection').then(mod => ({ default: mod.BestTimesSection })), {
  loading: () => <SkeletonLoader height="h-64" />
});

const AttractionReviewsSection = dynamic(() => import('@/components/attractions/sections/ReviewsSection').then(mod => ({ default: mod.AttractionReviewsSection })), {
  loading: () => <SkeletonLoader height="h-96" showAvatar />
});

const VisitorInfoSection = dynamic(() => import('@/components/attractions/sections/VisitorInfoSection').then(mod => ({ default: mod.VisitorInfoSection })), {
  loading: () => <SkeletonLoader height="h-48" />
});

const AttractionTipsSection = dynamic(() => import('@/components/attractions/sections/TipsSection').then(mod => ({ default: mod.AttractionTipsSection })), {
  loading: () => <SkeletonLoader height="h-64" />
});

const AttractionMapSection = dynamic(() => import('@/components/attractions/sections/MapSection').then(mod => ({ default: mod.AttractionMapSection })), {
  loading: () => <SkeletonLoader height="h-80" />
});

const SocialVideoSection = dynamic(() => import('@/components/attractions/sections/SocialVideoSection').then(mod => ({ default: mod.SocialVideoSection })), {
  loading: () => <SkeletonLoader height="h-96" />
});

const NearbyAttractionsSection = dynamic(() => import('@/components/attractions/sections/NearbyAttractionsSection').then(mod => ({ default: mod.NearbyAttractionsSection })), {
  loading: () => <SkeletonLoader height="h-72" />
});

const AudienceProfilesSection = dynamic(() => import('@/components/attractions/sections/AudienceProfilesSection').then(mod => ({ default: mod.AudienceProfilesSection })), {
  loading: () => <SkeletonLoader height="h-56" />
});

interface AttractionPageClientProps {
  pageData: AttractionPageResponse;
}

export function AttractionPageClient({ pageData }: AttractionPageClientProps) {
  // Build section IDs array based on available data to match actual page order
  const sectionIds = [
    pageData.best_time && Array.isArray(pageData.best_time) && pageData.best_time.length > 0 ? 'best-times' : null,
    pageData.cards?.review ? 'reviews' : null,
    pageData.visitor_info ? 'visitor-info' : null,
    pageData.cards?.tips && (pageData.cards.tips.safety?.length > 0 || pageData.cards.tips.insider?.length > 0) ? 'tips' : null,
    pageData.cards?.map ? 'map' : null,
    pageData.nearby_attractions && Array.isArray(pageData.nearby_attractions) && pageData.nearby_attractions.length > 0 ? 'nearby-attractions' : null,
    pageData.social_videos && Array.isArray(pageData.social_videos) && pageData.social_videos.length > 0 ? 'social-videos' : null,
    pageData.audience_profiles && Array.isArray(pageData.audience_profiles) && pageData.audience_profiles.length > 0 ? 'audience-profiles' : null,
  ].filter(Boolean) as string[];

  const { activeSection, scrollToSection } = useScrollSpy(sectionIds);

  return (
    <main className="bg-white text-gray-900 min-h-screen">
      {/* Load GetYourGuide script */}
      <GetYourGuideScript />

      {/* Storyboard Cards Grid */}
      <section id="storyboard-grid" aria-labelledby="storyboard-heading">
        <h2 id="storyboard-heading" className="sr-only">Attraction Overview</h2>
        <StoryboardCardsGrid data={pageData} />
      </section>

      {/* GetYourGuide Widget - in the gap between cards and navbar */}
      <div className="w-full px-4 lg:px-6 py-8 md:py-12">
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700 transition-all hover:shadow-xl hover:border-blue-200 shadow-sm relative overflow-hidden min-h-96">
          {/* Three.js Background Animation - Commented out for now */}
          {/* <div className="absolute inset-0 rounded-3xl opacity-40">
            <TicketAnimation />
          </div> */}
          
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100/20 rounded-full -mr-48 -mt-48 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-50/30 rounded-full -ml-36 -mb-36 pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="h-1.5 w-10 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-full shadow-md"></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    Plan Your Visit
                  </h2>
                </div>
              </div>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed ml-0">
                Secure your tickets in advance and plan your perfect day at {pageData.name}
              </p>
            </div>
            <div className="animate-in fade-in duration-1000 delay-200 [&_.gyg-card]:transition-all [&_.gyg-card]:duration-300 [&_.gyg-card:hover]:shadow-lg [&_.gyg-card:hover]:scale-105" data-gyg-widget="auto" data-gyg-partner-id="9BAL9K3" data-gyg-cmp={`story-${pageData.slug}-auto1`}></div>
          </div>
        </div>
      </div>

      {/* Sections Navbar - appears between grid and sections */}
      <nav aria-label="Section navigation">
        <SectionsNavbar data={pageData} activeSection={activeSection} onScrollToSection={scrollToSection} />
      </nav>

      {/* Sections */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-12 md:space-y-16">
          {/* Best Times */}
          {pageData.best_time && Array.isArray(pageData.best_time) && pageData.best_time.length > 0 && (
            <ErrorBoundary>
              <BestTimesSection data={pageData} />
            </ErrorBoundary>
          )}

          {/* Reviews */}
          {pageData.cards?.review && (
            <ErrorBoundary>
              <AttractionReviewsSection data={pageData} />
            </ErrorBoundary>
          )}

          {/* Visitor Info */}
          {pageData.visitor_info && (
            <ErrorBoundary>
              <VisitorInfoSection data={pageData} />
            </ErrorBoundary>
          )}

          {/* Tips */}
          {pageData.cards?.tips && (pageData.cards.tips.safety?.length > 0 || pageData.cards.tips.insider?.length > 0) && (
            <ErrorBoundary>
              <AttractionTipsSection data={pageData} />
            </ErrorBoundary>
          )}

          {/* GetYourGuide Widget - Experiences & Tours */}
          <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white p-8 md:p-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 transition-all hover:shadow-xl hover:border-emerald-200 shadow-sm relative overflow-hidden min-h-96">
            {/* Three.js Background Animation - Commented out for now */}
            {/* <div className="absolute inset-0 rounded-3xl opacity-40">
              <TicketAnimationEmerald />
            </div> */}
            
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/20 rounded-full -mr-48 -mt-48 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-50/30 rounded-full -ml-36 -mb-36 pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="h-1.5 w-10 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 rounded-full shadow-md"></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <svg className="w-6 h-6 text-emerald-600 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                      Explore Tours & Experiences
                    </h2>
                  </div>
                </div>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed ml-0">
                  Discover guided tours, skip-the-line tickets, and exclusive experiences curated for {pageData.name}
                </p>
              </div>
              <div className="animate-in fade-in duration-1000 delay-300 [&_.gyg-card]:transition-all [&_.gyg-card]:duration-300 [&_.gyg-card:hover]:shadow-lg [&_.gyg-card:hover]:scale-105" data-gyg-widget="auto" data-gyg-partner-id="9BAL9K3" data-gyg-cmp={`story-${pageData.slug}-auto2`}></div>
            </div>
          </div>

          {/* Map & Directions */}
          {pageData.cards?.map && (
            <ErrorBoundary>
              <AttractionMapSection data={pageData} />
            </ErrorBoundary>
          )}

          {/* Social Videos */}
          {pageData.social_videos && Array.isArray(pageData.social_videos) && pageData.social_videos.length > 0 && (
            <ErrorBoundary>
              <SocialVideoSection data={pageData} />
            </ErrorBoundary>
          )}

          {/* Nearby Attractions - Full Width */}
          {pageData.nearby_attractions && Array.isArray(pageData.nearby_attractions) && pageData.nearby_attractions.length > 0 && (
            <ErrorBoundary>
              <NearbyAttractionsSection data={pageData} />
            </ErrorBoundary>
          )}

          {/* Audience Profiles */}
          {pageData.audience_profiles && Array.isArray(pageData.audience_profiles) && pageData.audience_profiles.length > 0 && (
            <ErrorBoundary>
              <AudienceProfilesSection data={pageData} />
            </ErrorBoundary>
          )}
        </div>
      </div>
    </main>
  );
}

