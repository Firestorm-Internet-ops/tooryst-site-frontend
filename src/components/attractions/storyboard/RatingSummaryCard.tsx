'use client';

import { ReviewCard } from '@/types/attraction-page';

interface RatingSummaryCardProps {
  review?: ReviewCard | null;
}

function formatSummary(text: string): string {
  if (!text) return '';
  // Trim leading whitespace, then capitalize the first alphabetical character
  const trimmed = text.trimStart();
  const firstCharIndex = trimmed.search(/[A-Za-z]/);
  if (firstCharIndex === -1) return trimmed;
  return (
    trimmed.slice(0, firstCharIndex) +
    trimmed.charAt(firstCharIndex).toUpperCase() +
    trimmed.slice(firstCharIndex + 1)
  );
}

export function RatingSummaryCard({ review }: RatingSummaryCardProps) {
  return (
    <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/95 via-slate-950/95 to-slate-950/95 border border-slate-800/50 p-4 md:p-5 flex flex-col gap-3 min-h-[260px] h-full transition-all duration-300 hover:border-amber-700/30 hover:scale-[1.02] group">
      {/* Decorative backdrop */}
      <div className="pointer-events-none absolute inset-0">
        {/* Soft gradient glow from top-left */}
        <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-amber-400/20 blur-3xl transition-all duration-500 group-hover:bg-amber-400/30 group-hover:blur-2xl" />
        {/* Deep vignette */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-950/70 to-slate-950" />
        {/* Rating pattern overlay */}
        <div className="absolute inset-0 opacity-[0.14] mix-blend-screen transition-opacity duration-500 group-hover:opacity-[0.18]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="rating-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="4" cy="4" r="1.4" className="text-slate-400" fill="currentColor" />
                <circle cx="18" cy="10" r="1.4" className="text-slate-500" fill="currentColor" />
                <circle cx="10" cy="20" r="1.4" className="text-slate-700" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#rating-dots)" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-900 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:scale-110 group-hover:bg-amber-300">
            <span className="text-xl font-semibold">
              {review?.overall_rating != null ? review.overall_rating.toFixed(1) : '–'}
            </span>
          </div>
          <div className="transition-all duration-300 group-hover:scale-105">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-300 group-hover:text-slate-200 transition-colors duration-300">
              Traveler rating
            </p>
            <p className="text-xs text-slate-300">
              Out of <span className="font-medium">{review?.rating_scale_max || 5}</span>
            </p>
          </div>
        </div>
        {typeof review?.review_count === 'number' && (
          <div className="text-right transition-all duration-300 group-hover:scale-105">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Reviews</p>
            <p className="text-sm font-medium text-slate-100">
              {review.review_count.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {review?.summary_gemini && (
        <p className="relative z-10 text-sm md:text-base text-slate-200/90 animate-in fade-in duration-700 delay-150 transition-colors group-hover:text-slate-100">
          {formatSummary(review.summary_gemini)}
        </p>
      )}

      <div className="relative z-10 mt-auto pt-1 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <button
          onClick={() => {
            const section = document.getElementById('section-reviews');
            if (section) {
              // Account for both headers: main header (64px) + sections navbar (72px) + padding (16px)
              const mainHeaderHeight = 64;
              const sectionsNavbarHeight = 72;
              const totalOffset = mainHeaderHeight + sectionsNavbarHeight + 16;

              const elementPosition = section.getBoundingClientRect().top + window.pageYOffset;
              const offsetPosition = elementPosition - totalOffset;

              window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
              });
            }
          }}
          className="inline-flex items-center text-xs px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 transition-all duration-300 text-slate-100 border border-slate-600/60 hover:scale-105 hover:border-slate-500 cursor-pointer"
        >
          Read traveler reviews
        </button>
      </div>
    </article>
  );
}

