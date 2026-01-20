import React from 'react';
import { getPerformanceMonitor, recordPerformanceMetric } from './performance-budget';

type SeverityLevel = 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug';

/**
 * Performance monitoring utility (Sentry removed, console logging only)
 */
export class PerformanceMonitor {
  /**
   * Start a performance transaction (noop without Sentry)
   */
  static startTransaction(name: string, op: string = 'navigation'): any {
    if (typeof window === 'undefined') return undefined;
    return undefined;
  }

  /**
   * Measure and track Web Vitals with budget validation
   */
  static async trackWebVitals(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');

      // Cumulative Layout Shift
      onCLS((metric: any) => {
        recordPerformanceMetric('cls', metric.value, 'webVitals');

        if (metric.value > 0.1) {
          console.warn(`Poor CLS: ${metric.value}`);
        }
      });

      // Interaction to Next Paint (replaces FID in v5)
      onINP((metric: any) => {
        recordPerformanceMetric('inp', metric.value, 'webVitals');

        if (metric.value > 200) {
          console.warn(`Poor INP: ${metric.value}ms`);
        }
      });

      // First Contentful Paint
      onFCP((metric: any) => {
        recordPerformanceMetric('fcp', metric.value, 'webVitals');

        if (metric.value > 1800) {
          console.warn(`Poor FCP: ${metric.value}ms`);
        }
      });

      // Largest Contentful Paint
      onLCP((metric: any) => {
        recordPerformanceMetric('lcp', metric.value, 'webVitals');

        if (metric.value > 2500) {
          console.warn(`Poor LCP: ${metric.value}ms`);
        }
      });

      // Time to First Byte
      onTTFB((metric: any) => {
        recordPerformanceMetric('ttfb', metric.value, 'webVitals');

        if (metric.value > 800) {
          console.warn(`Poor TTFB: ${metric.value}ms`);
        }
      });
    } catch (error) {
      console.warn('Failed to load web-vitals:', error);
    }
  }

  /**
   * Track custom performance metrics with budget validation
   */
  static trackCustomMetric(name: string, value: number, unit: string = 'ms'): void {
    // Record in performance budget system
    recordPerformanceMetric(name, value, 'custom');
  }

  /**
   * Track resource metrics with budget validation
   */
  static trackResourceMetric(name: string, value: number, unit: string = 'KB'): void {
    // Record in performance budget system
    recordPerformanceMetric(name, value, 'resources');
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
   * Track page load performance with comprehensive metrics
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
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
        const loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
        const totalLoadTime = navigation.loadEventEnd - navigation.fetchStart;

        this.trackCustomMetric('domContentLoaded', domContentLoaded);
        this.trackCustomMetric('pageLoadTime', totalLoadTime);
        this.trackCustomMetric(`${pageName}_dom_content_loaded`, domContentLoaded);
        this.trackCustomMetric(`${pageName}_load_complete`, loadComplete);
        this.trackCustomMetric(`${pageName}_total_load_time`, totalLoadTime);

        // Track resource timing
        const resources = performance.getEntriesByType('resource');
        const totalResourceTime = resources.reduce((total, resource) => {
          return total + (resource.responseEnd - resource.startTime);
        }, 0);

        const avgResourceTime = resources.length > 0 ? totalResourceTime / resources.length : 0;

        this.trackCustomMetric('resourceLoadTime', avgResourceTime);
        this.trackCustomMetric(`${pageName}_total_resource_time`, totalResourceTime);
        this.trackResourceMetric('totalRequests', resources.length, 'count');

        // Calculate resource sizes by type
        let totalSize = 0;
        let jsSize = 0;
        let cssSize = 0;
        let imageSize = 0;
        let fontSize = 0;

        resources.forEach((resource: PerformanceResourceTiming) => {
          const size = resource.transferSize || 0;
          totalSize += size;

          if (resource.name.includes('.js') || resource.name.includes('javascript')) {
            jsSize += size;
          } else if (resource.name.includes('.css') || resource.name.includes('stylesheet')) {
            cssSize += size;
          } else if (resource.name.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i)) {
            imageSize += size;
          } else if (resource.name.match(/\.(woff|woff2|ttf|otf|eot)$/i)) {
            fontSize += size;
          }
        });

        // Convert bytes to KB and track
        this.trackResourceMetric('totalSize', Math.round(totalSize / 1024));
        this.trackResourceMetric('jsSize', Math.round(jsSize / 1024));
        this.trackResourceMetric('cssSize', Math.round(cssSize / 1024));
        this.trackResourceMetric('imageSize', Math.round(imageSize / 1024));
        this.trackResourceMetric('fontSize', Math.round(fontSize / 1024));
      }
    });
  }

  /**
   * Track API call performance
   */
  static trackAPICall(endpoint: string, method: string, duration: number, status: number): void {
    const metricName = `api_${method.toLowerCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Track API response time in custom metrics
    this.trackCustomMetric('apiResponseTime', duration);
    this.trackCustomMetric(metricName, duration);
  }

  /**
   * Track component mount performance
   */
  static trackComponentMount(componentName: string, duration: number): void {
    this.trackCustomMetric('componentMountTime', duration);
    this.trackCustomMetric(`${componentName}_mount_time`, duration);
  }

  /**
   * Track image load performance
   */
  static trackImageLoad(imageName: string, duration: number): void {
    this.trackCustomMetric('imageLoadTime', duration);
    this.trackCustomMetric(`${imageName}_load_time`, duration);
  }

  /**
   * Get performance report from budget monitor
   */
  static getPerformanceReport() {
    return getPerformanceMonitor().generateReport();
  }

  /**
   * Validate current performance against budget
   */
  static validatePerformanceBudget() {
    return getPerformanceMonitor().validateAll();
  }
}

/**
 * React hook for performance monitoring with budget validation
 */
export function usePerformanceMonitoring(componentName: string) {
  React.useEffect(() => {
    const startTime = performance.now();

    return () => {
      const mountDuration = performance.now() - startTime;
      PerformanceMonitor.trackComponentMount(componentName, mountDuration);
    };
  }, [componentName]);

  const measureRender = React.useCallback((renderName: string, fn: () => void) => {
    PerformanceMonitor.measure(`${componentName}_${renderName}`, fn);
  }, [componentName]);

  const measureAsync = React.useCallback(async <T>(renderName: string, fn: () => Promise<T>): Promise<T> => {
    return PerformanceMonitor.measureAsync(`${componentName}_${renderName}`, fn);
  }, [componentName]);

  return { measureRender, measureAsync };
}

/**
 * React hook for image load performance monitoring
 */
export function useImagePerformanceMonitoring() {
  const trackImageLoad = React.useCallback((imageName: string, startTime: number) => {
    const duration = performance.now() - startTime;
    PerformanceMonitor.trackImageLoad(imageName, duration);
  }, []);

  const createImageLoadTracker = React.useCallback((imageName: string) => {
    const startTime = performance.now();
    return () => trackImageLoad(imageName, startTime);
  }, [trackImageLoad]);

  return { trackImageLoad, createImageLoadTracker };
}

/**
 * React hook for API performance monitoring
 */
export function useAPIPerformanceMonitoring() {
  const trackAPICall = React.useCallback((endpoint: string, method: string, startTime: number, status: number) => {
    const duration = performance.now() - startTime;
    PerformanceMonitor.trackAPICall(endpoint, method, duration, status);
  }, []);

  const createAPITracker = React.useCallback((endpoint: string, method: string) => {
    const startTime = performance.now();
    return (status: number) => trackAPICall(endpoint, method, startTime, status);
  }, [trackAPICall]);

  return { trackAPICall, createAPITracker };
}

/**
 * React hook for performance budget monitoring
 */
export function usePerformanceBudget() {
  const [budgetStatus, setBudgetStatus] = React.useState<{
    passed: boolean;
    score: number;
    violations: number;
  } | null>(null);

  const checkBudget = React.useCallback(() => {
    const result = PerformanceMonitor.validatePerformanceBudget();
    setBudgetStatus({
      passed: result.passed,
      score: result.score,
      violations: result.violations.length,
    });
    return result;
  }, []);

  const getReport = React.useCallback(() => {
    return PerformanceMonitor.getPerformanceReport();
  }, []);

  React.useEffect(() => {
    // Check budget on mount and periodically
    checkBudget();

    const interval = setInterval(checkBudget, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkBudget]);

  return { budgetStatus, checkBudget, getReport };
}