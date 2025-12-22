import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api';
import { AttractionSummary, CountryOverview, PaginatedResponse } from '@/types/api';
import { config } from '@/lib/config';

interface UseCountryOptions {
  limit?: number;
  fetchCountryMetadata?: boolean;
}

export function useCountry(country: string, options?: UseCountryOptions) {
  const limit = options?.limit ?? config.pagination.countryDataLimit;
  const fetchCountryMetadata = options?.fetchCountryMetadata ?? true;

  const {
    data: countryData,
    isLoading: isLoadingCountry,
    error: countryError,
  } = useQuery<CountryOverview | null>({
    queryKey: ['country', country],
    queryFn: async () => {
      if (!fetchCountryMetadata) {
        return null;
      }
      try {
        const response = await apiClient.get<CountryOverview>(`/destinations/${country}`);
        return response.data;
      } catch (error) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(country) && fetchCountryMetadata,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: attractionData,
    isLoading: isLoadingAttractions,
    error: attractionsError,
  } = useQuery<PaginatedResponse<AttractionSummary>>({
    queryKey: ['country-attractions', country, limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<AttractionSummary>>('/attractions', {
        params: { country, limit, skip: 0 },
      });
      return response.data;
    },
    enabled: Boolean(country),
    staleTime: 1000 * 60 * 5,
  });

  const markers = React.useMemo(
    () =>
      (attractionData?.items ?? []).map((attraction) => ({
        lat: attraction.latitude,
        lng: attraction.longitude,
        name: attraction.name,
        slug: attraction.slug,
        rating: attraction.average_rating ?? null,
      })),
    [attractionData?.items]
  );

  const bounds = React.useMemo(() => {
    const points: Array<[number, number]> = [];

    markers.forEach((marker) => {
      if (typeof marker.lat === 'number' && typeof marker.lng === 'number') {
        points.push([marker.lat, marker.lng]);
      }
    });

    if (!points.length && countryData?.latitude && countryData?.longitude) {
      points.push([countryData.latitude, countryData.longitude]);
    }

    return points;
  }, [markers, countryData?.latitude, countryData?.longitude]);

  const isLoading = isLoadingAttractions || (fetchCountryMetadata && isLoadingCountry);
  const combinedError = attractionsError ?? (fetchCountryMetadata ? countryError : null);
  const isError = Boolean(combinedError);

  return {
    country: countryData ?? null,
    attractions: attractionData ?? null,
    markers,
    bounds,
    isLoading,
    isError,
    error: combinedError ?? null,
    attractionsError: attractionsError ?? null,
    countryError: fetchCountryMetadata ? countryError ?? null : null,
  };
}

