'use client';

import { SocialVideoCard } from '@/types/attraction-page';

interface SocialCardProps {
  social: SocialVideoCard;
}

export function SocialCard({ social }: SocialCardProps) {
  if (!social || !social.embed_url) return null;

  const handleScrollToSocial = () => {
    if (typeof window === 'undefined') return;

    // SectionShell prefixes ids with "section-"
    const section =
      document.getElementById('section-social-videos') ||
      document.getElementById('social-videos');

    if (section) {
      // Account for sticky headers (main header + sections navbar) and a small padding
      const mainHeaderHeight = 64;
      const sectionsNavbarHeight = 72;
      const totalOffset = mainHeaderHeight + sectionsNavbarHeight + 16;

      const elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - totalOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      return;
    }

    // Fallback: set hash so navigation jumps if section exists later
    window.location.hash = '#social-videos';
  };

  return (
    <article 
      className="rounded-3xl bg-gray-50 border border-gray-200 overflow-hidden w-full h-full flex flex-col cursor-pointer hover:border-gray-300 transition-colors"
      onClick={handleScrollToSocial}
    >
      {/* YouTube video - only show on desktop */}
      <div className="relative w-full flex-1 hidden lg:block">
        <iframe
          src={social.embed_url}
          title={social.title || 'Social video'}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
      
      {/* Mobile/Tablet content - show video info and play button */}
      <div className="lg:hidden flex-1 flex flex-col">
        {/* Video thumbnail or placeholder */}
        <div className="relative flex-1 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
          {social.thumbnail_url ? (
            <img 
              src={social.thumbnail_url} 
              alt={social.title || 'Video thumbnail'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg opacity-90 hover:opacity-100 transition-opacity">
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Video info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
            {social.title || 'Social Video'}
          </h3>
          <p className="text-xs text-gray-600 mb-2">
            {social.platform || 'YouTube'}
          </p>
          <p className="text-xs text-primary-600 font-medium">
            Tap to view videos →
          </p>
        </div>
      </div>
    </article>
  );
}

