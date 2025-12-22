import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash.debounce';

import { apiClient } from '@/lib/api';
import type { Attraction, City, SearchResults, PaginatedResponse, AttractionSummary } from '@/types/api';

type SearchFilter = 'cities' | 'attractions';
type FilteredResult = City | Attraction;

interface UseSearchOptions {
  initialFilter?: SearchFilter;
  initialResults?: SearchResults;
}

const EMPTY_RESULTS: SearchResults = {
  cities: [],
  attractions: [],
  stories: [], // Keep for API compatibility but don't use
};

export function useSearch(query: string, options?: UseSearchOptions) {
  const [debouncedQuery, setDebouncedQuery] = useState(query.trim());
  const [currentFilter, setCurrentFilter] = useState<SearchFilter>(options?.initialFilter ?? 'attractions');

  const debouncedUpdater = useMemo(
    () =>
      debounce((nextQuery: string) => {
        setDebouncedQuery(nextQuery);
      }, 300),
    []
  );

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setDebouncedQuery('');
      debouncedUpdater.cancel();
      return undefined;
    }

    debouncedUpdater(trimmed);

    return () => {
      debouncedUpdater.cancel();
    };
  }, [query, debouncedUpdater]);

  const trimmedQuery = debouncedQuery.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const hasInput = query.trim().length > 0;
  const isQueryEmpty = normalizedQuery.length === 0;

  const initialResults = options?.initialResults;

  // When no query, fetch all cities and attractions
  const { data: searchData, isLoading: isSearchLoading, isError: isSearchError, error: searchError } = useQuery<SearchResults>({
    queryKey: ['search', normalizedQuery],
    queryFn: async () => {
      if (!trimmedQuery) {
        // Fetch all cities and attractions when no query (no limit parameter)
        const [citiesResponse, attractionsResponse] = await Promise.all([
          apiClient.get<PaginatedResponse<City>>('/cities'),
          apiClient.get<PaginatedResponse<AttractionSummary>>('/attractions'),
        ]);
        return {
          cities: citiesResponse.data.items || [],
          attractions: attractionsResponse.data.items || [],
          stories: [],
        };
      }
      const response = await apiClient.get<SearchResults>('/search', {
        params: { q: trimmedQuery },
      });
      return response.data;
    },
    enabled: true, // Always enabled to show all data when no query
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 10,
    initialData: initialResults,
  });

  const results = searchData || EMPTY_RESULTS;
  const isLoading = isSearchLoading;
  const isError = isSearchError;
  const error = searchError;

  const totalResults =
    results.cities.length + results.attractions.length;


  const filteredResults: FilteredResult[] = useMemo(() => {
    if (isQueryEmpty) {
      return currentFilter === 'cities'
        ? (results.cities as FilteredResult[])
        : (results.attractions as FilteredResult[]);
    }

    const queryLower = trimmedQuery.toLowerCase();

    if (currentFilter === 'cities') {
      const cities = results.cities as City[];

      // Simple prefix matching for city names
      return cities.filter((city) =>
        city.name.toLowerCase().includes(queryLower)
      ) as FilteredResult[];
    }

    // For attractions, filter by attraction name OR city name
    const attractions = results.attractions as AttractionSummary[];

    return attractions.filter((attraction) =>
      attraction.name.toLowerCase().includes(queryLower) ||
      (attraction.city && attraction.city.toLowerCase().includes(queryLower))
    ) as unknown as FilteredResult[];
  }, [currentFilter, isQueryEmpty, results, trimmedQuery]);

  const filterByType = useCallback((type: SearchFilter) => {
    setCurrentFilter(type);
  }, []);

  const formattedError =
    !hasInput
      ? undefined
      : isError && error
      ? error instanceof Error
        ? error.message
        : 'Unable to fetch search results'
      : undefined;

  // Show loading when fetching data (whether there's input or not)
  const displayLoading = isLoading;
  const displayError = hasInput ? isError : false;

  return {
    results,
    filteredResults,
    totalResults,
    isLoading: displayLoading,
    isError: displayError,
    error: formattedError,
    filterByType,
    currentFilter,
  };
}

