'use client';

import * as React from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { Card } from '@/components/ui/Card';
import { AttractionCard } from '@/components/cards/AttractionCard';
import { config } from '@/lib/config';

type AttractionMarker = {
  lat: number;
  lng: number;
  name: string;
  slug: string;
  rating?: number | null;
  firstImageUrl?: string | null;
  city_name?: string;
  review_count?: number | null;
};

interface CityMapProps {
  lat: number | null;
  lng: number | null;
  cityName: string;
  attractions?: AttractionMarker[];
  zoom?: number;
  onMarkerClick?: (slug: string) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const defaultMapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  gestureHandling: 'cooperative' as const,
};

export function CityMap({
  lat,
  lng,
  cityName,
  attractions = [],
  zoom = config.map.defaultZoom,
  onMarkerClick,
}: CityMapProps) {
  const apiKey = config.googleMapsApiKey;
  const scriptId = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      const existing = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (existing && !existing.id) {
        existing.id = 'google-map-script';
      }
    }
    return 'google-map-script';
  }, []);
  const [activeMarker, setActiveMarker] = React.useState<AttractionMarker | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const mapRef = React.useRef<any>(null);

  // Filter and validate attraction markers
  const validMarkers = React.useMemo(() => {
    return attractions.filter(
      (marker) =>
        typeof marker.lat === 'number' &&
        typeof marker.lng === 'number' &&
        !isNaN(marker.lat) &&
        !isNaN(marker.lng) &&
        isFinite(marker.lat) &&
        isFinite(marker.lng)
    );
  }, [attractions]);

  // Calculate center coordinates
  const center = React.useMemo<{ lat: number; lng: number } | null>(() => {
    // Use city coordinates if available
    if (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      isFinite(lat) &&
      isFinite(lng) &&
      lat !== 0 &&
      lng !== 0
    ) {
      return {
        lat,
        lng,
      };
    }
    // Fallback to first attraction if city coordinates not available
    if (validMarkers.length > 0) {
      return {
        lat: validMarkers[0].lat,
        lng: validMarkers[0].lng,
      };
    }
    return null;
  }, [lat, lng, validMarkers]);

  // Calculate dynamic zoom level based on marker bounds
  const calculateZoomLevel = React.useCallback((markers: AttractionMarker[], centerCoords: { lat: number; lng: number } | null) => {
    if (markers.length === 0) return zoom;

    // Calculate bounds from all markers
    let minLat = markers[0].lat;
    let maxLat = markers[0].lat;
    let minLng = markers[0].lng;
    let maxLng = markers[0].lng;

    markers.forEach((marker) => {
      minLat = Math.min(minLat, marker.lat);
      maxLat = Math.max(maxLat, marker.lat);
      minLng = Math.min(minLng, marker.lng);
      maxLng = Math.max(maxLng, marker.lng);
    });

    // Add city center to bounds if available
    if (centerCoords) {
      minLat = Math.min(minLat, centerCoords.lat);
      maxLat = Math.max(maxLat, centerCoords.lat);
      minLng = Math.min(minLng, centerCoords.lng);
      maxLng = Math.max(maxLng, centerCoords.lng);
    }

    // Calculate the span
    const latSpan = maxLat - minLat;
    const lngSpan = maxLng - minLng;

    // Calculate zoom level based on span
    const maxSpan = Math.max(latSpan, lngSpan);
    
    if (maxSpan === 0) return zoom;

    // Empirical formula to convert span to zoom level using config thresholds
    const thresholds = config.map.zoomThresholds;
    let calculatedZoom = thresholds.default;
    
    if (maxSpan > thresholds.veryLarge.span) calculatedZoom = thresholds.veryLarge.zoom;
    else if (maxSpan > thresholds.large.span) calculatedZoom = thresholds.large.zoom;
    else if (maxSpan > thresholds.medium.span) calculatedZoom = thresholds.medium.zoom;
    else if (maxSpan > thresholds.mediumSmall.span) calculatedZoom = thresholds.mediumSmall.zoom;
    else if (maxSpan > thresholds.small.span) calculatedZoom = thresholds.small.zoom;
    else if (maxSpan > thresholds.verySmall.span) calculatedZoom = thresholds.verySmall.zoom;
    else if (maxSpan > thresholds.tiny.span) calculatedZoom = thresholds.tiny.zoom;
    else calculatedZoom = thresholds.default;

    return calculatedZoom;
  }, [zoom]);

  // Update map bounds when markers change
  const handleMapLoad = React.useCallback((map: any) => {
    mapRef.current = map;
    
    if (validMarkers.length > 0 && center) {
      const bounds = new window.google.maps.LatLngBounds();
      
      // Add city center
      bounds.extend(new window.google.maps.LatLng(center.lat, center.lng));
      
      // Add all markers
      validMarkers.forEach((marker) => {
        bounds.extend(new window.google.maps.LatLng(marker.lat, marker.lng));
      });
      
      // Fit bounds with padding from config
      const padding = config.map.boundsPadding;
      map.fitBounds(bounds, padding);
    }
  }, [validMarkers, center]);

  // Deduplicate Google Maps script tags to avoid multiple-load warnings
  React.useEffect(() => {
    const scripts = Array.from(
      document.querySelectorAll('script[src*="maps.googleapis.com/maps/api/js"]')
    );
    if (scripts.length > 1) {
      scripts.slice(1).forEach((s) => s.parentNode?.removeChild(s));
    }
  }, []);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries: ['places'], // Only load necessary libraries
    id: scriptId, // Use consistent script ID to prevent duplicate loads
    version: 'weekly', // Use weekly version for better caching
  });

  // Retry logic for failed loads
  React.useEffect(() => {
    if (loadError && retryCount < config.map.retryLimit && !isRetrying) {
      setIsRetrying(true);
      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        setIsRetrying(false);
        // Remove script and let useLoadScript reload it
        const script = document.getElementById('google-map-script');
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
        // Clear any cached Google Maps objects
        if (window.google && window.google.maps) {
          delete (window as any).google;
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loadError, retryCount, isRetrying]);

  if (!apiKey) {
    return (
      <Card className="p-0 overflow-hidden">
        <div
          className="relative h-96 lg:h-[500px] w-full flex items-center justify-center bg-gray-100"
          role="region"
          aria-label="City map with attraction markers"
        >
          <div className="text-center p-6">
            <p className="text-red-600 font-semibold mb-2">
              Google Maps API Key Required
            </p>
            <p className="text-sm text-gray-600">
              Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local
              file
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Don't render map if no valid coordinates
  if (!center) {
    return (
      <Card className="p-0 overflow-hidden">
        <div
          className="relative h-96 lg:h-[500px] w-full flex items-center justify-center bg-gray-100"
          role="region"
          aria-label={`Map of ${cityName}`}
        >
          <div className="text-center p-6">
            <p className="text-gray-600">
              Map location data not available
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (loadError) {
    return (
      <Card className="p-0 overflow-hidden">
        <div
          className="relative h-96 lg:h-[500px] w-full flex items-center justify-center bg-gray-100"
          role="region"
          aria-label={`Map of ${cityName}`}
        >
          <div className="text-center p-6">
            <p className="text-red-600 font-semibold mb-2">Error loading map</p>
            <p className="text-sm text-gray-600 mb-4">{loadError.message}</p>
            {retryCount < config.map.retryLimit && (
              <button
                onClick={() => {
                  setRetryCount((prev) => prev + 1);
                  setIsRetrying(true);
                  // Remove script and let useLoadScript reload it
                  const script = document.getElementById('google-map-script');
                  if (script && script.parentNode) {
                    script.parentNode.removeChild(script);
                  }
                  // Clear any cached Google Maps objects
                  if (window.google && window.google.maps) {
                    delete (window as any).google;
                  }
                  // Trigger reload by removing and re-adding the script
                  setTimeout(() => {
                    setIsRetrying(false);
                    window.location.reload();
                  }, 100);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="p-0 overflow-hidden">
        <div
          className="relative h-96 lg:h-[500px] w-full flex items-center justify-center bg-gray-100"
          role="region"
          aria-label={`Map of ${cityName}`}
        >
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
            <div className="text-gray-600 font-medium">Loading map...</div>
            {isRetrying && (
              <div className="text-sm text-gray-500 mt-2">Retrying...</div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  const handleMarkerClick = (marker: AttractionMarker) => {
    setActiveMarker(marker);
  };

  const handleCloseCard = () => {
    setActiveMarker(null);
  };

  const handleViewAttraction = (slug: string) => {
    onMarkerClick?.(slug);
    setActiveMarker(null);
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div
        className="relative h-96 lg:h-[500px] w-full"
        role="region"
        aria-label={`Map of ${cityName}`}
      >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={calculateZoomLevel(validMarkers, center)}
            options={defaultMapOptions}
            onLoad={handleMapLoad}
          >
          {validMarkers.map((marker, index) => (
              <Marker
                key={`${marker.slug}-${index}`}
                position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.name}
                onClick={() => handleMarkerClick(marker)}
              />
            ))}
          </GoogleMap>

        {activeMarker && (
          <div className="pointer-events-none absolute left-4 right-4 bottom-4 md:left-4 md:right-auto md:bottom-4 z-10 flex justify-start">
            <div className="pointer-events-auto w-full min-w-[320px] max-w-[90vw] sm:max-w-[400px] md:max-w-sm">
              <AttractionCard
                attraction={{
                  name: activeMarker.name,
                  slug: activeMarker.slug,
                  first_image_url: activeMarker.firstImageUrl ?? null,
                  rating: activeMarker.rating !== null && activeMarker.rating !== undefined 
                    ? Number(activeMarker.rating) 
                    : null,
                  review_count: activeMarker.review_count ?? null,
                  city_name: activeMarker.city_name ?? cityName,
                }}
                variant="popup"
                onView={handleViewAttraction}
                onClose={handleCloseCard}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
