'use client';

import { AttractionPageResponse } from '@/types/attraction-page';
import { useIntersectionLoad } from '@/utils/code-splitting';
import dynamic from 'next/dynamic';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

interface LazyMapSectionWrapperProps {
    data: AttractionPageResponse;
}

// Directly import the MapSection component
const MapSection = dynamic(() => import('@/components/attractions/sections/MapSection').then(mod => mod.AttractionMapSection), {
    loading: () => <SkeletonLoader height="h-80" />,
    ssr: false
});

export function LazyMapSectionWrapper({ data }: LazyMapSectionWrapperProps) {
    const { elementRef, shouldLoad } = useIntersectionLoad({
        rootMargin: '150px', // Load when 150px away from viewport
    });

    const mapData = data.cards?.map;

    if (!mapData || !mapData.latitude || !mapData.longitude) return null;

    return (
        <div ref={elementRef}>
            {shouldLoad ? (
                <MapSection data={data} />
            ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-gray-500">Map will load when visible</div>
                </div>
            )}
        </div>
    );
}