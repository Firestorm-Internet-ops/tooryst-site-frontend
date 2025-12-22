// Types matching the STORYBOARD_PAGE_API.md specification

export type HeroImage = {
  url: string;
  alt?: string;
  position?: number;
};

export type BestTimeCard = {
  is_open_today: boolean;
  today_local_date: string;
  today_opening_hours_local: string | null;
  today_opening_time: string | null;
  today_closing_time: string | null;
  crowd_level_today?: number | null;
  crowd_level_label_today?: string | null;
  best_time_text?: string | null;
  summary_text?: string | null;
};

export type WeatherCard = {
  date_local: string;
  temperature_c?: number | null;
  feels_like_c?: number | null;
  min_temperature_c?: number | null;
  max_temperature_c?: number | null;
  condition?: string | null;
  precipitation_mm?: number | null;
  wind_speed_kph?: number | null;
  humidity_percent?: number | null;
  icon_url?: string | null;
} | null;

export type SocialVideoCard = {
  platform: string;
  title: string;
  embed_url: string;
  thumbnail_url?: string | null;
  source_url?: string | null;
} | null;

export type MapCard = {
  latitude: number;
  longitude: number;
  static_map_image_url?: string | null;
  maps_link_url?: string | null;
  address?: string | null;
} | null;

export type ReviewSample = {
  author_name: string;
  author_url?: string | null;
  author_photo_url?: string | null;
  rating: number;
  text: string;
  time?: string | null;
  source?: string | null;
};

export type ReviewCard = {
  overall_rating?: number | null;
  rating_scale_max: number;
  review_count?: number | null;
  summary_gemini?: string | null;
  sample_reviews?: ReviewSample[];
} | null;

export type Tip = {
  id: number;
  text: string;
  source?: string | null;
};

export type TipsCard = {
  safety: Tip[];
  insider: Tip[];
} | null;

export type AboutCard = {
  short_description?: string | null;
  long_description?: string | null;
  recommended_duration_minutes?: number | null;
  highlights?: string[];
} | null;

export type NearbyAttractionCard = {
  id: number;
  slug: string;
  name: string;
  distance_km?: number | null;
  walking_time_minutes?: number | null;
  hero_image_url?: string | null;
} | null;

export type AttractionCards = {
  hero_images?: { images: HeroImage[] };
  best_time?: BestTimeCard;
  weather?: WeatherCard | WeatherCard[];
  social_video?: SocialVideoCard;
  map?: MapCard;
  review?: ReviewCard;
  tips?: TipsCard;
  about?: AboutCard;
  nearby_attraction?: NearbyAttractionCard;
};

export type VisitorInfo = {
  contact_info?: {
    email?: { url?: string; value?: string };
    phone?: { url?: string; value?: string };
    website?: { url?: string; value?: string };
  };
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
} | null;

export type Widgets = {
  widget_primary?: string | null;
  widget_secondary?: string | null;
} | null;

export type SocialVideo = {
  video_id: string;
  title: string;
  thumbnail_url?: string | null;
  channel_title?: string | null;
  watch_url?: string;
  view_count?: number | null;
  duration_seconds?: number | null;
};

export type NearbyAttraction = {
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
};

export type AudienceProfile = {
  audience_type: string;
  description: string;
  emoji?: string | null;
};

export type BestTimeDay = {
  date: string | null;           // null for regular days
  day_int?: number | null;       // 0-6 for regular days, null for special
  day_name: string;
  day_type?: 'regular' | 'special';  // NEW: distinguish type
  is_open_today: boolean;
  today_opening_time?: string | null;
  today_closing_time?: string | null;
  crowd_level_today?: number | null;
  best_time_today?: string | null;
  reason_text?: string | null;
  hourly_crowd_levels?: Array<{
    hour: string;
    time: string;
    value: number | null;
  }>;
};

export type AttractionPageResponse = {
  attraction_id: number;
  slug: string;
  name: string;
  city?: string;
  country?: string;
  timezone?: string;
  cards: AttractionCards;
  visitor_info?: VisitorInfo | null;
  widgets?: Widgets | null;
  social_videos?: SocialVideo[];
  nearby_attractions?: NearbyAttraction[];
  audience_profiles?: AudienceProfile[];
  best_time?: BestTimeDay[];
};

