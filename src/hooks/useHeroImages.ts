import { useState, useEffect } from 'react';
import { config } from '../lib/config';

interface HeroImage {
    position: number;
    data: string;  // base64 data URL
    alt: string;
    width?: number;
    height?: number;
}

interface UseHeroImagesResult {
    images: HeroImage[];
    isLoading: boolean;
    error: string | null;
    source: 'cache' | 'fetched' | null;
}

/**
 * Hook to fetch hero carousel images for an attraction.
 * Checks Redis cache first, fetches on-demand if miss.
 */
export function useHeroImages(attractionId: number): UseHeroImagesResult {
    const [images, setImages] = useState<HeroImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [source, setSource] = useState<'cache' | 'fetched' | null>(null);

    useEffect(() => {
        if (!attractionId) {
            setIsLoading(false);
            return;
        }

        const fetchImages = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(
                    `${config.apiBaseUrl}/hero-images/${attractionId}`
                );

                if (!response.ok) {
                    throw new Error(`Failed to fetch hero images: ${response.status}`);
                }

                const data = await response.json();
                setImages(data.images || []);
                setSource(data.source);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                setImages([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImages();
    }, [attractionId]);

    return { images, isLoading, error, source };
}

export default useHeroImages;
