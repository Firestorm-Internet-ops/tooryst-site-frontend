'use client';

import { useMemo, useState, useEffect } from 'react';
import tzLookup from 'tz-lookup';

import { AttractionPageResponse } from '@/types/attraction-page';
import { SectionShell } from './SectionShell';

interface BestTimesSectionProps {
  data: AttractionPageResponse;
}

function getCrowdColor(level?: number | null): string {
  if (level == null) return 'bg-gray-200';
  if (level <= 25) return 'bg-emerald-500';
  if (level <= 50) return 'bg-amber-500';
  if (level <= 75) return 'bg-orange-500';
  return 'bg-red-500';
}

function formatHour(hour: string): string {
  // Handle formats like "09:00", "9:00", "09", "9"
  if (!hour) return '';
  const parts = hour.split(':');
  const hourNum = parseInt(parts[0], 10);
  if (isNaN(hourNum)) return hour;

  // Format as 24-hour time
  const paddedHour = hourNum.toString().padStart(2, '0');
  return `${paddedHour}${parts[1] ? ':' + parts[1] : ':00'}`;
}

function getCurrentHour(): number {
  const now = new Date();
  return now.getHours();
}

export function BestTimesSection({ data }: BestTimesSectionProps) {
  const bestTimeDays = data.best_time || [];
  const [currentHour, setCurrentHour] = useState<number | null>(() => getCurrentHour());
  const [isMounted, setIsMounted] = useState(false);

  if (bestTimeDays.length === 0) return null;

  const lat = data.cards?.map?.latitude ?? null;
  const lng = data.cards?.map?.longitude ?? null;
  const timezone = data.timezone;

  // Memoize timezone lookup to avoid recalculating on every render
  const { displayTimezone, dayName } = useMemo(() => {
    let tz = timezone;
    let dayNameStr = '';
    
    if (!tz && lat != null && lng != null) {
      try {
        tz = tzLookup(lat, lng);
        dayNameStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(new Date());
      } catch {
        // Use default
      }
    } else if (tz) {
      try {
        dayNameStr = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long' }).format(new Date());
      } catch {
        // Use default
      }
    }
    
    return { displayTimezone: tz, dayName: dayNameStr };
  }, [timezone, lat, lng]);

  // Get current hour in the venue's timezone
  useEffect(() => {
    setIsMounted(true);
    if (displayTimezone) {
      try {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: displayTimezone,
          hour: '2-digit',
          hour12: false,
        });
        const timeStr = formatter.format(now);
        const hour = parseInt(timeStr, 10);
        setCurrentHour(hour);
      } catch {
        setCurrentHour(getCurrentHour());
      }
    } else {
      setCurrentHour(getCurrentHour());
    }
  }, [displayTimezone]);

  // Match by day_name instead of date to ensure we get the correct day
  const today = bestTimeDays.find((day) => day.day_name?.toLowerCase() === dayName?.toLowerCase()) || bestTimeDays[0];

  // Get closing time from visitor info for today
  const todayOpeningHours = data.visitor_info?.opening_hours?.find(
    (hour) => hour.day.toLowerCase() === dayName?.toLowerCase()
  );
  const closingTimeStr = todayOpeningHours?.close_time;
  
  // Parse closing time to get hour (e.g., "18:00" -> 18)
  const closingHour = closingTimeStr ? parseInt(closingTimeStr.split(':')[0], 10) : null;

  // Filter hourly data to only show hours up to closing time
  let hourlyData = today?.hourly_crowd_levels || [];
  if (closingHour !== null) {
    hourlyData = hourlyData.filter((hourly) => {
      const hourNum = parseInt(hourly.hour?.split(':')[0] || '0', 10);
      return hourNum < closingHour;
    });
  }
  
  // Format best time span - use the correct day's data
  const bestTimeSpan = today?.best_time_today 
    ? today.best_time_today.replace(/^(\d{1,2}:\d{2})\s*-\s*\1$/, '$1')
    : null;
  
  // Get reason text from the correct day
  const reasonText = today?.reason_text;

  // Find max crowd level for chart scaling
  const maxCrowdLevel = hourlyData.length > 0
    ? Math.max(...hourlyData.map((h) => {
        const val = h.value ?? 0;
        return typeof val === 'string' ? parseFloat(val) || 0 : val || 0;
      }), 100)
    : 100;

  return (
    <SectionShell
      id="best-times"
      title={`Best times to visit ${data.name}`}
      subtitle={`${dayName}'s crowd patterns and optimal visit windows.`}
    >
      <div className="space-y-6 flex flex-col h-full">
        {/* Best Time Span and Text */}
        <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-blue-50 border border-primary-100 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              {bestTimeSpan && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-primary-700 uppercase tracking-wide mb-2">
                    Best Time {dayName}
                  </p>
                  <p className="text-2xl font-bold text-primary-900">
                    {bestTimeSpan}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {reasonText && (
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {reasonText}
              </p>
            </div>
          )}
          
          {/* Opening Hours Info */}
          {todayOpeningHours && !todayOpeningHours.is_closed && (
            <div className="mt-4 pt-4 border-t border-primary-200">
              <p className="text-xs text-primary-700 font-medium">
                <span className="font-semibold">{todayOpeningHours.open_time}</span> - <span className="font-semibold">{todayOpeningHours.close_time}</span>
              </p>
            </div>
          )}
        </div>

        {/* Hourly Crowd Level Chart - Only for Today */}
        {hourlyData.length > 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Hourly Crowd Levels
                  </h3>
                  <p className="text-sm text-gray-600">
                    {dayName || today?.day_name}'s expected crowd levels throughout the day
                  </p>
                </div>
                {displayTimezone && (
                  <div className="text-xs sm:text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg whitespace-nowrap">
                    <span className="font-medium">Timezone:</span> {displayTimezone}
                  </div>
                )}
              </div>
            </div>

            {/* Bar Chart - Time on X-axis, bars vertical */}
            <div className="space-y-4 overflow-x-auto" role="img" aria-label={`Hourly crowd levels chart showing crowd percentages throughout the day${closingHour ? ` until closing at ${formatHour(`${closingHour}:00`)}` : ''}`}>
              {/* Chart Container */}
              <div className="flex items-end gap-1 sm:gap-2 md:gap-3 min-w-min sm:min-w-full">
                {/* Y-axis scale - Hidden on mobile, shown on sm+ */}
                <div className="hidden sm:flex flex-col justify-between h-48 sm:h-56 md:h-64 pr-2 sm:pr-3 border-r border-gray-200 flex-shrink-0" aria-hidden="true">
                  <span className="text-xs text-gray-500 font-medium">100%</span>
                  <span className="text-xs text-gray-500 font-medium">75%</span>
                  <span className="text-xs text-gray-500 font-medium">50%</span>
                  <span className="text-xs text-gray-500 font-medium">25%</span>
                  <span className="text-xs text-gray-500 font-medium">0%</span>
                </div>

                {/* Bars Container */}
                <div className="flex-1 min-w-0">
                  {/* Bars Row - Fixed height container */}
                  <div
                    className="relative flex items-end gap-0.5 sm:gap-1 md:gap-2 mb-6 sm:mb-8"
                    style={{ height: '160px', minHeight: '160px' }}
                    role="group"
                    aria-label="Crowd level bars"
                  >
                    {hourlyData.map((hourly, idx) => {
                      const rawLevel = hourly.value ?? 0;
                      const level = typeof rawLevel === 'string' ? parseFloat(rawLevel) || 0 : rawLevel || 0;
                      const percentage = maxCrowdLevel > 0 ? (level / maxCrowdLevel) * 100 : 0;
                      const barColor = getCrowdColor(level);
                      const barHeight = `${Math.min(percentage, 100)}%`;
                      const timeLabel = formatHour(hourly.hour || '');
                      const hourNum = parseInt(hourly.hour?.split(':')[0] || '0', 10);
                      const isCurrentHour = currentHour === hourNum;

                      return (
                        <div
                          key={idx}
                          className="flex-1 h-full flex flex-col items-center justify-end"
                          role="img"
                          aria-label={`At ${timeLabel}, crowd level is ${level}%${isCurrentHour ? ' (current time)' : ''}`}
                          tabIndex={0}
                        >
                          {/* Bar Container - Full height, aligned to bottom */}
                          <div className="relative w-full h-full flex flex-col justify-end">
                            {/* Colored Bar - Starts from bottom (0%) */}
                            <div
                              className={`w-full ${barColor} transition-all duration-500 rounded-t flex items-start justify-center pt-0.5 sm:pt-1 relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                isCurrentHour ? 'animate-pulse opacity-80' : ''
                              }`}
                              style={{ height: barHeight, minHeight: level > 0 ? '2px' : '0' }}
                              tabIndex={-1}
                              aria-hidden="true"
                            >
                              {percentage > 12 && (
                                <span className="text-xs font-semibold text-white drop-shadow" aria-hidden="true">
                                  {level}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* X-axis Time Labels */}
                  <div className="flex items-start gap-0.5 sm:gap-1 md:gap-2" aria-hidden="true">
                    {hourlyData.map((hourly, idx) => (
                      <div key={idx} className="flex-1 text-center min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                          {formatHour(hourly.hour || '')}
                        </p>
                      </div>
                    ))}
                    {closingHour !== null && (
                      <div className="flex-shrink-0 text-center">
                        <p className="text-xs sm:text-sm font-bold text-red-600">
                          {formatHour(`${closingHour}:00`)}
                        </p>
                        <p className="text-xs text-red-500 font-medium">Closes</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Closing Time Indicator */}
              {closingHour !== null && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></div>
                  <p className="text-sm text-red-700">
                    <span className="font-semibold">Closes at {formatHour(`${closingHour}:00`)}</span> - Graph shows crowd levels until closing time
                  </p>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-emerald-500"></div>
                  <span>Low (0-25%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-amber-500"></div>
                  <span>Moderate (26-50%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-orange-500"></div>
                  <span>Busy (51-75%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded bg-red-500"></div>
                  <span>Very Busy (76-100%)</span>
                </div>
              </div>
              {isMounted && currentHour !== null && (
                <div className="mt-3 text-center text-xs sm:text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-blue-400"></span>
                    Current time: {formatHour(`${currentHour}:00`)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SectionShell>
  );
}

