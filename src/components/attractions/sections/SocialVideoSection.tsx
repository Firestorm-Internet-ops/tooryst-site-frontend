'use client';

import { AttractionPageResponse } from '@/types/attraction-page';
import { SectionShell } from './SectionShell';
import Image from 'next/image';
import { Play, Eye, Clock } from 'lucide-react';
import { useState } from 'react';

interface SocialVideoSectionProps {
  data: AttractionPageResponse;
}

// Extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Format duration from seconds
function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function SocialVideoSection({ data }: SocialVideoSectionProps) {
  const socialVideos = data.social_videos || [];
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  if (socialVideos.length === 0) return null;

  return (
    <SectionShell
      id="social-videos"
      title="Social videos"
      subtitle="See what travelers are sharing about this attraction."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full auto-rows-fr">
        {socialVideos.map((video, idx) => {
          const videoId = video.video_id || (video.watch_url ? getYouTubeVideoId(video.watch_url) : null);
          const isPlaying = playingVideo === idx;
          const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : null;

          return (
            <div
              key={idx}
              className="group relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50 hover:border-primary-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full"
            >
              {isPlaying && embedUrl ? (
                // Embedded YouTube Player
                <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
                  <iframe
                    src={embedUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ) : (
                // Thumbnail with Play Button
                <>
                  {video.thumbnail_url && (
                    <div className="relative w-full" style={{ aspectRatio: '9/16' }}>
                      <Image
                        src={video.thumbnail_url}
                        alt={video.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <button
                        onClick={() => setPlayingVideo(idx)}
                        className="absolute inset-0 flex items-center justify-center group/play"
                        aria-label={`Play ${video.title}`}
                      >
                        <div className="rounded-full bg-white/95 p-4 group-hover/play:scale-110 group-hover/play:bg-white transition-all duration-300 shadow-2xl">
                          <Play className="h-8 w-8 text-primary-600 fill-primary-600" />
                        </div>
                      </button>
                      {video.duration_seconds && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                          <Clock className="h-3 w-3" />
                          {formatDuration(video.duration_seconds)}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              
              {/* Video Info */}
              <div className="p-4 bg-white flex-1 flex flex-col">
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 min-h-[2.5rem]">
                  {video.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-auto">
                  {video.channel_title && (
                    <span className="truncate flex-1 mr-2">{video.channel_title}</span>
                  )}
                  {video.view_count && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Eye className="h-3 w-3" />
                      <span>{video.view_count.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                {isPlaying && (
                  <button
                    onClick={() => setPlayingVideo(null)}
                    className="mt-3 w-full text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    Stop Video
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
}
