import { MetadataRoute } from 'next';
import { config } from '@/lib/config';

const BASE_URL = config.appUrl;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  try {
    // Fetch cities for dynamic pages
    const citiesResponse = await fetch(`${config.apiBaseUrl}/cities?limit=1000`, {
      cache: 'no-store',
    });
    
    let cityPages: MetadataRoute.Sitemap = [];
    if (citiesResponse.ok) {
      const citiesData = await citiesResponse.json();
      const cities = Array.isArray(citiesData) ? citiesData : citiesData.items || citiesData.data || [];
      
      cityPages = cities.map((city: any) => ({
        url: `${BASE_URL}/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.9,
      }));
    }

    // Fetch attractions for dynamic pages
    const attractionsResponse = await fetch(`${config.apiBaseUrl}/attractions?limit=1000`, {
      cache: 'no-store',
    });
    
    let attractionPages: MetadataRoute.Sitemap = [];
    if (attractionsResponse.ok) {
      const attractionsData = await attractionsResponse.json();
      const attractions = Array.isArray(attractionsData) ? attractionsData : attractionsData.items || attractionsData.data || [];
      
      attractionPages = attractions.map((attraction: any) => ({
        url: `${BASE_URL}/${attraction.city_slug}/${attraction.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    }

    return [...staticPages, ...cityPages, ...attractionPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}