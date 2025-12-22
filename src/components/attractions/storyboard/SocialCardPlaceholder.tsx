'use client';

import { Play } from 'lucide-react';

export function SocialCardPlaceholder() {
  return (
    <article className="rounded-3xl bg-gradient-to-br from-red-50 via-red-50 to-red-100 border border-red-200 overflow-hidden w-full h-full flex flex-col items-center justify-center relative">
      {/* YouTube-style background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4 w-20 h-20 bg-red-600 rounded-full" />
        <div className="absolute bottom-8 left-8 w-32 h-32 bg-red-600 rounded-full" />
      </div>

      <div className="text-center px-6 py-8 relative z-10">
        <div className="flex justify-center mb-4">
          <div className="bg-red-600 rounded-full p-4 shadow-lg">
            <Play className="h-8 w-8 text-white fill-white" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Coming Soon
        </h3>
        <p className="text-sm text-gray-700 mb-4">
          YouTube videos and social content for this attraction will be available soon
        </p>
      </div>
    </article>
  );
}
