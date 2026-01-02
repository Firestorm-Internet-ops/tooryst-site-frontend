import axios, { AxiosRequestConfig } from 'axios';
import { config } from './config';
import { APIErrorHandler, APIRetryHandler, APICircuitBreaker } from '../utils/api-error-handler';
import { ErrorHandler } from '../utils/error-handler';

const baseURL = config.apiBaseUrl;

export const apiClient = axios.create({
  baseURL,
  timeout: config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor with enhanced error context
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Add correlation ID for request tracking
    if (!config.headers?.['X-Correlation-ID']) {
      config.headers = config.headers ?? {};
      config.headers['X-Correlation-ID'] = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Add request timestamp
    config.metadata = {
      ...config.metadata,
      startTime: Date.now(),
    };

    return config;
  },
  (error) => {
    const enhancedError = ErrorHandler.handle(error, {
      component: 'APIClient',
      action: 'request_setup',
    });
    return Promise.reject(enhancedError);
  }
);

// Response interceptor with centralized error handling
apiClient.interceptors.response.use(
  (response) => {
    // Record success for circuit breaker
    if (response.config.url) {
      APICircuitBreaker.recordSuccess(response.config.url);
    }

    // Handle business logic errors in successful responses
    return APIErrorHandler.handleResponse(response, 
      APIErrorHandler.createRequestContext(response.config)
    );
  },
  (error) => {
    // Record failure for circuit breaker
    if (error.config?.url) {
      APICircuitBreaker.recordFailure(error.config.url);
    }

    // Handle the error with centralized error handling
    return APIErrorHandler.handleResponseError(
      error,
      APIErrorHandler.createRequestContext(error.config || {})
    );
  }
);

/**
 * Enhanced API client with retry and circuit breaker support
 */
export class EnhancedAPIClient {
  /**
   * Make a request with retry logic and circuit breaker protection
   */
  static async request<T>(
    config: AxiosRequestConfig,
    options: {
      retries?: number;
      retryDelay?: number;
      useCircuitBreaker?: boolean;
      context?: any;
    } = {}
  ): Promise<T> {
    const {
      retries = 2,
      retryDelay = 1000,
      useCircuitBreaker = true,
      context = {}
    } = options;

    const endpoint = config.url || 'unknown';
    const requestContext = APIErrorHandler.createRequestContext(config, context);

    const makeRequest = async (): Promise<T> => {
      if (useCircuitBreaker) {
        return APICircuitBreaker.withCircuitBreaker(
          endpoint,
          async () => {
            const response = await apiClient.request<T>(config);
            return response.data;
          },
          requestContext
        );
      } else {
        const response = await apiClient.request<T>(config);
        return response.data;
      }
    };

    if (retries > 0) {
      return APIRetryHandler.withRetry(makeRequest, {
        maxAttempts: retries + 1,
        baseDelay: retryDelay,
        context: requestContext,
      });
    } else {
      return makeRequest();
    }
  }

  /**
   * GET request with enhanced error handling
   */
  static async get<T>(
    url: string,
    config?: AxiosRequestConfig,
    options?: Parameters<typeof EnhancedAPIClient.request>[1]
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url }, options);
  }

  /**
   * POST request with enhanced error handling
   */
  static async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    options?: Parameters<typeof EnhancedAPIClient.request>[1]
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data }, options);
  }

  /**
   * PUT request with enhanced error handling
   */
  static async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
    options?: Parameters<typeof EnhancedAPIClient.request>[1]
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data }, options);
  }

  /**
   * DELETE request with enhanced error handling
   */
  static async delete<T>(
    url: string,
    config?: AxiosRequestConfig,
    options?: Parameters<typeof EnhancedAPIClient.request>[1]
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url }, options);
  }
}

// Export the original client as default
export default apiClient;

