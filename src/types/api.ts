export interface Section {
  id: string;
  title: string;
  type: string;
  data: unknown;
}

export interface Attraction {
  id: number;
  name: string;
  slug: string;
  city_id: number;
  city_name?: string;
  rating: number | null;
  review_count: number | null;
  lat: number;
  lng: number;
  place_id?: string | null;
  is_active: boolean;
  created_at: string;
  cards?: Record<string, unknown> | null;
  sections?: Record<string, unknown> | null;
  cards_available?: string[];
  widgets?: {
    primary_html?: string | null;
    secondary_html?: string | null;
  } | null;
}

export interface City {
  id: number;
  name: string;
  slug: string;
  country: string;
  attraction_count: number;
  lat?: number | null;
  lng?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
  rating?: number | null;
}

export interface CityDetail extends City {
  // Additional city detail properties can be added here
}

export interface AttractionSummary {
  id: number;
  name: string;
  slug: string;
  city_id: number;
  city?: string;
  average_rating: number | null;
  total_reviews: number | null;
  latitude: number;
  longitude: number;
  place_id?: string | null;
  is_active: boolean;
  created_at: string;
  hero_image?: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface SearchResults {
  cities: City[];
  attractions: Attraction[] | AttractionSummary[];
  stories: unknown[];
}

export interface CountryOverview {
  name: string;
  code?: string;
  region?: string;
  latitude?: number | null;
  longitude?: number | null;
  citiesCount?: number;
  attractionsCount?: number;
  mostVisitedCity?: string;
}
