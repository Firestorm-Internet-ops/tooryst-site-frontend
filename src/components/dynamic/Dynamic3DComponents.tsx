/**
 * Dynamic 3D Components with Code Splitting
 * Feature: frontend-quality-improvements, Task 4.3: Implement Code Splitting for Heavy Components
 * 
 * Dynamically imported 3D components with:
 * - Lazy loading with Suspense boundaries
 * - 3D-specific skeleton loading states
 * - WebGL capability detection
 * - Performance monitoring for heavy 3D libraries
 */

import * as React from 'react';
import { 
  createDynamicComponent, 
  DynamicWrapper, 
  useIntersectionLoad,
  generateChunkName 
} from '@/utils/code-splitting';

// Dynamic import for 3D Globe component
const DynamicGlobe3D = createDynamicComponent(
  () => import('@/components/sections/Globe3D').then(mod => ({ default: mod.Globe3D })),
  {
    skeletonType: '3d-globe',
    skeletonHeight: 'h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px]',
    chunkName: generateChunkName('Globe3D', '3d'),
    preload: false, // Heavy component, load on demand
  }
);

// Props interface for Globe3D
interface Globe3DProps {
  cities: Array<{
    name: string;
    lat?: number;
    lng?: number;
    region?: string;
    slug?: string;
    attractionCount?: number;
    country?: string;
  }>;
}

/**
 * WebGL capability detection
 */
function detectWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
}

/**
 * WebGL fallback component
 */
function WebGLFallback({ cities }: Globe3DProps) {
  return (
    <div className="h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px] bg-gradient-to-br from-blue-50 via-blue-100 to-white rounded-3xl border border-blue-100 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">3D Globe Not Available</h3>
        <p className="text-gray-600 mb-4">
          Your browser doesn't support WebGL, which is required for the 3D globe.
        </p>
        <div className="text-sm text-gray-500">
          Showing {cities.filter(city => city.lat && city.lng).length} cities worldwide
        </div>
      </div>
    </div>
  );
}

/**
 * Performance warning component for low-end devices
 */
function PerformanceWarning({ onProceed, onCancel }: { onProceed: () => void; onCancel: () => void }) {
  return (
    <div className="h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px] bg-gradient-to-br from-amber-50 via-amber-100 to-white rounded-3xl border border-amber-200 flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Notice</h3>
        <p className="text-gray-600 mb-6 text-sm">
          The 3D globe uses advanced graphics and may impact performance on older devices. 
          Would you like to load it anyway?
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Skip
          </button>
          <button
            onClick={onProceed}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            Load 3D Globe
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Device capability detection
 */
function detectDeviceCapability(): 'high' | 'medium' | 'low' {
  if (typeof window === 'undefined') return 'medium';
  
  // Check for mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Check memory (if available)
  const memory = (navigator as any).deviceMemory;
  
  // Check CPU cores (if available)
  const cores = navigator.hardwareConcurrency || 4;
  
  if (isMobile && memory && memory < 4) return 'low';
  if (memory && memory >= 8 && cores >= 8) return 'high';
  if (cores >= 4) return 'medium';
  
  return 'low';
}

/**
 * Lazy-loaded 3D Globe with capability detection
 */
export function LazyLoaded3DGlobe(props: Globe3DProps) {
  const { elementRef, shouldLoad } = useIntersectionLoad({
    rootMargin: '300px', // Load earlier due to heavy nature
  });
  
  const [webglSupported, setWebglSupported] = React.useState<boolean | null>(null);
  const [deviceCapability, setDeviceCapability] = React.useState<'high' | 'medium' | 'low' | null>(null);
  const [userChoice, setUserChoice] = React.useState<'proceed' | 'skip' | null>(null);

  // Check WebGL support and device capability
  React.useEffect(() => {
    if (shouldLoad) {
      setWebglSupported(detectWebGLSupport());
      setDeviceCapability(detectDeviceCapability());
    }
  }, [shouldLoad]);

  // Don't load if not in viewport yet
  if (!shouldLoad) {
    return (
      <div ref={elementRef} className="h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px] bg-gray-100 rounded-3xl flex items-center justify-center">
        <div className="text-gray-500">3D Globe will load when visible</div>
      </div>
    );
  }

  // WebGL not supported
  if (webglSupported === false) {
    return <WebGLFallback {...props} />;
  }

  // Show performance warning for low-end devices
  if (deviceCapability === 'low' && userChoice === null) {
    return (
      <PerformanceWarning
        onProceed={() => setUserChoice('proceed')}
        onCancel={() => setUserChoice('skip')}
      />
    );
  }

  // User chose to skip
  if (userChoice === 'skip') {
    return <WebGLFallback {...props} />;
  }

  // Load the 3D globe
  return (
    <DynamicWrapper
      skeletonType="3d-globe"
      skeletonHeight="h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px]"
      className="rounded-3xl overflow-hidden"
    >
      <DynamicGlobe3D {...props} />
    </DynamicWrapper>
  );
}

/**
 * Interactive 3D Globe with user-controlled loading
 */
interface Interactive3DGlobeProps extends Globe3DProps {
  loadOnInteraction?: boolean;
  interactionText?: string;
}

export function Interactive3DGlobe({ 
  loadOnInteraction = true, 
  interactionText = "Click to load interactive 3D globe",
  ...props 
}: Interactive3DGlobeProps) {
  const [shouldLoad, setShouldLoad] = React.useState(!loadOnInteraction);
  const [webglSupported, setWebglSupported] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    if (shouldLoad) {
      setWebglSupported(detectWebGLSupport());
    }
  }, [shouldLoad]);

  const handleLoadClick = () => {
    const supported = detectWebGLSupport();
    setWebglSupported(supported);
    
    if (supported) {
      setShouldLoad(true);
    }
  };

  if (!shouldLoad) {
    return (
      <div 
        className="h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px] bg-gradient-to-br from-blue-50 via-blue-100 to-white rounded-3xl border-2 border-dashed border-blue-200 hover:border-blue-300 transition-colors cursor-pointer flex items-center justify-center"
        onClick={handleLoadClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleLoadClick();
          }
        }}
        aria-label="Load interactive 3D globe"
      >
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-blue-700 font-medium text-lg mb-2">{interactionText}</div>
          <div className="text-blue-500 text-sm">
            Interactive 3D visualization of {props.cities.filter(city => city.lat && city.lng).length} cities
          </div>
          <div className="text-blue-400 text-xs mt-2">
            Requires WebGL • May impact performance on older devices
          </div>
        </div>
      </div>
    );
  }

  if (webglSupported === false) {
    return <WebGLFallback {...props} />;
  }

  return <LazyLoaded3DGlobe {...props} />;
}

/**
 * Preloadable 3D Globe for critical usage
 */
export function Preloadable3DGlobe(props: Globe3DProps & { preload?: boolean }) {
  const { preload = false, ...globeProps } = props;

  const Preloaded3DGlobe = React.useMemo(() => 
    createDynamicComponent(
      () => import('@/components/sections/Globe3D').then(mod => ({ default: mod.Globe3D })),
      {
        skeletonType: '3d-globe',
        skeletonHeight: 'h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px]',
        chunkName: generateChunkName('Globe3D', '3d'),
        preload,
      }
    ), [preload]
  );

  const [webglSupported, setWebglSupported] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    setWebglSupported(detectWebGLSupport());
  }, []);

  if (webglSupported === false) {
    return <WebGLFallback {...globeProps} />;
  }

  return (
    <DynamicWrapper
      skeletonType="3d-globe"
      skeletonHeight="h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px]"
      className="rounded-3xl overflow-hidden"
    >
      <Preloaded3DGlobe {...globeProps} />
    </DynamicWrapper>
  );
}

/**
 * 3D Globe with error boundary and fallback
 */
export function Robust3DGlobe(props: Globe3DProps) {
  const [retryCount, setRetryCount] = React.useState(0);
  const maxRetries = 2; // Fewer retries for heavy components

  const handleRetry = React.useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
    }
  }, [retryCount, maxRetries]);

  const ErrorFallback = React.useCallback(({ error, retry }: { error?: Error; retry: () => void }) => (
    <div className="h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px] bg-red-50 border border-red-200 rounded-3xl flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <div className="text-red-700 font-medium mb-2">Failed to load 3D globe</div>
        <div className="text-red-600 text-sm mb-4">
          {error?.message || 'An unexpected error occurred'}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => {
              // Fallback to 2D representation
              window.location.reload();
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Use 2D View
          </button>
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
    </div>
  ), [retryCount, maxRetries, handleRetry]);

  return (
    <DynamicWrapper
      skeletonType="3d-globe"
      skeletonHeight="h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px]"
      className="rounded-3xl overflow-hidden"
      error={ErrorFallback}
    >
      <DynamicGlobe3D {...props} />
    </DynamicWrapper>
  );
}

// Export the dynamic component for direct use
export { DynamicGlobe3D };