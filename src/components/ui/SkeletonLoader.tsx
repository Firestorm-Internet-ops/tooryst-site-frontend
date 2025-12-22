import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: string;
  lines?: number;
  showAvatar?: boolean;
}

export function SkeletonLoader({
  height = 'h-64',
  lines = 3,
  showAvatar = false,
  className,
  ...props
}: SkeletonLoaderProps) {
  return (
    <div className={cn('animate-pulse rounded-lg bg-gray-200', height, className)} {...props}>
      <div className="p-6 space-y-4">
        {showAvatar && (
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-32"></div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        )}
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          {Array.from({ length: lines - 1 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded w-full"></div>
          ))}
        </div>
        <div className="flex space-x-2">
          <div className="h-8 bg-gray-300 rounded w-20"></div>
          <div className="h-8 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}