// This file configures the initialization of Sentry on the client (browser).
// The config you add here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_ENABLED = process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true';

if (SENTRY_ENABLED) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'development',

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || '1.0'),

    // Session Replay
    replaysSessionSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0.1'),
    replaysOnErrorSampleRate: parseFloat(process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '1.0'),

    // Integrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
      Sentry.browserTracingIntegration({
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/.*\.tooryst\.co/,
        ],
      }),
      Sentry.captureConsoleIntegration({
        levels: ['error', 'warn'],
      }),
    ],

    // Enhanced error categorization for production issues
    beforeSend(event, hint) {
      // Tag hydration errors for tracking
      const isHydrationError = event.exception?.values?.some(
        (ex) =>
          ex.value?.includes('Hydration') ||
          ex.value?.includes('Server Components') ||
          ex.value?.includes('Text content does not match')
      );

      if (isHydrationError) {
        event.tags = { ...event.tags, errorType: 'hydration' };
      }

      // Tag WebGL errors with device context
      const isWebGLError = event.exception?.values?.some(
        (ex) =>
          ex.value?.includes('WebGL') ||
          ex.value?.includes('Context Lost')
      );

      if (isWebGLError) {
        event.tags = { ...event.tags, errorType: 'webgl' };
        // Add GPU info if available
        if (typeof navigator !== 'undefined') {
          event.contexts = {
            ...event.contexts,
            device: {
              gpu: (navigator as any)?.gpu || 'unknown',
              userAgent: navigator.userAgent,
            },
          };
        }
      }

      return event;
    },
  });

  console.log('✓ Sentry client initialized for environment:', process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT);
} else {
  console.log('⊘ Sentry disabled via NEXT_PUBLIC_SENTRY_ENABLED');
}

// Export router transition tracking for Next.js App Router
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
