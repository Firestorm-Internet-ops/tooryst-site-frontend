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
 * Severity levels for error tracking
 */
export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

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
 * Centralized error tracking utility (Sentry removed, console logging only)
 */
export class ErrorTracker {
  /**
   * Track an error with console logging
   */
  static trackError(
    error: Error | TrackedError,
    context: ErrorContext = {},
    level: SeverityLevel = 'error'
  ): void {
    // Enrich context with additional information
    const enrichedContext = {
      ...context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    // Console logging
    console.error('Error Tracked:', error);
  }

  /**
   * Track a warning or info message
   */
  static trackMessage(
    message: string,
    level: SeverityLevel = 'info',
    context: ErrorContext = {}
  ): void {
  }

  /**
   * Set user context for error tracking (no-op without Sentry)
   */
  static setUser(user: { id: string; email?: string; username?: string }): void {
  }

  /**
   * Clear user context (no-op without Sentry)
   */
  static clearUser(): void {
  }

  /**
   * Add breadcrumb for debugging
   */
  static addBreadcrumb(
    message: string,
    category: string = 'custom',
    level: SeverityLevel = 'info',
    data?: Record<string, any>
  ): void {
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