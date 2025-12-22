'use client';

import { useState } from 'react';
import { AttractionPageResponse } from '@/types/attraction-page';
import { SectionShell } from './SectionShell';
import Image from 'next/image';

interface ReviewsSectionProps {
  data: AttractionPageResponse;
}

interface ReviewCardProps {
  review: {
    author_name: string;
    author_photo_url?: string | null;
    author_url?: string | null;
    rating: number;
    text: string;
    time?: string | null;
    source?: string | null;
  };
  index: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function formatReviewTime(timeString?: string | null): string {
  if (!timeString) return '';

  try {
    const reviewDate = new Date(timeString);
    const now = new Date();
    const diffInMs = now.getTime() - reviewDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  } catch {
    return '';
  }
}

function ReviewCard({ review: r, index }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <article
      key={index}
      className="group rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 p-5 md:p-6 shadow-sm hover:shadow-xl hover:border-primary-200 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="flex items-start gap-4 mb-4">
        {r.author_photo_url ? (
          <div className="relative">
            <Image
              src={r.author_photo_url}
              alt={r.author_name}
              width={56}
              height={56}
              className="rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-primary-200 transition-all"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        ) : (
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl ring-2 ring-gray-100 group-hover:ring-primary-200 transition-all">
              {r.author_name.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="mb-2">
            {r.author_url ? (
              <a
                href={r.author_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-gray-900 hover:text-primary-600 transition-colors text-base"
              >
                {r.author_name}
              </a>
            ) : (
              <p className="font-bold text-gray-900 text-base">{r.author_name}</p>
            )}
            <p className="text-xs text-gray-500 mt-0.5">
              {formatReviewTime(r.time)}
              {r.source && r.source !== r.author_name && (
                <span className="inline-flex items-center ml-1">
                  · <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-medium">{r.source}</span>
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StarRating rating={r.rating} />
            <span className="text-sm font-semibold text-gray-700">{r.rating}.0</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -left-2 top-0 text-4xl text-primary-200 font-serif leading-none">"</div>
        <p className={`text-sm text-gray-700 leading-relaxed pl-4 pr-2 transition-all duration-300 ${!isExpanded ? 'line-clamp-6' : ''}`}>
          {r.text}
        </p>
        <div className="absolute -right-2 bottom-0 text-4xl text-primary-200 font-serif leading-none rotate-180">"</div>
      </div>
      
      {r.text.length > 300 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              Show less
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </>
          ) : (
            <>
              Read more
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
      )}
    </article>
  );
}

export function AttractionReviewsSection({ data }: ReviewsSectionProps) {
  const review = data.cards.review;

  if (!review || !review.sample_reviews?.length) return null;

  return (
    <SectionShell
      id="reviews"
      title="What travelers say"
      subtitle="Recent reviews and on-the-ground experiences."
    >
      <div className="space-y-4 md:space-y-6">
        {/* First row - 2 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {review.sample_reviews.slice(0, 2).map((r, idx) => (
            <ReviewCard key={idx} review={r} index={idx} />
          ))}
        </div>

        {/* Second row - 3 cards */}
        {review.sample_reviews.length > 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {review.sample_reviews.slice(2, 5).map((r, idx) => (
              <ReviewCard key={idx + 2} review={r} index={idx + 2} />
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}

