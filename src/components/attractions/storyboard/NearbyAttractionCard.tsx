'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin } from 'lucide-react';
import { NearbyAttractionCard as NearbyAttractionCardType } from '@/types/attraction-page';
import { getImageSizes, generateBlurDataURL } from '@/lib/image-utils';

interface NearbyAttractionCardProps {
  nearby: NearbyAttractionCardType;
}

export function NearbyAttractionCard({ nearby }: NearbyAttractionCardProps) {
  if (!nearby) return null;

  const handleScrollToNearby = () => {
    const section = document.getElementById('section-nearby-attractions');
    if (section) {
      // Account for both headers: main header (64px) + sections navbar (72px) + padding (16px)
      const mainHeaderHeight = 64;
      const sectionsNavbarHeight = 72;
      const totalOffset = mainHeaderHeight + sectionsNavbarHeight + 16;

      const elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - totalOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <article className="relative rounded-3xl border border-gray-200 overflow-hidden group h-full min-h-[240px]">
      {nearby.hero_image_url && (
        <Image
          src={nearby.hero_image_url}
          alt={nearby.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={getImageSizes('card')}
          loading="lazy"
          placeholder="blur"
          blurDataURL={generateBlurDataURL()}
          quality={85}
        />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-5">
        <div className="space-y-2">
          <h3 className="text-base md:text-lg font-semibold text-white line-clamp-2">
            {nearby.name}
          </h3>
          
          <div className="flex items-center gap-3 text-sm text-white/90">
            {nearby.distance_km !== null && nearby.distance_km !== undefined && (
              <span className="flex items-center gap-1">
                {nearby.distance_km.toFixed(1)} km away
              </span>
            )}
            {nearby.walking_time_minutes !== null && nearby.walking_time_minutes !== undefined && (
              <span className="flex items-center gap-1">
                ~{nearby.walking_time_minutes} min walk
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-3">
            {nearby.slug && (
              <Link
                href={`/attractions/${nearby.slug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white text-gray-900 text-sm font-medium transition-colors"
              >
                View attraction
                <span className="text-gray-600">→</span>
              </Link>
            )}
            <button
              onClick={handleScrollToNearby}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-500/90 hover:bg-primary-500 text-white text-sm font-medium transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <MapPin className="h-4 w-4" />
              See More
            </button>
          </div>
        </div>
      </div>

      {/* Overlay label */}
      <div className="absolute inset-x-0 top-0 p-3">
        <div className="inline-flex rounded-full bg-black/65 px-3 py-1 backdrop-blur-sm">
          <h2 className="text-xs md:text-sm font-medium text-white">Nearby</h2>
        </div>
      </div>
    </article>
  );
}

