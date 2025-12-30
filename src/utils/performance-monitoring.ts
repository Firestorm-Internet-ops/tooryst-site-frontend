import * as Sentry from '@sentry/nextjs';

/**
 * Performance monitoring utility with Sentry integration
 */
export class PerformanceMonitor {
  /**
   * Start a performance transaction
   */
  static startTransaction(name: string, op: string = 'navigation'): any {
    if (typeof window === 'undefined') return undefined;

    // Use the newer Sentry.startSpan API instead of deprecated startTransaction
    return Sentry.startSpan({
      name,
      op,
    }, (span) => span);
  }

  /**
   * Measure and track Web Vitals
   */
  static async trackWebVitals(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');

      // Cumulative Layout Shift
      onCLS((metric: any) => {
        Sentry.addBreadcrumb({
          category: 'web-vital',
          message: `CLS: ${metric.value}`,
          level: 'info',
          data: metric,
        });

        if (metric.value > 0.1) {
          Sentry.captureMessage(`Poor CLS: ${metric.value}`, 'warning');
        }
      });

      // Interaction to Next Paint (replaces FID in v5)
      onINP((metric: any) => {
        Sentry.addBreadcrumb({
          category: 'web-vital',
          message: `INP: ${metric.value}ms`,
          level: 'info',
          data: metric,
        });

        if (metric.value > 200) {
          Sentry.captureMessage(`Poor INP: ${metric.value}ms`, 'warning');
        }
      });

      // First Contentful Paint
      onFCP((metric: any) => {
        Sentry.addBreadcrumb({
          category: 'web-vital',
          message: `FCP: ${metric.value}ms`,
          level: 'info',
          data: metric,
        });

        if (metric.value > 1800) {
          Sentry.captureMessage(`Poor FCP: ${metric.value}ms`, 'warning');
        }
      });

      // Largest Contentful Paint
      onLCP((metric: any) => {
        Sentry.addBreadcrumb({
          category: 'web-vital',
          message: `LCP: ${metric.value}ms`,
          level: 'info',
          data: metric,
        });

        if (metric.value > 2500) {
          Sentry.captureMessage(`Poor LCP: ${metric.value}ms`, 'warning');
        }
      });

      // Time to First Byte
      onTTFB((metric: any) => {
        Sentry.addBreadcrumb({
          category: 'web-vital',
          message: `TTFB: ${metric.value}ms`,
          level: 'info',
          data: metric,
        });

        if (metric.value > 800) {
          Sentry.captureMessage(`Poor TTFB: ${metric.value}ms`, 'warning');
        }
      });
    } catch (error) {
      console.warn('Failed to load web-vitals:', error);
    }
  }

  /**
   * Track custom performance metrics
   */
  static trackCustomMetric(name: string, value: number, unit: string = 'ms'): void {
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${name}: ${value}${unit}`,
      level: 'info',
      data: { name, value, unit },
    });

    // Set custom measurement
    Sentry.setMeasurement(name, value, unit);
  }

  /**
   * Measure function execution time
   */
  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      const duration = performance.now() - startTime;
      
      this.trackCustomMetric(name, duration);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.trackCustomMetric(`${name}_error`, duration);
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  static measure<T>(name: string, fn: () => T): T {
    const startTime = performance.now();
    
    try {
      const result = fn();
      const duration = performance.now() - startTime;
      
      this.trackCustomMetric(name, duration);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.trackCustomMetric(`${name}_error`, duration);
      throw error;
    }
  }

  /**
   * Track page load performance
   */
  static trackPageLoad(pageName: string): void {
    if (typeof window === 'undefined') return;

    // Use requestIdleCallback or setTimeout as fallback
    const trackWhenIdle = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(callback);
      } else {
        setTimeout(callback, 0);
      }
    };

    trackWhenIdle(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        // Track various load metrics
        this.trackCustomMetric(`${pageName}_dom_content_loaded`, navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        this.trackCustomMetric(`${pageName}_load_complete`, navigation.loadEventEnd - navigation.loadEventStart);
        this.trackCustomMetric(`${pageName}_total_load_time`, navigation.loadEventEnd - navigation.fetchStart);
        
        // Track resource timing
        const resources = performance.getEntriesByType('resource');
        const totalResourceTime = resources.reduce((total, resource) => {
          return total + (resource.responseEnd - resource.startTime);
        }, 0);
        
        this.trackCustomMetric(`${pageName}_total_resource_time`, totalResourceTime);
        this.trackCustomMetric(`${pageName}_resource_count`, resources.length, 'count');
      }
    });
  }

  /**
   * Track API call performance
   */
  static trackAPICall(endpoint: string, method: string, duration: number, status: number): void {
    const metricName = `api_${method.toLowerCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    this.trackCustomMetric(metricName, duration);
    
    Sentry.addBreadcrumb({
      category: 'api',
      message: `${method} ${endpoint} - ${status} (${duration}ms)`,
      level: status >= 400 ? 'error' : 'info',
      data: {
        endpoint,
        method,
        duration,
        status,
      },
    });
  }
}

/**
 * React hook for performance monitoring
 */
export function usePerformanceMonitoring(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const mountDuration = performance.now() - startTime;
      PerformanceMonitor.trackCustomMetric(`${componentName}_mount_time`, mountDuration);
    };
  }, [componentName]);

  const measureRender = React.useCallback((renderName: string, fn: () => void) => {
    PerformanceMonitor.measure(`${componentName}_${renderName}`, fn);
  }, [componentName]);

  return { measureRender };
}

// Import React for the hook
import React from 'react';