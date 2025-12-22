'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import Globe from 'three-globe';
import * as THREE from 'three';
import { config } from '@/lib/config';

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
}: {
  cities: CityMarker[];
  setActiveCities: (cities: CityMarker[]) => void;
  isPaused: boolean;
}) {
  const globeRef = useRef<Globe | null>(null);
  const groupRef = useRef<THREE.Group>(null);
  const activeCitiesRef = useRef<CityMarker[]>([]);
  const cityVectorsRef = useRef<{ city: CityMarker; vec: THREE.Vector3 }[]>([]);
  const { camera } = useThree();

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

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    const cityVectors = cityVectorsRef.current;
    if (!cityVectors.length) return;

    if (!isPaused) {
      groupRef.current.rotation.y += delta * 0.1;
    }

    // Compute which cities are most "in front" of the camera
    const camPos = new THREE.Vector3();
    camera.getWorldPosition(camPos);

    const camDir = new THREE.Vector3();
    camera.getWorldDirection(camDir); // camera forward in world space
    const camFromCenter = camPos.clone().normalize();

    const scored: { city: CityMarker; score: number }[] = [];

    for (const { city, vec } of cityVectors) {
      const localPos = vec.clone();
      const worldPos = localPos.clone();
      groupRef.current.localToWorld(worldPos);

      // Drop anything on the far side of the globe relative to the camera
      const cityNormal = worldPos.clone().normalize();
      const facingScore = cityNormal.dot(camFromCenter);
      if (facingScore <= 0.05) continue;

      const toCity = worldPos.clone().sub(camPos).normalize();
      const alignment = camDir.dot(toCity); // 1 means centered in view

      // Blend view alignment with hemisphere facing so near-the-edge cities still count
      const score = alignment * 0.7 + facingScore * 0.3;
      scored.push({ city, score });
    }

    // Require solid visibility to avoid mismatches (e.g., Madrid vs Melbourne)
    const scoreThreshold = 0.55;

    const topCities = scored
      .filter(({ city, score }) => city.name && score > scoreThreshold)
      .sort((a, b) => b.score - a.score)
      .map(({ city }) => city);

    const prev = activeCitiesRef.current;
    const changed =
      prev.length !== topCities.length ||
      prev.some((city, idx) => city !== topCities[idx]);

    if (changed) {
      activeCitiesRef.current = topCities;
      setActiveCities(topCities);
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
  const [activeCities, setActiveCities] = useState<CityMarker[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div
      className="relative w-full h-[340px] sm:h-[420px] md:h-[520px] lg:h-[600px] rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 via-blue-100 to-white border border-blue-100"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
          setActiveCities={setActiveCities}
          isPaused={isPaused}
        />
        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={200}
          maxDistance={500}
          autoRotate={false}
        />
      </Canvas>

      {activeCities.length > 0 && (
        <div className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-xl z-10 border border-gray-200/50 w-[240px] max-h-[360px] overflow-y-auto space-y-3 pr-2">
          {activeCities.map((city) => (
            <div
              key={city.slug ?? city.name}
              className="flex flex-col gap-1 border-b last:border-b-0 border-gray-200/50 pb-2 last:pb-0"
            >
              <p className="text-sm font-semibold text-gray-900">{city.name}</p>
              {typeof city.attractionCount === 'number' && (
                <p className="text-xs text-gray-700">
                  {city.attractionCount} attractions
                </p>
              )}
              <a
                href={city.slug ? `/${city.slug}` : '#'}
                className="mt-1 inline-flex items-center justify-center rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-600 transition-colors"
              >
                {config.text.globe.viewCity}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
