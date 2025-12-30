/**
 * Google Analytics utility functions
 * Provides type-safe event tracking and pageview functions
 */

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer: Record<string, any>[];
  }
}

export interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent({ action, category, label, value }: GAEvent) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

/**
 * Track a page view in Google Analytics
 */
export function trackPageView(url: string, title?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
      page_location: url,
      page_title: title,
    });
  }
}

/**
 * Track search events
 */
export function trackSearch(searchTerm: string, resultCount?: number) {
  trackEvent({
    action: 'search',
    category: 'engagement',
    label: searchTerm,
    value: resultCount,
  });
}

/**
 * Track attraction views
 */
export function trackAttractionView(attractionName: string, cityName: string) {
  trackEvent({
    action: 'view_attraction',
    category: 'content',
    label: `${attractionName} - ${cityName}`,
  });
}

/**
 * Track city views
 */
export function trackCityView(cityName: string, countryName: string) {
  trackEvent({
    action: 'view_city',
    category: 'content',
    label: `${cityName}, ${countryName}`,
  });
}

/**
 * Track map interactions
 */
export function trackMapInteraction(action: 'zoom' | 'pan' | 'marker_click', location?: string) {
  trackEvent({
    action: `map_${action}`,
    category: 'interaction',
    label: location,
  });
}

/**
 * Track share events
 */
export function trackShare(method: string, contentType: string, contentId: string) {
  trackEvent({
    action: 'share',
    category: 'engagement',
    label: `${method} - ${contentType} - ${contentId}`,
  });
}

/**
 * Track navigation events
 */
export function trackNavigation(destination: string, source?: string) {
  trackEvent({
    action: 'navigate',
    category: 'navigation',
    label: source ? `${source} -> ${destination}` : destination,
  });
}