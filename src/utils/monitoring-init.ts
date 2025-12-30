import { PerformanceMonitor } from './performance-monitoring';

/**
 * Initialize monitoring systems
 */
export function initializeMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Initialize Web Vitals tracking
  PerformanceMonitor.trackWebVitals();

  // Track initial page load
  PerformanceMonitor.trackPageLoad('initial');

  // Add global error handler for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    // Import ErrorTracker dynamically to avoid circular dependencies
    import('./error-tracking').then(({ ErrorTracker, TrackedError, ErrorType }) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new TrackedError(
            String(event.reason),
            ErrorType.UNKNOWN_ERROR,
            { action: 'unhandled_promise_rejection' }
          );
      
      ErrorTracker.trackError(error, {
        action: 'unhandled_promise_rejection',
        additionalData: {
          reason: event.reason,
        },
      });
    });
  });

  // Add global error handler for JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    // Import ErrorTracker dynamically to avoid circular dependencies
    import('./error-tracking').then(({ ErrorTracker }) => {
      ErrorTracker.trackError(event.error || new Error(event.message), {
        action: 'global_error',
        additionalData: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });
  });

  // Track page visibility changes for performance context
  document.addEventListener('visibilitychange', () => {
    PerformanceMonitor.trackCustomMetric(
      'page_visibility_change',
      Date.now(),
      'timestamp'
    );
  });

  console.log('🔍 Monitoring systems initialized');
}