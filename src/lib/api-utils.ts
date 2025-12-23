import { config } from './config';

/**
 * Robust API fetching utility that handles build-time failures gracefully
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
  } = {}
): Promise<T> {
  const { 
    timeout = config.apiTimeout, 
    revalidate = config.revalidateSeconds,
    retries = 2 
  } = options;
  
  const url = `${config.apiBaseUrl}${path}`;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        next: { revalidate },
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`API request failed: ${response.status} ${response.statusText} for ${url}`);
        if (attempt === retries) {
          return fallback;
        }
        continue;
      }
      
      const data = await response.json();
      return data as T;
      
    } catch (error) {
      const isLastAttempt = attempt === retries;
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn(`API request timeout after ${timeout}ms for ${url}`);
        } else if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
          console.warn(`API connection failed for ${url} - backend may not be running`);
        } else {
          console.warn(`API request error for ${url}:`, error.message);
        }
      }
      
      if (isLastAttempt) {
        console.warn(`All ${retries + 1} attempts failed for ${url}, using fallback data`);
        return fallback;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  return fallback;
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
  }
): Promise<T> {
  // During build time, if we can't connect to the API, return fallback immediately
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    try {
      return await fetchFromApi(path, fallback, { 
        ...options, 
        timeout: 5000, // Shorter timeout during build
        retries: 0 // No retries during build
      });
    } catch {
      return fallback;
    }
  }
  
  return fetchFromApi(path, fallback, options);
}