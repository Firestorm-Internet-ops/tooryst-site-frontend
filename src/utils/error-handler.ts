/**
 * Centralized Error Handling System
 * Feature: frontend-quality-improvements, Task 2.1: Centralized Error Handling
 * 
 * This module provides comprehensive error classification, context enrichment,
 * and consistent error message formatting for the entire application.
 */

import { ErrorTracker, TrackedError, ErrorType, ErrorContext } from './error-tracking';

/**
 * HTTP status code ranges for error classification
 */
export const HTTP_STATUS = {
  CLIENT_ERROR_MIN: 400,
  CLIENT_ERROR_MAX: 499,
  SERVER_ERROR_MIN: 500,
  SERVER_ERROR_MAX: 599,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,
} as const;

/**
 * Error severity levels for consistent classification
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Enhanced error context interface
 */
export interface EnhancedErrorContext extends ErrorContext {
  severity?: ErrorSeverity;
  recoverable?: boolean;
  userMessage?: string;
  technicalDetails?: Record<string, any>;
  correlationId?: string;
  sessionId?: string;
  feature?: string;
  retryable?: boolean;
  timestamp?: string;
}

/**
 * API Error class with enhanced context and classification
 */
export class APIError extends TrackedError {
  public readonly status: number;
  public readonly endpoint: string;
  public readonly method: string;
  public readonly responseData?: any;
  public readonly severity: ErrorSeverity;

  constructor(
    message: string,
    status: number,
    endpoint: string,
    method: string = 'GET',
    responseData?: any,
    context: EnhancedErrorContext = {}
  ) {
    const severity = APIError.determineSeverity(status);
    const enhancedContext = {
      ...context,
      severity,
      additionalData: {
        status,
        endpoint,
        method,
        responseData,
        ...context.additionalData,
      },
    };

    super(message, ErrorType.API_ERROR, enhancedContext);
    
    this.status = status;
    this.endpoint = endpoint;
    this.method = method;
    this.responseData = responseData;
    this.severity = severity;
    this.name = 'APIError';
  }

  /**
   * Determine error severity based on HTTP status code
   */
  private static determineSeverity(status: number): ErrorSeverity {
    if (status >= HTTP_STATUS.SERVER_ERROR_MIN) {
      return ErrorSeverity.HIGH;
    }
    if (status === HTTP_STATUS.UNAUTHORIZED || status === HTTP_STATUS.FORBIDDEN) {
      return ErrorSeverity.MEDIUM;
    }
    if (status === HTTP_STATUS.NOT_FOUND) {
      return ErrorSeverity.LOW;
    }
    if (status === HTTP_STATUS.VALIDATION_ERROR) {
      return ErrorSeverity.LOW;
    }
    if (status === HTTP_STATUS.TOO_MANY_REQUESTS) {
      return ErrorSeverity.MEDIUM;
    }
    return ErrorSeverity.MEDIUM;
  }

  /**
   * Check if the error is retryable based on status code
   */
  isRetryable(): boolean {
    const retryableStatuses = [
      HTTP_STATUS.TOO_MANY_REQUESTS,
      500, 502, 503, 504, // Server errors that might be temporary
    ];
    return retryableStatuses.includes(this.status);
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(): string {
    const enhancedContext = this.context as EnhancedErrorContext;
    if (enhancedContext.userMessage) {
      return enhancedContext.userMessage;
    }

    switch (this.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return 'Please log in to continue.';
      case HTTP_STATUS.FORBIDDEN:
        return 'You don\'t have permission to perform this action.';
      case HTTP_STATUS.NOT_FOUND:
        return 'The requested resource was not found.';
      case HTTP_STATUS.VALIDATION_ERROR:
        return 'Please check your input and try again.';
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return 'Too many requests. Please wait a moment and try again.';
      default:
        if (this.status >= HTTP_STATUS.SERVER_ERROR_MIN) {
          return 'A server error occurred. Please try again later.';
        }
        return 'An error occurred. Please try again.';
    }
  }
}

/**
 * Validation Error class with field-specific context
 */
export class ValidationError extends TrackedError {
  public readonly field: string;
  public readonly value: any;
  public readonly rule?: string;
  public readonly severity: ErrorSeverity = ErrorSeverity.LOW;

  constructor(
    message: string,
    field: string,
    value: any,
    rule?: string,
    context: EnhancedErrorContext = {}
  ) {
    const enhancedContext = {
      ...context,
      severity: ErrorSeverity.LOW,
      recoverable: true,
      additionalData: {
        field,
        value,
        rule,
        ...context.additionalData,
      },
    };

    super(message, ErrorType.VALIDATION_ERROR, enhancedContext);
    
    this.field = field;
    this.value = value;
    this.rule = rule;
    this.name = 'ValidationError';
  }

  /**
   * Get user-friendly validation message
   */
  getUserMessage(): string {
    const enhancedContext = this.context as EnhancedErrorContext;
    if (enhancedContext.userMessage) {
      return enhancedContext.userMessage;
    }

    const fieldName = this.field.charAt(0).toUpperCase() + this.field.slice(1);
    
    switch (this.rule) {
      case 'required':
        return `${fieldName} is required.`;
      case 'email':
        return `Please enter a valid email address.`;
      case 'minLength':
        return `${fieldName} is too short.`;
      case 'maxLength':
        return `${fieldName} is too long.`;
      case 'pattern':
        return `${fieldName} format is invalid.`;
      default:
        return this.message || `${fieldName} is invalid.`;
    }
  }
}

/**
 * Network Error class for connection and timeout issues
 */
export class NetworkError extends TrackedError {
  public readonly code?: string;
  public readonly timeout?: boolean;
  public readonly offline?: boolean;
  public readonly severity: ErrorSeverity = ErrorSeverity.MEDIUM;

  constructor(
    message: string,
    code?: string,
    context: EnhancedErrorContext = {}
  ) {
    const timeout = code === 'TIMEOUT' || message.includes('timeout');
    const offline = !navigator.onLine;
    
    const enhancedContext = {
      ...context,
      severity: ErrorSeverity.MEDIUM,
      recoverable: true,
      retryable: true,
      additionalData: {
        code,
        timeout,
        offline,
        ...context.additionalData,
      },
    };

    super(message, ErrorType.NETWORK_ERROR, enhancedContext);
    
    this.code = code;
    this.timeout = timeout;
    this.offline = offline;
    this.name = 'NetworkError';
  }

  /**
   * Get user-friendly network error message
   */
  getUserMessage(): string {
    const enhancedContext = this.context as EnhancedErrorContext;
    if (enhancedContext.userMessage) {
      return enhancedContext.userMessage;
    }

    if (this.offline) {
      return 'You appear to be offline. Please check your internet connection.';
    }
    
    if (this.timeout) {
      return 'The request timed out. Please try again.';
    }

    return 'Network error occurred. Please check your connection and try again.';
  }
}

/**
 * Authentication Error class
 */
export class AuthenticationError extends TrackedError {
  public readonly reason?: string;
  public readonly severity: ErrorSeverity = ErrorSeverity.MEDIUM;

  constructor(
    message: string,
    reason?: string,
    context: EnhancedErrorContext = {}
  ) {
    const enhancedContext = {
      ...context,
      severity: ErrorSeverity.MEDIUM,
      recoverable: true,
      additionalData: {
        reason,
        ...context.additionalData,
      },
    };

    super(message, ErrorType.AUTHENTICATION_ERROR, enhancedContext);
    
    this.reason = reason;
    this.name = 'AuthenticationError';
  }

  getUserMessage(): string {
    const enhancedContext = this.context as EnhancedErrorContext;
    if (enhancedContext.userMessage) {
      return enhancedContext.userMessage;
    }

    switch (this.reason) {
      case 'expired':
        return 'Your session has expired. Please log in again.';
      case 'invalid':
        return 'Invalid credentials. Please try again.';
      case 'required':
        return 'Please log in to continue.';
      default:
        return 'Authentication failed. Please log in again.';
    }
  }
}

/**
 * Permission Error class
 */
export class PermissionError extends TrackedError {
  public readonly resource?: string;
  public readonly action?: string;
  public readonly severity: ErrorSeverity = ErrorSeverity.MEDIUM;

  constructor(
    message: string,
    resource?: string,
    action?: string,
    context: EnhancedErrorContext = {}
  ) {
    const enhancedContext = {
      ...context,
      severity: ErrorSeverity.MEDIUM,
      recoverable: false,
      additionalData: {
        resource,
        action,
        ...context.additionalData,
      },
    };

    super(message, ErrorType.PERMISSION_ERROR, enhancedContext);
    
    this.resource = resource;
    this.action = action;
    this.name = 'PermissionError';
  }

  getUserMessage(): string {
    const enhancedContext = this.context as EnhancedErrorContext;
    if (enhancedContext.userMessage) {
      return enhancedContext.userMessage;
    }

    if (this.resource && this.action) {
      return `You don't have permission to ${this.action} ${this.resource}.`;
    }

    return 'You don\'t have permission to perform this action.';
  }
}

/**
 * Centralized Error Handler class
 */
export class ErrorHandler {
  /**
   * Handle and classify any error
   */
  static handle(
    error: unknown,
    context: EnhancedErrorContext = {}
  ): TrackedError {
    let classifiedError: TrackedError;

    // If it's already a TrackedError, enhance it with additional context
    if (error instanceof TrackedError) {
      // Create new context object with merged data
      const mergedContext = { ...error.context, ...context };
      
      // If it's one of our enhanced error types, preserve the type
      if (error instanceof APIError) {
        classifiedError = new APIError(
          error.message,
          error.status,
          error.endpoint,
          error.method,
          error.responseData,
          mergedContext
        );
      } else if (error instanceof ValidationError) {
        classifiedError = new ValidationError(
          error.message,
          error.field,
          error.value,
          error.rule,
          mergedContext
        );
      } else if (error instanceof NetworkError) {
        classifiedError = new NetworkError(
          error.message,
          error.code,
          mergedContext
        );
      } else if (error instanceof AuthenticationError) {
        classifiedError = new AuthenticationError(
          error.message,
          error.reason,
          mergedContext
        );
      } else if (error instanceof PermissionError) {
        classifiedError = new PermissionError(
          error.message,
          error.resource,
          error.action,
          mergedContext
        );
      } else {
        // Generic TrackedError
        classifiedError = new TrackedError(
          error.message,
          error.type,
          mergedContext
        );
      }
    }
    // Handle Axios errors
    else if (this.isAxiosError(error)) {
      classifiedError = this.handleAxiosError(error, context);
    }
    // Handle Fetch API errors
    else if (this.isFetchError(error)) {
      classifiedError = this.handleFetchError(error, context);
    }
    // Handle validation errors (from form libraries)
    else if (this.isValidationError(error)) {
      classifiedError = this.handleValidationError(error, context);
    }
    // Handle network errors
    else if (this.isNetworkError(error)) {
      classifiedError = this.handleNetworkError(error, context);
    }
    // Handle generic errors
    else if (error instanceof Error) {
      classifiedError = new TrackedError(
        error.message,
        ErrorType.UNKNOWN_ERROR,
        {
          ...context,
          additionalData: {
            originalError: error.name,
            stack: error.stack,
            severity: ErrorSeverity.MEDIUM,
            ...context.additionalData,
          },
        }
      );
    }
    // Handle non-Error objects
    else {
      classifiedError = new TrackedError(
        String(error) || 'Unknown error occurred',
        ErrorType.UNKNOWN_ERROR,
        {
          ...context,
          additionalData: {
            originalError: error,
            severity: ErrorSeverity.MEDIUM,
            ...context.additionalData,
          },
        }
      );
    }

    // Enrich context with runtime information
    const enrichedContext = this.enrichContext(classifiedError.context as EnhancedErrorContext);
    
    // Create a new error with enriched context, preserving the original type
    let finalError: TrackedError;
    
    if (classifiedError instanceof APIError) {
      finalError = new APIError(
        classifiedError.message,
        classifiedError.status,
        classifiedError.endpoint,
        classifiedError.method,
        classifiedError.responseData,
        enrichedContext
      );
    } else if (classifiedError instanceof ValidationError) {
      finalError = new ValidationError(
        classifiedError.message,
        classifiedError.field,
        classifiedError.value,
        classifiedError.rule,
        enrichedContext
      );
    } else if (classifiedError instanceof NetworkError) {
      finalError = new NetworkError(
        classifiedError.message,
        classifiedError.code,
        enrichedContext
      );
    } else if (classifiedError instanceof AuthenticationError) {
      finalError = new AuthenticationError(
        classifiedError.message,
        classifiedError.reason,
        enrichedContext
      );
    } else if (classifiedError instanceof PermissionError) {
      finalError = new PermissionError(
        classifiedError.message,
        classifiedError.resource,
        classifiedError.action,
        enrichedContext
      );
    } else {
      finalError = new TrackedError(
        classifiedError.message,
        classifiedError.type,
        enrichedContext
      );
    }

    // Track the error
    ErrorTracker.trackError(finalError, enrichedContext);

    return finalError;
  }

  /**
   * Handle Axios errors
   */
  private static handleAxiosError(
    error: any,
    context: EnhancedErrorContext
  ): TrackedError {
    const response = error.response;
    const request = error.request;
    const config = error.config;

    if (response) {
      // Server responded with error status
      return new APIError(
        response.data?.message || error.message || 'API request failed',
        response.status,
        config?.url || 'unknown',
        config?.method?.toUpperCase() || 'GET',
        response.data,
        context
      );
    } else if (request) {
      // Request was made but no response received
      return new NetworkError(
        'Network request failed - no response received',
        'NO_RESPONSE',
        context
      );
    } else {
      // Request setup error
      return new TrackedError(
        error.message || 'Request configuration error',
        ErrorType.UNKNOWN_ERROR,
        {
          ...context,
          additionalData: {
            axiosError: true,
            severity: ErrorSeverity.MEDIUM,
            ...context.additionalData,
          },
        }
      );
    }
  }

  /**
   * Handle Fetch API errors
   */
  private static handleFetchError(
    error: any,
    context: EnhancedErrorContext
  ): NetworkError {
    if (error.name === 'AbortError') {
      return new NetworkError(
        'Request was cancelled',
        'ABORTED',
        context
      );
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return new NetworkError(
        'Network connection failed',
        'CONNECTION_FAILED',
        context
      );
    }

    return new NetworkError(
      error.message || 'Fetch request failed',
      error.name,
      context
    );
  }

  /**
   * Handle validation errors
   */
  private static handleValidationError(
    error: any,
    context: EnhancedErrorContext
  ): ValidationError {
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      const firstIssue = error.issues?.[0];
      if (firstIssue) {
        return new ValidationError(
          firstIssue.message,
          firstIssue.path?.join('.') || 'unknown',
          firstIssue.received,
          firstIssue.code,
          context
        );
      }
    }

    // Handle other validation libraries
    return new ValidationError(
      error.message || 'Validation failed',
      error.field || 'unknown',
      error.value,
      error.rule,
      context
    );
  }

  /**
   * Handle network errors
   */
  private static handleNetworkError(
    error: any,
    context: EnhancedErrorContext
  ): NetworkError {
    let code = error.code || error.name;
    let message = error.message || 'Network error occurred';

    // Handle specific network error patterns
    if (error.message?.includes('fetch failed') || error.message?.includes('Failed to fetch')) {
      code = 'CONNECTION_FAILED';
      message = 'Network connection failed';
    } else if (error.name === 'TypeError' && error.message?.includes('fetch')) {
      code = 'FETCH_ERROR';
      message = 'Network request failed';
    }

    return new NetworkError(message, code, context);
  }

  /**
   * Enrich error context with runtime information
   */
  private static enrichContext(context: EnhancedErrorContext): EnhancedErrorContext {
    const enriched: EnhancedErrorContext = {
      ...context,
      timestamp: new Date().toISOString(),
    };

    // Add browser context if available
    if (typeof window !== 'undefined') {
      enriched.userAgent = window.navigator.userAgent;
      enriched.url = window.location.href;
      
      // Add session/correlation IDs if available
      if (!enriched.sessionId) {
        enriched.sessionId = sessionStorage.getItem('sessionId') || undefined;
      }
      
      // Add feature context from URL
      if (!enriched.feature) {
        const pathname = window.location.pathname;
        if (pathname.includes('/attractions/')) {
          enriched.feature = 'attractions';
        } else if (pathname.includes('/cities/')) {
          enriched.feature = 'cities';
        } else if (pathname.includes('/search')) {
          enriched.feature = 'search';
        }
      }
    }

    // Add performance context
    if (typeof performance !== 'undefined') {
      enriched.technicalDetails = {
        ...enriched.technicalDetails,
        memoryUsage: (performance as any).memory ? {
          used: (performance as any).memory.usedJSHeapSize,
          total: (performance as any).memory.totalJSHeapSize,
          limit: (performance as any).memory.jsHeapSizeLimit,
        } : undefined,
        timing: performance.now(),
      };
    }

    return enriched;
  }

  /**
   * Type guards for error classification
   */
  private static isAxiosError(error: any): boolean {
    return error?.isAxiosError === true || (error?.config && error?.request);
  }

  private static isFetchError(error: any): boolean {
    return error instanceof TypeError && 
           (error.message.includes('fetch') || error.message.includes('Failed to fetch'));
  }

  private static isValidationError(error: any): boolean {
    return error?.name === 'ZodError' || 
           error?.name === 'ValidationError' ||
           (error?.field && error?.rule);
  }

  private static isNetworkError(error: any): boolean {
    return error?.code === 'NETWORK_ERROR' ||
           error?.code === 'ECONNREFUSED' ||
           error?.code === 'TIMEOUT' ||
           error?.name === 'NetworkError' ||
           (error?.name === 'TypeError' && error?.message?.includes('fetch'));
  }

  /**
   * Format error message consistently
   */
  static formatErrorMessage(
    error: TrackedError,
    includeDetails: boolean = false
  ): string {
    let message = '';

    // Get user-friendly message if available
    if ('getUserMessage' in error && typeof error.getUserMessage === 'function') {
      message = (error as any).getUserMessage();
    } else {
      message = error.message;
    }

    // Add technical details in development or when explicitly requested
    if (includeDetails) {
      const details = [];
      
      if (error instanceof APIError) {
        details.push(`Status: ${error.status}`);
        details.push(`Endpoint: ${error.endpoint}`);
        if (error.method) details.push(`Method: ${error.method}`);
      }
      
      if (error instanceof ValidationError) {
        details.push(`Field: ${error.field}`);
        if (error.rule) details.push(`Rule: ${error.rule}`);
      }
      
      if (error instanceof NetworkError && error.code) {
        details.push(`Code: ${error.code}`);
      }

      if (error instanceof AuthenticationError && error.reason) {
        details.push(`Reason: ${error.reason}`);
      }

      if (error instanceof PermissionError) {
        if (error.resource) details.push(`Resource: ${error.resource}`);
        if (error.action) details.push(`Action: ${error.action}`);
      }

      if (details.length > 0) {
        message += ` (${details.join(', ')})`;
      }
    }

    return message;
  }

  /**
   * Get recovery suggestions for an error
   */
  static getRecoverySuggestions(error: TrackedError): string[] {
    const suggestions: string[] = [];

    if (error instanceof NetworkError) {
      suggestions.push('Check your internet connection');
      if (error.timeout) {
        suggestions.push('Try again in a few moments');
      }
      suggestions.push('Refresh the page');
    } else if (error instanceof APIError) {
      if (error.isRetryable()) {
        suggestions.push('Try again in a few moments');
      }
      if (error.status === HTTP_STATUS.UNAUTHORIZED) {
        suggestions.push('Log in again');
      }
      if (error.status === HTTP_STATUS.FORBIDDEN) {
        suggestions.push('Contact support if you believe this is an error');
      }
    } else if (error instanceof ValidationError) {
      suggestions.push('Check your input and try again');
      suggestions.push('Make sure all required fields are filled');
    } else if (error instanceof AuthenticationError) {
      suggestions.push('Log in again');
      suggestions.push('Clear your browser cache and cookies');
    }

    // Generic suggestions
    if (suggestions.length === 0) {
      suggestions.push('Refresh the page');
      suggestions.push('Try again later');
      suggestions.push('Contact support if the problem persists');
    }

    return suggestions;
  }
}

/**
 * Convenience functions for creating specific error types
 */

export function createAPIError(
  message: string,
  status: number,
  endpoint: string,
  method: string = 'GET',
  responseData?: any,
  context?: EnhancedErrorContext
): APIError {
  return new APIError(message, status, endpoint, method, responseData, context);
}

export function createValidationError(
  message: string,
  field: string,
  value: any,
  rule?: string,
  context?: EnhancedErrorContext
): ValidationError {
  return new ValidationError(message, field, value, rule, context);
}

export function createNetworkError(
  message: string,
  code?: string,
  context?: EnhancedErrorContext
): NetworkError {
  return new NetworkError(message, code, context);
}

export function createAuthenticationError(
  message: string,
  reason?: string,
  context?: EnhancedErrorContext
): AuthenticationError {
  return new AuthenticationError(message, reason, context);
}

export function createPermissionError(
  message: string,
  resource?: string,
  action?: string,
  context?: EnhancedErrorContext
): PermissionError {
  return new PermissionError(message, resource, action, context);
}