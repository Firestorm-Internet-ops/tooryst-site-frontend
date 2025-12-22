'use client';

import Image from 'next/image';
import { MapCard } from '@/types/attraction-page';
import { MapPin } from 'lucide-react';

interface MapTeaserCardProps {
  map: MapCard;
}

export function MapTeaserCard({ map }: MapTeaserCardProps) {
  if (!map) return null;

  const handleClick = () => {
    const section = document.getElementById('section-map');
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
    <article
      onClick={handleClick}
      className="relative rounded-3xl border border-gray-200 overflow-hidden h-full min-h-[260px] group cursor-pointer transition-all duration-300 hover:border-primary-300 hover:shadow-lg"
    >
      {map.static_map_image_url && (
        <Image
          src={map.static_map_image_url}
          alt={map.address || 'Map'}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, 100vw"
          loading="lazy"
          unoptimized
        />
      )}

      {/* Overlay label */}
      <div className="absolute inset-x-0 bottom-0 p-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-black/70 hover:bg-black/80 px-4 py-2 backdrop-blur-sm transition-all duration-300 group-hover:scale-105">
          <MapPin className="h-4 w-4 text-primary-400" />
          <h2 className="text-xs md:text-sm font-medium text-white uppercase tracking-[0.15em]">View on Map</h2>
        </div>
      </div>
    </article>
  );
}

