/**
 * Performance Budget Validation System
 * Feature: frontend-quality-improvements, Task 2.3: Performance Monitoring Utilities
 * 
 * This module provides comprehensive performance budget validation and monitoring
 * to ensure the application meets performance standards and user experience goals.
 */

import { ErrorHandler, createAPIError } from './error-handler';

/**
 * Performance budget thresholds based on Core Web Vitals and custom metrics
 */
export interface PerformanceBudget {
  // Core Web Vitals thresholds
  webVitals: {
    lcp: { good: number; poor: number }; // Largest Contentful Paint (ms)
    inp: { good: number; poor: number }; // Interaction to Next Paint (ms)
    cls: { good: number; poor: number }; // Cumulative Layout Shift (score)
    fcp: { good: number; poor: number }; // First Contentful Paint (ms)
    ttfb: { good: number; poor: number }; // Time to First Byte (ms)
  };

  // Custom performance metrics
  custom: {
    pageLoadTime: { good: number; poor: number }; // Total page load time (ms)
    domContentLoaded: { good: number; poor: number }; // DOM ready time (ms)
    resourceLoadTime: { good: number; poor: number }; // Average resource load time (ms)
    apiResponseTime: { good: number; poor: number }; // Average API response time (ms)
    componentMountTime: { good: number; poor: number }; // React component mount time (ms)
    bundleSize: { good: number; poor: number }; // JavaScript bundle size (KB)
    imageLoadTime: { good: number; poor: number }; // Average image load time (ms)
  };

  // Resource budgets
  resources: {
    totalRequests: { good: number; poor: number }; // Total number of requests
    totalSize: { good: number; poor: number }; // Total resource size (KB)
    jsSize: { good: number; poor: number }; // JavaScript size (KB)
    cssSize: { good: number; poor: number }; // CSS size (KB)
    imageSize: { good: number; poor: number }; // Image size (KB)
    fontSize: { good: number; poor: number }; // Font size (KB)
  };
}

/**
 * Default performance budget based on industry standards and Core Web Vitals
 */
export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  webVitals: {
    lcp: { good: 2500, poor: 4000 }, // LCP: Good < 2.5s, Poor > 4s
    inp: { good: 200, poor: 500 },   // INP: Good < 200ms, Poor > 500ms
    cls: { good: 0.1, poor: 0.25 },  // CLS: Good < 0.1, Poor > 0.25
    fcp: { good: 1800, poor: 3000 }, // FCP: Good < 1.8s, Poor > 3s
    ttfb: { good: 800, poor: 1800 }, // TTFB: Good < 800ms, Poor > 1.8s
  },

  custom: {
    pageLoadTime: { good: 3000, poor: 5000 },      // Page load: Good < 3s, Poor > 5s
    domContentLoaded: { good: 1500, poor: 3000 },  // DOM ready: Good < 1.5s, Poor > 3s
    resourceLoadTime: { good: 500, poor: 1000 },   // Resource load: Good < 500ms, Poor > 1s
    apiResponseTime: { good: 300, poor: 1000 },    // API response: Good < 300ms, Poor > 1s
    componentMountTime: { good: 16, poor: 50 },    // Component mount: Good < 16ms (1 frame), Poor > 50ms
    bundleSize: { good: 200, poor: 500 },          // Bundle size: Good < 200KB, Poor > 500KB
    imageLoadTime: { good: 1000, poor: 3000 },     // Image load: Good < 1s, Poor > 3s
  },

  resources: {
    totalRequests: { good: 75, poor: 150 },        // Total requests: Good < 75, Poor > 150
    totalSize: { good: 3000, poor: 5000 },         // Total size: Good < 3MB, Poor > 5MB
    jsSize: { good: 1500, poor: 3000 },            // JS size: Good < 1.5MB, Poor > 3MB
    cssSize: { good: 100, poor: 200 },             // CSS size: Good < 100KB, Poor > 200KB
    imageSize: { good: 1000, poor: 2000 },         // Image size: Good < 1MB, Poor > 2MB
    fontSize: { good: 200, poor: 400 },            // Font size: Good < 200KB, Poor > 400KB
  },
};

/**
 * Performance metric rating
 */
export type PerformanceRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Performance budget violation
 */
export interface BudgetViolation {
  metric: string;
  category: 'webVitals' | 'custom' | 'resources';
  value: number;
  threshold: number;
  rating: PerformanceRating;
  impact: 'low' | 'medium' | 'high' | 'critical';
  suggestion: string;
}

/**
 * Performance budget validation result
 */
export interface BudgetValidationResult {
  passed: boolean;
  score: number; // 0-100 performance score
  violations: BudgetViolation[];
  summary: {
    good: number;
    needsImprovement: number;
    poor: number;
    total: number;
  };
}

/**
 * Performance Budget Validator
 */
export class PerformanceBudgetValidator {
  private budget: PerformanceBudget;
  private violations: BudgetViolation[] = [];

  constructor(budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET) {
    this.budget = budget;
  }

  /**
   * Validate a performance metric against the budget
   */
  validateMetric(
    metric: string,
    category: keyof PerformanceBudget,
    value: number
  ): PerformanceRating {
    const budgetCategory = this.budget[category] as any;
    let thresholds = budgetCategory[metric];

    // Handle dynamic custom metrics
    if (!thresholds && category === 'custom') {
      if (metric.endsWith('_load_time')) {
        thresholds = budgetCategory['imageLoadTime'];
      }
    }

    if (!thresholds) {
      console.warn(`No budget threshold defined for ${category}.${metric}`);
      return 'good';
    }

    if (value <= thresholds.good) {
      return 'good';
    } else if (value <= thresholds.poor) {
      return 'needs-improvement';
    } else {
      return 'poor';
    }
  }

  /**
   * Add a budget violation
   */
  private addViolation(
    metric: string,
    category: keyof PerformanceBudget,
    value: number,
    rating: PerformanceRating
  ): void {
    const budgetCategory = this.budget[category] as any;
    const thresholds = budgetCategory[metric];

    if (!thresholds) return;

    const threshold = rating === 'poor' ? thresholds.poor : thresholds.good;
    const impact = this.determineImpact(category, metric, rating);
    const suggestion = this.getSuggestion(category, metric, rating);

    this.violations.push({
      metric: `${category}.${metric}`,
      category,
      value,
      threshold,
      rating,
      impact,
      suggestion,
    });
  }

  /**
   * Determine the impact level of a performance issue
   */
  private determineImpact(
    category: keyof PerformanceBudget,
    metric: string,
    rating: PerformanceRating
  ): BudgetViolation['impact'] {
    // Critical metrics that directly affect user experience
    const criticalMetrics = ['lcp', 'inp', 'cls', 'pageLoadTime'];
    const highImpactMetrics = ['fcp', 'ttfb', 'domContentLoaded', 'apiResponseTime'];

    if (rating === 'poor') {
      if (criticalMetrics.includes(metric)) return 'critical';
      if (highImpactMetrics.includes(metric)) return 'high';
      return 'medium';
    }

    if (rating === 'needs-improvement') {
      if (criticalMetrics.includes(metric)) return 'high';
      if (highImpactMetrics.includes(metric)) return 'medium';
      return 'low';
    }

    return 'low';
  }

  /**
   * Get performance improvement suggestions
   */
  private getSuggestion(
    category: keyof PerformanceBudget,
    metric: string,
    rating: PerformanceRating
  ): string {
    const suggestions: Record<string, string> = {
      'webVitals.lcp': 'Optimize images, reduce server response times, eliminate render-blocking resources',
      'webVitals.inp': 'Reduce JavaScript execution time, optimize event handlers, use web workers',
      'webVitals.cls': 'Set size attributes on images and videos, avoid inserting content above existing content',
      'webVitals.fcp': 'Eliminate render-blocking resources, optimize fonts, reduce server response times',
      'webVitals.ttfb': 'Optimize server response times, use CDN, implement caching strategies',
      'custom.pageLoadTime': 'Optimize critical rendering path, reduce bundle size, implement code splitting',
      'custom.domContentLoaded': 'Minimize DOM size, optimize JavaScript parsing, defer non-critical scripts',
      'custom.resourceLoadTime': 'Optimize images, use compression, implement resource hints',
      'custom.apiResponseTime': 'Optimize database queries, implement caching, use CDN for API responses',
      'custom.componentMountTime': 'Optimize React components, use React.memo, implement virtualization',
      'custom.bundleSize': 'Implement code splitting, tree shaking, remove unused dependencies',
      'custom.imageLoadTime': 'Optimize image formats (WebP, AVIF), implement lazy loading, use responsive images',
      'resources.totalRequests': 'Combine resources, implement resource bundling, use HTTP/2 server push',
      'resources.totalSize': 'Enable compression, optimize assets, implement efficient caching',
      'resources.jsSize': 'Implement code splitting, tree shaking, minification',
      'resources.cssSize': 'Remove unused CSS, implement CSS minification, use critical CSS',
      'resources.imageSize': 'Optimize image compression, use modern formats, implement responsive images',
      'resources.fontSize': 'Use font subsetting, implement font loading strategies, optimize font formats',
    };

    const key = `${category}.${metric}`;
    return suggestions[key] || 'Optimize this metric to improve performance';
  }

  /**
   * Validate Web Vitals metrics
   */
  validateWebVitals(metrics: {
    lcp?: number;
    inp?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  }): void {
    Object.entries(metrics).forEach(([metric, value]) => {
      if (value !== undefined) {
        const rating = this.validateMetric(metric, 'webVitals', value);
        if (rating !== 'good') {
          this.addViolation(metric, 'webVitals', value, rating);
        }
      }
    });
  }

  /**
   * Validate custom performance metrics
   */
  validateCustomMetrics(metrics: {
    pageLoadTime?: number;
    domContentLoaded?: number;
    resourceLoadTime?: number;
    apiResponseTime?: number;
    componentMountTime?: number;
    bundleSize?: number;
    imageLoadTime?: number;
  }): void {
    Object.entries(metrics).forEach(([metric, value]) => {
      if (value !== undefined) {
        const rating = this.validateMetric(metric, 'custom', value);
        if (rating !== 'good') {
          this.addViolation(metric, 'custom', value, rating);
        }
      }
    });
  }

  /**
   * Validate resource metrics
   */
  validateResources(metrics: {
    totalRequests?: number;
    totalSize?: number;
    jsSize?: number;
    cssSize?: number;
    imageSize?: number;
    fontSize?: number;
  }): void {
    Object.entries(metrics).forEach(([metric, value]) => {
      if (value !== undefined) {
        const rating = this.validateMetric(metric, 'resources', value);
        if (rating !== 'good') {
          this.addViolation(metric, 'resources', value, rating);
        }
      }
    });
  }

  /**
   * Calculate performance score (0-100)
   */
  private calculateScore(): number {
    if (this.violations.length === 0) return 100;

    // Weight violations by impact
    const impactWeights = {
      critical: 25,
      high: 15,
      medium: 10,
      low: 5,
    };

    const totalPenalty = this.violations.reduce((total, violation) => {
      return total + impactWeights[violation.impact];
    }, 0);

    // Cap the penalty to ensure score doesn't go below 0
    const maxPenalty = 100;
    const actualPenalty = Math.min(totalPenalty, maxPenalty);

    return Math.max(0, 100 - actualPenalty);
  }

  /**
   * Get validation summary
   */
  private getSummary(): BudgetValidationResult['summary'] {
    const summary = {
      good: 0,
      needsImprovement: 0,
      poor: 0,
      total: this.violations.length,
    };

    this.violations.forEach(violation => {
      if (violation.rating === 'good') summary.good++;
      else if (violation.rating === 'needs-improvement') summary.needsImprovement++;
      else if (violation.rating === 'poor') summary.poor++;
    });

    return summary;
  }

  /**
   * Get validation result
   */
  getResult(): BudgetValidationResult {
    const score = this.calculateScore();
    const summary = this.getSummary();

    return {
      passed: this.violations.length === 0 || score >= 80, // Pass if score >= 80
      score,
      violations: [...this.violations],
      summary,
    };
  }

  /**
   * Reset validator for new validation
   */
  reset(): void {
    this.violations = [];
  }

  /**
   * Update performance budget
   */
  updateBudget(budget: Partial<PerformanceBudget>): void {
    this.budget = { ...this.budget, ...budget };
  }
}

/**
 * Performance Budget Monitor - Singleton for global performance monitoring
 */
export class PerformanceBudgetMonitor {
  private static instance: PerformanceBudgetMonitor;
  private validator: PerformanceBudgetValidator;
  private metrics: Map<string, number> = new Map();
  private isEnabled: boolean = true;

  private constructor() {
    this.validator = new PerformanceBudgetValidator();
  }

  static getInstance(): PerformanceBudgetMonitor {
    if (!PerformanceBudgetMonitor.instance) {
      PerformanceBudgetMonitor.instance = new PerformanceBudgetMonitor();
    }
    return PerformanceBudgetMonitor.instance;
  }

  /**
   * Enable or disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, category?: keyof PerformanceBudget): void {
    if (!this.isEnabled) return;

    this.metrics.set(name, value);

    // Validate immediately if category is provided
    if (category) {
      const rating = this.validator.validateMetric(name, category, value);

      if (rating === 'poor') {
        // Only report critical performance issues in production
        // In development, just log a warning
        if (process.env.NODE_ENV === 'production') {
          const error = createAPIError(
            `Performance budget violation: ${name} = ${value}`,
            0, // No HTTP status for performance issues
            'performance-budget',
            'MONITOR',
            { metric: name, value, rating: rating, category: category }
          );

          ErrorHandler.handle(error, {
            component: 'PerformanceBudgetMonitor',
            action: 'recordMetric',
            feature: 'performance',
          });
        } else {
          // Development: Just log a warning without throwing
          console.warn(`[Performance Budget] ${name} = ${value} (threshold: poor)`);
        }
      }
    }
  }

  /**
   * Validate all recorded metrics
   */
  validateAll(): BudgetValidationResult {
    this.validator.reset();

    // Group metrics by category for validation
    const webVitalsMetrics: any = {};
    const customMetrics: any = {};
    const resourceMetrics: any = {};

    this.metrics.forEach((value, name) => {
      // Categorize metrics based on naming convention
      if (['lcp', 'inp', 'cls', 'fcp', 'ttfb'].includes(name)) {
        webVitalsMetrics[name] = value;
      } else if (name.startsWith('resource_') || ['totalRequests', 'totalSize', 'jsSize', 'cssSize', 'imageSize', 'fontSize'].includes(name)) {
        const metricName = name.replace('resource_', '');
        resourceMetrics[metricName] = value;
      } else {
        customMetrics[name] = value;
      }
    });

    // Validate each category
    this.validator.validateWebVitals(webVitalsMetrics);
    this.validator.validateCustomMetrics(customMetrics);
    this.validator.validateResources(resourceMetrics);

    return this.validator.getResult();
  }

  /**
   * Get current metrics
   */
  getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
  }

  /**
   * Update performance budget
   */
  updateBudget(budget: Partial<PerformanceBudget>): void {
    this.validator.updateBudget(budget);
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    timestamp: string;
    metrics: Record<string, number>;
    validation: BudgetValidationResult;
    recommendations: string[];
  } {
    const validation = this.validateAll();
    const recommendations = validation.violations
      .sort((a, b) => {
        const impactOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      })
      .slice(0, 5) // Top 5 recommendations
      .map(violation => violation.suggestion);

    return {
      timestamp: new Date().toISOString(),
      metrics: Object.fromEntries(this.metrics),
      validation,
      recommendations,
    };
  }
}

/**
 * Convenience functions for performance budget validation
 */

export function validatePerformanceBudget(
  metrics: {
    webVitals?: Parameters<PerformanceBudgetValidator['validateWebVitals']>[0];
    custom?: Parameters<PerformanceBudgetValidator['validateCustomMetrics']>[0];
    resources?: Parameters<PerformanceBudgetValidator['validateResources']>[0];
  },
  budget?: PerformanceBudget
): BudgetValidationResult {
  const validator = new PerformanceBudgetValidator(budget);

  if (metrics.webVitals) validator.validateWebVitals(metrics.webVitals);
  if (metrics.custom) validator.validateCustomMetrics(metrics.custom);
  if (metrics.resources) validator.validateResources(metrics.resources);

  return validator.getResult();
}

export function getPerformanceMonitor(): PerformanceBudgetMonitor {
  return PerformanceBudgetMonitor.getInstance();
}

export function recordPerformanceMetric(name: string, value: number, category?: keyof PerformanceBudget): void {
  getPerformanceMonitor().recordMetric(name, value, category);
}