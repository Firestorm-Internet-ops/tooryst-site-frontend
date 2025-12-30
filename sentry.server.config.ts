import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Environment configuration
  environment: process.env.NODE_ENV || 'development',
  
  // Performance monitoring - lower sample rate for server
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,
  
  // Error filtering for server-side
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      // Don't send certain development-only errors
      if (event.exception?.values?.[0]?.value?.includes('ECONNREFUSED')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
  
  // Release tracking
  release: process.env.SENTRY_RELEASE,
});