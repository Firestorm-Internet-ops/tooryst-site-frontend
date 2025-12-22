import { AttractionPageResponse } from '@/types/attraction-page';
import { HeroImageSlider } from '@/components/attractions/HeroImagesSlider';
import { BestTimeTodayCard } from '@/components/attractions/storyboard/BestTimeTodayCard';
import { WeatherSnapshotCard } from '@/components/attractions/storyboard/WeatherSnapshotCard';
import { RatingSummaryCard } from '@/components/attractions/storyboard/RatingSummaryCard';
import { SafetyTipCard } from '@/components/attractions/storyboard/SafetyTipCard';
import { MapTeaserCard } from '@/components/attractions/storyboard/MapTeaserCard';
import { AboutSnippetCard } from '@/components/attractions/storyboard/AboutSnippetCard';
import { NearbyAttractionCard } from '@/components/attractions/storyboard/NearbyAttractionCard';
import { SocialCard } from '@/components/attractions/storyboard/SocialCard';
import { SocialCardPlaceholder } from '@/components/attractions/storyboard/SocialCardPlaceholder';

interface StoryboardCardsGridProps {
  data: AttractionPageResponse;
}

export function StoryboardCardsGrid({ data }: StoryboardCardsGridProps) {
  // Debug: Log social video data
  console.log('Social video data:', data.cards.social_video);
  
  return (
    <section className="pb-10">
      <div className="w-full px-4 lg:px-6">
        <div className="flex flex-col gap-4">

          {/* ───────────────── Hero Row (UNCHANGED) ───────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-full">
              <HeroImageSlider
                name={data.name}
                city={data.city}
                country={data.country}
                images={data.cards.hero_images?.images ?? []}
              />
            </div>

            <div className="lg:col-span-1 flex flex-col md:flex-row lg:flex-col gap-4">
              <div className="flex-1 cursor-pointer">
                <BestTimeTodayCard
                  bestTime={data.cards.best_time}
                  name={data.name}
                  timezone={data.timezone}
                  latitude={data.cards?.map?.latitude ?? null}
                  longitude={data.cards?.map?.longitude ?? null}
                  visitorInfo={data.visitor_info}
                />
              </div>

              {data.cards.weather && (
                <div className="flex-1 cursor-pointer">
                  <WeatherSnapshotCard
                    weather={data.cards.weather}
                    timezone={data.timezone}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ───────────────── Rows 2–4 (DESKTOP GRID) ───────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-3 lg:auto-rows-fr gap-4 lg:min-h-[600px]">

            {/* Reviews */}
            <div className="lg:col-start-1 lg:row-start-1 cursor-pointer">
              <RatingSummaryCard review={data.cards.review} />
            </div>

            {/* Map (rows 1–2) - Desktop only */}
            {data.cards.map && (
              <div className="hidden lg:block lg:col-start-2 lg:row-start-1 lg:row-span-2 h-full cursor-pointer">
                <MapTeaserCard map={data.cards.map} />
              </div>
            )}

            {/* Social (rows 1–3) */}
            <div className="hidden lg:block lg:col-start-3 lg:row-start-1 lg:row-span-3 h-full cursor-pointer">
              {data.cards.social_video ? (
                <SocialCard social={data.cards.social_video} />
              ) : (
                <SocialCardPlaceholder />
              )}
            </div>

            {/* Tips */}
            {data.cards.tips && (
              <div className="hidden lg:block lg:col-start-1 lg:row-start-2 cursor-pointer">
                <SafetyTipCard tips={data.cards.tips} />
              </div>
            )}

            {/* About */}
            {data.cards.about && (
              <div className="hidden lg:block lg:col-start-1 lg:row-start-3 cursor-pointer">
                <AboutSnippetCard about={data.cards.about} />
              </div>
            )}

            {/* Nearby */}
            {data.cards.nearby_attraction && (
              <div className="hidden lg:block lg:col-start-2 lg:row-start-3 cursor-pointer">
                <NearbyAttractionCard nearby={data.cards.nearby_attraction} />
              </div>
            )}

            {/* ───────────── Mobile / Tablet ───────────── */}
            <div className="lg:hidden flex flex-col gap-4">
              {/* Tips and Map cards on mobile/tablet */}
              <div className="flex flex-col md:flex-row gap-4">
                {data.cards.tips && (
                  <div className="md:flex-1 cursor-pointer">
                    <SafetyTipCard tips={data.cards.tips} />
                  </div>
                )}

                {data.cards.map && (
                  <div className="md:flex-1 cursor-pointer">
                    <MapTeaserCard map={data.cards.map} />
                  </div>
                )}
              </div>

              {/* Social Video Card on left, About + Nearby stacked on right */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Social Video Card - Left side on tablet */}
                <div className="md:flex-1 cursor-pointer">
                  {data.cards.social_video ? (
                    <SocialCard social={data.cards.social_video} />
                  ) : (
                    <SocialCardPlaceholder />
                  )}
                </div>

                {/* About + Nearby cards stacked - Right side on tablet */}
                <div className="flex flex-col gap-4 md:flex-1">
                  {data.cards.about && (
                    <div className="cursor-pointer">
                      <AboutSnippetCard about={data.cards.about} />
                    </div>
                  )}

                  {data.cards.nearby_attraction && (
                    <div className="cursor-pointer">
                      <NearbyAttractionCard nearby={data.cards.nearby_attraction} />
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
