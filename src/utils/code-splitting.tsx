/**
 * Code Splitting Utilities
 * Feature: frontend-quality-improvements, Task 4.3: Implement Code Splitting for Heavy Components
 * 
 * Utilities for dynamic imports and code splitting including:
 * - Dynamic component loading with Suspense boundaries
 * - Loading states and error boundaries
 * - Chunk optimization and preloading
 * - Performance monitoring integration
 */

import * as React from 'react';
import { Suspense, ComponentType, LazyExoticComponent } from 'react';
import { PerformanceMonitor } from './performance-monitoring';

/**
 * Loading component for code-split components
 */
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  message = 'Loading...', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]} mb-3`} />
      <div className="text-gray-600 font-medium text-sm">{message}</div>
    </div>
  );
}

/**
 * Skeleton loading component for maps and 3D components
 */
interface ComponentSkeletonProps {
  type: 'map' | '3d-globe' | 'chart' | 'generic';
  height?: string;
  className?: string;
}

export function ComponentSkeleton({ 
  type, 
  height = 'h-96', 
  className = '' 
}: ComponentSkeletonProps) {
  const getSkeletonContent = () => {
    switch (type) {
      case 'map':
        return (
          <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50" />
            <div className="absolute top-4 left-4 w-8 h-8 bg-gray-300 rounded animate-pulse" />
            <div className="absolute top-4 right-4 w-20 h-8 bg-gray-300 rounded animate-pulse" />
            <div className="absolute bottom-4 left-4 w-32 h-16 bg-white rounded shadow-lg animate-pulse" />
            {/* Fake markers */}
            <div className="absolute top-1/3 left-1/2 w-3 h-3 bg-red-400 rounded-full animate-pulse" />
            <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-red-400 rounded-full animate-pulse" />
            <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-red-400 rounded-full animate-pulse" />
          </div>
        );
      
      case '3d-globe':
        return (
          <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-blue-100 to-white rounded-3xl overflow-hidden border border-blue-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-gradient-to-br from-blue-200 to-green-200 animate-pulse" />
            </div>
            <div className="absolute top-1/2 right-4 w-48 h-32 bg-white/95 rounded-xl shadow-xl animate-pulse" />
            {/* Fake rotating dots */}
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-400 rounded-full animate-ping" />
            <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute top-3/4 left-3/4 w-2 h-2 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          </div>
        );
      
      case 'chart':
        return (
          <div className="relative w-full h-full bg-gray-50 rounded-lg overflow-hidden">
            <div className="absolute top-4 left-4 w-32 h-6 bg-gray-300 rounded animate-pulse" />
            <div className="absolute bottom-8 left-8 right-8 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="absolute bottom-12 left-8 w-4 h-32 bg-gray-300 rounded animate-pulse" />
            <div className="absolute bottom-12 left-16 w-4 h-24 bg-gray-300 rounded animate-pulse" />
            <div className="absolute bottom-12 left-24 w-4 h-40 bg-gray-300 rounded animate-pulse" />
            <div className="absolute bottom-12 left-32 w-4 h-20 bg-gray-300 rounded animate-pulse" />
          </div>
        );
      
      default:
        return (
          <div className="w-full h-full bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
            <div className="text-gray-400">Loading component...</div>
          </div>
        );
    }
  };

  return (
    <div className={`${height} ${className}`}>
      {getSkeletonContent()}
    </div>
  );
}

/**
 * Error boundary for code-split components
 */
interface CodeSplitErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

interface CodeSplitErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
  onError?: (error: Error) => void;
  maxRetries?: number;
}

export class CodeSplitErrorBoundary extends React.Component<
  CodeSplitErrorBoundaryProps,
  CodeSplitErrorBoundaryState
> {
  constructor(props: CodeSplitErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): CodeSplitErrorBoundaryState {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Code split component error:', error, errorInfo);
    this.props.onError?.(error);
  }

  retry = () => {
    const { maxRetries = 3 } = this.props;
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback } = this.props;
      
      if (Fallback) {
        return <Fallback error={this.state.error} retry={this.retry} />;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 font-semibold mb-2">Failed to load component</div>
          <div className="text-red-500 text-sm mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </div>
          {this.state.retryCount < (this.props.maxRetries || 3) && (
            <button
              onClick={this.retry}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Retry ({this.state.retryCount + 1}/{this.props.maxRetries || 3})
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for code splitting with performance monitoring
 */
interface DynamicComponentOptions {
  loading?: React.ComponentType;
  error?: React.ComponentType<{ error?: Error; retry: () => void }>;
  skeletonType?: 'map' | '3d-globe' | 'chart' | 'generic';
  skeletonHeight?: string;
  preload?: boolean;
  chunkName?: string;
  onLoadStart?: () => void;
  onLoadEnd?: (loadTime: number) => void;
  onError?: (error: Error) => void;
}

export function createDynamicComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: DynamicComponentOptions = {}
): LazyExoticComponent<T> {
  const {
    preload = false,
    chunkName,
    onLoadStart,
    onLoadEnd,
    onError,
  } = options;

  // Create the lazy component with performance monitoring
  const LazyComponent = React.lazy(async () => {
    const startTime = performance.now();
    onLoadStart?.();

    try {
      const module = await importFn();
      const loadTime = performance.now() - startTime;
      
      // Track performance
      PerformanceMonitor.trackCustomMetric(
        chunkName ? `chunk-${chunkName}` : 'dynamic-component-load',
        loadTime
      );
      
      onLoadEnd?.(loadTime);
      return module;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to load component');
      onError?.(err);
      throw err;
    }
  });

  // Preload the component if requested
  if (preload && typeof window !== 'undefined') {
    // Preload after a short delay to not block initial render
    setTimeout(() => {
      importFn().catch(() => {
        // Ignore preload errors
      });
    }, 100);
  }

  return LazyComponent;
}

/**
 * Wrapper component for dynamic components with Suspense and error boundary
 */
interface DynamicWrapperProps {
  children: React.ReactNode;
  loading?: React.ComponentType;
  error?: React.ComponentType<{ error?: Error; retry: () => void }>;
  skeletonType?: 'map' | '3d-globe' | 'chart' | 'generic';
  skeletonHeight?: string;
  className?: string;
}

export function DynamicWrapper({
  children,
  loading: LoadingComponent,
  error: ErrorComponent,
  skeletonType = 'generic',
  skeletonHeight = 'h-96',
  className = '',
}: DynamicWrapperProps) {
  const fallback = LoadingComponent ? (
    <LoadingComponent />
  ) : (
    <ComponentSkeleton type={skeletonType} height={skeletonHeight} className={className} />
  );

  return (
    <CodeSplitErrorBoundary fallback={ErrorComponent}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </CodeSplitErrorBoundary>
  );
}

/**
 * Hook for preloading dynamic components
 */
export function usePreloadComponent(
  importFn: () => Promise<any>,
  condition: boolean = true
) {
  const [isPreloaded, setIsPreloaded] = React.useState(false);
  const [isPreloading, setIsPreloading] = React.useState(false);

  const preload = React.useCallback(async () => {
    if (isPreloaded || isPreloading) return;

    setIsPreloading(true);
    const startTime = performance.now();

    try {
      await importFn();
      const loadTime = performance.now() - startTime;
      
      PerformanceMonitor.trackCustomMetric('component-preload', loadTime);
      setIsPreloaded(true);
    } catch (error) {
      console.warn('Failed to preload component:', error);
    } finally {
      setIsPreloading(false);
    }
  }, [importFn, isPreloaded, isPreloading]);

  React.useEffect(() => {
    if (condition && typeof window !== 'undefined') {
      // Preload after a short delay
      const timer = setTimeout(preload, 100);
      return () => clearTimeout(timer);
    }
  }, [condition, preload]);

  return { isPreloaded, isPreloading, preload };
}

/**
 * Hook for intersection-based component loading
 */
export function useIntersectionLoad(options: IntersectionObserverInit = {}) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);
  const elementRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback: load immediately if no intersection observer
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isVisible = entry.isIntersecting;
        setIsIntersecting(isVisible);
        
        if (isVisible && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        rootMargin: '100px', // Load before component comes into view
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasIntersected, options]);

  return {
    elementRef,
    isIntersecting,
    hasIntersected,
    shouldLoad: hasIntersected,
  };
}

/**
 * Utility for chunk name generation
 */
export function generateChunkName(componentName: string, category?: string): string {
  const sanitized = componentName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  if (category) {
    const sanitizedCategory = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${sanitizedCategory}-${sanitized}`;
  }
  return sanitized;
}

/**
 * Bundle analyzer helper for development
 */
export function logChunkInfo(chunkName: string, size?: number) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Code Splitting] Loaded chunk: ${chunkName}${size ? ` (${size}KB)` : ''}`);
  }
}