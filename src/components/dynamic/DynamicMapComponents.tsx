/**
 * Dynamic Map Components with Code Splitting
 * Feature: frontend-quality-improvements, Task 4.3: Implement Code Splitting for Heavy Components
 * 
 * Dynamically imported map components with:
 * - Lazy loading with Suspense boundaries
 * - Skeleton loading states
 * - Error handling and retry logic
 * - Performance monitoring
 */

import * as React from 'react';
import { 
  createDynamicComponent, 
  DynamicWrapper, 
  useIntersectionLoad,
  generateChunkName 
} from '@/utils/code-splitting';

// Dynamic imports for map components
const DynamicCityMap = createDynamicComponent(
  () => import('@/components/sections/CityMap').then(mod => ({ default: mod.CityMap })),
  {
    skeletonType: 'map',
    skeletonHeight: 'h-96 lg:h-[500px]',
    chunkName: generateChunkName('CityMap', 'maps'),
    preload: false, // Load on demand
  }
);

const DynamicCountryMap = createDynamicComponent(
  () => import('@/components/sections/CountryMap').then(mod => ({ default: mod.CountryMap })),
  {
    skeletonType: 'map',
    skeletonHeight: 'h-96 lg:h-[500px]',
    chunkName: generateChunkName('CountryMap', 'maps'),
    preload: false,
  }
);

const DynamicMapSection = createDynamicComponent(
  () => import('@/components/attractions/sections/MapSection').then(mod => ({ default: mod.MapSection })),
  {
    skeletonType: 'map',
    skeletonHeight: 'h-96',
    chunkName: generateChunkName('MapSection', 'maps'),
    preload: false,
  }
);

// Props interfaces (re-exported from original components)
interface CityMapProps {
  lat: number | null;
  lng: number | null;
  cityName: string;
  attractions?: Array<{
    lat: number;
    lng: number;
    name: string;
    slug: string;
    rating?: number | null;
    firstImageUrl?: string | null;
    city_name?: string;
    review_count?: number | null;
  }>;
  zoom?: number;
  onMarkerClick?: (slug: string) => void;
}

interface CountryMapProps {
  // Add country map props based on the actual component
  countryName: string;
  cities?: Array<{
    name: string;
    lat: number;
    lng: number;
    slug: string;
  }>;
  zoom?: number;
}

interface MapSectionProps {
  // Add map section props based on the actual component
  attraction: {
    name: string;
    lat?: number;
    lng?: number;
  };
}

/**
 * Lazy-loaded City Map with intersection observer
 */
export function LazyLoadedCityMap(props: CityMapProps) {
  const { elementRef, shouldLoad } = useIntersectionLoad({
    rootMargin: '200px', // Load when 200px away from viewport
  });

  return (
    <div ref={elementRef}>
      {shouldLoad ? (
        <DynamicWrapper
          skeletonType="map"
          skeletonHeight="h-96 lg:h-[500px]"
          className="rounded-lg overflow-hidden"
        >
          <DynamicCityMap {...props} />
        </DynamicWrapper>
      ) : (
        <div className="h-96 lg:h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">Map will load when visible</div>
        </div>
      )}
    </div>
  );
}

/**
 * Lazy-loaded Country Map with intersection observer
 */
export function LazyLoadedCountryMap(props: CountryMapProps) {
  const { elementRef, shouldLoad } = useIntersectionLoad({
    rootMargin: '200px',
  });

  return (
    <div ref={elementRef}>
      {shouldLoad ? (
        <DynamicWrapper
          skeletonType="map"
          skeletonHeight="h-96 lg:h-[500px]"
          className="rounded-lg overflow-hidden"
        >
          <DynamicCountryMap {...props} />
        </DynamicWrapper>
      ) : (
        <div className="h-96 lg:h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">Map will load when visible</div>
        </div>
      )}
    </div>
  );
}

/**
 * Lazy-loaded Map Section with intersection observer
 */
export function LazyLoadedMapSection(props: MapSectionProps) {
  const { elementRef, shouldLoad } = useIntersectionLoad({
    rootMargin: '150px',
  });

  return (
    <div ref={elementRef}>
      {shouldLoad ? (
        <DynamicWrapper
          skeletonType="map"
          skeletonHeight="h-96"
          className="rounded-lg overflow-hidden"
        >
          <DynamicMapSection {...props} />
        </DynamicWrapper>
      ) : (
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-gray-500">Map will load when visible</div>
        </div>
      )}
    </div>
  );
}

/**
 * Preloadable City Map for critical above-fold usage
 */
export function PreloadableCityMap(props: CityMapProps & { preload?: boolean }) {
  const { preload = false, ...mapProps } = props;

  const PreloadedCityMap = React.useMemo(() => 
    createDynamicComponent(
      () => import('@/components/sections/CityMap').then(mod => ({ default: mod.CityMap })),
      {
        skeletonType: 'map',
        skeletonHeight: 'h-96 lg:h-[500px]',
        chunkName: generateChunkName('CityMap', 'maps'),
        preload,
      }
    ), [preload]
  );

  return (
    <DynamicWrapper
      skeletonType="map"
      skeletonHeight="h-96 lg:h-[500px]"
      className="rounded-lg overflow-hidden"
    >
      <PreloadedCityMap {...mapProps} />
    </DynamicWrapper>
  );
}

/**
 * Map component with conditional loading based on user interaction
 */
interface InteractiveMapProps extends CityMapProps {
  loadOnInteraction?: boolean;
  interactionText?: string;
}

export function InteractiveMap({ 
  loadOnInteraction = false, 
  interactionText = "Click to load interactive map",
  ...props 
}: InteractiveMapProps) {
  const [shouldLoad, setShouldLoad] = React.useState(!loadOnInteraction);

  if (!shouldLoad) {
    return (
      <div 
        className="h-96 lg:h-[500px] bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center cursor-pointer border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors"
        onClick={() => setShouldLoad(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setShouldLoad(true);
          }
        }}
        aria-label="Load interactive map"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="text-blue-700 font-medium">{interactionText}</div>
          <div className="text-blue-500 text-sm mt-1">Saves bandwidth and improves performance</div>
        </div>
      </div>
    );
  }

  return <LazyLoadedCityMap {...props} />;
}

/**
 * Map component with error boundary and retry functionality
 */
export function RobustCityMap(props: CityMapProps) {
  const [retryCount, setRetryCount] = React.useState(0);
  const maxRetries = 3;

  const handleRetry = React.useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
    }
  }, [retryCount, maxRetries]);

  const ErrorFallback = React.useCallback(({ error, retry }: { error?: Error; retry: () => void }) => (
    <div className="h-96 lg:h-[500px] bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
      <div className="text-center p-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="text-red-700 font-medium mb-2">Failed to load map</div>
        <div className="text-red-600 text-sm mb-4">
          {error?.message || 'An unexpected error occurred'}
        </div>
        {retryCount < maxRetries && (
          <button
            onClick={() => {
              retry();
              handleRetry();
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry ({retryCount + 1}/{maxRetries})
          </button>
        )}
      </div>
    </div>
  ), [retryCount, maxRetries, handleRetry]);

  return (
    <DynamicWrapper
      skeletonType="map"
      skeletonHeight="h-96 lg:h-[500px]"
      className="rounded-lg overflow-hidden"
      error={ErrorFallback}
    >
      <DynamicCityMap {...props} />
    </DynamicWrapper>
  );
}

// Export the dynamic components for direct use
export { DynamicCityMap, DynamicCountryMap, DynamicMapSection };