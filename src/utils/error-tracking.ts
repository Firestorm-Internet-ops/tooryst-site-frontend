import * as Sentry from '@sentry/nextjs';

/**
 * Error types for classification
 */
export enum ErrorType {
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Error context interface for enriching error reports
 */
export interface ErrorContext {
  userId?: string;
  userAgent?: string;
  url?: string;
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

/**
 * Custom error class with enhanced context
 */
export class TrackedError extends Error {
  public readonly type: ErrorType;
  public readonly context: ErrorContext;
  public readonly timestamp: Date;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN_ERROR,
    context: ErrorContext = {}
  ) {
    super(message);
    this.name = 'TrackedError';
    this.type = type;
    this.context = context;
    this.timestamp = new Date();
  }
}

/**
 * Centralized error tracking utility
 */
export class ErrorTracker {
  /**
   * Track an error with Sentry and console logging
   */
  static trackError(
    error: Error | TrackedError,
    context: ErrorContext = {},
    level: Sentry.SeverityLevel = 'error'
  ): void {
    // Enrich context with additional information
    const enrichedContext = {
      ...context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Set Sentry context
    Sentry.withScope((scope) => {
      scope.setLevel(level);
      
      // Add error type if it's a TrackedError
      if (error instanceof TrackedError) {
        scope.setTag('errorType', error.type);
        scope.setContext('errorDetails', {
          type: error.type,
          timestamp: error.timestamp.toISOString(),
          ...error.context,
        });
      }

      // Add general context
      scope.setContext('errorContext', enrichedContext);

      // Add user context if available
      if (enrichedContext.userId) {
        scope.setUser({ id: enrichedContext.userId });
      }

      // Add component context if available
      if (enrichedContext.component) {
        scope.setTag('component', enrichedContext.component);
      }

      // Add action context if available
      if (enrichedContext.action) {
        scope.setTag('action', enrichedContext.action);
      }

      // Capture the error
      Sentry.captureException(error);
    });

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Tracked: ${error.message}`);
      console.error('Error:', error);
      console.log('Context:', enrichedContext);
      if (error instanceof TrackedError) {
        console.log('Type:', error.type);
        console.log('Timestamp:', error.timestamp);
      }
      console.groupEnd();
    }
  }

  /**
   * Track a warning or info message
   */
  static trackMessage(
    message: string,
    level: Sentry.SeverityLevel = 'info',
    context: ErrorContext = {}
  ): void {
    Sentry.withScope((scope) => {
      scope.setLevel(level);
      scope.setContext('messageContext', context as any);
      
      if (context.component) {
        scope.setTag('component', context.component);
      }
      
      if (context.action) {
        scope.setTag('action', context.action);
      }

      Sentry.captureMessage(message);
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`📝 Message Tracked (${level}): ${message}`, context);
    }
  }

  /**
   * Set user context for error tracking
   */
  static setUser(user: { id: string; email?: string; username?: string }): void {
    Sentry.setUser(user);
  }

  /**
   * Clear user context
   */
  static clearUser(): void {
    Sentry.setUser(null);
  }

  /**
   * Add breadcrumb for debugging
   */
  static addBreadcrumb(
    message: string,
    category: string = 'custom',
    level: Sentry.SeverityLevel = 'info',
    data?: Record<string, any>
  ): void {
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000,
    });
  }
}

/**
 * Higher-order function to wrap async functions with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: ErrorContext = {}
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorTracker.trackError(
        error instanceof Error ? error : new Error(String(error)),
        context
      );
      throw error;
    }
  }) as T;
}

/**
 * React error boundary helper
 */
export function trackComponentError(
  error: Error,
  errorInfo: { componentStack: string },
  componentName: string
): void {
  ErrorTracker.trackError(error, {
    component: componentName,
    additionalData: {
      componentStack: errorInfo.componentStack,
    },
  });
}

/**
 * API error helper
 */
export function createAPIError(
  message: string,
  status: number,
  endpoint: string,
  method: string = 'GET'
): TrackedError {
  return new TrackedError(
    message,
    ErrorType.API_ERROR,
    {
      additionalData: {
        status,
        endpoint,
        method,
      },
    }
  );
}

/**
 * Validation error helper
 */
export function createValidationError(
  message: string,
  field: string,
  value: any
): TrackedError {
  return new TrackedError(
    message,
    ErrorType.VALIDATION_ERROR,
    {
      additionalData: {
        field,
        value,
      },
    }
  );
}