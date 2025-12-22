import * as React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const sizeClasses = {
  small: 'h-4 w-4',
  medium: 'h-5 w-5',
  large: 'h-6 w-6',
};

export function RatingStars({ rating, size = 'medium', showText }: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - Math.ceil(rating);

  const starSize = sizeClasses[size];

  return (
    <div className="flex items-center gap-2 text-primary-600">
      <div className="flex gap-1">
        {Array.from({ length: fullStars }).map((_, idx) => (
          <Star key={`full-${idx}`} className={`${starSize} fill-yellow-400 text-yellow-400`} aria-label="filled-star" />
        ))}
        {hasHalfStar && (
          <Star className={`${starSize} fill-yellow-200 text-yellow-400`} aria-label="filled-star" />
        )}
        {Array.from({ length: emptyStars }).map((_, idx) => (
          <Star key={`empty-${idx}`} className={`${starSize} text-gray-300`} aria-label="empty-star" />
        ))}
      </div>
      {showText && <span className="text-sm font-medium text-gray-600">{rating.toFixed(1)}</span>}
    </div>
  );
}
