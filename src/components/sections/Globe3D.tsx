'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Globe from 'three-globe';
import * as THREE from 'three';
import { config } from '@/lib/config';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance } from '@/utils/geo-utils';

interface CityMarker {
  name: string;
  lat?: number;
  lng?: number;
  region?: string;
  slug?: string;
  attractionCount?: number;
  country?: string;
}

interface Globe3DProps {
  cities: CityMarker[];
}

function GlobeScene({
  cities,
  setActiveCities,
  isPaused,
  userPosition,
}: {
  cities: CityMarker[];
  setActiveCities: (cities: CityMarker[]) => void;
  isPaused: boolean;
  userPosition: { latitude: number; longitude: number } | null;
}) {
  const globeRef = useRef<Globe | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const activeCitiesRef = useRef<CityMarker[]>([]);
  const cityVectorsRef = useRef<{ city: CityMarker; vec: THREE.Vector3 }[]>([]);
  const validCitiesRef = useRef<CityMarker[]>([]);
  const { camera } = useThree();

  // Performance optimization: throttle expensive visibility calculations
  const frameCounterRef = useRef(0);
  const CALC_INTERVAL = 5; // Run visibility calculation every 5 frames for responsive updates

  // Reusable Vector3 objects to avoid garbage collection
  const tempVec1 = useRef(new THREE.Vector3()).current;
  const tempVec2 = useRef(new THREE.Vector3()).current;
  const tempVec3 = useRef(new THREE.Vector3()).current;

  const validCities = useMemo(
    () => cities.filter((city) => city.lat != null && city.lng != null),
    [cities]
  );

  useEffect(() => {
    if (!groupRef.current) return;

    // Remove old globe
    if (globeRef.current) {
      groupRef.current.remove(globeRef.current);
      globeRef.current = null;
    }

    const globe = new Globe();
    globeRef.current = globe;

    globe.globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
    globe.showAtmosphere(true);
    globe.atmosphereColor('#60a5fa');
    globe.atmosphereAltitude(0.2);

    // Pins
    globe
      .pointsData(validCities)
      .pointLat((d: any) => d.lat)
      .pointLng((d: any) => d.lng)
      .pointAltitude(() => 0.02)
      .pointColor(() => '#ef4444')
      .pointRadius(() => 0.8);

    // Labels
    globe
      .labelsData(validCities)
      .labelLat((d: any) => d.lat)
      .labelLng((d: any) => d.lng)
      .labelText((d: any) => d.name)
      .labelColor(() => '#ef4444')
      .labelSize(() => 1.5)
      .labelDotRadius(() => 0.4)
      .labelDotOrientation(() => 'right');

    // Align city vectors with three-globe's own projection to avoid drift
    const globeAny = globe as any;
    cityVectorsRef.current = validCities.map((city) => {
      const { x, y, z } = globeAny.getCoords(city.lat!, city.lng!, 0);
      return {
        city,
        vec: new THREE.Vector3(x, y, z),
      };
    });

    groupRef.current.add(globe);

    return () => {
      if (globeRef.current && groupRef.current) {
        groupRef.current.remove(globeRef.current);
        globeRef.current = null;
      }
    };
  }, [validCities]);

  // Update validCities ref for use in useFrame
  useEffect(() => {
    validCitiesRef.current = validCities;
  }, [validCities]);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    // Always rotate smoothly - this is the most important part
    // Only pause if explicitly paused, otherwise keep rotating
    if (!isPaused && globeRef.current) {
      globeRef.current.rotation.y += delta * 0.15; // Slower rotation speed
    }

    // If we have user position, calculate closest cities
    if (userPosition) {
      const validCities = validCitiesRef.current;
      if (!validCities.length) return;

      // Throttle expensive calculations
      frameCounterRef.current++;
      if (frameCounterRef.current % CALC_INTERVAL !== 0) {
        return; // Skip expensive calculations most frames
      }

      const scored: { city: CityMarker; distance: number }[] = [];

      for (const city of validCities) {
        if (!city.lat || !city.lng) continue;
        const distance = calculateDistance(
          userPosition.latitude,
          userPosition.longitude,
          city.lat,
          city.lng
        );
        scored.push({ city, distance });
      }

      const closestCities = scored
        .filter(({ city }) => city.name)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3) // Show only 3 closest cities
        .map(({ city }) => city);

      const prev = activeCitiesRef.current;
      const changed =
        prev.length !== closestCities.length ||
        prev.some((city, idx) => city !== closestCities[idx]);

      if (changed) {
        activeCitiesRef.current = closestCities;

        // Force synchronous React update from Three.js render loop
        flushSync(() => {
          setActiveCities(closestCities);
        });
      }
    } else {
      // Fallback to original visibility-based logic when no user position
      const cityVectors = cityVectorsRef.current;
      if (!cityVectors.length) return;

      // Throttle expensive visibility calculations
      frameCounterRef.current++;
      if (frameCounterRef.current % CALC_INTERVAL !== 0) {
        return; // Skip expensive calculations most frames
      }

      // Compute which cities are most "in front" of the camera
      camera.getWorldPosition(tempVec1); // Reuse tempVec1 for camPos
      camera.getWorldDirection(tempVec2); // Reuse tempVec2 for camDir
      tempVec1.normalize(); // camFromCenter

      const scored: { city: CityMarker; score: number }[] = [];

      for (const { city, vec } of cityVectors) {
        // Reuse tempVec3 for world position calculations
        tempVec3.copy(vec);
        if (globeRef.current) {
          globeRef.current.localToWorld(tempVec3);
        } else {
          groupRef.current.localToWorld(tempVec3);
        }

        // Drop anything on the far side of the globe relative to the camera
        const cityNormal = tempVec3.clone().normalize(); // Need to clone here to keep worldPos
        const facingScore = cityNormal.dot(tempVec1);
        if (facingScore <= 0.05) continue;

        const toCity = tempVec3.clone().sub(camera.position).normalize();
        const alignment = tempVec2.dot(toCity); // 1 means centered in view

        // Blend view alignment with hemisphere facing so near-the-edge cities still count
        const score = alignment * 0.7 + facingScore * 0.3;
        scored.push({ city, score });
      }

      // Require solid visibility to avoid mismatches (e.g., Madrid vs Melbourne)
      const scoreThreshold = 0.55;

      const topCities = scored
        .filter(({ city, score }) => city.name && score > scoreThreshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3) // Show only 3 cities
        .map(({ city }) => city);

      const prev = activeCitiesRef.current;
      const changed =
        prev.length !== topCities.length ||
        prev.some((city, idx) => city !== topCities[idx]);

      if (changed) {
        activeCitiesRef.current = topCities;

        // Force synchronous React update from Three.js render loop
        flushSync(() => {
          setActiveCities(topCities);
        });
      }
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={2} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} />
      <directionalLight position={[-10, -10, 5]} intensity={0.8} />
      <directionalLight position={[0, 0, 10]} intensity={0.6} />
      <pointLight position={[50, 50, 50]} intensity={1} />
    </group>
  );
}

export function Globe3D({ cities }: Globe3DProps) {
  const { position: userPosition, loading: locationLoading, error: locationError } = useGeolocation();
  const [activeCities, setActiveCities] = useState<CityMarker[]>(() =>
    cities.filter(c => c.lat && c.lng && c.name).slice(0, 3)
  );
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Memoize callback to prevent closure issues
  const setActiveCitiesMemo = useCallback((newCities: CityMarker[]) => {
    setActiveCities(newCities);
  }, []);

  // Debug: log when component renders with cities

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isHovered) {
      setIsPaused(true);
    } else {
      // Resume rotation after a short delay
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        setIsPaused(false);
      }, 200); // Slightly longer delay for smoother experience
    }
  }, [isHovered]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="space-y-3">
      <div
        className="relative w-full h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-white border border-blue-100"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Canvas
          className="bg-transparent"
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 300]} fov={45} />
          <GlobeScene
            cities={cities}
            setActiveCities={setActiveCitiesMemo}
            isPaused={isPaused}
            userPosition={userPosition}
          />
          <OrbitControls
            enableZoom
            enablePan={false}
            minDistance={200}
            maxDistance={500}
            autoRotate={false}
          />
        </Canvas>

        {/* Desktop: Card on the right inside globe */}
        {activeCities.length > 0 && (
          <div className="hidden lg:block absolute top-1/2 right-4 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 lg:px-4 lg:py-3 shadow-xl z-10 border border-gray-200/50 w-[200px] lg:w-[240px] max-h-[320px] lg:max-h-[380px] overflow-y-auto space-y-2 lg:space-y-3">
            {activeCities.map((city) => (
              <div
                key={city.slug ?? city.name}
                className="flex flex-col gap-1 lg:gap-2 border-b last:border-b-0 border-gray-200/50 pb-2 lg:pb-3 last:pb-0"
              >
                <p className="text-xs lg:text-base font-semibold text-gray-900">{city.name}</p>
                {typeof city.attractionCount === 'number' && (
                  <p className="text-[10px] lg:text-sm text-gray-700">
                    {city.attractionCount} attractions
                  </p>
                )}
                <a
                  href={city.slug ? `/${city.slug}` : '#'}
                  className="mt-1 inline-flex items-center justify-center rounded-lg bg-primary-500 px-2 py-1 lg:px-3 lg:py-2 text-[10px] lg:text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
                >
                  {config.text.globe.viewCity}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tablet & Mobile: Horizontal slider below globe as separate layer */}
      {activeCities.length > 0 && (
        <div className="lg:hidden bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200/50 shadow-lg relative">
          <button
            onClick={() => sliderRef.current?.scrollBy({ left: -220, behavior: 'smooth' })}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg border border-gray-200/50 hover:bg-white transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => sliderRef.current?.scrollBy({ left: 220, behavior: 'smooth' })}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow-lg border border-gray-200/50 hover:bg-white transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div ref={sliderRef} className="flex gap-2 md:gap-3 overflow-x-auto px-3 py-2 md:px-4 md:py-3 snap-x snap-mandatory scrollbar-hide">
            {activeCities.map((city) => (
              <div
                key={city.slug ?? city.name}
                className="flex-shrink-0 snap-start bg-white rounded-lg px-3 py-2 md:px-4 md:py-3 shadow-sm border border-gray-200/50 w-[200px] md:w-[240px]"
              >
                <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{city.name}</p>
                {typeof city.attractionCount === 'number' && (
                  <p className="text-[10px] md:text-xs text-gray-700 mt-0.5 md:mt-1">
                    {city.attractionCount} attractions
                  </p>
                )}
                <a
                  href={city.slug ? `/${city.slug}` : '#'}
                  className="mt-1.5 md:mt-2 inline-flex items-center justify-center rounded-lg bg-primary-500 px-2 py-1 md:px-3 md:py-2 text-[10px] md:text-xs font-semibold text-white hover:bg-primary-600 transition-colors w-full"
                >
                  {config.text.globe.viewCity}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
