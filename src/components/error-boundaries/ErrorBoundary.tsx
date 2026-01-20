'use client';

/**
 * Comprehensive Error Boundary Components
 * Feature: frontend-quality-improvements, Task 5.3: Add Comprehensive Error Boundaries to Component Tree
 *
 * Error boundary components (Sentry removed, console logging only):
 * - React Error Boundary with fallback UI
 * - Console error reporting
 * - Context-aware error handling
 * - Recovery mechanisms and retry logic
 * - Performance monitoring integration
 */

import React, { Component } from 'react';
import { PerformanceMonitor } from '@/utils/performance-monitoring';

/**
 * Error boundary state interface
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  lastErrorTime: number;
}

/**
 * Error boundary props interface
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps> | React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo, errorId?: string) => void;
  onRetry?: () => void;
  maxRetries?: number;
  retryDelay?: number;
  level?: 'page' | 'section' | 'component';
  context?: Record<string, any>;
  showDetails?: boolean;
  enableRetry?: boolean;
}

/**
 * Error fallback component props
 */
interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
  retry: () => void;
  canRetry: boolean;
  retryCount: number;
  maxRetries: number;
  level: string;
  context?: Record<string, any>;
  showDetails: boolean;
}

/**
 * Default error fallback component
 */
export function DefaultErrorFallback({
  error,
  errorInfo,
  errorId,
  retry,
  canRetry,
  retryCount,
  maxRetries,
  level,
  context,
  showDetails,
}: ErrorFallbackProps) {
  const getErrorTitle = () => {
    switch (level) {
      case 'page':
        return 'Page Error';
      case 'section':
        return 'Section Error';
      case 'component':
        return 'Component Error';
      default:
        return 'Application Error';
    }
  };

  const getErrorMessage = () => {
    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
      return 'Failed to load application resources. This might be due to a network issue or an application update.';
    }

    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return 'Network connection error. Please check your internet connection and try again.';
    }

    return 'An unexpected error occurred. Please try refreshing the page.';
  };

  const getErrorIcon = () => {
    switch (level) {
      case 'page':
        return (
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'section':
        return (
          <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const containerClasses = {
    page: 'min-h-screen flex items-center justify-center bg-gray-50 px-4',
    section: 'min-h-96 flex items-center justify-center bg-gray-50 rounded-lg p-8',
    component: 'min-h-32 flex items-center justify-center bg-gray-50 rounded p-4',
  };

  const contentClasses = {
    page: 'max-w-md w-full text-center',
    section: 'max-w-sm w-full text-center',
    component: 'max-w-xs w-full text-center',
  };

  return (
    <div className={containerClasses[level as keyof typeof containerClasses] || containerClasses.component}>
      <div className={contentClasses[level as keyof typeof contentClasses] || contentClasses.component}>
        {getErrorIcon()}

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {getErrorTitle()}
        </h2>

        <p className="text-gray-600 mb-6">
          {getErrorMessage()}
        </p>

        {errorId && (
          <p className="text-xs text-gray-400 mb-4">
            Error ID: {errorId}
          </p>
        )}

        <div className="space-y-3">
          {canRetry && (
            <button
              onClick={retry}
              className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              {retryCount > 0 ? `Retry (${retryCount}/${maxRetries})` : 'Try Again'}
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Reload Page
          </button>

          {level === 'page' && (
            <button
              onClick={() => window.location.href = '/'}
              className="w-full text-primary-600 hover:text-primary-700 transition-colors font-medium"
            >
              Go to Homepage
            </button>
          )}
        </div>

        {showDetails && process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details (Development)
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              {error.stack && (
                <div className="mb-2">
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                </div>
              )}
              {context && Object.keys(context).length > 0 && (
                <div className="mb-2">
                  <strong>Context:</strong>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(context, null, 2)}</pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                </div>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

/**
 * Comprehensive Error Boundary Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      lastErrorTime: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      lastErrorTime: Date.now(),
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { onError, level = 'component', context } = this.props;

    // Generate unique error ID
    const errorId = `${level}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Update state with error info and ID
    this.setState({
      errorInfo,
      errorId,
    });

    // Track performance impact
    PerformanceMonitor.trackCustomMetric('error-boundary-catch', Date.now());

    // Enhanced error context
    const enhancedContext = {
      level,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      retryCount: this.state.retryCount,
      ...context,
    };

    // Log error to console (Sentry removed)
    console.group(`🚨 Error Boundary (${level})`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Context:', enhancedContext);
    console.error('Error ID:', errorId);
    console.groupEnd();

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo, errorId);
    }
  }

  handleRetry = () => {
    const { maxRetries = 3, retryDelay = 1000, onRetry } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      return;
    }

    // Clear any existing timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Exponential backoff for retries
    const delay = retryDelay * Math.pow(2, retryCount);

    this.retryTimeoutId = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        retryCount: retryCount + 1,
      });

      // Call custom retry handler
      if (onRetry) {
        onRetry();
      }

      // Track retry attempt
      PerformanceMonitor.trackCustomMetric('error-boundary-retry', retryCount + 1);
    }, delay);
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    const {
      children,
      fallback,
      maxRetries = 3,
      level = 'component',
      context,
      showDetails = false,
      enableRetry = true,
    } = this.props;

    const { hasError, error, errorInfo, errorId, retryCount } = this.state;

    if (hasError && error) {
      const canRetry = enableRetry && retryCount < maxRetries;

      // If fallback is a ReactNode, render it directly
      if (fallback && !React.isValidElement(fallback) && typeof fallback !== 'function') {
        return <>{fallback}</>;
      }

      // If fallback is a Component, render with props
      const FallbackComponent = (typeof fallback === 'function' ? fallback : DefaultErrorFallback) as React.ComponentType<ErrorFallbackProps>;

      return (
        <FallbackComponent
          error={error}
          errorInfo={errorInfo}
          errorId={errorId}
          retry={this.handleRetry}
          canRetry={canRetry}
          retryCount={retryCount}
          maxRetries={maxRetries}
          level={level}
          context={context}
          showDetails={showDetails}
        />
      );
    }

    return children;
  }
}

/**
 * Higher-order component for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * Hook for error handler
 */
export function useErrorHandler() {
  return React.useCallback((error: Error, errorInfo?: any) => {
    // Log error to console (Sentry removed)
    console.group('🚨 Error Handler');
    console.error('Error:', error);
    if (errorInfo) {
      console.error('Error Info:', errorInfo);
    }
    console.groupEnd();

    // Re-throw error to be caught by error boundary
    throw error;
  }, []);
}

/**
 * Specialized error boundaries for different contexts
 */

// Page-level error boundary
export function PageErrorBoundary({ children, ...props }: Omit<ErrorBoundaryProps, 'level'>) {
  return (
    <ErrorBoundary level="page" maxRetries={2} showDetails={true} {...props}>
      {children}
    </ErrorBoundary>
  );
}

// Section-level error boundary
export function SectionErrorBoundary({ children, ...props }: Omit<ErrorBoundaryProps, 'level'>) {
  return (
    <ErrorBoundary level="section" maxRetries={3} enableRetry={true} {...props}>
      {children}
    </ErrorBoundary>
  );
}

// Component-level error boundary
export function ComponentErrorBoundary({ children, ...props }: Omit<ErrorBoundaryProps, 'level'>) {
  return (
    <ErrorBoundary level="component" maxRetries={1} enableRetry={false} {...props}>
      {children}
    </ErrorBoundary>
  );
}

// Async component error boundary
export function AsyncErrorBoundary({ children, ...props }: Omit<ErrorBoundaryProps, 'level'>) {
  return (
    <ErrorBoundary
      level="component"
      maxRetries={2}
      retryDelay={2000}
      context={{ type: 'async-component' }}
      {...props}
    >
      <React.Suspense fallback={<div className="animate-pulse bg-gray-200 rounded h-32" />}>
        {children}
      </React.Suspense>
    </ErrorBoundary>
  );
}

// Export all components and utilities
export default ErrorBoundary;