import { AttractionSummary } from '@/types/api';
import { AttractionCard } from '@/components/cards/AttractionCard';

interface AttractionsGridProps {
  attractions: AttractionSummary[];
  loading?: boolean;
}

export function AttractionsGrid({
  attractions,
  loading = false,
}: AttractionsGridProps) {
  if (loading) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        Loading attractions...
      </div>
    );
  }

  if (attractions.length === 0) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        No attractions found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
      {attractions.map((attraction, index) => (
        <AttractionCard
          key={attraction.slug}
          attraction={{
            name: attraction.name,
            slug: attraction.slug,
            first_image_url: attraction.hero_image,
            rating: attraction.average_rating,
            review_count: attraction.total_reviews,
            city_name: attraction.city,
          }}
          variant="grid"
          priority={index < 4} // Prioritize first 4 images above the fold
          index={index}
        />
      ))}
    </div>
  );
}
