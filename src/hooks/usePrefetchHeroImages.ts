import { useEffect, useRef } from 'react';
import { config } from '../lib/config';

interface UsePrefetchHeroImagesOptions {
    enabled?: boolean;
    debounceMs?: number;
}

/**
 * Hook to prefetch hero carousel images for a list of attractions.
 * Call this on listing pages to trigger background prefetch.
 */
export function usePrefetchHeroImages(
    attractionIds: number[],
    options: UsePrefetchHeroImagesOptions = {}
) {
    const { enabled = true, debounceMs = 500 } = options;
    const prefetchedRef = useRef<Set<number>>(new Set());
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!enabled || attractionIds.length === 0) return;

        // Filter out already prefetched attractions
        const newIds = attractionIds.filter(id => !prefetchedRef.current.has(id));
        if (newIds.length === 0) return;

        // Clear pending prefetch
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // Debounce the prefetch request
        timeoutRef.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    `${config.apiBaseUrl}/prefetch-hero-images`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ attraction_ids: newIds.slice(0, 50) }),
                    }
                );

                if (response.ok) {
                    newIds.forEach(id => prefetchedRef.current.add(id));
                }
            } catch (error) {
                // Silently fail - prefetch is optional
                console.warn('[Prefetch] Failed:', error);
            }
        }, debounceMs);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [attractionIds, enabled, debounceMs]);

    return { prefetch: (ids: number[]) => { /* manual trigger */ } };
}

export default usePrefetchHeroImages;
