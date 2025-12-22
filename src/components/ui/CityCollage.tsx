'use client';

import { useState, useEffect } from 'react';
import { OptimizedImage } from './OptimizedImage';
import { getCityAttractionImages, generateCollageUrl, type AttractionImage } from '@/lib/image-collage';

interface CityCollageProps {
  citySlug: string;
  cityName: string;
  className?: string;
  width?: number;
  height?: number;
  fallbackImage?: string;
}

export function CityCollage({
  citySlug,
  cityName,
  className = '',
  width = 1200,
  height = 630,
  fallbackImage,
}: CityCollageProps) {
  const [collageUrl, setCollageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function generateCollage() {
      try {
        setIsLoading(true);
        setError(null);

        // Get attraction images for the city
        const attractionImages = await getCityAttractionImages(citySlug);
        
        if (attractionImages.length > 0) {
          // Generate collage URL
          const url = generateCollageUrl(attractionImages, cityName, {
            width,
            height,
            quality: 85,
          });
          setCollageUrl(url);
        } else {
          // No images available, use fallback
          setCollageUrl(fallbackImage || null);
        }
      } catch (err) {
        console.error('Error generating city collage:', err);
        setError('Failed to load city images');
        setCollageUrl(fallbackImage || null);
      } finally {
        setIsLoading(false);
      }
    }

    generateCollage();
  }, [citySlug, cityName, width, height, fallbackImage]);

  if (isLoading) {
    return (
      <div 
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{ width, height }}
      >
        <div className="flex items-center justify-center h-full text-gray-500">
          Loading city images...
        </div>
      </div>
    );
  }

  if (error || !collageUrl) {
    return (
      <div 
        className={`bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-white text-center">
          <h3 className="text-2xl font-bold">{cityName}</h3>
          <p className="text-blue-100">Discover amazing attractions</p>
        </div>
      </div>
    );
  }

  return (
    <OptimizedImage
      src={collageUrl}
      alt={`${cityName} attractions collage`}
      width={width}
      height={height}
      className={className}
      priority
      quality={85}
    />
  );
}

// Static version for server-side rendering
export function StaticCityCollage({
  attractionImages,
  cityName,
  className = '',
  width = 1200,
  height = 630,
}: {
  attractionImages: AttractionImage[];
  cityName: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  if (attractionImages.length === 0) {
    return (
      <div 
        className={`bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <div className="text-white text-center">
          <h3 className="text-2xl font-bold">{cityName}</h3>
          <p className="text-blue-100">Discover amazing attractions</p>
        </div>
      </div>
    );
  }

  const collageUrl = generateCollageUrl(attractionImages, cityName, {
    width,
    height,
    quality: 85,
  });

  return (
    <OptimizedImage
      src={collageUrl}
      alt={`${cityName} attractions collage`}
      width={width}
      height={height}
      className={className}
      priority
      quality={85}
    />
  );
}