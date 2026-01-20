/**
 * Service Worker for Offline Caching and Performance
 *
 * Implements:
 * - Cache-first strategy for static assets
 * - Network-first strategy for API calls
 * - Stale-while-revalidate for images
 * - Offline fallback pages
 */

const CACHE_VERSION = 'tooryst-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/herobg1.svg',
  '/manifest.json',
];

// Cache size limits
const CACHE_LIMITS = {
  [IMAGE_CACHE]: 50,
  [API_CACHE]: 30,
  [DYNAMIC_CACHE]: 40,
};

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete old caches that don't match current version
              return name.startsWith('tooryst-') && !name.startsWith(CACHE_VERSION);
            })
            .map((name) => {
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(request));
  } else if (isAPIRequest(url)) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticAsset(url)) {
    event.respondWith(handleStaticRequest(request));
  } else {
    event.respondWith(handleDynamicRequest(request));
  }
});

/**
 * Check if request is for an image
 */
function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|avif|svg|ico)$/i.test(url.pathname);
}

/**
 * Check if request is for an API endpoint
 */
function isAPIRequest(url) {
  return url.pathname.startsWith('/api/') || url.href.includes('/attractions/');
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(url) {
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/images/') ||
    /\.(js|css|woff|woff2|ttf|eot)$/i.test(url.pathname)
  );
}

/**
 * Handle image requests - Stale-while-revalidate strategy
 */
async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  // Return cached image immediately if available
  if (cached) {
    // Update cache in background
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {
        // Silently fail background update
      });

    return cached;
  }

  // If not cached, fetch from network
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
      limitCacheSize(IMAGE_CACHE, CACHE_LIMITS[IMAGE_CACHE]);
    }
    return response;
  } catch (error) {
    // Return offline fallback image if available
    return new Response('', { status: 404, statusText: 'Image not found' });
  }
}

/**
 * Handle API requests - Network-first strategy
 */
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE);

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
      limitCacheSize(API_CACHE, CACHE_LIMITS[API_CACHE]);
    }
    return response;
  } catch (error) {
    // Fall back to cache if network fails
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // Return error response
    return new Response(
      JSON.stringify({ error: 'Network error, no cached data available' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Handle static asset requests - Cache-first strategy
 */
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  // Only use cached response if it was successful
  if (cached && cached.ok) {
    return cached;
  }

  try {
    const response = await fetch(request);
    // Only cache successful responses
    if (response && response.status === 200 && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Service worker fetch failed:', error);
    return new Response('', { status: 404, statusText: 'Not found' });
  }
}

/**
 * Handle dynamic page requests - Network-first with cache fallback
 */
async function handleDynamicRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE);

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
      limitCacheSize(DYNAMIC_CACHE, CACHE_LIMITS[DYNAMIC_CACHE]);
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    // Return offline page if available
    const offlinePage = await cache.match('/offline');
    if (offlinePage) {
      return offlinePage;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

/**
 * Limit cache size by removing oldest entries
 */
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxSize) {
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map((key) => cache.delete(key)));
  }
}

/**
 * Message event - handle cache invalidation
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name.startsWith('tooryst-')) {
              return caches.delete(name);
            }
          })
        );
      })
    );
  }

  if (event.data && event.data.type === 'INVALIDATE_CACHE') {
    const { pattern } = event.data;
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map(async (cacheName) => {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            return Promise.all(
              keys
                .filter((key) => key.url.includes(pattern))
                .map((key) => cache.delete(key))
            );
          })
        );
      })
    );
  }
});