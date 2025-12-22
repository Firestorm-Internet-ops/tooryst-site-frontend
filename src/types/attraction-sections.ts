// Types for sections endpoint response

export interface ReviewItem {
  author_name: string;
  author_url?: string | null;
  author_photo_url?: string | null;
  rating: number;
  text?: string | null;
  time?: string | null;
  source: string;
}

export interface ReviewsSectionContent {
  overall_rating?: number | null;
  rating_scale_max: number;
  total_reviews?: number | null;
  summary?: string | null;
  items: ReviewItem[];
}

export interface BestTimeTab {
  label: string;
  date: string;
  chart_json?: string | null;
  summary?: string | null;
}

export interface BestTimeSectionContent {
  tabs: BestTimeTab[];
  default_tab: string;
}

export interface WidgetSectionContent {
  html?: string | null;
  custom_config?: Record<string, any> | null;
}

export interface MapSectionContent {
  latitude: number;
  longitude: number;
  address?: string | null;
  static_map_url?: string | null;
  directions_url?: string | null;
  zoom_level?: number | null;
}

export interface VisitorInfoItem {
  label: string;
  value: string;
  url?: string | null;
}

export interface OpeningHours {
  day: string;
  open_time?: string | null;
  close_time?: string | null;
  is_closed: boolean;
}

export interface VisitorInfoSectionContent {
  contact_items: VisitorInfoItem[];
  opening_hours: OpeningHours[];
  accessibility_info?: string | null;
  best_season?: string | null;
}

export interface TipItem {
  id: number;
  text: string;
  source?: string | null;
}

export interface TipsSectionContent {
  safety: TipItem[];
  insider: TipItem[];
}

export interface SocialVideoItem {
  id: number;
  platform: string;
  title: string;
  embed_url: string;
  thumbnail_url?: string | null;
  duration_seconds?: number | null;
}

export interface SocialVideosSectionContent {
  items: SocialVideoItem[];
}

export interface NearbyAttractionItem {
  id: number;
  slug?: string | null;
  name: string;
  distance_text?: string | null;
  distance_km?: number | null;
  rating?: number | null;
  user_ratings_total?: number | null;
  review_count?: number | null;
  image_url?: string | null;
  link?: string | null;
  vicinity?: string | null;
  audience_type?: string | null;
  audience_text?: string | null;
}

export interface NearbyAttractionsSectionContent {
  items: NearbyAttractionItem[];
}

export interface AudienceProfileItem {
  audience_type: string;
  description: string;
  emoji?: string | null;
}

export interface AudienceProfileSectionContent {
  items: AudienceProfileItem[];
}

export type SectionContent =
  | BestTimeSectionContent
  | ReviewsSectionContent
  | WidgetSectionContent
  | MapSectionContent
  | VisitorInfoSectionContent
  | TipsSectionContent
  | SocialVideosSectionContent
  | NearbyAttractionsSectionContent
  | AudienceProfileSectionContent;

export interface Section {
  section_type: string;
  title: string;
  subtitle?: string | null;
  layout: string;
  is_visible: boolean;
  order: number;
  content: SectionContent;
}

export interface AttractionSectionsResponse {
  attraction_id: number;
  slug: string;
  name: string;
  city: string;
  country?: string | null;
  sections: Section[];
}

