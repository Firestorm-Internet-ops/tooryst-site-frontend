import * as React from 'react';
import Image from 'next/image';
import { Play, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';

interface SocialCardProps {
  video: {
    id: string;
    title: string;
    thumbnailUrl: string;
    videoUrl: string;
  };
}

export function SocialCard({ video }: SocialCardProps) {
  const hasThumbnail = video.thumbnailUrl && video.thumbnailUrl.trim() !== '';
  const hasTitle = video.title && video.title.trim() !== '';

  // Show placeholder if no thumbnail or title
  if (!hasThumbnail || !hasTitle) {
    return (
      <Card className="overflow-hidden p-0 hover:shadow-lg transition-shadow">
        <div className="relative h-40 md:h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group">
          <div className="text-center">
            <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 font-medium">No video available</p>
          </div>
        </div>
        <div className="p-3">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">
            {hasTitle ? video.title : 'Coming Soon'}
          </p>
          <p className="text-xs text-gray-500 mt-1">Video data not yet available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0 hover:shadow-lg transition-shadow">
      <a
        href={video.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <div className="relative h-40 md:h-48 group">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
            <div className="bg-white/90 rounded-full p-3 shadow-lg">
              <Play className="h-6 w-6 text-primary-500 fill-primary-500" />
            </div>
          </div>
        </div>
        <div className="p-3">
          <p className="text-sm font-medium text-gray-900 line-clamp-2">{video.title}</p>
        </div>
      </a>
    </Card>
  );
}
