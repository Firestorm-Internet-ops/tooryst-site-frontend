/**
 * Web Vitals monitoring for performance tracking with budget validation
 * Sends Core Web Vitals metrics to analytics endpoint and performance budget system
 */

import { recordPerformanceMetric } from '../utils/performance-budget';

export interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

export function reportWebVitals(metric: WebVitalMetric) {
  // Record in performance budget system
  recordPerformanceMetric(metric.name, metric.value, 'webVitals');

  if (process.env.NODE_ENV === 'production') {
    // Send to your analytics service
    const body = JSON.stringify(metric);
    
    // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/metrics', body);
    } else {
      fetch('/api/metrics', {
        method: 'POST',
        body,
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((err) => {
        console.error('Failed to send metrics:', err);
      });
    }
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value.toFixed(2),
      rating: metric.rating,
      delta: metric.delta.toFixed(2),
    });
  }
}

/**
 * Initialize Web Vitals tracking with performance budget integration
 * Call this in your root layout or app component
 * Note: Requires 'npm install web-vitals'
 */
export async function initWebVitals() {
  if (typeof window === 'undefined') return;

  try {
    // Dynamically import to avoid build errors if web-vitals is not installed
    const webVitals = await import('web-vitals').catch(() => null);
    
    if (!webVitals) {
      console.warn('web-vitals package not installed. Install with: npm install web-vitals');
      return;
    }

    const { onCLS, onINP, onFCP, onLCP, onTTFB } = webVitals;

    onCLS(reportWebVitals);
    onINP(reportWebVitals); // FID was replaced with INP (Interaction to Next Paint)
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);

    console.log('[Web Vitals] Initialized with performance budget integration');
  } catch (error) {
    console.error('Failed to initialize Web Vitals:', error);
  }
}

/**
 * Get current Web Vitals metrics
 * Useful for performance debugging and monitoring
 */
export function getCurrentWebVitals(): Promise<{
  lcp?: number;
  inp?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}> {
  return new Promise(async (resolve) => {
    if (typeof window === 'undefined') {
      resolve({});
      return;
    }

    try {
      const webVitals = await import('web-vitals').catch(() => null);
      
      if (!webVitals) {
        resolve({});
        return;
      }

      const { onCLS, onINP, onFCP, onLCP, onTTFB } = webVitals;
      const metrics: any = {};

      // Collect current metrics
      onCLS((metric) => { metrics.cls = metric.value; });
      onINP((metric) => { metrics.inp = metric.value; });
      onFCP((metric) => { metrics.fcp = metric.value; });
      onLCP((metric) => { metrics.lcp = metric.value; });
      onTTFB((metric) => { metrics.ttfb = metric.value; });

      // Wait a bit for metrics to be collected
      setTimeout(() => resolve(metrics), 100);
    } catch (error) {
      console.error('Failed to get current Web Vitals:', error);
      resolve({});
    }
  });
}
