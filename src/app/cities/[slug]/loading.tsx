/**
 * Loading UI for City Pages
 * Displays skeleton components during page transitions
 */

import {
  Skeleton,
  SkeletonCard,
  SkeletonGrid
} from '@/components/ui/SkeletonComponents';

export default function Loading() {
  return (
    <main className="bg-white text-gray-900 min-h-screen">
      {/* Hero Section Skeleton */}
      <div className="w-full px-4 lg:px-6 py-8">
        <Skeleton className="w-full h-96 rounded-lg" />
      </div>

      {/* City Overview Skeleton */}
      <div className="w-full px-4 lg:px-6 py-8">
        <Skeleton className="w-full h-48 rounded-lg" />
      </div>

      {/* Attractions Grid Skeleton */}
      <div className="w-full px-4 lg:px-6 py-8">
        <SkeletonGrid count={6} columns={3} />
      </div>
    </main>
  );
}
