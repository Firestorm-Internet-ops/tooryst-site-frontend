/**
 * React Query Optimizations and Caching Utilities
 * Feature: frontend-quality-improvements, Task 5.1: Optimize React Query Configuration for Better Caching
 * 
 * Advanced caching strategies and optimizations including:
 * - Request deduplication and background refetching
 * - Cache warming and prefetching strategies
 * - Performance monitoring integration
 * - Advanced error handling and retry logic
 * - Cache invalidation patterns
 */

import { QueryClient, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { PerformanceMonitor } from '@/utils/performance-monitoring';

/**
 * Enhanced query options with performance monitoring
 */
export function createOptimizedQueryOptions<TData = unknown, TError = Error>(
  options: UseQueryOptions<TData, TError> & {
    performanceKey?: string;
    prefetchRelated?: string[][];
  }
): UseQueryOptions<TData, TError> {
  const { performanceKey, prefetchRelated, queryFn, ...restOptions } = options;

  return {
    ...restOptions,
    queryFn: async (context) => {
      const startTime = performance.now();
      
      try {
        const result = await queryFn?.(context);
        
        // Track performance
        if (performanceKey) {
          const duration = performance.now() - startTime;
          PerformanceMonitor.trackCustomMetric(`query-${performanceKey}`, duration);
        }
        
        return result;
      } catch (error) {
        // Track error performance
        if (performanceKey) {
          const duration = performance.now() - startTime;
          PerformanceMonitor.trackCustomMetric(`query-error-${performanceKey}`, duration);
        }
        throw error;
      }
    },
    
    // Enhanced retry logic with exponential backoff
    retry: (failureCount, error) => {
      // Don't retry on client errors (4xx)
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        const status = axiosError.response?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
      }
      
      return failureCount < 3;
    },
    
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Background refetching optimization
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: false, // Disable automatic refetching by default
    
    // Stale-while-revalidate pattern
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  };
}

/**
 * Enhanced mutation options with performance monitoring
 */
export function createOptimizedMutationOptions<TData = unknown, TError = Error, TVariables = void>(
  options: UseMutationOptions<TData, TError, TVariables> & {
    performanceKey?: string;
    invalidateQueries?: string[][];
    optimisticUpdates?: Array<{
      queryKey: string[];
      updater: (oldData: any, variables: TVariables) => any;
    }>;
  }
): UseMutationOptions<TData, TError, TVariables> {
  const { performanceKey, invalidateQueries, optimisticUpdates, mutationFn, ...restOptions } = options;

  return {
    ...restOptions,
    mutationFn: async (variables) => {
      const startTime = performance.now();
      
      try {
        const result = await mutationFn?.(variables);
        
        // Track performance
        if (performanceKey) {
          const duration = performance.now() - startTime;
          PerformanceMonitor.trackCustomMetric(`mutation-${performanceKey}`, duration);
        }
        
        return result;
      } catch (error) {
        // Track error performance
        if (performanceKey) {
          const duration = performance.now() - startTime;
          PerformanceMonitor.trackCustomMetric(`mutation-error-${performanceKey}`, duration);
        }
        throw error;
      }
    },
    
    // Enhanced retry logic
    retry: 1,
    retryDelay: 1000,
  };
}

/**
 * Cache warming utilities
 */
export class CacheWarmer {
  constructor(private queryClient: QueryClient) {}

  /**
   * Warm cache with related data
   */
  async warmRelatedData(baseQueryKey: string[], relatedQueries: Array<{
    queryKey: string[];
    queryFn: () => Promise<any>;
    priority?: 'high' | 'medium' | 'low';
  }>) {
    const promises = relatedQueries.map(async ({ queryKey, queryFn, priority = 'medium' }) => {
      // Check if data is already cached and fresh
      const existingData = this.queryClient.getQueryData(queryKey);
      const queryState = this.queryClient.getQueryState(queryKey);
      
      if (existingData && queryState && Date.now() - queryState.dataUpdatedAt < 1000 * 60 * 2) {
        return; // Skip if data is fresh (less than 2 minutes old)
      }
      
      // Prefetch based on priority
      const staleTime = priority === 'high' ? 1000 * 60 * 10 : 1000 * 60 * 5;
      
      return this.queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime,
      });
    });

    await Promise.allSettled(promises);
  }

  /**
   * Preload critical data for a route
   */
  async preloadRouteData(route: string, dataLoaders: Array<{
    queryKey: string[];
    queryFn: () => Promise<any>;
    critical?: boolean;
  }>) {
    const criticalLoaders = dataLoaders.filter(loader => loader.critical);
    const nonCriticalLoaders = dataLoaders.filter(loader => !loader.critical);

    // Load critical data first
    if (criticalLoaders.length > 0) {
      await Promise.all(
        criticalLoaders.map(({ queryKey, queryFn }) =>
          this.queryClient.prefetchQuery({ queryKey, queryFn })
        )
      );
    }

    // Load non-critical data in background
    if (nonCriticalLoaders.length > 0) {
      Promise.allSettled(
        nonCriticalLoaders.map(({ queryKey, queryFn }) =>
          this.queryClient.prefetchQuery({ queryKey, queryFn })
        )
      );
    }
  }
}

/**
 * Cache invalidation patterns
 */
export class CacheInvalidator {
  constructor(private queryClient: QueryClient) {}

  /**
   * Invalidate related queries based on patterns
   */
  async invalidateByPattern(patterns: Array<{
    pattern: string[];
    exact?: boolean;
    refetchType?: 'active' | 'inactive' | 'all';
  }>) {
    const promises = patterns.map(({ pattern, exact = false, refetchType = 'active' }) => {
      return this.queryClient.invalidateQueries({
        queryKey: pattern,
        exact,
        refetchType,
      });
    });

    await Promise.all(promises);
  }

  /**
   * Smart invalidation based on mutation type
   */
  async smartInvalidate(mutationType: 'create' | 'update' | 'delete', entityType: string, entityId?: string) {
    const patterns: Array<{ pattern: string[]; exact?: boolean }> = [];

    switch (mutationType) {
      case 'create':
        // Invalidate list queries
        patterns.push({ pattern: [entityType] });
        patterns.push({ pattern: [entityType, 'list'] });
        break;
        
      case 'update':
        if (entityId) {
          // Invalidate specific entity and related queries
          patterns.push({ pattern: [entityType, entityId], exact: true });
          patterns.push({ pattern: [entityType, entityId, 'details'], exact: true });
        }
        // Also invalidate list queries
        patterns.push({ pattern: [entityType] });
        break;
        
      case 'delete':
        if (entityId) {
          // Remove specific entity from cache
          this.queryClient.removeQueries({ queryKey: [entityType, entityId] });
        }
        // Invalidate list queries
        patterns.push({ pattern: [entityType] });
        break;
    }

    await this.invalidateByPattern(patterns);
  }
}

/**
 * Performance monitoring for React Query
 */
export class QueryPerformanceMonitor {
  private static instance: QueryPerformanceMonitor;
  private metrics: Map<string, { count: number; totalTime: number; errors: number }> = new Map();

  static getInstance(): QueryPerformanceMonitor {
    if (!QueryPerformanceMonitor.instance) {
      QueryPerformanceMonitor.instance = new QueryPerformanceMonitor();
    }
    return QueryPerformanceMonitor.instance;
  }

  trackQuery(queryKey: string[], duration: number, success: boolean) {
    const key = queryKey.join(':');
    const existing = this.metrics.get(key) || { count: 0, totalTime: 0, errors: 0 };
    
    this.metrics.set(key, {
      count: existing.count + 1,
      totalTime: existing.totalTime + duration,
      errors: existing.errors + (success ? 0 : 1),
    });

    // Track with performance monitor
    PerformanceMonitor.trackCustomMetric(`react-query-${key}`, duration);
  }

  getMetrics() {
    const result: Record<string, {
      count: number;
      averageTime: number;
      errorRate: number;
    }> = {};

    this.metrics.forEach((value, key) => {
      result[key] = {
        count: value.count,
        averageTime: value.totalTime / value.count,
        errorRate: value.errors / value.count,
      };
    });

    return result;
  }

  reset() {
    this.metrics.clear();
  }
}

/**
 * React Query hooks with enhanced caching
 */
export function useOptimizedQuery<TData = unknown, TError = Error>(
  options: UseQueryOptions<TData, TError> & {
    performanceKey?: string;
    warmRelated?: string[][];
  }
) {
  const queryClient = useQueryClient();
  const { warmRelated, ...queryOptions } = options;

  // Warm related cache when this query succeeds
  const enhancedOptions = {
    ...createOptimizedQueryOptions(queryOptions),
    onSuccess: (data: TData) => {
      options.onSuccess?.(data);
      
      // Warm related cache
      if (warmRelated && warmRelated.length > 0) {
        const warmer = new CacheWarmer(queryClient);
        // This would need specific query functions for each related query
        // Implementation would depend on the specific use case
      }
    },
  };

  return enhancedOptions;
}

/**
 * Batch query utilities
 */
export class BatchQueryManager {
  private batchQueue: Array<{
    queryKey: string[];
    queryFn: () => Promise<any>;
    resolve: (data: any) => void;
    reject: (error: any) => void;
  }> = [];
  
  private batchTimeout: NodeJS.Timeout | null = null;

  constructor(private queryClient: QueryClient, private batchDelay = 50) {}

  /**
   * Add query to batch
   */
  addToBatch<TData>(queryKey: string[], queryFn: () => Promise<TData>): Promise<TData> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ queryKey, queryFn, resolve, reject });
      
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }
      
      this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, this.batchDelay);
    });
  }

  private async processBatch() {
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimeout = null;

    // Group by similar query patterns for potential optimization
    const groups = new Map<string, typeof batch>();
    
    batch.forEach(item => {
      const pattern = item.queryKey[0]; // Group by first part of query key
      if (!groups.has(pattern)) {
        groups.set(pattern, []);
      }
      groups.get(pattern)!.push(item);
    });

    // Process each group
    for (const [pattern, items] of groups) {
      await Promise.allSettled(
        items.map(async ({ queryKey, queryFn, resolve, reject }) => {
          try {
            const data = await this.queryClient.fetchQuery({ queryKey, queryFn });
            resolve(data);
          } catch (error) {
            reject(error);
          }
        })
      );
    }
  }
}

/**
 * Export utilities for easy access
 */
export const queryOptimizations = {
  CacheWarmer,
  CacheInvalidator,
  QueryPerformanceMonitor,
  BatchQueryManager,
  createOptimizedQueryOptions,
  createOptimizedMutationOptions,
};