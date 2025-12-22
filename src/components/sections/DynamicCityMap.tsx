'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';

// Dynamic import for the heavy CityMap component with Google Maps
const CityMap = dynamic(() => import('./CityMap').then(mod => ({ default: mod.CityMap })), {
  ssr: false,
  loading: () => (
    <Card className="p-0 overflow-hidden">
      <div className="h-96 lg:h-[500px] w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-3 text-sm text-gray-600">Loading Google Maps...</p>
        </div>
      </div>
    </Card>
  ),
});

export { CityMap as DynamicCityMap };