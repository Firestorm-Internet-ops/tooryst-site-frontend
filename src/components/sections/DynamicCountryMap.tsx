'use client';

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';

// Dynamic import for the heavy CountryMap component
const CountryMap = dynamic(() => import('./CountryMap').then(mod => ({ default: mod.CountryMap })), {
  ssr: false,
  loading: () => (
    <Card className="p-0 overflow-hidden">
      <div className="h-[500px] w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-3 text-sm text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    </Card>
  ),
});

export { CountryMap as DynamicCountryMap };