import { useState, useEffect } from 'react';

interface GeolocationPosition {
    latitude: number;
    longitude: number;
}

interface UseGeolocationReturn {
    position: GeolocationPosition | null;
    error: string | null;
    loading: boolean;
}

export function useGeolocation(): UseGeolocationReturn {
    const [position, setPosition] = useState<GeolocationPosition | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by this browser');
            setLoading(false);
            return;
        }

        const success = (pos: globalThis.GeolocationPosition) => {
            setPosition({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
            });
            setError(null);
            setLoading(false);
        };

        const failure = (err: GeolocationPositionError) => {
            setError(err.message);
            setLoading(false);
        };

        const options: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
        };

        navigator.geolocation.getCurrentPosition(success, failure, options);
    }, []);

    return { position, error, loading };
}