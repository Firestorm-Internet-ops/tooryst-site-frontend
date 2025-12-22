'use client';

import { useEffect, useRef } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { AttractionPageResponse } from '@/types/attraction-page';
import { SectionShell } from './SectionShell';
import { config } from '@/lib/config';

interface MapSectionProps {
  data: AttractionPageResponse;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ['places'];

export function AttractionMapSection({ data }: MapSectionProps) {
  const map = data.cards.map;
  const mapRef = useRef<HTMLDivElement>(null);
  const directionsRef = useRef<HTMLDivElement>(null);

  // Use the same useLoadScript hook as CityMap to prevent duplicate script loading
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: config.googleMapsApiKey || '',
    libraries: GOOGLE_MAPS_LIBRARIES,
    id: 'google-map-script', // Same ID as CityMap
    version: 'weekly',
  });

  if (!map || !map.latitude || !map.longitude) return null;

  const mapsUrl = map.maps_link_url || `https://www.google.com/maps/dir/?api=1&destination=${map.latitude},${map.longitude}`;

  useEffect(() => {
    if (!isLoaded || loadError) return;

    const initializeMap = () => {
      if (!mapRef.current || !directionsRef.current || !window.google) return;

      const google = window.google;
      const destination = { lat: map.latitude, lng: map.longitude };

      // Create map
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: destination,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      // Add marker for destination
      new google.maps.Marker({
        position: destination,
        map: mapInstance,
        title: map.address || 'Attraction',
      });

      // Create directions service and renderer
      const directionsService = new google.maps.DirectionsService();
      const directionsRenderer = new google.maps.DirectionsRenderer({
        map: mapInstance,
        panel: directionsRef.current,
      });

      // Add directions input functionality
      const originInput = document.getElementById('origin-input') as HTMLInputElement;
      if (originInput) {
        const autocomplete = new google.maps.places.Autocomplete(originInput);
        
        originInput.addEventListener('keypress', (e: KeyboardEvent) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            calculateRoute();
          }
        });
      }

      const calculateRoute = () => {
        const origin = (document.getElementById('origin-input') as HTMLInputElement)?.value;
        const travelMode = (document.querySelector('input[name="travel-mode"]:checked') as HTMLInputElement)?.value || 'DRIVING';

        if (!origin) {
          // Try to get user's current location
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userLocation = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                };
                requestDirections(userLocation, travelMode);
              },
              () => {
                alert('Please enter a starting location');
              }
            );
          } else {
            alert('Please enter a starting location');
          }
          return;
        }

        requestDirections(origin, travelMode);
      };

      const requestDirections = (origin: any, travelMode: string) => {
        directionsService.route(
          {
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode[travelMode],
          },
          (result: any, status: any) => {
            if (status === 'OK') {
              directionsRenderer.setDirections(result);
            } else {
              alert('Could not calculate directions: ' + status);
            }
          }
        );
      };

      // Attach to button
      const directionsBtn = document.getElementById('get-directions-btn');
      if (directionsBtn) {
        directionsBtn.onclick = calculateRoute;
      }
    };

    initializeMap();
  }, [isLoaded, loadError, map.latitude, map.longitude, map.address]);

  // Show loading state
  if (!isLoaded) {
    return (
      <SectionShell
        id="map"
        title="Location & Directions"
        subtitle="Find your way to the attraction."
      >
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
          <div className="w-full h-[500px] flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
              <div className="text-gray-600 font-medium">Loading map...</div>
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  // Show error state
  if (loadError) {
    return (
      <SectionShell
        id="map"
        title="Location & Directions"
        subtitle="Find your way to the attraction."
      >
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
          <div className="w-full h-[500px] flex items-center justify-center bg-gray-100">
            <div className="text-center p-6">
              <p className="text-red-600 font-semibold mb-2">Error loading map</p>
              <p className="text-sm text-gray-600">Please try refreshing the page</p>
            </div>
          </div>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell
      id="map"
      title="Location & Directions"
      subtitle="Find your way to the attraction."
    >
      <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
        <div className="flex flex-col lg:flex-row">
          {/* Directions Sidebar */}
          <div className="lg:w-96 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Directions</h3>
            
            {/* From Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">From</label>
              <input
                id="origin-input"
                type="text"
                placeholder="Enter starting location"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty to use your current location</p>
            </div>

            {/* To Input (Read-only) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">To</label>
              <input
                type="text"
                value={map.address || `${map.latitude}, ${map.longitude}`}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-700"
              />
            </div>

            {/* Travel Mode */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">Travel mode</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { mode: 'DRIVING', icon: '🚗', label: 'Drive' },
                  { mode: 'WALKING', icon: '🚶', label: 'Walk' },
                  { mode: 'TRANSIT', icon: '🚇', label: 'Transit' },
                  { mode: 'BICYCLING', icon: '🚴', label: 'Bike' },
                ].map(({ mode, icon, label }) => (
                  <label
                    key={mode}
                    className="flex items-center gap-2 p-3 rounded-xl border-2 border-gray-200 hover:border-primary-300 cursor-pointer transition-all has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50"
                  >
                    <input
                      type="radio"
                      name="travel-mode"
                      value={mode}
                      defaultChecked={mode === 'DRIVING'}
                      className="sr-only"
                    />
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Get Directions Button */}
            <button
              id="get-directions-btn"
              className="w-full py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-primary-700 hover:to-primary-600 transition-all"
            >
              Get Directions
            </button>

            {/* Directions Panel */}
            <div
              ref={directionsRef}
              className="max-h-96 overflow-y-auto text-sm"
              style={{ fontSize: '14px' }}
            />

            {/* Open in Google Maps */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-white text-primary-600 font-semibold rounded-xl border-2 border-primary-200 hover:border-primary-300 hover:bg-primary-50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in Google Maps
            </a>
          </div>

          {/* Map Container */}
          <div className="flex-1">
            <div
              ref={mapRef}
              className="w-full h-[500px] lg:h-[700px] bg-gray-100"
            />
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
