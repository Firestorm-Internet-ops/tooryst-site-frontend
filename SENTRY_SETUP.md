# Sentry Error Tracking Setup

This document explains how Sentry error tracking is configured in the Tooryst frontend application.

## Configuration Files

### Environment Variables
- `.env.local.example` - Template for environment variables
- `.env.local` - Local development environment variables (not tracked in git)

Required environment variables:
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token
```

### Sentry Configuration Files
- `sentry.client.config.ts` - Client-side Sentry configuration
- `sentry.server.config.ts` - Server-side Sentry configuration  
- `sentry.edge.config.ts` - Edge runtime Sentry configuration

### Next.js Integration
- `next.config.ts` - Updated with Sentry webpack plugin integration

## Core Components

### Error Tracking Utilities
- `src/utils/error-tracking.ts` - Centralized error tracking with custom error types
- `src/utils/performance-monitoring.ts` - Performance monitoring with Web Vitals
- `src/utils/monitoring-init.ts` - Initialization of monitoring systems

### React Components
- `src/components/ErrorBoundary.tsx` - React Error Boundary with Sentry integration
- `src/components/providers/MonitoringProvider.tsx` - Provider for initializing monitoring

### Layout Integration
- `src/app/layout.tsx` - Updated to include error boundaries and monitoring provider

## Features

### Error Classification
- API errors with status codes and endpoints
- Validation errors with field information
- Network errors
- Authentication and permission errors
- Unknown errors with context

### Performance Monitoring
- Web Vitals tracking (CLS, INP, FCP, LCP, TTFB) - Updated for web-vitals v5
- Custom performance metrics
- API call performance tracking
- Page load performance monitoring

### Error Context Enrichment
- User information
- Component and action context
- Additional metadata
- Breadcrumb tracking

### Development vs Production
- Different sampling rates for performance monitoring
- Error filtering for development-specific issues
- Debug mode enabled in development
- Console logging in development only

## Usage Examples

### Basic Error Tracking
```typescript
import { ErrorTracker, TrackedError, ErrorType } from '@/utils/error-tracking';

// Track a simple error
ErrorTracker.trackError(new Error('Something went wrong'));

// Track with context
ErrorTracker.trackError(error, {
  component: 'UserProfile',
  action: 'updateProfile',
  userId: '123'
});

// Create typed errors
const apiError = createAPIError('Failed to fetch user', 404, '/api/users/123');
ErrorTracker.trackError(apiError);
```

### Performance Monitoring
```typescript
import { PerformanceMonitor } from '@/utils/performance-monitoring';

// Track custom metrics
PerformanceMonitor.trackCustomMetric('component_render_time', 150);

// Measure async operations
const result = await PerformanceMonitor.measureAsync('api_call', async () => {
  return await fetchUserData();
});
```

### Error Boundaries
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Wrap components with error boundary
<ErrorBoundary>
  <UserProfile />
</ErrorBoundary>

// Custom fallback UI
<ErrorBoundary fallback={<CustomErrorUI />}>
  <CriticalComponent />
</ErrorBoundary>
```

## Testing

The error tracking system includes comprehensive tests:
- `src/__tests__/error-tracking.test.tsx` - Tests for all error tracking functionality

Run tests with:
```bash
pnpm test src/__tests__/error-tracking.test.tsx
```

## Setup Instructions

1. **Create Sentry Project**: Create a new project in your Sentry organization
2. **Get DSN**: Copy the DSN from your Sentry project settings
3. **Set Environment Variables**: Copy `.env.local.example` to `.env.local` and fill in your values
4. **Deploy Configuration**: Set environment variables in your production deployment
5. **Verify Setup**: Check Sentry dashboard for incoming errors and performance data

## Production Considerations

- **Sampling Rates**: Configured for 10% performance monitoring in production
- **Error Filtering**: Filters out non-actionable errors like network timeouts
- **Source Maps**: Automatically uploaded in production builds (requires auth token)
- **Release Tracking**: Configured to track releases for better error context
- **Privacy**: Sensitive data is masked in session replays

## Monitoring Dashboard

Once configured, you can monitor:
- Error frequency and trends
- Performance metrics and Web Vitals
- User sessions with replay capability
- Release-based error tracking
- Custom performance metrics