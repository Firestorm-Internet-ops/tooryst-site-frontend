import type { AttractionPageResponse } from '@/types/attraction-page';

// Backend response types (inferred from transformation logic)
interface BackendHeroImage {
  url: string;
  alt_text?: string;
}

interface BackendBestTimeRegular {
  day_int: number;           // 0=Monday, 6=Sunday
  day_name: string;
  is_open_today: boolean;
  today_opening_time?: string | null;
  today_closing_time?: string | null;
  crowd_level_today?: number | null;
  best_time_today?: string | null;
  reason_text?: string | null;
  hourly_crowd_levels?: Array<{
    hour: string;
    value: number;
  }>;
}

interface BackendBestTimeSpecial {
  date: string;              // ISO date string
  day: string;               // day name (note: different field name)
  is_open_today: boolean;
  today_opening_time?: string | null;
  today_closing_time?: string | null;
  crowd_level_today?: number | null;
  best_time_today?: string | null;
  reason_text?: string | null;
  hourly_crowd_levels?: Array<{
    hour: string;
    value: number;
  }>;
}

interface BackendBestTime {
  regular_days: BackendBestTimeRegular[];
  special_days: BackendBestTimeSpecial[];
}

interface BackendWeather {
  date: string;
  temperature_c?: number | null;
  feels_like_c?: number | null;
  min_temperature_c?: number | null;
  max_temperature_c?: number | null;
  summary?: string | null;
  precipitation_mm?: number | null;
  wind_speed_kph?: number | null;
  humidity_percent?: number | null;
  icon_url?: string | null;
}

interface BackendSocialVideo {
  video_id: string;
  title: string;
  thumbnail_url?: string | null;
  channel_title?: string | null;
  watch_url: string;
  view_count?: number | null;
  duration_seconds?: number | null;
}

interface BackendMap {
  latitude: number;
  longitude: number;
  static_map_url?: string | null;
  directions_url?: string | null;
  address?: string | null;
}

interface BackendReviewSummary {
  average_rating?: number | null;
  total_reviews?: number | null;
  summary_text?: string | null;
}

interface BackendReview {
  author_name: string;
  author_url?: string | null;
  author_photo_url?: string | null;
  rating: number;
  text: string;
  time?: string | null;
  source?: string | null;
}

interface BackendReviews {
  summary: BackendReviewSummary;
  reviews?: BackendReview[];
}

interface BackendTip {
  id: number;
  text: string;
  source?: string | null;
  scope?: string | null;
  position?: number | null;
}

interface BackendTips {
  safety: BackendTip[];
  insider: BackendTip[];
}

interface BackendVisitorInfo {
  contact_info?: Record<string, unknown>;
  accessibility_info?: string | null;
  best_season?: string | null;
  opening_hours?: Array<{
    day: string;
    is_closed: boolean;
    open_time?: string | null;
    close_time?: string | null;
  }>;
  short_description?: string | null;
  recommended_duration_minutes?: number | null;
  highlights?: string[];
}

interface BackendWidget {
  widget_primary?: string | null;
  widget_secondary?: string | null;
}

interface BackendNearbyAttraction {
  name: string;
  slug?: string | null;
  link?: string | null;
  distance_km?: number | null;
  distance_text?: string | null;
  walking_time_minutes?: number | null;
  image_url?: string | null;
  rating?: number | null;
  review_count?: number | null;
  vicinity?: string | null;
}

interface BackendAudienceProfile {
  audience_type: string;
  description: string;
  emoji?: string | null;
}

interface BackendAttractionResponse {
  id: number;
  slug: string;
  name: string;
  city?: string;
  country?: string;
  hero_images?: BackendHeroImage[];
  best_time?: BackendBestTime;
  weather?: BackendWeather[];
  social_videos?: BackendSocialVideo[];
  map?: BackendMap;
  reviews?: BackendReviews;
  tips?: BackendTips | null;
  visitor_info?: BackendVisitorInfo;
  widgets?: BackendWidget;
  nearby_attractions?: BackendNearbyAttraction[];
  audience_profiles?: BackendAudienceProfile[];
}

/**
 * Transforms backend attraction response to frontend AttractionPageResponse format
 */
export function transformAttractionData(data: BackendAttractionResponse): AttractionPageResponse {
  return {
    attraction_id: data.id,
    slug: data.slug,
    name: data.name,
    city: data.city,
    country: data.country,
    timezone: (data as any).timezone,
    cards: {
      hero_images: data.hero_images?.length ? {
        images: data.hero_images.map((img) => ({
          url: img.url,
          alt: img.alt_text,
        }))
      } : undefined,

      best_time: (() => {
        if (!data.best_time) return undefined;

        // Get today's date (we'll match against special_days or regular_days)
        const today = new Date();
        const todayIso = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const todayDayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, etc.

        // Convert to ISO 8601 day numbering (0=Monday, 6=Sunday)
        const dayInt = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;

        // First, check special_days for today's specific date
        const specialDay = data.best_time.special_days?.find(day => day.date === todayIso);

        if (specialDay) {
          return {
            is_open_today: specialDay.is_open_today,
            today_local_date: specialDay.date,
            today_opening_hours_local: specialDay.is_open_today
              ? `${specialDay.today_opening_time || 'N/A'} - ${specialDay.today_closing_time || 'N/A'}`
              : 'Closed',
            today_opening_time: specialDay.today_opening_time || null,
            today_closing_time: specialDay.today_closing_time || null,
            crowd_level_today: specialDay.crowd_level_today,
            crowd_level_label_today: null,
            best_time_text: specialDay.best_time_today,
            summary_text: specialDay.reason_text,
          };
        }

        // Otherwise, use regular_days pattern for today's day-of-week
        const regularDay = data.best_time.regular_days?.find(day => day.day_int === dayInt);

        if (regularDay) {
          return {
            is_open_today: regularDay.is_open_today,
            today_local_date: todayIso, // Use today's date even for regular patterns
            today_opening_hours_local: regularDay.is_open_today
              ? `${regularDay.today_opening_time || 'N/A'} - ${regularDay.today_closing_time || 'N/A'}`
              : 'Closed',
            today_opening_time: regularDay.today_opening_time || null,
            today_closing_time: regularDay.today_closing_time || null,
            crowd_level_today: regularDay.crowd_level_today,
            crowd_level_label_today: null,
            best_time_text: regularDay.best_time_today,
            summary_text: regularDay.reason_text,
          };
        }

        return undefined; // No data available
      })(),

      weather: data.weather && data.weather.length > 0 ? data.weather.map((w) => ({
        date_local: w.date,
        temperature_c: w.temperature_c,
        feels_like_c: w.feels_like_c,
        min_temperature_c: w.min_temperature_c,
        max_temperature_c: w.max_temperature_c,
        condition: w.summary,
        precipitation_mm: w.precipitation_mm,
        wind_speed_kph: w.wind_speed_kph,
        humidity_percent: w.humidity_percent,
        icon_url: w.icon_url,
      })) : null,

      social_video: data.social_videos?.[0] ? {
        platform: 'youtube',
        title: data.social_videos[0].title,
        embed_url: `https://www.youtube.com/embed/${data.social_videos[0].video_id}`,
        thumbnail_url: data.social_videos[0].thumbnail_url,
        source_url: data.social_videos[0].watch_url,
      } : null,

      map: data.map ? {
        latitude: data.map.latitude,
        longitude: data.map.longitude,
        static_map_image_url: data.map.static_map_url,
        maps_link_url: data.map.directions_url,
        address: data.map.address,
      } : null,

      review: data.reviews ? {
        overall_rating: data.reviews.summary.average_rating,
        rating_scale_max: 5,
        review_count: data.reviews.summary.total_reviews,
        summary_gemini: data.reviews.summary.summary_text,
        sample_reviews: data.reviews.reviews?.map((r) => ({
          author_name: r.author_name,
          author_url: r.author_url,
          author_photo_url: r.author_photo_url,
          rating: r.rating,
          text: r.text,
          time: r.time,
          source: r.source,
        })),
      } : null,

      tips: data.tips && (data.tips.safety?.length > 0 || data.tips.insider?.length > 0) ? {
        safety: (data.tips.safety || []).map((t) => ({
          id: t.id,
          text: t.text,
          source: t.source,
        })),
        insider: (data.tips.insider || []).map((t) => ({
          id: t.id,
          text: t.text,
          source: t.source,
        })),
      } : null,

      about: data.visitor_info ? {
        short_description: data.visitor_info.short_description,
        long_description: null,
        recommended_duration_minutes: data.visitor_info.recommended_duration_minutes,
        highlights: data.visitor_info.highlights,
      } : null,

      nearby_attraction: data.nearby_attractions?.[0] ? {
        id: 0,
        slug: data.nearby_attractions[0].slug || '',
        name: data.nearby_attractions[0].name,
        distance_km: data.nearby_attractions[0].distance_km,
        walking_time_minutes: data.nearby_attractions[0].distance_km ? Math.round(data.nearby_attractions[0].distance_km * 12) : null,
        hero_image_url: data.nearby_attractions[0].image_url,
      } : null,
    },
    visitor_info: data.visitor_info ? {
      contact_info: data.visitor_info.contact_info || {},
      accessibility_info: data.visitor_info.accessibility_info || null,
      best_season: data.visitor_info.best_season || null,
      opening_hours: data.visitor_info.opening_hours || [],
      short_description: data.visitor_info.short_description || null,
      recommended_duration_minutes: data.visitor_info.recommended_duration_minutes || null,
      highlights: data.visitor_info.highlights || [],
    } : null,
    widgets: data.widgets ? {
      widget_primary: data.widgets.widget_primary || null,
      widget_secondary: data.widgets.widget_secondary || null,
    } : null,
    social_videos: (data.social_videos || []).map((video) => ({
      video_id: video.video_id,
      title: video.title,
      thumbnail_url: video.thumbnail_url || null,
      channel_title: video.channel_title || null,
      watch_url: video.watch_url,
      view_count: video.view_count || null,
      duration_seconds: video.duration_seconds || null,
    })),
    nearby_attractions: (data.nearby_attractions || []).map((nearby) => ({
      name: nearby.name,
      slug: nearby.slug || null,
      link: nearby.link || null,
      distance_km: nearby.distance_km || null,
      distance_text: nearby.distance_text || null,
      walking_time_minutes: nearby.walking_time_minutes || null,
      image_url: nearby.image_url || null,
      rating: nearby.rating || null,
      review_count: nearby.review_count || null,
      vicinity: nearby.vicinity || null,
    })),
    audience_profiles: (data.audience_profiles || []).map((profile) => ({
      audience_type: profile.audience_type,
      description: profile.description,
      emoji: profile.emoji || null,
    })),
    best_time: [
      // Map regular days (Mon-Sun patterns)
      ...(data.best_time?.regular_days || []).map((day) => ({
        date: null,  // Regular days don't have specific dates
        day_int: day.day_int,
        day_name: day.day_name,
        day_type: 'regular' as const,
        is_open_today: day.is_open_today,
        today_opening_time: day.today_opening_time || null,
        today_closing_time: day.today_closing_time || null,
        crowd_level_today: day.crowd_level_today ?? null,
        best_time_today: day.best_time_today || null,
        reason_text: day.reason_text || null,
        hourly_crowd_levels: (day.hourly_crowd_levels || [])
          .filter((hour) => hour.hour && hour.value !== null)
          .map((hour) => ({
            hour: hour.hour,
            time: hour.hour,
            value: hour.value ?? null,
          })),
      })),
      // Map special days (specific dates)
      ...(data.best_time?.special_days || []).map((day) => ({
        date: day.date,
        day_int: null,  // Special days may not have day_int
        day_name: day.day,  // Note: field is 'day' not 'day_name'
        day_type: 'special' as const,
        is_open_today: day.is_open_today,
        today_opening_time: day.today_opening_time || null,
        today_closing_time: day.today_closing_time || null,
        crowd_level_today: day.crowd_level_today ?? null,
        best_time_today: day.best_time_today || null,
        reason_text: day.reason_text || null,
        hourly_crowd_levels: (day.hourly_crowd_levels || [])
          .filter((hour) => hour.hour && hour.value !== null)
          .map((hour) => ({
            hour: hour.hour,
            time: hour.hour,
            value: hour.value ?? null,
          })),
      })),
    ],
  };
}