/**
 * Enhanced Search Input Component with Zod Validation
 * Feature: frontend-quality-improvements, Task 3.1: Schema-based Form Validation
 * 
 * Enhanced search input with:
 * - Real-time validation using Zod schemas
 * - Debounced input with validation feedback
 * - Accessibility improvements
 * - Error handling and user feedback
 * - Integration with React Hook Form
 */

import * as React from 'react';
import { Search, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import { useSearch } from '@/hooks/useSearch';
import { useSearchValidation } from '@/hooks/useFormValidation';
import { searchFormSchema, type SearchFormData } from '@/lib/validation-schemas';
import { config } from '@/lib/config';
import type { City, AttractionSummary, Attraction } from '@/types/api';

interface EnhancedSearchInputProps {
  onSearch: (data: SearchFormData) => void;
  onValidatedSearch?: (query: string, isValid: boolean) => void;
  debounceMs?: number;
  placeholder?: string;
  showSuggestions?: boolean;
  showValidation?: boolean;
  showFilters?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'hero' | 'compact';
}

export function EnhancedSearchInput({
  onSearch,
  onValidatedSearch,
  debounceMs = config.ui.debounceMs,
  placeholder = 'Search destinations, cities, or attractions',
  showSuggestions = true,
  showValidation = true,
  showFilters = false,
  className,
  size = 'md',
  variant = 'default',
}: EnhancedSearchInputProps) {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [selectedFilter, setSelectedFilter] = React.useState<'cities' | 'attractions' | 'all'>('all');
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Form validation with React Hook Form and Zod
  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: '',
      filter: 'all',
    },
    mode: 'onChange',
  });

  const { watch, control, handleSubmit, formState: { errors, isValid } } = form;
  const queryValue = watch('query');

  // Real-time search validation
  const {
    query,
    debouncedQuery,
    isValidating,
    validationError,
    isValid: isQueryValid,
    updateQuery,
    clearQuery,
  } = useSearchValidation(debounceMs);

  // Use search hook for suggestions
  const { results, isLoading } = useSearch(debouncedQuery, {
    initialFilter: selectedFilter === 'all' ? 'attractions' : selectedFilter,
  });

  // Sync form query with validation hook
  React.useEffect(() => {
    updateQuery(queryValue || '');
  }, [queryValue, updateQuery]);

  // Notify parent of validation status
  React.useEffect(() => {
    if (onValidatedSearch) {
      onValidatedSearch(debouncedQuery, isQueryValid);
    }
  }, [debouncedQuery, isQueryValid, onValidatedSearch]);

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

  // Handle form submission
  const onSubmit = (data: SearchFormData) => {
    if (!data.query.trim()) return;
    
    setShowDropdown(false);
    onSearch({
      ...data,
      filter: selectedFilter,
    });
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: { type: 'city' | 'attraction'; name: string; slug: string }) => {
    const searchData: SearchFormData = {
      query: suggestion.name,
      filter: suggestion.type === 'city' ? 'cities' : 'attractions',
    };
    
    form.setValue('query', suggestion.name);
    setSelectedFilter(searchData.filter);
    setShowDropdown(false);
    onSearch(searchData);
    
    // Navigate to appropriate page
    if (suggestion.type === 'city') {
      router.push(`/cities/${suggestion.slug}`);
    } else {
      router.push(`/attractions/${suggestion.slug}`);
    }
  };

  // Handle clear
  const handleClear = () => {
    form.reset();
    clearQuery();
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Build suggestions from search results
  const allSuggestions: Array<{ type: 'city' | 'attraction'; name: string; slug: string }> = [];
  if (showSuggestions && results && typeof results === 'object' && 'cities' in results && 'attractions' in results) {
    const searchResults = results as { cities?: City[]; attractions?: (AttractionSummary | Attraction)[] };
    
    if (selectedFilter === 'all' || selectedFilter === 'cities') {
      searchResults.cities?.slice(0, config.ui.searchSuggestionLimit).forEach((city) => {
        allSuggestions.push({ type: 'city', name: city.name, slug: city.slug });
      });
    }
    
    if (selectedFilter === 'all' || selectedFilter === 'attractions') {
      searchResults.attractions?.slice(0, config.ui.searchSuggestionLimit).forEach((attraction) => {
        allSuggestions.push({ type: 'attraction', name: attraction.name, slug: attraction.slug });
      });
    }
  }

  // Size classes
  const sizeClasses = {
    sm: 'text-sm py-2 px-3',
    md: 'text-base py-3 px-4',
    lg: 'text-lg py-4 px-6',
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-white border-gray-200 focus-within:border-primary-400 focus-within:ring-primary-200/50',
    hero: 'bg-white/95 backdrop-blur-sm border-white/20 focus-within:border-primary-400 focus-within:ring-primary-200/50 shadow-lg',
    compact: 'bg-gray-50 border-gray-300 focus-within:border-primary-500 focus-within:ring-primary-100',
  };

  const hasError = !!(errors.query || validationError);
  const showSuccess = showValidation && isQueryValid && debouncedQuery.length > 0;

  return (
    <div className={cn('relative w-full', className)} ref={dropdownRef}>
      <form onSubmit={handleSubmit(onSubmit)} className="w-full">
        <div className={cn(
          'flex flex-row items-stretch w-full rounded-full overflow-hidden border-2 transition-all',
          variantClasses[variant],
          hasError && 'border-red-400 focus-within:border-red-500 focus-within:ring-red-200/50',
          showSuccess && 'border-green-400 focus-within:border-green-500 focus-within:ring-green-200/50',
          'focus-within:ring-4'
        )}>
          {/* Search Icon */}
          <div className="relative flex-1 w-full min-w-0 flex items-center">
            <Search className={cn(
              'absolute left-3 h-5 w-5 text-gray-400 pointer-events-none',
              size === 'sm' && 'h-4 w-4 left-2',
              size === 'lg' && 'h-6 w-6 left-4'
            )} />
            
            {/* Main Input */}
            <Controller
              name="query"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    inputRef.current = e;
                  }}
                  type="text"
                  placeholder={placeholder}
                  className={cn(
                    'w-full bg-transparent border-0 outline-none placeholder-gray-500',
                    sizeClasses[size],
                    size === 'sm' ? 'pl-8 pr-8' : size === 'lg' ? 'pl-12 pr-12' : 'pl-10 pr-10'
                  )}
                  onFocus={() => setShowDropdown(true)}
                  aria-label="Search input"
                  aria-describedby={hasError ? 'search-error' : undefined}
                  aria-invalid={hasError}
                />
              )}
            />

            {/* Validation Icons */}
            {showValidation && (
              <div className={cn(
                'absolute right-2 flex items-center space-x-1',
                size === 'lg' && 'right-3'
              )}>
                {isValidating && (
                  <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" />
                )}
                {hasError && !isValidating && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                {showSuccess && !isValidating && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {queryValue && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-200"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Filter Dropdown */}
          {showFilters && (
            <div className="flex items-center border-l border-gray-200 px-3">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as 'cities' | 'attractions' | 'all')}
                className="bg-transparent border-0 outline-none text-sm text-gray-600 focus:ring-0"
                aria-label="Search filter"
              >
                <option value="all">All</option>
                <option value="cities">Cities</option>
                <option value="attractions">Attractions</option>
              </select>
            </div>
          )}

          {/* Search Button */}
          <button
            type="submit"
            disabled={!isValid || isValidating}
            className={cn(
              'bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary-200 focus:ring-offset-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed',
              sizeClasses[size],
              size === 'sm' ? 'px-4 min-w-[80px]' : size === 'lg' ? 'px-8 min-w-[140px]' : 'px-6 min-w-[120px]'
            )}
          >
            <span className={cn(size === 'sm' ? 'hidden sm:inline' : 'hidden sm:inline')}>Search</span>
            <Search className={cn('sm:hidden h-5 w-5', size === 'sm' && 'h-4 w-4')} />
          </button>
        </div>

        {/* Error Message */}
        {hasError && showValidation && (
          <div id="search-error" className="mt-2 text-sm text-red-600 flex items-center space-x-1">
            <AlertCircle className="h-4 w-4" />
            <span>{errors.query?.message || validationError}</span>
          </div>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showDropdown && showSuggestions && (debouncedQuery.length > 0 || allSuggestions.length > 0) && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-gray-200 bg-white shadow-xl max-h-80 overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-500 flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary-500 border-t-transparent rounded-full" />
              <span>Searching...</span>
            </div>
          )}
          
          {!isLoading && allSuggestions.length === 0 && debouncedQuery.length > 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              No results found for "{debouncedQuery}"
            </div>
          )}
          
          {!isLoading && allSuggestions.length > 0 && (
            <div className="py-2">
              {allSuggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.slug}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors flex items-center space-x-3"
                >
                  <div className={cn(
                    'flex-shrink-0 w-2 h-2 rounded-full',
                    suggestion.type === 'city' ? 'bg-blue-500' : 'bg-green-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.name}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {suggestion.type}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}