/**
 * Service Worker Registration
 * Registers and manages the service worker lifecycle
 */

/**
 * Register service worker in production only
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined') {
    return; // Not in browser
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log('[SW] Service worker disabled in development');
    return;
  }

  if (!('serviceWorker' in navigator)) {
    console.log('[SW] Service worker not supported');
    return;
  }

  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[SW] Service worker registered successfully');

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is installed, show update notification
              console.log('[SW] New version available, please refresh');

              // Optionally show a notification to the user
              if (window.confirm('A new version is available. Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          });
        }
      });

      // Handle controller change (new service worker activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] Controller changed, reloading page');
        window.location.reload();
      });

      // Check for updates periodically (every hour)
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);
    } catch (error) {
      console.error('[SW] Service worker registration failed:', error);
    }
  });
}

/**
 * Unregister service worker
 */
export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('[SW] Service worker unregistered');
    }
  } catch (error) {
    console.error('[SW] Service worker unregistration failed:', error);
  }
}

/**
 * Clear all caches
 */
export async function clearServiceWorkerCache() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (registration && registration.active) {
    registration.active.postMessage({ type: 'CLEAR_CACHE' });
  }
}

/**
 * Invalidate cache by pattern
 */
export async function invalidateCache(pattern: string) {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (registration && registration.active) {
    registration.active.postMessage({
      type: 'INVALIDATE_CACHE',
      pattern,
    });
  }
}

/**
 * Check if service worker is registered and active
 */
export async function isServiceWorkerActive(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  return !!(registration && registration.active);
}
