import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.NODE_ENV || 'development',
  
  // Performance monitoring - minimal for edge
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,
  
  // Debug mode for development (disabled to avoid source map warnings)
  debug: false,
  
  // Release tracking
  release: process.env.SENTRY_RELEASE,
});