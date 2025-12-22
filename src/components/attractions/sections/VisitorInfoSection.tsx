'use client';

import { useMemo } from 'react';
import tzLookup from 'tz-lookup';
import { AttractionPageResponse } from '@/types/attraction-page';
import { SectionShell } from './SectionShell';
import { Mail, Phone, Globe, Clock, Info, Calendar } from 'lucide-react';

interface VisitorInfoSectionProps {
  data: AttractionPageResponse;
}

export function VisitorInfoSection({ data }: VisitorInfoSectionProps) {
  const visitorInfo = data.visitor_info;

  if (!visitorInfo) return null;

  const contactInfo = visitorInfo.contact_info || {};
  const openingHours = visitorInfo.opening_hours || [];
  const bestSeason = visitorInfo.best_season;
  
  // Get today's day name in the attraction's timezone
  const todayDayName = useMemo(() => {
    let tz = data.timezone;
    
    if (!tz && data.cards?.map?.latitude != null && data.cards?.map?.longitude != null) {
      try {
        tz = tzLookup(data.cards.map.latitude, data.cards.map.longitude);
      } catch {
        // Use default
      }
    }
    
    if (tz) {
      try {
        return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(new Date());
      } catch {
        // Use default
      }
    }
    
    return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  }, [data.timezone, data.cards?.map?.latitude, data.cards?.map?.longitude]);

  return (
    <SectionShell
      id="visitor-info"
      title="Visitor information"
      subtitle="Contact details, accessibility, and opening hours."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left side: Contact & Accessibility */}
        <div className="flex flex-col gap-6 min-h-full">
          {/* Contact Info */}
          {(contactInfo.email || contactInfo.phone || contactInfo.website) && (
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 md:p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-600" />
                Contact
              </h3>
              <div className="space-y-3">
                {contactInfo.email?.value && (
                  <a
                    href={contactInfo.email.url || `mailto:${contactInfo.email.value}`}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Mail className="h-4 w-4 text-blue-500" />
                    {contactInfo.email.value}
                  </a>
                )}
                {contactInfo.phone?.value && (
                  <a
                    href={contactInfo.phone.url || `tel:${contactInfo.phone.value}`}
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-emerald-600 transition-colors"
                  >
                    <Phone className="h-4 w-4 text-emerald-500" />
                    {contactInfo.phone.value}
                  </a>
                )}
                {contactInfo.website?.value && (
                  <a
                    href={contactInfo.website.url || contactInfo.website.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <Globe className="h-4 w-4 text-blue-500" />
                    {contactInfo.website.value}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Accessibility Info */}
          {visitorInfo.accessibility_info && (
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 md:p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-purple-600" />
                Accessibility
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {visitorInfo.accessibility_info}
              </p>
            </div>
          )}

          {/* Best Season */}
          {bestSeason && (
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 border border-gray-200 p-4 md:p-5">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald-600" />
                Best Season
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {bestSeason}
              </p>
            </div>
          )}
        </div>

        {/* Right side: Opening Hours */}
        <div className="flex flex-col gap-6 min-h-full">
          {openingHours.length > 0 && (
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4 md:p-5 flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Opening Hours
              </h3>
              <div className="space-y-2">
                {openingHours.map((hour, idx) => {
                  const isToday = hour.day.toLowerCase() === todayDayName.toLowerCase();
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg border-b border-gray-200 last:border-0 transition-colors ${
                        isToday
                          ? 'bg-primary-50 border-primary-200 border-2 -mx-1'
                          : ''
                      }`}
                    >
                      <span className={`text-sm font-medium ${
                        isToday ? 'text-primary-900' : 'text-gray-900'
                      }`}>
                        {hour.day}
                        {isToday && (
                          <span className="ml-2 text-xs font-semibold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">
                            Today
                          </span>
                        )}
                      </span>
                      {hour.is_closed ? (
                        <span className={`text-sm ${
                          isToday ? 'text-primary-700' : 'text-gray-500'
                        }`}>
                          Closed
                        </span>
                      ) : (
                        <span className={`text-sm font-medium ${
                          isToday ? 'text-primary-900' : 'text-gray-700'
                        }`}>
                          {hour.open_time && hour.close_time
                            ? `${hour.open_time} - ${hour.close_time}`
                            : 'Hours vary'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
}
