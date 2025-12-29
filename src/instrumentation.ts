import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }

  // Note: Client-side initialization happens via sentry.client.config.ts
  // which is automatically loaded by Next.js
}

export const onRequestError = Sentry.captureRequestError;
