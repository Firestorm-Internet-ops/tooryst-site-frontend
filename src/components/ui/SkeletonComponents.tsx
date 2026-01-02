/**
 * Skeleton Loading Components
 * Feature: frontend-quality-improvements, Task 4.5: Create Skeleton Loading Components
 * 
 * Comprehensive skeleton loading components including:
 * - SkeletonCard with multiple variants
 * - SkeletonGrid for loading states
 * - Specialized skeletons for different content types
 * - Animated loading states with accessibility support
 */

import * as React from 'react';

/**
 * Base skeleton component with animation
 */
interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
  animate?: boolean;
}

export function Skeleton({ className = '', children, animate = true }: SkeletonProps) {
  const animationClass = animate ? 'animate-pulse' : '';
  
  return (
    <div 
      className={`bg-gray-200 rounded ${animationClass} ${className}`}
      role="status"
      aria-label="Loading content"
    >
      {children}
    </div>
  );
}

/**
 * Skeleton card component with multiple variants
 */
interface SkeletonCardProps {
  variant?: 'default' | 'attraction' | 'city' | 'article' | 'compact';
  className?: string;
  showImage?: boolean;
  showActions?: boolean;
  animate?: boolean;
}

export function SkeletonCard({ 
  variant = 'default', 
  className = '',
  showImage = true,
  showActions = true,
  animate = true 
}: SkeletonCardProps) {
  const baseClasses = 'bg-white rounded-lg border border-gray-200 overflow-hidden';
  const animationClass = animate ? 'animate-pulse' : '';

  const renderContent = () => {
    switch (variant) {
      case 'attraction':
        return (
          <>
            {showImage && (
              <div className="h-48 bg-gray-200" />
            )}
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 w-4 bg-gray-200 rounded" />
                  ))}
                  <div className="h-4 bg-gray-200 rounded w-12 ml-2" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
              {showActions && (
                <div className="flex space-x-2 pt-2">
                  <div className="h-8 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded w-24" />
                </div>
              )}
            </div>
          </>
        );

      case 'city':
        return (
          <>
            {showImage && (
              <div className="h-40 bg-gray-200" />
            )}
            <div className="p-4 space-y-3">
              <div className="h-7 bg-gray-200 rounded w-2/3" />
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-5 bg-gray-200 rounded w-28" />
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            </div>
          </>
        );

      case 'article':
        return (
          <>
            {showImage && (
              <div className="h-32 bg-gray-200" />
            )}
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-4/5" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="flex items-center space-x-4 pt-2">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </>
        );

      case 'compact':
        return (
          <div className="flex items-center space-x-3 p-3">
            {showImage && (
              <div className="h-12 w-12 bg-gray-200 rounded" />
            )}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        );

      default:
        return (
          <>
            {showImage && (
              <div className="h-48 bg-gray-200" />
            )}
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
              {showActions && (
                <div className="flex space-x-2 pt-2">
                  <div className="h-8 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded w-24" />
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div 
      className={`${baseClasses} ${animationClass} ${className}`}
      role="status"
      aria-label={`Loading ${variant} content`}
    >
      {renderContent()}
    </div>
  );
}

/**
 * Skeleton grid component for loading multiple items
 */
interface SkeletonGridProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4 | 6;
  variant?: 'default' | 'attraction' | 'city' | 'article' | 'compact';
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function SkeletonGrid({ 
  count = 6, 
  columns = 3, 
  variant = 'default',
  className = '',
  gap = 'md',
  animate = true 
}: SkeletonGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
  };

  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };

  return (
    <div 
      className={`grid ${columnClasses[columns]} ${gapClasses[gap]} ${className}`}
      role="status"
      aria-label={`Loading ${count} ${variant} items`}
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard 
          key={index} 
          variant={variant} 
          animate={animate}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton list component for vertical layouts
 */
interface SkeletonListProps {
  count?: number;
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function SkeletonList({ 
  count = 5, 
  variant = 'default',
  className = '',
  spacing = 'md',
  animate = true 
}: SkeletonListProps) {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  };

  const renderItem = (index: number) => {
    switch (variant) {
      case 'compact':
        return (
          <div className="flex items-center space-x-3 p-3 bg-white rounded border">
            <div className="h-8 w-8 bg-gray-200 rounded" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        );

      case 'detailed':
        return (
          <div className="p-4 bg-white rounded border space-y-3">
            <div className="flex items-start space-x-3">
              <div className="h-12 w-12 bg-gray-200 rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center space-x-4 p-4 bg-white rounded border">
            <div className="h-10 w-10 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        );
    }
  };

  return (
    <div 
      className={`${spacingClasses[spacing]} ${className}`}
      role="status"
      aria-label={`Loading ${count} list items`}
    >
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={animate ? 'animate-pulse' : ''}>
          {renderItem(index)}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton text component for text content
 */
interface SkeletonTextProps {
  lines?: number;
  className?: string;
  animate?: boolean;
  variant?: 'paragraph' | 'heading' | 'caption';
}

export function SkeletonText({ 
  lines = 3, 
  className = '',
  animate = true,
  variant = 'paragraph' 
}: SkeletonTextProps) {
  const getLineWidth = (index: number) => {
    const widths = ['w-full', 'w-5/6', 'w-4/5', 'w-3/4', 'w-2/3'];
    return widths[index % widths.length];
  };

  const getLineHeight = () => {
    switch (variant) {
      case 'heading':
        return 'h-6';
      case 'caption':
        return 'h-3';
      default:
        return 'h-4';
    }
  };

  const spacing = variant === 'heading' ? 'space-y-3' : 'space-y-2';

  return (
    <div 
      className={`${spacing} ${className}`}
      role="status"
      aria-label={`Loading ${variant} text`}
    >
      {Array.from({ length: lines }, (_, index) => (
        <div 
          key={index}
          className={`${getLineHeight()} bg-gray-200 rounded ${getLineWidth(index)} ${animate ? 'animate-pulse' : ''}`}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton table component
 */
interface SkeletonTableProps {
  rows?: number;
  columns?: number;
  className?: string;
  animate?: boolean;
  showHeader?: boolean;
}

export function SkeletonTable({ 
  rows = 5, 
  columns = 4,
  className = '',
  animate = true,
  showHeader = true 
}: SkeletonTableProps) {
  const animationClass = animate ? 'animate-pulse' : '';

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}
      role="status"
      aria-label="Loading table data"
    >
      {showHeader && (
        <div className={`bg-gray-50 px-6 py-3 border-b border-gray-200 ${animationClass}`}>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }, (_, index) => (
              <div key={index} className="h-4 bg-gray-200 rounded w-3/4" />
            ))}
          </div>
        </div>
      )}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className={`px-6 py-4 ${animationClass}`}>
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }, (_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded w-5/6" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton form component
 */
interface SkeletonFormProps {
  fields?: number;
  className?: string;
  animate?: boolean;
  showSubmitButton?: boolean;
}

export function SkeletonForm({ 
  fields = 4, 
  className = '',
  animate = true,
  showSubmitButton = true 
}: SkeletonFormProps) {
  const animationClass = animate ? 'animate-pulse' : '';

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-6 space-y-4 ${animationClass} ${className}`}
      role="status"
      aria-label="Loading form"
    >
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded w-full" />
        </div>
      ))}
      {showSubmitButton && (
        <div className="pt-2">
          <div className="h-10 bg-gray-200 rounded w-32" />
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton avatar component
 */
interface SkeletonAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
  shape?: 'circle' | 'square';
}

export function SkeletonAvatar({ 
  size = 'md', 
  className = '',
  animate = true,
  shape = 'circle' 
}: SkeletonAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded';
  const animationClass = animate ? 'animate-pulse' : '';

  return (
    <div 
      className={`bg-gray-200 ${sizeClasses[size]} ${shapeClass} ${animationClass} ${className}`}
      role="status"
      aria-label="Loading avatar"
    />
  );
}

/**
 * Skeleton page component for full page loading states
 */
interface SkeletonPageProps {
  layout?: 'default' | 'sidebar' | 'hero' | 'dashboard';
  className?: string;
  animate?: boolean;
}

export function SkeletonPage({ 
  layout = 'default', 
  className = '',
  animate = true 
}: SkeletonPageProps) {
  const animationClass = animate ? 'animate-pulse' : '';

  const renderLayout = () => {
    switch (layout) {
      case 'sidebar':
        return (
          <div className="flex min-h-screen">
            <div className="w-64 bg-gray-100 p-4 space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="space-y-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="h-6 bg-gray-200 rounded w-full" />
                ))}
              </div>
            </div>
            <div className="flex-1 p-6 space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <SkeletonGrid count={6} columns={2} />
            </div>
          </div>
        );

      case 'hero':
        return (
          <div className="space-y-8">
            <div className="h-96 bg-gray-200 rounded-lg" />
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-4">
                <div className="h-12 bg-gray-200 rounded w-2/3 mx-auto" />
                <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto" />
              </div>
              <SkeletonGrid count={9} columns={3} />
            </div>
          </div>
        );

      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-8 bg-gray-200 rounded w-1/4" />
              <div className="h-10 bg-gray-200 rounded w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg border space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-8 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-gray-200 rounded-lg" />
              <SkeletonTable rows={6} columns={3} />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <SkeletonText lines={2} variant="paragraph" />
            <SkeletonGrid count={6} columns={3} />
          </div>
        );
    }
  };

  return (
    <div 
      className={`${animationClass} ${className}`}
      role="status"
      aria-label={`Loading ${layout} page`}
    >
      {renderLayout()}
    </div>
  );
}

// All components are already exported individually above