import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration for better performance
      staleTime: 1000 * 60 * 5, // 5 minutes - data is considered fresh
      gcTime: 1000 * 60 * 10, // 10 minutes - cache retention time
      
      // Request optimization
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      
      // Background refetching configuration
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Refetch when component mounts
      
      // Request deduplication is enabled by default in React Query v5
      // Multiple identical requests will be automatically deduplicated
      
      // Network mode configuration
      networkMode: 'online', // Only fetch when online
      
      // Error handling
      throwOnError: false, // Don't throw errors, handle them in components
    },
    mutations: {
      // Mutation configuration
      retry: 1, // Retry mutations once on failure
      retryDelay: 1000, // Wait 1 second before retrying mutations
      networkMode: 'online', // Only mutate when online
    },
  },
});

// Enhanced query client with performance monitoring integration
export const createOptimizedQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: true,
        networkMode: 'online',
        throwOnError: false,
        
        // Performance monitoring integration
        meta: {
          trackPerformance: true,
        },
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
        networkMode: 'online',
        
        // Performance monitoring for mutations
        meta: {
          trackPerformance: true,
        },
      },
    },
    
    // Global error handling
    mutationCache: {
      onError: (error, variables, context, mutation) => {
        console.error('Mutation error:', error);
        // Could integrate with error tracking service here
      },
    },
    
    queryCache: {
      onError: (error, query) => {
        console.error('Query error:', error);
        // Could integrate with error tracking service here
      },
    },
  });
};

// Cache utilities for manual cache management
export const cacheUtils = {
  /**
   * Prefetch data for better UX
   */
  prefetchQuery: (queryKey: string[], queryFn: () => Promise<any>) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 1000 * 60 * 5,
    });
  },
  
  /**
   * Invalidate specific queries
   */
  invalidateQueries: (queryKey: string[]) => {
    return queryClient.invalidateQueries({ queryKey });
  },
  
  /**
   * Set query data manually
   */
  setQueryData: (queryKey: string[], data: any) => {
    return queryClient.setQueryData(queryKey, data);
  },
  
  /**
   * Get cached query data
   */
  getQueryData: (queryKey: string[]) => {
    return queryClient.getQueryData(queryKey);
  },
  
  /**
   * Remove specific queries from cache
   */
  removeQueries: (queryKey: string[]) => {
    return queryClient.removeQueries({ queryKey });
  },
  
  /**
   * Clear all cache
   */
  clear: () => {
    return queryClient.clear();
  },
  
  /**
   * Get cache stats for monitoring
   */
  getCacheStats: () => {
    const queryCache = queryClient.getQueryCache();
    const mutationCache = queryClient.getMutationCache();
    
    return {
      queryCount: queryCache.getAll().length,
      mutationCount: mutationCache.getAll().length,
      queries: queryCache.getAll().map(query => ({
        queryKey: query.queryKey,
        state: query.state.status,
        dataUpdatedAt: query.state.dataUpdatedAt,
        lastErrorUpdatedAt: query.state.errorUpdatedAt,
      })),
    };
  },
};

