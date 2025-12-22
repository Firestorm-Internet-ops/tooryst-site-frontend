/**
 * Web Vitals monitoring for performance tracking
 * Sends Core Web Vitals metrics to analytics endpoint
 */

export interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

export function reportWebVitals(metric: WebVitalMetric) {
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
 * Initialize Web Vitals tracking
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

    const { getCLS, getFID, getFCP, getLCP, getTTFB } = webVitals;

    getCLS(reportWebVitals);
    getFID(reportWebVitals);
    getFCP(reportWebVitals);
    getLCP(reportWebVitals);
    getTTFB(reportWebVitals);
  } catch (error) {
    console.error('Failed to initialize Web Vitals:', error);
  }
}
