/**
 * Loading UI for Attraction Pages
 * Displays skeleton components during page transitions
 * Improves perceived performance with instant visual feedback
 */

import {
  Skeleton,
  SkeletonGrid,
  SkeletonCard
} from '@/components/ui/SkeletonComponents';

export default function Loading() {
  return (
    <main className="bg-white text-gray-900 min-h-screen">
      {/* Hero Image Skeleton */}
      <div className="w-full px-4 lg:px-6 py-4">
        <Skeleton className="w-full h-96 rounded-lg" />
      </div>

      {/* Storyboard Cards Grid Skeleton */}
      <div className="w-full px-4 lg:px-6 py-8">
        <SkeletonGrid count={6} columns={3} />
      </div>

      {/* Sections Skeleton */}
      <div className="w-full px-4 lg:px-6 py-8 space-y-8">
        <Skeleton className="w-full h-64 rounded-lg" />
        <Skeleton className="w-full h-64 rounded-lg" />
        <Skeleton className="w-full h-64 rounded-lg" />
      </div>
    </main>
  );
}
