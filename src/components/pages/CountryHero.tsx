import Link from 'next/link';
import { Share2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface CountryHeroProps {
  country: {
    name: string;
    code?: string;
    lat?: number | null;
    lng?: number | null;
    citiesCount?: number;
    attractionsCount?: number;
  };
  mostVisitedCity?: string;
  heroImageUrl?: string;
}

// Import config for gradients
import { config } from '@/lib/config';

export function CountryHero({ country, mostVisitedCity, heroImageUrl }: CountryHeroProps) {
  const flagEmoji = country.code
    ? country.code
        .toUpperCase()
        .replace(/./g, (char) =>
          String.fromCodePoint((char.charCodeAt(0) % 32) + 0x1f1e5)
        )
    : '🌍';

  const backgroundStyle = heroImageUrl
    ? {
        backgroundImage: `${config.gradients.heroOverlay}, url(${heroImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { backgroundImage: config.gradients.defaultBackground };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${country.name} • Storyboard`,
        text: `Discover top cities and attractions in ${country.name}`,
        url: `/destinations/${country.name.toLowerCase()}`,
      });
    }
  };

  return (
    <section
      className="rounded-3xl text-white shadow-xl overflow-hidden"
      style={backgroundStyle}
    >
      <div className="flex flex-col lg:flex-row gap-8 p-6 md:p-10 lg:p-12 backdrop-blur-[2px]">
        <div className="flex-1 text-center lg:text-left space-y-4">
          <span className="text-5xl md:text-6xl" aria-hidden="true">
            {flagEmoji}
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-semibold">
            {country.name}
          </h1>
          <p className="text-sm md:text-base text-white/80">
            Discover the most-loved cities, attractions, and travel intel across{' '}
            {country.name}.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            <Link
              aria-label="Explore cities"
              className="inline-flex items-center justify-center rounded-lg bg-white text-gray-900 px-5 py-2 text-sm font-medium shadow-md hover:shadow-lg transition-shadow"
              href={`/destinations/${country.name.toLowerCase()}#cities`}
            >
              Explore Cities
            </Link>
            <Button
              variant="ghost"
              className="border border-white/40 text-white hover:bg-white/10"
              onClick={handleShare}
              aria-label="Share"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-white/70">Cities</p>
            <p className="text-3xl font-semibold mt-1">
              {country.citiesCount ?? '—'}
            </p>
            <p className="text-sm text-white/70 mt-2">featured destinations</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-white/70">
              Attractions
            </p>
            <p className="text-3xl font-semibold mt-1">
              {country.attractionsCount ?? '—'}
            </p>
            <p className="text-sm text-white/70 mt-2">curated experiences</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/70">
                Most Visited
              </p>
              <p className="text-lg font-semibold mt-1">
                {mostVisitedCity ?? '—'}
              </p>
            </div>
            {mostVisitedCity && (
              <Badge variant="light" className="self-start bg-white/20 text-white mt-4">
                Trending
              </Badge>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

