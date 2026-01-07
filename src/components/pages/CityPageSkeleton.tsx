import * as React from 'react';
import { SkeletonGrid } from '@/components/ui/SkeletonComponents';
import { BentoGridLayout } from '@/components/layout/BentoGridLayout';

/**
 * Skeleton loading state for the city page to prevent layout shifts
 * and provide a premium loading experience.
 */
export function CityPageSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white animate-pulse">
            {/* Hero Section Skeleton */}
            <section className="relative w-full h-[420px] sm:h-[55vh] sm:min-h-[480px] max-h-[700px] overflow-hidden bg-gray-200">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    {/* Breadcrumb Skeleton */}
                    <div className="absolute top-6 left-4 md:left-8 flex items-center gap-2 max-w-7xl mx-auto w-full">
                        <div className="h-4 w-12 bg-gray-300/50 rounded" />
                        <div className="h-3 w-3 bg-gray-300/30 rounded-full" />
                        <div className="h-4 w-12 bg-gray-300/50 rounded" />
                        <div className="h-3 w-3 bg-gray-300/30 rounded-full" />
                        <div className="h-4 w-20 bg-gray-300/50 rounded" />
                    </div>

                    <div className="space-y-6 text-center">
                        {/* City Title Skeleton */}
                        <div className="h-12 md:h-16 w-64 md:w-96 bg-gray-300/50 rounded-2xl mx-auto" />

                        {/* Badges Skeleton */}
                        <div className="flex flex-wrap justify-center gap-3">
                            <div className="h-8 w-32 bg-gray-300/30 rounded-full" />
                            <div className="h-8 w-32 bg-gray-300/30 rounded-full" />
                        </div>

                        {/* Buttons Skeleton */}
                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <div className="h-12 w-40 bg-gray-100/40 rounded-xl" />
                            <div className="h-12 w-32 bg-gray-100/20 rounded-xl border border-white/20" />
                        </div>
                    </div>
                </div>
            </section>

            <BentoGridLayout>
                {/* Quick Stats Skeleton */}
                <section className="mt-8 mb-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-24 bg-gray-100/50 rounded-2xl border border-gray-100" />
                        ))}
                    </div>
                </section>

                {/* Attractions Section Skeleton */}
                <section className="space-y-8 mb-12">
                    <div className="space-y-4">
                        <div className="h-4 w-24 bg-gray-200/60 rounded" />
                        <div className="h-10 w-64 bg-gray-200/70 rounded" />
                        <div className="h-5 w-full max-w-lg bg-gray-200/50 rounded" />
                    </div>
                    <SkeletonGrid count={8} columns={4} variant="attraction" gap="lg" />
                </section>

                {/* Map Section Skeleton */}
                <section className="space-y-6 mb-12">
                    <div className="space-y-4">
                        <div className="h-4 w-24 bg-gray-200/60 rounded" />
                        <div className="h-10 w-48 bg-gray-200/70 rounded" />
                        <div className="h-5 w-full max-w-lg bg-gray-200/50 rounded" />
                    </div>
                    <div className="h-96 lg:h-[500px] bg-gray-100/50 rounded-3xl border border-gray-100 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-primary-500 animate-spin" />
                    </div>
                </section>
            </BentoGridLayout>
        </div>
    );
}
