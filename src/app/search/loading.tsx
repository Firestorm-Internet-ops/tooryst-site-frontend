/**
 * Loading UI for Search Page
 * Displays skeleton components during search operations
 */

import { Skeleton, SkeletonGrid } from '@/components/ui/SkeletonComponents';

export default function Loading() {
  return (
    <main className="bg-white text-gray-900 min-h-screen">
      {/* Search Header Skeleton */}
      <div className="w-full px-4 lg:px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-full rounded-lg mb-4" />
          <Skeleton className="h-8 w-64 rounded" />
        </div>
      </div>

      {/* Search Results Skeleton */}
      <div className="w-full px-4 lg:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <SkeletonGrid count={9} columns={3} />
        </div>
      </div>
    </main>
  );
}
