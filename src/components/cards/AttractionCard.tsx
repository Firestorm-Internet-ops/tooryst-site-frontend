import Image from 'next/image';
import { X } from 'lucide-react';
import { RatingStars } from '@/components/ui/RatingStars';
import { NavigationLink } from '@/components/ui/NavigationLink';
import { PlaceholderCard } from '@/components/cards/PlaceholderCard';
import { config } from '@/lib/config';
import { cityNameToSlug } from '@/lib/slug-utils';
import { getImageSizes, generateBlurDataURL } from '@/lib/image-utils';

interface AttractionCardProps {
  attraction: {
    name: string;
    slug: string;
    first_image_url?: string | null;
    rating: number | null;
    review_count?: number | null;
    city_name?: string;
  };
  variant?: 'grid' | 'popup';
  onView?: (slug: string) => void;
  onClose?: () => void;
  priority?: boolean; // For above-the-fold images
  index?: number; // For determining priority
}

export function AttractionCard({
  attraction,
  variant = 'grid',
  onView,
  onClose,
  priority = false,
  index = 0,
}: AttractionCardProps) {
  const hasImage = attraction.first_image_url && attraction.first_image_url.trim() !== '';
  const imageUrl = hasImage ? (attraction.first_image_url as string) : config.images.fallbackAttraction;
  const isPlaceholder = !hasImage;
  
  // Determine if this image should be prioritized (first 3 images)
  const shouldPrioritize = priority || index < 3;

  // Show placeholder if no image and no name
  if (isPlaceholder && !attraction.name) {
    return (
      <PlaceholderCard
        variant={variant}
        title="Coming Soon"
        message="Attraction data not yet available"
      />
    );
  }

  if (variant === 'popup') {
    return (
      <div className="w-full bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow text-left overflow-hidden">
        <div className={`relative h-28 w-full overflow-hidden ${isPlaceholder ? 'bg-gradient-to-br from-gray-100 to-gray-200' : ''}`}>
          <Image
            src={imageUrl}
            alt={attraction.name}
            fill
            className={`object-cover ${isPlaceholder ? 'opacity-40' : ''}`}
            sizes={getImageSizes('thumbnail')}
            priority={shouldPrioritize}
            loading={shouldPrioritize ? 'eager' : 'lazy'}
            placeholder="blur"
            blurDataURL={generateBlurDataURL()}
            quality={85}
          />
          {isPlaceholder && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-500 bg-white/80 px-2 py-1 rounded">
                Coming Soon
              </span>
            </div>
          )}
          {onClose && (
            <button
              type="button"
              className="absolute top-1.5 right-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              aria-label="Close attraction card"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {attraction.rating != null && 
           !isNaN(Number(attraction.rating)) && 
           Number(attraction.rating) > 0 && (
            <div className="absolute top-2 left-2 bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
              {Number(attraction.rating).toFixed(config.ui.ratingDecimalPlaces)} ★
            </div>
          )}
        </div>
        <div className="p-3 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
            {attraction.name}
          </h3>
          {attraction.city_name && (
            <p className="text-xs text-gray-600">
              {attraction.city_name}
              {attraction.review_count !== null &&
                attraction.review_count !== undefined && (
                  <span className="text-gray-400">
                    {' '}
                    ({attraction.review_count})
                  </span>
                )}
            </p>
          )}
          {onView && (
            <button
              type="button"
              onClick={() => onView(attraction.slug)}
              className="w-full mt-2 px-3 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              View
            </button>
          )}
        </div>
      </div>
    );
  }

  // Grid variant
  const citySlug = attraction.city_name ? cityNameToSlug(attraction.city_name) : 'unknown';
  const attractionUrl = `/${citySlug}/${attraction.slug}`;
  
  return (
    <NavigationLink
      href={attractionUrl}
      showLoadingSpinner={true}
      className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow text-left w-full h-full overflow-hidden group m-0 p-0 flex flex-col"
    >
      <div className={`relative h-48 w-full overflow-hidden rounded-t-2xl flex-shrink-0 ${isPlaceholder ? 'bg-gradient-to-br from-gray-100 to-gray-200' : ''}`}>
        <Image
          src={imageUrl}
          alt={attraction.name}
          fill
          className={`object-cover transition-transform duration-200 ${isPlaceholder ? 'opacity-40' : 'group-hover:scale-105'}`}
          sizes={getImageSizes('card')}
          priority={shouldPrioritize}
          loading={shouldPrioritize ? 'eager' : 'lazy'}
          placeholder="blur"
          blurDataURL={generateBlurDataURL()}
          quality={85}
        />
        {isPlaceholder && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500 bg-white/80 px-3 py-1 rounded">
              Coming Soon
            </span>
          </div>
        )}
        {attraction.rating != null && 
         !isNaN(Number(attraction.rating)) && 
         Number(attraction.rating) > 0 && (
          <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
            {Number(attraction.rating).toFixed(config.ui.ratingDecimalPlaces)} ★
          </div>
        )}
      </div>

      <div className="p-4 space-y-2 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
          {attraction.name}
        </h3>
        {attraction.city_name && (
          <p className="text-sm text-gray-500">
            {attraction.city_name}
            {attraction.review_count !== null &&
              attraction.review_count !== undefined && (
                <span className="text-gray-400">
                  {' '}
                  ({attraction.review_count})
                </span>
              )}
          </p>
        )}
        {isPlaceholder ? (
          <div className="mt-auto pt-2">
            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
              Coming Soon
            </span>
          </div>
        ) : (
          attraction.rating !== null && (
            <div className="mt-auto">
              <RatingStars rating={attraction.rating} />
            </div>
          )
        )}
      </div>
    </NavigationLink>
  );
}
