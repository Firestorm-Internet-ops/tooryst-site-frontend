/**
 * API Error Handler Integration
 * Feature: frontend-quality-improvements, Task 2.1: Centralized Error Handling
 * 
 * This module integrates the centralized error handling system with API clients
 * and provides consistent error handling across all API interactions.
 */

import { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { ErrorHandler, APIError, NetworkError, AuthenticationError, PermissionError, EnhancedErrorContext } from './error-handler';

/**
 * API Error Handler for Axios interceptors
 */
export class APIErrorHandler {
  /**
   * Handle Axios response errors
   */
  static handleResponseError(
    error: AxiosError,
    context: EnhancedErrorContext = {}
  ): Promise<never> {
    const enhancedContext = {
      ...context,
      component: context.component || 'APIClient',
      action: context.action || 'api_request',
    };

    const classifiedError = ErrorHandler.handle(error, enhancedContext);

    // For certain errors, we might want to trigger specific actions
    if (classifiedError instanceof AuthenticationError) {
      // Clear authentication state
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    }

    return Promise.reject(classifiedError);
  }

  /**
   * Handle successful responses but check for business logic errors
   */
  static handleResponse<T>(
    response: AxiosResponse<T>,
    context: EnhancedErrorContext = {}
  ): AxiosResponse<T> {
    // Check for business logic errors in successful HTTP responses
    const data = response.data as any;

    if (data && typeof data === 'object') {
      // Handle common API error patterns
      if (data.error || data.success === false) {
        const errorMessage = data.error || data.message || 'API returned an error';
        const apiError = new APIError(
          errorMessage,
          response.status,
          response.config?.url || 'unknown',
          response.config?.method?.toUpperCase() || 'GET',
          data,
          {
            ...context,
            severity: data.severity || 'medium',
            userMessage: data.userMessage,
          }
        );

        ErrorHandler.handle(apiError, context);
        throw apiError;
      }

      // Handle validation errors in successful responses
      if (data.validationErrors || data.fieldErrors) {
        const validationErrors = data.validationErrors || data.fieldErrors;
        const firstError = Array.isArray(validationErrors)
          ? validationErrors[0]
          : validationErrors;

        if (firstError) {
          const validationError = ErrorHandler.handle(
            new Error(firstError.message || 'Validation failed'),
            {
              ...context,
              additionalData: {
                field: firstError.field,
                value: firstError.value,
                rule: firstError.rule,
                allErrors: validationErrors,
              },
            }
          );
          throw validationError;
        }
      }
    }

    return response;
  }

  /**
   * Create context for API requests
   */
  static createRequestContext(
    config: AxiosRequestConfig,
    additionalContext: EnhancedErrorContext = {}
  ): EnhancedErrorContext {
    return {
      ...additionalContext,
      component: additionalContext.component || 'APIClient',
      action: additionalContext.action || `${config.method?.toUpperCase()}_${config.url}`,
      feature: additionalContext.feature || APIErrorHandler.extractFeatureFromUrl(config.url),
      additionalData: {
        endpoint: config.url,
        method: config.method?.toUpperCase(),
        params: config.params,
        ...additionalContext.additionalData,
      },
    };
  }

  /**
   * Extract feature name from API URL
   */
  private static extractFeatureFromUrl(url?: string): string | undefined {
    if (!url) return undefined;

    if (url.includes('/attractions')) return 'attractions';
    if (url.includes('/cities')) return 'cities';
    if (url.includes('/search')) return 'search';
    if (url.includes('/auth')) return 'authentication';
    if (url.includes('/user')) return 'user';

    return undefined;
  }
}

/**
 * Fetch API Error Handler
 */
export class FetchErrorHandler {
  /**
   * Handle fetch response errors
   */
  static async handleResponse(
    response: Response,
    context: EnhancedErrorContext = {}
  ): Promise<Response> {
    if (!response.ok) {
      let errorData: any;
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } else {
          errorMessage = await response.text() || errorMessage;
        }
      } catch {
        // If we can't parse the error response, use the default message
      }

      const apiError = new APIError(
        errorMessage,
        response.status,
        response.url,
        'GET', // Default method, should be passed in context if known
        errorData,
        {
          ...context,
          additionalData: {
            headers: Object.fromEntries(response.headers.entries()),
            ...context.additionalData,
          },
        }
      );

      ErrorHandler.handle(apiError, context);
      throw apiError;
    }

    return response;
  }

  /**
   * Handle fetch network errors
   */
  static handleNetworkError(
    error: Error,
    context: EnhancedErrorContext = {}
  ): never {
    const networkError = ErrorHandler.handle(error, {
      ...context,
      component: context.component || 'FetchClient',
      action: context.action || 'fetch_request',
    });

    throw networkError;
  }
}

/**
 * Retry logic for API requests
 */
export class APIRetryHandler {
  /**
   * Determine if an error is retryable
   */
  static isRetryable(error: unknown): boolean {
    if (error instanceof APIError) {
      return error.isRetryable();
    }

    if (error instanceof NetworkError) {
      return error.context.retryable !== false;
    }

    // Don't retry authentication or permission errors
    if (error instanceof AuthenticationError || error instanceof PermissionError) {
      return false;
    }

    return false;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  static calculateRetryDelay(attempt: number, baseDelay: number = 1000): number {
    const exponentialDelay = Math.pow(2, attempt) * baseDelay;
    const jitter = Math.random() * 0.1 * exponentialDelay; // Add 10% jitter
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
  }

  /**
   * Execute a function with retry logic
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    options: {
      maxAttempts?: number;
      baseDelay?: number;
      context?: EnhancedErrorContext;
    } = {}
  ): Promise<T> {
    const { maxAttempts = 3, baseDelay = 1000, context = {} } = options;
    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry if it's not a retryable error
        if (!this.isRetryable(error)) {
          throw error;
        }

        // Don't retry on the last attempt
        if (attempt === maxAttempts - 1) {
          break;
        }

        // Wait before retrying
        const delay = this.calculateRetryDelay(attempt, baseDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // If we get here, all attempts failed
    const enhancedError = ErrorHandler.handle(lastError, {
      ...context,
      additionalData: {
        retryAttempts: maxAttempts,
        finalAttempt: true,
        ...context.additionalData,
      },
    });

    throw enhancedError;
  }
}

/**
 * Circuit breaker pattern for API resilience
 */
export class APICircuitBreaker {
  private static failures = new Map<string, number>();
  private static lastFailureTime = new Map<string, number>();
  private static readonly FAILURE_THRESHOLD = 5;
  private static readonly RECOVERY_TIMEOUT = 60000; // 1 minute

  /**
   * Check if circuit is open for a given endpoint
   */
  static isCircuitOpen(endpoint: string): boolean {
    const failures = this.failures.get(endpoint) || 0;
    const lastFailure = this.lastFailureTime.get(endpoint) || 0;
    const now = Date.now();

    // If we haven't reached the failure threshold, circuit is closed
    if (failures < this.FAILURE_THRESHOLD) {
      return false;
    }

    // If enough time has passed, reset the circuit
    if (now - lastFailure > this.RECOVERY_TIMEOUT) {
      this.failures.set(endpoint, 0);
      this.lastFailureTime.delete(endpoint);
      return false;
    }

    return true;
  }

  /**
   * Record a failure for an endpoint
   */
  static recordFailure(endpoint: string): void {
    const currentFailures = this.failures.get(endpoint) || 0;
    this.failures.set(endpoint, currentFailures + 1);
    this.lastFailureTime.set(endpoint, Date.now());
  }

  /**
   * Record a success for an endpoint
   */
  static recordSuccess(endpoint: string): void {
    this.failures.set(endpoint, 0);
    this.lastFailureTime.delete(endpoint);
  }

  /**
   * Execute a function with circuit breaker protection
   */
  static async withCircuitBreaker<T>(
    endpoint: string,
    fn: () => Promise<T>,
    context: EnhancedErrorContext = {}
  ): Promise<T> {
    // Check if circuit is open
    if (this.isCircuitOpen(endpoint)) {
      const circuitError = new APIError(
        'Service temporarily unavailable due to repeated failures',
        503,
        endpoint,
        'GET',
        undefined,
        {
          ...context,
          severity: 'high',
          userMessage: 'This service is temporarily unavailable. Please try again later.',
          additionalData: {
            circuitBreakerOpen: true,
            failures: this.failures.get(endpoint),
            ...context.additionalData,
          },
        }
      );

      ErrorHandler.handle(circuitError, context);
      throw circuitError;
    }

    try {
      const result = await fn();
      this.recordSuccess(endpoint);
      return result;
    } catch (error) {
      this.recordFailure(endpoint);
      throw error;
    }
  }
}