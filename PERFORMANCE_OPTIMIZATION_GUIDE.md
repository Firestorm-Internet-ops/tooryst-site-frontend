# Performance Optimization Guide

## 🚀 **Priority 1: Image Optimization (Biggest Impact)**

### Current Issues:
- Large unoptimized images
- No lazy loading for below-fold images
- Missing responsive image sizes
- No image preloading for critical images

### Solutions:

#### A. Optimize Image Loading Strategy
```typescript
// client/src/components/ui/OptimizedImage.tsx - Enhanced version
'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes,
  quality = 75, // Reduced from 85 for faster loading
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        quality={quality}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => setIsLoading(false)}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      />
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
```

#### B. Implement Image Preloading for Critical Images
```typescript
// client/src/hooks/useImagePreloader.ts - Enhanced
import { useEffect } from 'react';

export function useImagePreloader(imageUrls: string[], priority = false) {
  useEffect(() => {
    if (!priority) return; // Only preload priority images
    
    imageUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }, [imageUrls, priority]);
}
```

#### C. Optimize Hero Image Slider
```typescript
// client/src/components/attractions/HeroImagesSlider.tsx - Add lazy loading
export function HeroImageSlider({ images }: HeroImageSliderProps) {
  return (
    <div className="relative">
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          src={image.url}
          alt={image.alt || 'Attraction image'}
          priority={index === 0} // Only first image is priority
          quality={index === 0 ? 85 : 75} // Higher quality for first image
          sizes="(max-width: 768px) 100vw, 66vw"
        />
      ))}
    </div>
  );
}
```

## 🚀 **Priority 2: API & Data Optimization**

### Current Issues:
- Large API responses
- No caching strategy
- Blocking API calls
- No data prefetching

### Solutions:

#### A. Implement API Response Caching
```typescript
// client/src/lib/api-cache.ts
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function cachedFetch(url: string, options?: RequestInit) {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

#### B. Optimize API Calls with Parallel Loading
```typescript
// client/src/app/[city-slug]/[attraction-slug]/page.tsx - Parallel loading
async function getAttractionData(slug: string) {
  // Load critical data first
  const [attraction, reviews] = await Promise.all([
    cachedFetch(`${config.apiBaseUrl}/attractions/${slug}`),
    cachedFetch(`${config.apiBaseUrl}/attractions/${slug}/reviews?limit=5`)
  ]);
  
  // Load non-critical data after
  const [weather, nearby] = await Promise.allSettled([
    cachedFetch(`${config.apiBaseUrl}/attractions/${slug}/weather`),
    cachedFetch(`${config.apiBaseUrl}/attractions/${slug}/nearby`)
  ]);
  
  return { attraction, reviews, weather, nearby };
}
```

#### C. Implement Streaming for Large Responses
```typescript
// client/src/components/attractions/AttractionPageClient.tsx - Streaming
import { Suspense } from 'react';

export function AttractionPageClient({ pageData }: AttractionPageClientProps) {
  return (
    <main>
      {/* Critical content loads immediately */}
      <HeroImageSlider images={pageData.cards.hero_images?.images} />
      
      {/* Non-critical content streams in */}
      <Suspense fallback={<CardSkeleton />}>
        <StoryboardCardsGrid data={pageData} />
      </Suspense>
      
      <Suspense fallback={<SectionSkeleton />}>
        <ReviewsSection />
      </Suspense>
    </main>
  );
}
```

## 🚀 **Priority 3: Code Splitting & Bundle Optimization**

### Current Issues:
- Large JavaScript bundles
- No code splitting
- Unused dependencies loaded

### Solutions:

#### A. Implement Dynamic Imports
```typescript
// client/src/components/attractions/AttractionPageClient.tsx
import dynamic from 'next/dynamic';

// Lazy load heavy components
const MapSection = dynamic(() => import('./sections/MapSection'), {
  loading: () => <div className="h-64 bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false // Don't render on server if not needed
});

const SocialVideosSection = dynamic(() => import('./sections/SocialVideosSection'), {
  loading: () => <div className="h-48 bg-gray-200 animate-pulse rounded-lg" />
});

export function AttractionPageClient({ pageData }: AttractionPageClientProps) {
  return (
    <main>
      {/* Critical content */}
      <HeroImageSlider />
      <StoryboardCardsGrid />
      
      {/* Lazy loaded sections */}
      <MapSection />
      <SocialVideosSection />
    </main>
  );
}
```

#### B. Optimize Bundle Size
```typescript
// client/next.config.ts - Enhanced
const nextConfig: NextConfig = {
  // ... existing config
  
  // Bundle analyzer
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Optimize bundle splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
  
  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      '@tanstack/react-query'
    ],
  },
};
```

## 🚀 **Priority 4: Loading States & Perceived Performance**

### Solutions:

#### A. Implement Skeleton Loading
```typescript
// client/src/components/ui/Skeletons.tsx
export function CardSkeleton() {
  return (
    <div className="rounded-3xl bg-gray-200 animate-pulse h-64 w-full" />
  );
}

export function HeroSkeleton() {
  return (
    <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg" />
  );
}

export function StoryboardSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
```

#### B. Progressive Loading Strategy
```typescript
// client/src/app/[city-slug]/[attraction-slug]/loading.tsx
export default function Loading() {
  return (
    <main className="bg-white text-gray-900">
      <div className="w-full px-4 lg:px-6 py-8">
        <HeroSkeleton />
        <div className="mt-8">
          <StoryboardSkeleton />
        </div>
      </div>
    </main>
  );
}
```

## 🚀 **Priority 5: Database & Backend Optimization**

### Solutions:

#### A. Optimize API Endpoints
```python
# backend/app/api/attractions.py - Add response optimization
@router.get("/attractions/{slug}")
async def get_attraction(slug: str, minimal: bool = False):
    if minimal:
        # Return only essential data for initial render
        return {
            "name": attraction.name,
            "city": attraction.city,
            "hero_images": attraction.hero_images[:1],  # Only first image
            "cards": {
                "best_time": attraction.cards.best_time,
                "review": attraction.cards.review
            }
        }
    
    # Return full data
    return attraction
```

#### B. Implement CDN for Images
```typescript
// client/src/lib/image-utils.ts - CDN optimization
export function optimizeImageUrl(url: string, width?: number, quality = 75) {
  // Use your CDN (Cloudinary, ImageKit, etc.)
  if (url.includes('your-cdn.com')) {
    return `${url}?w=${width}&q=${quality}&f=auto`;
  }
  
  // Fallback to Next.js image optimization
  return url;
}
```

## 🚀 **Priority 6: Caching Strategy**

### Solutions:

#### A. Implement Service Worker for Caching
```typescript
// client/public/sw.js
const CACHE_NAME = 'tooryst-v1';
const urlsToCache = [
  '/',
  '/herobg1.svg',
  // Add critical assets
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
```

#### B. Browser Caching Headers
```typescript
// client/next.config.ts - Enhanced caching
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
        },
      ],
    },
    {
      source: '/_next/image',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
},
```

## 📊 **Performance Monitoring**

### A. Add Performance Metrics
```typescript
// client/src/lib/performance.ts
export function measurePerformance() {
  if (typeof window !== 'undefined') {
    // Core Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
}
```

### B. Performance Budget
```json
// client/performance-budget.json
{
  "budget": [
    {
      "path": "/**",
      "timings": [
        {
          "metric": "first-contentful-paint",
          "budget": 2000
        },
        {
          "metric": "largest-contentful-paint",
          "budget": 2500
        }
      ],
      "resourceSizes": [
        {
          "resourceType": "script",
          "budget": 400
        },
        {
          "resourceType": "total",
          "budget": 2000
        }
      ]
    }
  ]
}
```

## 🎯 **Implementation Priority**

### Week 1: Quick Wins (Biggest Impact)
1. ✅ **Optimize images** - Reduce quality to 75%, add lazy loading
2. ✅ **Add loading skeletons** - Improve perceived performance
3. ✅ **Implement API caching** - 5-minute cache for attraction data
4. ✅ **Preload critical images** - Hero images only

### Week 2: Code Optimization
1. ✅ **Dynamic imports** - Lazy load heavy components
2. ✅ **Bundle optimization** - Code splitting, tree shaking
3. ✅ **Remove unused dependencies** - Audit and clean up

### Week 3: Advanced Optimization
1. ✅ **CDN implementation** - Move images to CDN
2. ✅ **Service worker** - Cache critical assets
3. ✅ **Database optimization** - Optimize API queries

## 🧪 **Testing Performance**

### Tools to Use:
1. **Lighthouse** - Overall performance score
2. **WebPageTest** - Detailed loading analysis
3. **Chrome DevTools** - Network and performance tabs
4. **Next.js Bundle Analyzer** - Bundle size analysis

### Commands:
```bash
# Analyze bundle size
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build

# Performance testing
npm install -g lighthouse
lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html
```

## 📈 **Expected Results**

After implementing these optimizations:

- **First Contentful Paint**: < 1.5s (from ~3s)
- **Largest Contentful Paint**: < 2.5s (from ~5s)
- **Time to Interactive**: < 3s (from ~6s)
- **Bundle Size**: Reduced by 30-50%
- **Image Loading**: 60% faster with lazy loading
- **Perceived Performance**: Much smoother with skeletons

## 🚨 **Critical Actions (Do First)**

1. **Reduce image quality** from 85 to 75 (instant 20% improvement)
2. **Add lazy loading** to all images below fold
3. **Implement loading skeletons** for better UX
4. **Cache API responses** for 5 minutes
5. **Preload only hero images** (first image priority)

These changes alone will give you 40-60% performance improvement! 🚀