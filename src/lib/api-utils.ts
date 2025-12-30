import { config } from './config';
import { ErrorHandler, NetworkError, APIError } from '../utils/error-handler';
import { FetchErrorHandler, APIRetryHandler } from '../utils/api-error-handler';

/**
 * Robust API fetching utility that handles build-time failures gracefully
 * Enhanced with centralized error handling
 */

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export async function fetchFromApi<T>(
  path: string, 
  fallback: T,
  options: {
    timeout?: number;
    revalidate?: number;
    retries?: number;
    context?: any;
  } = {}
): Promise<T> {
  const { 
    timeout = config.apiTimeout, 
    revalidate = config.revalidateSeconds,
    retries = 2,
    context = {}
  } = options;
  
  const url = `${config.apiBaseUrl}${path}`;
  const requestContext = {
    component: 'APIUtils',
    action: 'fetchFromApi',
    feature: 'api',
    ...context,
    additionalData: {
      endpoint: path,
      timeout,
      retries,
      ...context.additionalData,
    },
  };

  // Use retry handler for robust fetching
  try {
    return await APIRetryHandler.withRetry(
      async () => {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
          const response = await fetch(url, {
            next: { revalidate },
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'X-Correlation-ID': `fetch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            },
          });
          
          clearTimeout(timeoutId);
          
          // Handle response with centralized error handling
          await FetchErrorHandler.handleResponse(response, requestContext);
          
          const data = await response.json();
          return data as T;
          
        } catch (error) {
          clearTimeout(timeoutId);
          
          // Handle different types of fetch errors
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              throw new NetworkError(
                `Request timeout after ${timeout}ms`,
                'TIMEOUT',
                requestContext
              );
            } else if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
              throw new NetworkError(
                'Connection failed - backend may not be running',
                'CONNECTION_FAILED',
                requestContext
              );
            }
          }
          
          // Let the fetch error handler deal with it
          FetchErrorHandler.handleNetworkError(
            error instanceof Error ? error : new Error(String(error)),
            requestContext
          );
        }
      },
      {
        maxAttempts: retries + 1,
        baseDelay: 1000,
        context: requestContext,
      }
    );
  } catch (error) {
    // Log the error and return fallback
    const handledError = ErrorHandler.handle(error, {
      ...requestContext,
      severity: 'medium',
      recoverable: true,
      userMessage: 'Unable to load data. Using cached version.',
    });

    if (process.env.NODE_ENV === 'development') {
      console.warn(`All attempts failed for ${url}, using fallback data:`, handledError);
    }
    
    return fallback;
  }
}

/**
 * Extract items from paginated API responses
 */
export function extractItems<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    if ('items' in payload && Array.isArray(payload.items)) return payload.items;
    if ('data' in payload && Array.isArray(payload.data)) return payload.data;
    if ('results' in payload && Array.isArray(payload.results)) return payload.results;
  }
  return [];
}

/**
 * Safe API fetch with better error handling for build time
 */
export async function safeFetchFromApi<T>(
  path: string,
  fallback: T,
  options?: {
    timeout?: number;
    revalidate?: number;
    context?: any;
  }
): Promise<T> {
  const requestContext = {
    component: 'APIUtils',
    action: 'safeFetchFromApi',
    ...options?.context,
  };

  // During build time, if we can't connect to the API, return fallback immediately
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    try {
      return await fetchFromApi(path, fallback, { 
        ...options, 
        timeout: 5000, // Shorter timeout during build
        retries: 0, // No retries during build
        context: requestContext,
      });
    } catch (error) {
      // During build, we don't want to track errors as they're expected
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Build-time API fetch failed for ${path}, using fallback`);
      }
      return fallback;
    }
  }
  
  return fetchFromApi(path, fallback, { ...options, context: requestContext });
}

/**
 * Enhanced fetch with comprehensive error handling
 */
export async function enhancedFetch<T>(
  url: string,
  options: RequestInit & {
    timeout?: number;
    retries?: number;
    context?: any;
  } = {}
): Promise<T> {
  const {
    timeout = config.apiTimeout,
    retries = 2,
    context = {},
    ...fetchOptions
  } = options;

  const requestContext = {
    component: 'APIUtils',
    action: 'enhancedFetch',
    ...context,
    additionalData: {
      url,
      method: fetchOptions.method || 'GET',
      timeout,
      retries,
      ...context.additionalData,
    },
  };

  return APIRetryHandler.withRetry(
    async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'X-Correlation-ID': `enhanced_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...fetchOptions.headers,
          },
        });

        clearTimeout(timeoutId);

        // Handle response with centralized error handling
        await FetchErrorHandler.handleResponse(response, requestContext);

        // Parse response based on content type
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          return await response.json();
        } else {
          return await response.text() as unknown as T;
        }
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof Error && error.name === 'AbortError') {
          throw new NetworkError(
            `Request timeout after ${timeout}ms`,
            'TIMEOUT',
            requestContext
          );
        }
        
        throw error;
      }
    },
    {
      maxAttempts: retries + 1,
      baseDelay: 1000,
      context: requestContext,
    }
  );
}

/**
 * Batch API requests with error handling
 */
export async function batchFetch<T>(
  requests: Array<{
    path: string;
    fallback: T;
    options?: Parameters<typeof fetchFromApi>[2];
  }>,
  options: {
    concurrency?: number;
    failFast?: boolean;
    context?: any;
  } = {}
): Promise<T[]> {
  const { concurrency = 5, failFast = false, context = {} } = options;
  
  const requestContext = {
    component: 'APIUtils',
    action: 'batchFetch',
    ...context,
    additionalData: {
      requestCount: requests.length,
      concurrency,
      failFast,
      ...context.additionalData,
    },
  };

  // Split requests into batches
  const batches: typeof requests[] = [];
  for (let i = 0; i < requests.length; i += concurrency) {
    batches.push(requests.slice(i, i + concurrency));
  }

  const results: T[] = [];
  const errors: Error[] = [];

  for (const batch of batches) {
    const batchPromises = batch.map(async (request, index) => {
      try {
        const result = await fetchFromApi(
          request.path,
          request.fallback,
          {
            ...request.options,
            context: {
              ...requestContext,
              batchIndex: results.length + index,
            },
          }
        );
        return { success: true, result, index: results.length + index };
      } catch (error) {
        const handledError = ErrorHandler.handle(error, {
          ...requestContext,
          additionalData: {
            batchIndex: results.length + index,
            path: request.path,
            ...requestContext.additionalData,
          },
        });
        
        if (failFast) {
          throw handledError;
        }
        
        errors.push(handledError);
        return { success: false, result: request.fallback, index: results.length + index };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.map(r => r.result));
  }

  // Log batch completion
  if (errors.length > 0) {
    ErrorHandler.handle(
      new Error(`Batch fetch completed with ${errors.length} errors out of ${requests.length} requests`),
      {
        ...requestContext,
        severity: 'medium',
        additionalData: {
          errorCount: errors.length,
          successCount: requests.length - errors.length,
          errors: errors.map(e => e.message),
          ...requestContext.additionalData,
        },
      }
    );
  }

  return results;
}