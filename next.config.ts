import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  compress: true,
  output: 'standalone', // Required for Docker deployment

  // Build configuration
  typescript: {
    // Allow build to continue even with TypeScript errors during deployment
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  eslint: {
    // Allow build to continue even with ESLint errors during deployment
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },

  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: [
      '@mui/material',
      '@mui/icons-material',
      'lucide-react',
      'react-icons',
      'framer-motion',
      '@tanstack/react-query',
    ],
    // React Compiler should be configured here if needed
    // reactCompiler: true, // This is experimental and may not be available in your Next.js version
  },

  // Webpack configuration for code splitting and vendor chunks
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize chunks for better caching and loading
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          chunks: 'all',
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            // Vendor chunk for common libraries
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              chunks: 'all',
              enforce: true,
            },
            // React and Next.js specific chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              name: 'react-vendor',
              priority: 20,
              chunks: 'all',
              enforce: true,
            },
            // UI library chunk
            ui: {
              test: /[\\/]node_modules[\\/](@mui|lucide-react|framer-motion)[\\/]/,
              name: 'ui-vendor',
              priority: 15,
              chunks: 'all',
              enforce: true,
            },
            // Map and 3D libraries chunk (heavy components)
            maps: {
              test: /[\\/]node_modules[\\/](leaflet|mapbox-gl|three|@react-three)[\\/]/,
              name: 'maps-vendor',
              priority: 25,
              chunks: 'all',
              enforce: true,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      };
    }

    // Add bundle analyzer in development
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache for optimized images
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable image optimization for better performance
    loader: 'default',
    path: '/_next/image',
    domains: [], // Use remotePatterns instead
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.weserv.nl',
      },
      {
        protocol: 'https',
        hostname: 'wsrv.nl',
      },
      {
        protocol: 'https',
        hostname: 'api.mapbox.com',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'openweathermap.org',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.ggpht.com',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.example.com', // Add your CDN domain
      },
      {
        protocol: 'https',
        hostname: '*.nyt.com', // New York Times images
      },
      {
        protocol: 'https',
        hostname: '*.nytimes.com', // New York Times images
      },
      {
        protocol: 'https',
        hostname: 'images.tooryst.co',
      },
    ],
    // Unoptimized images for development (remove in production)
    unoptimized: false,
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects for performance (if needed)
  async redirects() {
    return [
      {
        source: '/sitemap_index.xml',
        destination: '/sitemap.xml',
        permanent: true,
      },
    ];
  },

  // Rewrites for API optimization
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
