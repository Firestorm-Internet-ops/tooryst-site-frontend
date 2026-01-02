/**
 * Performance Monitoring Utilities Test Suite
 * Feature: frontend-quality-improvements, Task 2.3: Performance Monitoring Utilities
 * 
 * Comprehensive test suite for performance monitoring utilities including:
 * - Performance budget validation
 * - Web Vitals tracking
 * - Custom performance metrics
 * - React hooks for performance monitoring
 * - Integration with Sentry and error tracking
 */

import { render, renderHook, act, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import { 
  PerformanceBudgetValidator,
  PerformanceBudgetMonitor,
  DEFAULT_PERFORMANCE_BUDGET,
  validatePerformanceBudget,
  getPerformanceMonitor,
  recordPerformanceMetric,
  type PerformanceBudget,
  type BudgetValidationResult,
  type PerformanceRating
} from '../utils/performance-budget';
import { 
  PerformanceMonitor,
  usePerformanceMonitoring,
  useImagePerformanceMonitoring,
  useAPIPerformanceMonitoring,
  usePerformanceBudget
} from '../utils/performance-monitoring';
import { reportWebVitals, initWebVitals, getCurrentWebVitals } from '../lib/web-vitals';

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  addBreadcrumb: jest.fn(),
  captureMessage: jest.fn(),
  captureException: jest.fn(),
  setMeasurement: jest.fn(),
  startSpan: jest.fn((config, callback) => callback({ name: config.name })),
  withScope: jest.fn((callback) => {
    const mockScope = {
      setLevel: jest.fn(),
      setTag: jest.fn(),
      setContext: jest.fn(),
      setUser: jest.fn(),
      setExtra: jest.fn(),
    };
    callback(mockScope);
  }),
}));

// Mock web-vitals
const mockWebVitals = {
  onCLS: jest.fn(),
  onINP: jest.fn(),
  onFCP: jest.fn(),
  onLCP: jest.fn(),
  onTTFB: jest.fn(),
};

jest.mock('web-vitals', () => mockWebVitals);

// Mock performance API
const mockPerformance = {
  now: jest.fn(() => 1000),
  getEntriesByType: jest.fn(() => []),
};

Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock navigator.sendBeacon
Object.defineProperty(global, 'navigator', {
  value: {
    sendBeacon: jest.fn(() => true),
  },
  writable: true,
});

describe('Performance Budget Validation', () => {
  let validator: PerformanceBudgetValidator;

  beforeEach(() => {
    validator = new PerformanceBudgetValidator();
  });

  describe('PerformanceBudgetValidator', () => {
    test('should validate Web Vitals metrics correctly', () => {
      const metrics = {
        lcp: 2000, // good
        inp: 300,  // needs improvement
        cls: 0.3,  // poor
        fcp: 1500, // good
        ttfb: 600, // good
      };

      validator.validateWebVitals(metrics);
      const result = validator.getResult();

      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(2); // inp and cls violations
      expect(result.violations.find(v => v.metric === 'webVitals.inp')).toBeDefined();
      expect(result.violations.find(v => v.metric === 'webVitals.cls')).toBeDefined();
    });

    test('should validate custom metrics correctly', () => {
      const metrics = {
        pageLoadTime: 4000,     // needs improvement
        domContentLoaded: 2000, // needs improvement
        apiResponseTime: 200,   // good
        componentMountTime: 60, // poor
        bundleSize: 150,        // good
      };

      validator.validateCustomMetrics(metrics);
      const result = validator.getResult();

      expect(result.violations).toHaveLength(3);
      expect(result.violations.find(v => v.metric === 'custom.pageLoadTime')).toBeDefined();
      expect(result.violations.find(v => v.metric === 'custom.domContentLoaded')).toBeDefined();
      expect(result.violations.find(v => v.metric === 'custom.componentMountTime')).toBeDefined();
    });

    test('should validate resource metrics correctly', () => {
      const metrics = {
        totalRequests: 75,  // needs improvement
        totalSize: 1500,    // needs improvement
        jsSize: 400,        // needs improvement
        cssSize: 30,        // good
        imageSize: 800,     // needs improvement
        fontSize: 50,       // good
      };

      validator.validateResources(metrics);
      const result = validator.getResult();

      expect(result.violations).toHaveLength(4);
      expect(result.score).toBeLessThan(100);
    });

    test('should calculate performance score correctly', () => {
      // Test with no violations
      let result = validator.getResult();
      expect(result.score).toBe(100);
      expect(result.passed).toBe(true);

      // Test with violations
      validator.validateWebVitals({ cls: 0.3 }); // poor CLS
      result = validator.getResult();
      expect(result.score).toBeLessThan(100);
      expect(result.passed).toBe(false);
    });

    test('should provide appropriate suggestions for violations', () => {
      validator.validateWebVitals({ lcp: 5000 }); // poor LCP
      const result = validator.getResult();

      const lcpViolation = result.violations.find(v => v.metric === 'webVitals.lcp');
      expect(lcpViolation?.suggestion).toContain('Optimize images');
      expect(lcpViolation?.impact).toBe('critical');
    });

    test('should reset validator state correctly', () => {
      validator.validateWebVitals({ cls: 0.3 });
      expect(validator.getResult().violations).toHaveLength(1);

      validator.reset();
      expect(validator.getResult().violations).toHaveLength(0);
      expect(validator.getResult().score).toBe(100);
    });
  });

  describe('PerformanceBudgetMonitor', () => {
    let monitor: PerformanceBudgetMonitor;

    beforeEach(() => {
      monitor = PerformanceBudgetMonitor.getInstance();
      monitor.clearMetrics();
    });

    test('should be a singleton', () => {
      const monitor1 = PerformanceBudgetMonitor.getInstance();
      const monitor2 = PerformanceBudgetMonitor.getInstance();
      expect(monitor1).toBe(monitor2);
    });

    test('should record and validate metrics', () => {
      monitor.recordMetric('lcp', 3000, 'webVitals');
      monitor.recordMetric('pageLoadTime', 4000, 'custom');

      const result = monitor.validateAll();
      expect(result.violations).toHaveLength(2);
    });

    test('should generate comprehensive performance report', () => {
      monitor.recordMetric('lcp', 2000, 'webVitals');
      monitor.recordMetric('pageLoadTime', 3000, 'custom');
      monitor.recordMetric('totalSize', 800, 'resources');

      const report = monitor.generateReport();

      expect(report.timestamp).toBeDefined();
      expect(report.metrics).toEqual({
        lcp: 2000,
        pageLoadTime: 3000,
        totalSize: 800,
      });
      expect(report.validation).toBeDefined();
      expect(report.recommendations).toBeInstanceOf(Array);
    });

    test('should handle disabled monitoring', () => {
      monitor.setEnabled(false);
      monitor.recordMetric('lcp', 3000, 'webVitals');

      const metrics = monitor.getMetrics();
      expect(metrics.size).toBe(0);

      monitor.setEnabled(true);
    });
  });

  describe('Convenience Functions', () => {
    test('validatePerformanceBudget should work with all metric types', () => {
      const result = validatePerformanceBudget({
        webVitals: { lcp: 3000, cls: 0.2 },
        custom: { pageLoadTime: 4000 },
        resources: { totalSize: 1500 },
      });

      expect(result.violations).toHaveLength(4);
      expect(result.passed).toBe(false);
    });

    test('getPerformanceMonitor should return singleton instance', () => {
      const monitor1 = getPerformanceMonitor();
      const monitor2 = getPerformanceMonitor();
      expect(monitor1).toBe(monitor2);
    });

    test('recordPerformanceMetric should record in global monitor', () => {
      const monitor = getPerformanceMonitor();
      monitor.clearMetrics();

      recordPerformanceMetric('testMetric', 100);
      
      const metrics = monitor.getMetrics();
      expect(metrics.get('testMetric')).toBe(100);
    });
  });
});

describe('Performance Monitoring Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPerformance.now.mockReturnValue(1000);
  });

  describe('PerformanceMonitor', () => {
    test('should track Web Vitals with budget validation', async () => {
      const mockMetric = {
        name: 'LCP',
        value: 3000,
        rating: 'needs-improvement' as const,
        delta: 100,
        id: 'test-id',
        navigationType: 'navigate',
      };

      await PerformanceMonitor.trackWebVitals();

      // Simulate Web Vitals callback
      const onLCPCallback = mockWebVitals.onLCP.mock.calls[0][0];
      onLCPCallback(mockMetric);

      // Verify Sentry integration
      const Sentry = require('@sentry/nextjs');
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'web-vital',
          message: 'LCP: 3000ms',
        })
      );
    });

    test('should track custom metrics with budget validation', () => {
      PerformanceMonitor.trackCustomMetric('testMetric', 500);

      const Sentry = require('@sentry/nextjs');
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'performance',
          message: 'testMetric: 500ms',
        })
      );
      expect(Sentry.setMeasurement).toHaveBeenCalledWith('testMetric', 500, 'ms');
    });

    test('should track resource metrics', () => {
      PerformanceMonitor.trackResourceMetric('bundleSize', 200, 'KB');

      const Sentry = require('@sentry/nextjs');
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'resource',
          message: 'bundleSize: 200KB',
        })
      );
    });

    test('should measure async function execution', async () => {
      mockPerformance.now
        .mockReturnValueOnce(1000) // start time
        .mockReturnValueOnce(1500); // end time

      const asyncFn = jest.fn().mockResolvedValue('result');
      const result = await PerformanceMonitor.measureAsync('testAsync', asyncFn);

      expect(result).toBe('result');
      expect(asyncFn).toHaveBeenCalled();

      const Sentry = require('@sentry/nextjs');
      expect(Sentry.setMeasurement).toHaveBeenCalledWith('testAsync', 500, 'ms');
    });

    test('should measure sync function execution', () => {
      mockPerformance.now
        .mockReturnValueOnce(1000) // start time
        .mockReturnValueOnce(1200); // end time

      const syncFn = jest.fn().mockReturnValue('result');
      const result = PerformanceMonitor.measure('testSync', syncFn);

      expect(result).toBe('result');
      expect(syncFn).toHaveBeenCalled();

      const Sentry = require('@sentry/nextjs');
      expect(Sentry.setMeasurement).toHaveBeenCalledWith('testSync', 200, 'ms');
    });

    test('should track page load performance comprehensively', () => {
      const mockNavigation = {
        domContentLoadedEventStart: 1000,
        domContentLoadedEventEnd: 1500,
        loadEventStart: 2000,
        loadEventEnd: 2500,
        fetchStart: 500,
      };

      const mockResources = [
        { name: 'script.js', transferSize: 50000, responseEnd: 1200, startTime: 1000 },
        { name: 'style.css', transferSize: 10000, responseEnd: 1100, startTime: 1000 },
        { name: 'image.jpg', transferSize: 100000, responseEnd: 1300, startTime: 1000 },
      ];

      mockPerformance.getEntriesByType
        .mockReturnValueOnce([mockNavigation])
        .mockReturnValueOnce(mockResources);

      // Mock requestIdleCallback
      global.requestIdleCallback = jest.fn((callback) => callback());

      PerformanceMonitor.trackPageLoad('testPage');

      const Sentry = require('@sentry/nextjs');
      expect(Sentry.setMeasurement).toHaveBeenCalledWith('domContentLoaded', 500, 'ms');
      expect(Sentry.setMeasurement).toHaveBeenCalledWith('pageLoadTime', 2000, 'ms');
      expect(Sentry.setMeasurement).toHaveBeenCalledWith('jsSize', expect.any(Number), 'KB');
    });

    test('should track API call performance', () => {
      PerformanceMonitor.trackAPICall('/api/test', 'GET', 300, 200);

      const Sentry = require('@sentry/nextjs');
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'api',
          message: 'GET /api/test - 200 (300ms)',
          level: 'info',
        })
      );
    });

    test('should get performance report and validate budget', () => {
      const monitor = getPerformanceMonitor();
      monitor.recordMetric('lcp', 2000);

      const report = PerformanceMonitor.getPerformanceReport();
      const validation = PerformanceMonitor.validatePerformanceBudget();

      expect(report.metrics).toBeDefined();
      expect(validation.passed).toBeDefined();
    });
  });

  describe('React Hooks', () => {
    test('usePerformanceMonitoring should track component mount time', () => {
      mockPerformance.now
        .mockReturnValueOnce(1000) // mount start
        .mockReturnValueOnce(1050); // unmount

      const { result, unmount } = renderHook(() => 
        usePerformanceMonitoring('TestComponent')
      );

      expect(result.current.measureRender).toBeInstanceOf(Function);
      expect(result.current.measureAsync).toBeInstanceOf(Function);

      unmount();

      const Sentry = require('@sentry/nextjs');
      expect(Sentry.setMeasurement).toHaveBeenCalledWith('componentMountTime', 50, 'ms');
    });

    test('useImagePerformanceMonitoring should track image load times', () => {
      const { result } = renderHook(() => useImagePerformanceMonitoring());

      mockPerformance.now.mockReturnValue(1500);
      
      act(() => {
        result.current.trackImageLoad('hero-image', 1000);
      });

      const Sentry = require('@sentry/nextjs');
      expect(Sentry.setMeasurement).toHaveBeenCalledWith('imageLoadTime', 500, 'ms');
    });

    test('useAPIPerformanceMonitoring should track API call times', () => {
      const { result } = renderHook(() => useAPIPerformanceMonitoring());

      mockPerformance.now.mockReturnValue(1300);
      
      act(() => {
        result.current.trackAPICall('/api/data', 'POST', 1000, 201);
      });

      const Sentry = require('@sentry/nextjs');
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'api',
          message: 'POST /api/data - 201 (300ms)',
        })
      );
    });

    test('usePerformanceBudget should monitor budget status', async () => {
      const { result } = renderHook(() => usePerformanceBudget());

      await waitFor(() => {
        expect(result.current.budgetStatus).toBeDefined();
      });

      expect(result.current.checkBudget).toBeInstanceOf(Function);
      expect(result.current.getReport).toBeInstanceOf(Function);

      act(() => {
        const report = result.current.getReport();
        expect(report.timestamp).toBeDefined();
      });
    });
  });

  describe('Web Vitals Integration', () => {
    test('reportWebVitals should integrate with performance budget', () => {
      const metric = {
        name: 'LCP',
        value: 2500,
        rating: 'good' as const,
        delta: 100,
        id: 'test-id',
        navigationType: 'navigate',
      };

      reportWebVitals(metric);

      const monitor = getPerformanceMonitor();
      const metrics = monitor.getMetrics();
      expect(metrics.get('LCP')).toBe(2500);
    });

    test('initWebVitals should set up all Web Vitals listeners', async () => {
      await initWebVitals();

      expect(mockWebVitals.onCLS).toHaveBeenCalled();
      expect(mockWebVitals.onINP).toHaveBeenCalled();
      expect(mockWebVitals.onFCP).toHaveBeenCalled();
      expect(mockWebVitals.onLCP).toHaveBeenCalled();
      expect(mockWebVitals.onTTFB).toHaveBeenCalled();
    });

    test('getCurrentWebVitals should collect current metrics', async () => {
      const metrics = await getCurrentWebVitals();
      expect(metrics).toBeDefined();
    });
  });
});

/**
 * Property-based tests for performance monitoring consistency
 * Property 15: Performance Metrics Tracking
 * Validates: Requirements 8.1, 8.3, 8.4
 */
describe('Property Tests: Performance Metrics Tracking', () => {
  test('Property 15.0: Performance metric validation consistency', () => {
    fc.assert(fc.property(
      fc.record({
        lcp: fc.integer({ min: 500, max: 10000 }),
        inp: fc.integer({ min: 50, max: 2000 }),
        cls: fc.float({ min: 0, max: 1, noNaN: true }),
        fcp: fc.integer({ min: 300, max: 8000 }),
        ttfb: fc.integer({ min: 100, max: 5000 }),
      }),
      (webVitals) => {
        const validator = new PerformanceBudgetValidator();
        validator.validateWebVitals(webVitals);
        const result = validator.getResult();

        // Validation result should always be consistent
        expect(result.passed).toBe(result.violations.length === 0 || result.score >= 80);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(result.summary.total).toBe(result.violations.length);

        // Each violation should have required properties
        result.violations.forEach(violation => {
          expect(violation.metric).toBeDefined();
          expect(violation.category).toBeDefined();
          expect(violation.value).toBeGreaterThan(0);
          expect(violation.threshold).toBeGreaterThan(0);
          expect(['good', 'needs-improvement', 'poor']).toContain(violation.rating);
          expect(['low', 'medium', 'high', 'critical']).toContain(violation.impact);
          expect(violation.suggestion).toBeTruthy();
        });
      }
    ), { numRuns: 100 });
  });

  test('Property 15.1: Performance budget monitor consistency', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        name: fc.constantFrom('lcp', 'inp', 'cls', 'fcp', 'ttfb', 'pageLoadTime', 'apiResponseTime'),
        value: fc.integer({ min: 10, max: 10000 }),
        category: fc.constantFrom('webVitals', 'custom', 'resources'),
      }), { minLength: 1, maxLength: 10 }),
      (metrics) => {
        const monitor = new PerformanceBudgetMonitor();

        metrics.forEach(metric => {
          monitor.recordMetric(metric.name, metric.value, metric.category);
        });

        const result = monitor.validateAll();
        const report = monitor.generateReport();

        // Calculate unique metric names (duplicates overwrite)
        const uniqueMetricNames = new Set(metrics.map(m => m.name));
        const expectedMetricCount = uniqueMetricNames.size;

        // Monitor should maintain consistency
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        expect(report.timestamp).toBeDefined();
        expect(Object.keys(report.metrics)).toHaveLength(expectedMetricCount);

        // Validation results should match (ignoring violation order)
        expect(report.validation.passed).toBe(result.passed);
        expect(report.validation.score).toBe(result.score);
        expect(report.validation.summary).toEqual(result.summary);
        expect(report.validation.violations).toEqual(expect.arrayContaining(result.violations));
        expect(result.violations).toEqual(expect.arrayContaining(report.validation.violations));

        expect(report.recommendations).toBeInstanceOf(Array);

        // Recorded metrics should match the last value for each metric name
        const recordedMetrics = monitor.getMetrics();
        const lastMetricValues = new Map();
        metrics.forEach(metric => {
          lastMetricValues.set(metric.name, metric.value);
        });

        lastMetricValues.forEach((value, name) => {
          expect(recordedMetrics.get(name)).toBe(value);
        });
      }
    ), { numRuns: 50 });
  });

  test('Property 15.2: Performance measurement consistency', () => {
    fc.assert(fc.property(
      fc.record({
        startTime: fc.integer({ min: 1000, max: 5000 }),
        endTime: fc.integer({ min: 5001, max: 10000 }),
        metricName: fc.string({ minLength: 1, maxLength: 20 }),
      }),
      ({ startTime, endTime, metricName }) => {
        const expectedDuration = endTime - startTime;
        
        mockPerformance.now
          .mockReturnValueOnce(startTime)
          .mockReturnValueOnce(endTime);

        const testFn = jest.fn().mockReturnValue('test-result');
        const result = PerformanceMonitor.measure(metricName, testFn);

        // Measurement should be consistent
        expect(result).toBe('test-result');
        expect(testFn).toHaveBeenCalledTimes(1);

        const Sentry = require('@sentry/nextjs');
        expect(Sentry.setMeasurement).toHaveBeenCalledWith(
          metricName, 
          expectedDuration, 
          'ms'
        );
      }
    ), { numRuns: 75 });
  });

  test('Property 15.3: Web Vitals integration consistency', () => {
    fc.assert(fc.property(
      fc.record({
        name: fc.constantFrom('LCP', 'INP', 'CLS', 'FCP', 'TTFB'),
        value: fc.integer({ min: 100, max: 8000 }),
        rating: fc.constantFrom('good', 'needs-improvement', 'poor'),
        delta: fc.integer({ min: 1, max: 1000 }),
        id: fc.string({ minLength: 5, maxLength: 15 }),
        navigationType: fc.constantFrom('navigate', 'reload', 'back_forward'),
      }),
      (metric) => {
        const monitor = getPerformanceMonitor();
        monitor.clearMetrics();

        reportWebVitals(metric);

        // Web Vitals should be recorded in performance budget
        const metrics = monitor.getMetrics();
        expect(metrics.get(metric.name)).toBe(metric.value);

        // Should integrate with Sentry in production
        if (process.env.NODE_ENV === 'production') {
          expect(navigator.sendBeacon).toHaveBeenCalled();
        }
      }
    ), { numRuns: 50 });
  });

  test('Property 15.4: Performance score calculation consistency', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        impact: fc.constantFrom('low', 'medium', 'high', 'critical'),
        count: fc.integer({ min: 1, max: 5 }),
      }), { minLength: 0, maxLength: 4 }),
      (violationGroups) => {
        const validator = new PerformanceBudgetValidator();
        
        // Create violations with different impact levels
        violationGroups.forEach(group => {
          for (let i = 0; i < group.count; i++) {
            // Simulate violations by adding poor metrics
            if (group.impact === 'critical') {
              validator.validateWebVitals({ lcp: 5000 }); // Poor LCP
            } else if (group.impact === 'high') {
              validator.validateWebVitals({ fcp: 4000 }); // Poor FCP
            } else if (group.impact === 'medium') {
              validator.validateCustomMetrics({ pageLoadTime: 6000 }); // Poor page load
            } else {
              validator.validateResources({ totalRequests: 120 }); // Poor request count
            }
            validator.reset();
            
            // Add single violation for testing
            if (group.impact === 'critical') {
              validator.validateWebVitals({ lcp: 5000 });
            } else if (group.impact === 'high') {
              validator.validateWebVitals({ fcp: 4000 });
            } else if (group.impact === 'medium') {
              validator.validateCustomMetrics({ pageLoadTime: 6000 });
            } else {
              validator.validateResources({ totalRequests: 120 });
            }
          }
        });

        const result = validator.getResult();

        // Score calculation should be consistent
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(100);
        
        if (result.violations.length === 0) {
          expect(result.score).toBe(100);
          expect(result.passed).toBe(true);
        } else {
          expect(result.score).toBeLessThan(100);
          // Score should decrease with more severe violations
          const hasHighImpact = result.violations.some(v => 
            v.impact === 'critical' || v.impact === 'high'
          );
          if (hasHighImpact) {
            expect(result.score).toBeLessThan(90);
          }
        }
      }
    ), { numRuns: 30 });
  });
});