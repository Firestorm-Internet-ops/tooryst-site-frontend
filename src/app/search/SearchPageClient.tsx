'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useSearch } from '@/hooks/useSearch';
import type { SearchResults, City, AttractionSummary } from '@/types/api';
import { Pagination } from '@/components/ui/Pagination';
import { AttractionsGrid } from '@/components/sections/AttractionsGrid';
import { Card } from '@/components/ui/Card';
import { config } from '@/lib/config';

export type SearchFilter = 'cities' | 'attractions';

interface SearchPageClientProps {
  initialQuery: string;
  initialFilter?: SearchFilter;
  initialPage?: number;
  initialResults?: SearchResults;
}

const PAGE_SIZE = config.pagination.searchPageSize;
const FILTERS: SearchFilter[] = ['cities', 'attractions'];

const isCity = (item: unknown): item is City =>
  !!item && typeof item === 'object' && 'country' in item && 'attraction_count' in item;

const isAttraction = (item: unknown): item is AttractionSummary =>
  !!item && typeof item === 'object' && 'slug' in item && 'city' in item && typeof (item as { city?: unknown }).city === 'string';


export function SearchPageClient({
  initialQuery,
  initialFilter = 'attractions',
  initialPage = 1,
  initialResults,
}: SearchPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [inputValue, setInputValue] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(Math.max(initialPage, 1));

  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const queryString = params.toString();
      const target = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(target, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const enableInitialResults = searchQuery === initialQuery ? initialResults : undefined;

  // Auto-search effect with debounce
  useEffect(() => {
    const trimmed = inputValue.trim();

    // Debounce the search to avoid too many API calls while typing
    const timeoutId = setTimeout(() => {
      if (trimmed !== searchQuery) {
        setSearchQuery(trimmed);
        setCurrentPage(1);
        updateUrlParams({ q: trimmed || null, page: null });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [inputValue, searchQuery, updateUrlParams]);

  const { results, filteredResults, totalResults, isLoading, isError, error, filterByType, currentFilter } =
    useSearch(searchQuery, {
      initialFilter,
      initialResults: enableInitialResults,
    });

  const cities = (results && typeof results === 'object' && 'cities' in results) ? results.cities : [];
  const attractions = (results && typeof results === 'object' && 'attractions' in results) ? results.attractions : [];

  const counts = {
    cities: cities.length,
    attractions: attractions.length,
  };

  const dataByFilter: Record<SearchFilter, unknown[]> = {
    cities,
    attractions,
  };

  const activeItems = dataByFilter[currentFilter] ?? [];
  const totalPages = Math.max(1, Math.ceil(activeItems.length / PAGE_SIZE));
  const paginatedItems = useMemo(
    () => activeItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [activeItems, currentPage]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      updateUrlParams({ page: totalPages > 1 ? String(totalPages) : null });
    }
  }, [currentPage, totalPages, updateUrlParams]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    setSearchQuery(trimmed);
    setCurrentPage(1);
    updateUrlParams({ q: trimmed || null, page: null });
    // Scroll to top when submitting search
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (filter: SearchFilter) => {
    if (filter === currentFilter) return;
    filterByType(filter);
    setCurrentPage(1);
    updateUrlParams({ filter, page: null });
    // Scroll to top when changing filters
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageChange = (nextPage: number) => {
    setCurrentPage(nextPage);
    updateUrlParams({ page: nextPage > 1 ? String(nextPage) : null });
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasQuery = searchQuery.trim().length > 0;
  const showEmptyQueryMessage = !hasQuery && !isLoading && totalResults === 0;
  const showNoResults = hasQuery && !isLoading && !isError && totalResults === 0;

  const renderCityCards = (cities: City[]) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cities.map((city) => (
        <Card
          key={city.slug}
          className="bg-white text-gray-900 border border-gray-200 shadow-sm cursor-pointer hover:border-primary-200 hover:shadow-md transition-colors"
        >
          <button
            type="button"
            onClick={() => router.push(`/${city.slug}`)}
            className="w-full text-left flex flex-col gap-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{city.name}</h3>
            </div>
            <p className="text-sm text-gray-600">{city.attraction_count || 0} {config.text.cityCard.attractionsLabel}</p>
            <span className="text-sm font-medium text-primary-600 mt-1">
              {config.text.cityCard.viewButton}
            </span>
            </button>
        </Card>
      ))}
    </div>
  );

  const renderCombinedList = (items: unknown[]) => {
    const cities = items.filter(isCity) as City[];
    const attractions = items.filter(isAttraction) as AttractionSummary[];

          return (
      <div className="flex flex-col gap-8">
        {/* Cities Section */}
        {cities.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-600 px-3">
                {config.text.sections.cities} ({cities.length})
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cities.map((city) => (
                <Card
                  key={`city-${city.slug}`}
                  className="bg-white text-gray-900 border border-gray-200 shadow-sm cursor-pointer hover:border-primary-200 hover:shadow-md transition-all duration-300 group"
                >
                  <button
                    type="button"
                    onClick={() => router.push(`/${city.slug}`)}
                    className="w-full text-left flex flex-col gap-3 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-primary-500 group-hover:bg-primary-400 transition-colors" />
                          <span className="text-xs uppercase tracking-wider text-primary-600 font-medium">City</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1">
                          {city.name}
                        </h3>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                          <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">{city.attraction_count || 0}</span>
                        <span className="text-gray-500">{config.text.cityCard.attractionsLabel}</span>
                      </div>
                      <div className="ml-auto text-primary-600 group-hover:text-primary-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
              </div>
                  </button>
            </Card>
              ))}
            </div>
          </div>
        )}

        {/* Attractions Section */}
        {attractions.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary-600 px-3">
                {config.text.sections.attractions} ({attractions.length})
              </h3>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-200 to-transparent" />
              </div>
            <AttractionsGrid 
              attractions={attractions} 
            />
              </div>
        )}
    </div>
  );
  };

  const renderResults = () => {
    if (isLoading) {
      return <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm">{config.text.loading.results}</div>;
    }

    if (showEmptyQueryMessage) {
      return (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm">
          {config.text.search.emptyState}
        </div>
      );
    }

    if (showNoResults) {
      return (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 text-center text-gray-600 shadow-sm">
          {config.text.search.noResults}
        </div>
      );
    }

    if (isError) {
      return (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          {error ?? config.text.search.error}
        </div>
      );
    }

    if (currentFilter === 'cities') {
      return renderCityCards(paginatedItems as City[]);
    }

    if (currentFilter === 'attractions') {
      return (
        <AttractionsGrid 
          attractions={paginatedItems as AttractionSummary[]} 
        />
      );
    }

    return renderCombinedList(paginatedItems);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 text-gray-900 px-1 sm:px-0">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row md:items-center md:gap-3">
          <div className="flex flex-1 flex-col gap-2">
            <label htmlFor="search-input" className="text-xs uppercase tracking-[0.4em] text-primary-600">
              {config.text.search.title}
            </label>
            <input
              id="search-input"
              type="search"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder={config.text.search.placeholder}
              className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200/40"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-primary-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-600"
          >
            {config.text.search.button}
          </button>
        </form>
        {hasQuery && (
          <p className="mt-4 text-sm text-gray-600">
            {isLoading ? config.text.search.loading : `${totalResults} results for “${searchQuery}”`}
          </p>
        )}
      </section>

      <section className="flex flex-wrap gap-3 w-full items-center justify-center sm:justify-start" role="tablist" aria-label="Search result filters">
        {FILTERS.map((filter) => {
          const filterLabel = filter === 'cities'
            ? config.text.filters.cities
            : config.text.filters.attractions;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => handleFilterChange(filter)}
              role="tab"
              aria-selected={currentFilter === filter}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                currentFilter === filter ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterLabel} ({counts[filter]})
            </button>
          );
        })}
      </section>

      <section className="flex flex-col gap-6">
        {renderResults()}
        {totalPages > 1 && !isLoading && !isError && !showEmptyQueryMessage && !showNoResults && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        )}
      </section>
    </div>
  );
}

