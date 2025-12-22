import * as React from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSearch } from '@/hooks/useSearch';
import { config } from '@/lib/config';
import type { City, AttractionSummary, Attraction } from '@/types/api';

interface SearchInputProps {
  onSearch: (value: string) => void;
  suggestions?: string[];
  debounceMs?: number;
  placeholder?: string;
  onDebouncedChange?: (value: string) => void;
  showSuggestions?: boolean;
}

export function SearchInput({
  onSearch,
  suggestions = [],
  debounceMs = config.ui.debounceMs,
  placeholder = 'Search destinations, cities, or attractions',
  onDebouncedChange,
  showSuggestions = true,
}: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Use search hook for suggestions if enabled
  const { results, isLoading } = useSearch(query, {
    initialFilter: 'attractions',
  });

  React.useEffect(() => {
    if (!onDebouncedChange) return undefined;
    const handle = window.setTimeout(() => {
      onDebouncedChange(query);
    }, debounceMs);
    return () => window.clearTimeout(handle);
  }, [query, debounceMs, onDebouncedChange]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowDropdown(false);
    onSearch(query.trim());
  };

  const handleSuggestionClick = () => {
    setShowDropdown(false);
  };

  // Helper function to get the URL for a suggestion
  const getSuggestionUrl = (suggestion: { type: 'city' | 'attraction'; slug: string }) => {
    if (suggestion.type === 'city') {
      return `/${suggestion.slug}`;
    } else {
      // For attractions, we need the city slug. For now, we'll use the old structure
      // TODO: Update this when we have city slug in attraction data
      return `/attractions/${suggestion.slug}`;
    }
  };

  const handleClear = () => {
    setQuery('');
    setShowDropdown(false);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setQuery(value);
    if (showSuggestions && value.trim().length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleInputFocus = () => {
    if (showSuggestions && query.trim().length > 0) {
      setShowDropdown(true);
    }
  };

  // Build suggestions from search results
  const allSuggestions: Array<{ type: 'city' | 'attraction'; name: string; slug: string }> = [];
  if (showSuggestions && results && typeof results === 'object' && 'cities' in results && 'attractions' in results) {
    const searchResults = results as { cities?: City[]; attractions?: (AttractionSummary | Attraction)[] };
    searchResults.cities?.slice(0, config.ui.searchSuggestionLimit).forEach((city) => {
      allSuggestions.push({ type: 'city', name: city.name, slug: city.slug });
    });
    searchResults.attractions?.slice(0, config.ui.searchSuggestionLimit).forEach((attraction) => {
      allSuggestions.push({ type: 'attraction', name: attraction.name, slug: attraction.slug });
    });
  }

  // Fallback to provided suggestions if no search results
  const displaySuggestions =
    allSuggestions.length > 0
      ? allSuggestions
      : suggestions.map((s) => ({ type: 'city' as const, name: s, slug: s }));

  return (
    <div className="relative w-full max-w-4xl mx-auto" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex flex-row items-stretch w-full rounded-full overflow-hidden shadow-lg bg-white border-2 border-white/20 focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-200/50 transition-all backdrop-blur-sm">
          <div className="relative flex-1 w-full min-w-0 flex items-center">
            <Search className="absolute left-3 sm:left-4 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder={placeholder}
              aria-label={placeholder}
              className={cn(
                'w-full bg-transparent py-3 sm:py-3.5 pl-10 sm:pl-12 pr-10 sm:pr-12 text-sm sm:text-base text-gray-900 placeholder:text-gray-500 focus:outline-none transition-all'
              )}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={handleClear}
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-200"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-primary-500 px-4 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white hover:bg-primary-600 transition-all whitespace-nowrap sm:min-w-[120px] focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2 shadow-md"
          >
            <span className="hidden sm:inline">Search</span>
            <Search className="sm:hidden h-5 w-5" />
          </button>
        </div>
      </form>

      {showSuggestions && showDropdown && displaySuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white shadow-xl">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          )}
          {!isLoading && (
            <ul className="max-h-80 overflow-y-auto" role="listbox">
              {displaySuggestions.map((suggestion, index) => (
                <li key={`${suggestion.type}-${suggestion.slug}-${index}`}>
                  <Link
                    href={getSuggestionUrl(suggestion)}
                    className="block w-full px-5 py-3 text-left text-sm sm:text-base text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    onClick={handleSuggestionClick}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-400 uppercase min-w-[60px]">
                        {suggestion.type === 'city' ? 'City' : 'Attraction'}
                      </span>
                      <span className="font-medium">{suggestion.name}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
