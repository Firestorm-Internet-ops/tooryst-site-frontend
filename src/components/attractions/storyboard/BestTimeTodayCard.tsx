'use client';

import { useMemo } from 'react';
import tzLookup from 'tz-lookup';
import { BestTimeCard } from '@/types/attraction-page';

interface VisitorInfo {
  opening_hours?: Array<{
    day: string;
    is_closed: boolean;
    open_time?: string | null;
    close_time?: string | null;
  }>;
}

interface BestTimeTodayCardProps {
  bestTime?: BestTimeCard | null;
  name: string;
  timezone?: string;
  latitude?: number | null;
  longitude?: number | null;
  visitorInfo?: VisitorInfo | null;
}

function getCrowdStyle(level?: number | null, label?: string | null) {
  // First, try to use the label string if provided
  if (label) {
    const labelLower = label.toLowerCase();
    // Use the original label text, just determine color based on content
    if (labelLower.includes('low') || labelLower.includes('quiet')) {
      return {
        label: label,
        bg: 'bg-emerald-500/20',
        text: 'text-emerald-200',
        dot: 'bg-emerald-400',
      };
    }
    if (labelLower.includes('moderate') || labelLower.includes('medium')) {
      return {
        label: label,
        bg: 'bg-amber-300/20',
        text: 'text-amber-200',
        dot: 'bg-amber-300',
      };
    }
    if (labelLower.includes('busy') || labelLower.includes('high')) {
      return {
        label: label, // Show original label like "High" or "Busy"
        bg: 'bg-orange-400/25',
        text: 'text-orange-200',
        dot: 'bg-orange-400',
      };
    }
    if (labelLower.includes('very') || labelLower.includes('extremely')) {
      return {
        label: label,
        bg: 'bg-red-500/25',
        text: 'text-red-200',
        dot: 'bg-red-500',
      };
    }
    // If label doesn't match known patterns, use it as-is with default styling
    return {
      label: label,
      bg: 'bg-slate-700',
      text: 'text-slate-100',
      dot: 'bg-slate-300',
    };
  }

  // Fall back to numeric level if label not available
  if (level == null) {
    return {
      label: 'Unknown',
      bg: 'bg-slate-700',
      text: 'text-slate-100',
      dot: 'bg-slate-300',
    };
  }

  // 0 = closed
  if (level === 0) {
    return {
      label: 'Closed',
      bg: 'bg-crowd-closed',
      text: 'text-crowd-closed-text',
      dot: 'bg-crowd-closed-dot',
    };
  }

  // 1-30 = low green
  if (level <= 30) {
    return {
      label: 'Low',
      bg: 'bg-crowd-low',
      text: 'text-crowd-low-text',
      dot: 'bg-crowd-low-dot',
    };
  }

  // 31-60 = medium yellow
  if (level <= 60) {
    return {
      label: 'Moderate',
      bg: 'bg-crowd-moderate',
      text: 'text-crowd-moderate-text',
      dot: 'bg-crowd-moderate-dot',
    };
  }

  // 61-80 = high bright orange
  if (level <= 80) {
    return {
      label: 'High',
      bg: 'bg-crowd-high',
      text: 'text-crowd-high-text',
      dot: 'bg-crowd-high-dot',
    };
  }

  // 81-100 = peak red
  return {
    label: 'Peak',
    bg: 'bg-crowd-peak',
    text: 'text-crowd-peak-text',
    dot: 'bg-crowd-peak-dot',
  };
}

function calculateIsOpenNow(
  timezone?: string,
  openingTime?: string | null,
  closingTime?: string | null
): boolean {
  if (!timezone || !openingTime || !closingTime) {
    return false;
  }

  try {
    // Get current time in the venue's timezone using a more reliable method
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    
    // Format as HH:MM string directly
    const timeString = formatter.format(now);
    const [currentHour, currentMinute] = timeString.split(':').map(Number);
    const currentTimeMinutes = currentHour * 60 + currentMinute;

    // Parse opening and closing times (format: "HH:MM")
    const [openHour, openMinute] = openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = closingTime.split(':').map(Number);

    const openTimeMinutes = openHour * 60 + openMinute;
    const closeTimeMinutes = closeHour * 60 + closeMinute;

    // Check if current time is within opening hours
    return currentTimeMinutes >= openTimeMinutes && currentTimeMinutes < closeTimeMinutes;
  } catch (error) {
    console.warn('Error calculating opening status:', error);
    return false;
  }
}

export function BestTimeTodayCard({ bestTime, name, timezone, latitude, longitude, visitorInfo }: BestTimeTodayCardProps) {
  if (!bestTime) return null;

  // Get current day name in the city's timezone
  const dayName = useMemo(() => {
    let tz = timezone;
    
    if (!tz && latitude != null && longitude != null) {
      try {
        tz = tzLookup(latitude, longitude);
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
  }, [timezone, latitude, longitude]);

  // Get opening hours from visitor info for today
  const todayOpeningHours = useMemo(() => {
    if (!visitorInfo?.opening_hours) return null;
    return visitorInfo.opening_hours.find(
      (hour) => hour.day.toLowerCase() === dayName?.toLowerCase()
    );
  }, [visitorInfo, dayName]);

  // Calculate if open now - prefer visitor info, fallback to bestTime data
  const { isOpenNow, isOpenText } = useMemo(() => {
    let open = false;
    let text = 'Closed now';
    
    if (todayOpeningHours) {
      if (todayOpeningHours.is_closed) {
        open = false;
        text = 'Closed';
      } else {
        open = calculateIsOpenNow(timezone, todayOpeningHours.open_time, todayOpeningHours.close_time);
        text = open ? 'Open now' : 'Closed now';
      }
    } else {
      // Fallback to bestTime data if visitor info not available
      open = calculateIsOpenNow(timezone, bestTime.today_opening_time, bestTime.today_closing_time);
      text = open ? 'Open now' : 'Closed now';
    }
    
    return { isOpenNow: open, isOpenText: text };
  }, [todayOpeningHours, timezone, bestTime.today_opening_time, bestTime.today_closing_time]);

  // Format best time window: if it's "x-x", show just "x"
  const bestWindow = bestTime.best_time_text
    ? bestTime.best_time_text.replace(/^(\d{1,2}:\d{2})\s*-\s*\1$/, '$1')
    : null;

  const crowd = getCrowdStyle(bestTime.crowd_level_today, bestTime.crowd_level_label_today);

  return (
    <article className="rounded-3xl bg-gradient-to-br from-slate-800/90 via-slate-850/90 to-slate-900/90 border border-slate-700/50 p-4 md:p-5 flex flex-col relative overflow-hidden min-h-[260px] transition-all duration-300 hover:border-primary-700/50 hover:scale-[1.02] group">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-transparent to-purple-500/30 animate-pulse" />
      </div>

      {/* Crowd-related backdrop pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden transition-opacity duration-500 group-hover:opacity-[0.05]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="crowd-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              {/* Person silhouettes representing crowd */}
              <g fill="currentColor" className="text-white">
                {/* Person 1 */}
                <circle cx="12" cy="10" r="3" />
                <path d="M 12 13 L 10 20 L 14 20 Z" />
                <path d="M 10 20 L 8 25 L 12 25 Z" />
                <path d="M 14 20 L 16 25 L 12 25 Z" />

                {/* Person 2 */}
                <circle cx="28" cy="12" r="2.5" />
                <path d="M 28 14.5 L 26 22 L 30 22 Z" />
                <path d="M 26 22 L 24 28 L 28 28 Z" />
                <path d="M 30 22 L 32 28 L 28 28 Z" />

                {/* Person 3 */}
                <circle cx="45" cy="8" r="2.5" />
                <path d="M 45 10.5 L 43 18 L 47 18 Z" />
                <path d="M 43 18 L 41 24 L 45 24 Z" />
                <path d="M 47 18 L 49 24 L 45 24 Z" />

                {/* Person 4 */}
                <circle cx="8" cy="35" r="3" />
                <path d="M 8 38 L 6 45 L 10 45 Z" />
                <path d="M 6 45 L 4 50 L 8 50 Z" />
                <path d="M 10 45 L 12 50 L 8 50 Z" />

                {/* Person 5 */}
                <circle cx="25" cy="38" r="2.5" />
                <path d="M 25 40.5 L 23 48 L 27 48 Z" />
                <path d="M 23 48 L 21 54 L 25 54 Z" />
                <path d="M 27 48 L 29 54 L 25 54 Z" />

                {/* Person 6 */}
                <circle cx="42" cy="42" r="2.5" />
                <path d="M 42 44.5 L 40 52 L 44 52 Z" />
                <path d="M 40 52 L 38 58 L 42 58 Z" />
                <path d="M 44 52 L 46 58 L 42 58 Z" />

                {/* Person 7 */}
                <circle cx="52" cy="32" r="2" />
                <path d="M 52 34 L 50 41 L 54 41 Z" />
                <path d="M 50 41 L 48 47 L 52 47 Z" />
                <path d="M 54 41 L 56 47 L 52 47 Z" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#crowd-pattern)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Row 1: crowd + status chips */}
        <div className="flex items-center justify-between mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Crowd switch-style chip (left) */}
          <div className="inline-flex items-center rounded-full overflow-hidden text-sm md:text-base shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="bg-slate-800 px-3 py-1.5 transition-colors duration-300 hover:bg-slate-700">
              <span className="text-slate-100">Crowd</span>
            </div>
            <div className={`${crowd.bg} px-3 py-1.5 transition-all duration-300`}>
              <span className="text-white font-medium">{crowd.label}</span>
            </div>
          </div>

          {/* Status chip (right) */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs md:text-sm bg-slate-800 text-slate-100 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 hover:bg-slate-700">
            <span
              className={`h-2 w-2 rounded-full ${
                isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
              } transition-all duration-300`}
            />
            <span>{isOpenText}</span>
          </div>
        </div>

        {/* Row 2: big best window in the centre */}
        <div className="text-center flex-1 flex flex-col justify-center py-4 animate-in fade-in zoom-in-95 duration-700 delay-150">
          <p className="text-xs md:text-sm uppercase tracking-wide text-slate-400 mb-3 transition-all duration-300 group-hover:text-slate-300 group-hover:tracking-wider">
            Best time {dayName?.toLowerCase()}
          </p>
          <p className="text-2xl md:text-3xl font-semibold text-slate-50 transition-all duration-300 group-hover:text-white group-hover:scale-105">
            {bestWindow || 'No window available'}
          </p>
        </div>

        {/* Row 3: Read more link */}
        <div className="flex justify-center pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
          <a
            href="#section-best-times"
            onClick={(e) => {
              e.preventDefault();
              const section = document.getElementById('section-best-times');
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
                return;
              }
              window.location.hash = '#section-best-times';
            }}
            className="text-xs md:text-sm text-primary-400 hover:text-primary-300 transition-all duration-300 flex items-center gap-1 group/button hover:gap-2 hover:scale-110 cursor-pointer"
          >
            <span className="transition-all duration-300">Read more</span>
            <span className="group-hover/button:translate-x-1 transition-transform duration-300">→</span>
          </a>
        </div>
      </div>
    </article>
  );
}

