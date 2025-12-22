import * as React from 'react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api';
import { AttractionSummary, CityDetail, PaginatedResponse } from '@/types/api';

const DEFAULT_LIMIT = 12;

interface UseCityOptions {
  initialPage?: number;
  limit?: number;
}

const shouldRetry = (failureCount: number, error: unknown) => {
  const status = (error as { response?: { status?: number } })?.response?.status;
  if (status === 404) {
    return false;
  }
  return failureCount < 2;
};

export function useCity(slug: string, options?: UseCityOptions) {
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const initialPage = Math.max(1, options?.initialPage ?? 1);
  const [page, setPage] = React.useState(initialPage);
  const skip = (page - 1) * limit;

  React.useEffect(() => {
    setPage((prev) => {
      const next = Math.max(1, initialPage);
      return prev === next ? prev : next;
    });
  }, [initialPage]);

  const {
    data: city,
    isLoading: isLoadingCity,
    error: cityError,
  } = useQuery<CityDetail>({
    queryKey: ['city', slug],
    queryFn: async () => {
      const response = await apiClient.get<CityDetail>(`/cities/${slug}`);
      return response.data;
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
    retry: shouldRetry,
  });

  const {
    data: attractions,
    isLoading: isLoadingAttractions,
    error: attractionsError,
  } = useQuery<PaginatedResponse<AttractionSummary>>({
    queryKey: ['city-attractions', slug, skip, limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<AttractionSummary>>(
        `/cities/${slug}/attractions`,
        {
          params: { skip, limit },
        }
      );
      return response.data;
    },
    enabled: Boolean(slug),
    staleTime: 1000 * 60 * 5,
    placeholderData: (previousData) => previousData,
    retry: shouldRetry,
  });

  const totalPages = React.useMemo(() => {
    if (!attractions?.total) {
      return 0;
    }
    return Math.max(1, Math.ceil(attractions.total / limit));
  }, [attractions?.total, limit]);

  const handleSetPage = React.useCallback(
    (nextPage: number) => {
      setPage((prev) => {
        if (!Number.isFinite(nextPage)) {
          return prev;
        }
        const safePage = Math.max(1, Math.floor(nextPage));
        if (totalPages > 0) {
          return Math.min(safePage, totalPages);
        }
        return safePage;
      });
    },
    [totalPages]
  );

  const isError = Boolean(cityError || attractionsError);

  return {
    city,
    attractions,
    isLoadingCity,
    isLoadingAttractions,
    isError,
    cityError: cityError ?? null,
    attractionsError: attractionsError ?? null,
    currentPage: page,
    totalPages,
    limit,
    setPage: handleSetPage,
  };
}

