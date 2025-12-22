import { MetadataRoute } from 'next';
import { config } from '@/lib/config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = config.appUrl;
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/search?*', // Disallow search pages with parameters
          '/*?*', // Disallow URLs with query parameters
        ],
      },
      {
        userAgent: 'GPTBot', // OpenAI's web crawler
        allow: '/',
      },
      {
        userAgent: 'Google-Extended', // Google's AI training crawler
        allow: '/',
      },
      {
        userAgent: 'CCBot', // Common Crawl bot used by AI companies
        allow: '/',
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
    ],
    host: baseUrl,
  };
}