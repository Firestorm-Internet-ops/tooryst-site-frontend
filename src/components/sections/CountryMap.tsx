'use client';

import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { Card } from '@/components/ui/Card';

type CityMarker = {
  name: string;
  slug: string;
  lat: number;
  lng: number;
  attractionCount?: number;
};

type AttractionMarker = {
  name: string;
  slug: string;
  lat: number;
  lng: number;
  rating?: number | null;
};

interface CountryMapProps {
  country: {
    name: string;
    lat?: number | null;
    lng?: number | null;
  };
  cities?: CityMarker[];
  attractions?: AttractionMarker[];
  onCityClick?: (slug: string) => void;
  onAttractionClick?: (slug: string) => void;
}

const cityIcon = L.divIcon({
  className: 'city-marker-icon',
  html: `<div style="
        width: 28px;
        height: 28px;
        border-radius: 14px;
        background: #2563EB;
        color: white;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
      ">C</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const attractionIcon = L.divIcon({
  className: 'attraction-marker-icon',
  html: `<div style="
        width: 16px;
        height: 16px;
        border-radius: 8px;
        background: #F97316;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(249, 115, 22, 0.4);
      "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapBounds({ coordinates }: { coordinates: Array<[number, number]> }) {
  const map = useMap();

  React.useEffect(() => {
    if (!coordinates.length) {
      return;
    }
    const bounds = L.latLngBounds(coordinates);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [coordinates, map]);

  return null;
}

function ZoomWatcher({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });

  React.useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}

export function CountryMap({
  country,
  cities = [],
  attractions = [],
  onCityClick,
  onAttractionClick,
}: CountryMapProps) {
  const center: [number, number] = [
    country.lat ?? 0,
    country.lng ?? 0,
  ];

  const bounds = React.useMemo(() => {
    const points: Array<[number, number]> = [];

    cities.forEach((city) => {
      if (typeof city.lat === 'number' && typeof city.lng === 'number') {
        points.push([city.lat, city.lng]);
      }
    });

    attractions.forEach((spot) => {
      if (typeof spot.lat === 'number' && typeof spot.lng === 'number') {
        points.push([spot.lat, spot.lng]);
      }
    });

    if (!points.length && typeof country.lat === 'number' && typeof country.lng === 'number') {
      points.push([country.lat, country.lng]);
    }

    return points;
  }, [cities, attractions, country.lat, country.lng]);

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const [zoomLevel, setZoomLevel] = React.useState(6);

  React.useEffect(() => {
    if (!containerRef.current || isVisible) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <Card className="p-0 overflow-hidden">
      <div
        ref={containerRef}
        className="h-[500px] w-full"
        role="region"
        aria-label={`Country map for ${country.name}`}
      >
        {isVisible ? (
          <MapContainer
            center={center}
            zoom={6}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {bounds.length > 0 && <MapBounds coordinates={bounds} />}
            <ZoomWatcher onZoomChange={setZoomLevel} />

            {cities.map((city) => {
              if (typeof city.lat !== 'number' || typeof city.lng !== 'number') {
                return null;
              }
              return (
                <Marker
                  key={`city-${city.slug}`}
                  position={[city.lat, city.lng]}
                  icon={cityIcon}
                  eventHandlers={{
                    click: () => onCityClick?.(city.slug),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{city.name}</p>
                      {typeof city.attractionCount === 'number' && (
                        <p>{city.attractionCount} attractions</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {attractions.map((spot) => {
              if (typeof spot.lat !== 'number' || typeof spot.lng !== 'number') {
                return null;
              }
              return (
                <Marker
                  key={`attraction-${spot.slug}`}
                  position={[spot.lat, spot.lng]}
                  icon={attractionIcon}
                  eventHandlers={{
                    click: () => onAttractionClick?.(spot.slug),
                  }}
                >
                  {/* Show name label when zoomed in close enough */}
                  {zoomLevel >= 11 && (
                    <Tooltip
                      permanent
                      direction="top"
                      offset={[0, -4]}
                      className="!bg-white !text-gray-900 !border !border-gray-200 !rounded-full !px-2 !py-0.5 !text-[11px]"
                    >
                      {spot.name}
                    </Tooltip>
                  )}
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">{spot.name}</p>
                      {typeof spot.rating === 'number' && (
                        <p>{spot.rating.toFixed(1)} ★</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Loading map...
          </div>
        )}
      </div>
      <div className="mt-3 space-y-3">
        {cities.length > 0 && (
          <div>
            <p className="text-xs uppercase text-gray-500 mb-1">Cities</p>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <button
                  key={`keyboard-city-${city.slug}`}
                  type="button"
                  onClick={() => onCityClick?.(city.slug)}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-primary-300 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {attractions.length > 0 && (
          <div>
            <p className="text-xs uppercase text-gray-500 mb-1">Attractions</p>
            <div className="flex flex-wrap gap-2">
              {attractions.map((spot) => (
                <button
                  key={`keyboard-attraction-${spot.slug}`}
                  type="button"
                  onClick={() => onAttractionClick?.(spot.slug)}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:border-primary-300 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                >
                  {spot.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

