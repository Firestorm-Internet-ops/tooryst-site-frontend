'use client';

import { AttractionPageResponse } from '@/types/attraction-page';
import { SectionShell } from './SectionShell';
import { useState } from 'react';

interface AudienceProfilesSectionProps {
  data: AttractionPageResponse;
}

export function AudienceProfilesSection({ data }: AudienceProfilesSectionProps) {
  const audienceProfiles = data.audience_profiles || [];
  const [activeIndex, setActiveIndex] = useState(0);

  if (audienceProfiles.length === 0) return null;

  const active = audienceProfiles[Math.min(activeIndex, audienceProfiles.length - 1)];

  return (
    <SectionShell
      id="audience-profiles"
      title="Who this is for"
      subtitle="Find out if this attraction matches your travel style."
    >
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 hide-scrollbar">
          {audienceProfiles.map((profile, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-700'
                }`}
              >
                {profile.emoji && (
                  <span className="text-lg" role="img" aria-label={profile.audience_type}>
                    {profile.emoji}
                  </span>
                )}
                <span className="capitalize whitespace-nowrap">
                  {profile.audience_type.replace(/_/g, ' ')}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Tab Content */}
        {active && (
          <article className="rounded-2xl bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100 p-5 md:p-6 shadow-sm">
            <div className="flex items-start gap-4">
              {active.emoji && (
                <span className="text-4xl flex-shrink-0" role="img" aria-label={active.audience_type}>
                  {active.emoji}
                </span>
              )}
              <div className="flex-1 space-y-2">
                <h3 className="text-base font-semibold text-gray-900 capitalize">
                  {active.audience_type.replace(/_/g, ' ')}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {active.description}
                </p>
              </div>
            </div>
          </article>
        )}
      </div>
    </SectionShell>
  );
}
