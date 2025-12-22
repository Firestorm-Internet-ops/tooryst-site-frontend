import type { Metadata } from 'next';
import seoConfig from '@/data/seo-config.json';
import config from '@/lib/config';
import { getCityAttractionImages, generateCollageUrl } from './image-collage';

// Types for SEO data
export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  canonical?: string;
  alternates?: {
    canonical?: string;
    languages?: Record<string, string>;
  };
}

export interface CityData {
  name: string;
  slug: string;
  attraction_count?: number;
  description?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  hero_image?: string;
}

export interface AttractionData {
  name: string;
  slug: string;
  city_name: string;
  city_slug: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  hero_image?: string;
  rating?: number;
  review_count?: number;
  opening_hours?: string;
}

// Template variable replacement
function replaceTemplateVariables(template: string, variables: Record<string, any>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key] || match;
  });
}

// Generate SEO metadata for homepage
export function generateHomepageMetadata(): Metadata {
  const template = seoConfig.templates.homepage;
  const variables = {
    siteName: seoConfig.global.siteName,
    defaultImage: seoConfig.global.defaultImage,
    siteUrl: seoConfig.global.siteUrl,
  };

  const title = replaceTemplateVariables(template.title, variables);
  const description = replaceTemplateVariables(template.description, variables);
  const image = replaceTemplateVariables(template.image, variables);

  return {
    title,
    description,
    keywords: template.keywords,
    openGraph: {
      title,
      description,
      url: seoConfig.global.siteUrl,
      siteName: seoConfig.global.siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${seoConfig.global.siteName} - Travel Intelligence Platform`,
        },
      ],
      locale: seoConfig.global.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: seoConfig.global.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Generate SEO metadata for city pages
export async function generateCityMetadata(city: CityData): Promise<Metadata> {
  const template = seoConfig.templates.city;
  
  // Get attraction images for collage if no hero image
  let cityImage = city.hero_image;
  if (!cityImage) {
    try {
      const attractionImages = await getCityAttractionImages(city.slug);
      if (attractionImages.length > 0) {
        cityImage = generateCollageUrl(attractionImages, city.name, {
          width: 1200,
          height: 630,
          quality: 85,
        });
      } else {
        cityImage = seoConfig.global.defaultImage;
      }
    } catch (error) {
      console.warn(`Failed to generate collage for ${city.name}:`, error);
      cityImage = seoConfig.global.defaultImage;
    }
  }

  const variables = {
    siteName: seoConfig.global.siteName,
    siteUrl: seoConfig.global.siteUrl,
    cityName: city.name,
    attractionCount: city.attraction_count || 'many',
    cityImage,
  };

  const title = replaceTemplateVariables(template.title, variables);
  const description = replaceTemplateVariables(template.description, variables);
  const image = replaceTemplateVariables(template.image, variables);
  const url = `${seoConfig.global.siteUrl}/${city.slug}`;

  // Replace template variables in keywords
  const keywords = template.keywords.map(keyword => 
    replaceTemplateVariables(keyword, variables)
  );

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: seoConfig.global.siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${city.name} Travel Guide - ${seoConfig.global.siteName}`,
        },
      ],
      locale: seoConfig.global.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: seoConfig.global.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Generate SEO metadata for attraction pages
export function generateAttractionMetadata(attraction: AttractionData): Metadata {
  const template = seoConfig.templates.attraction;
  
  // Use attraction hero image or fallback to default
  const attractionImage = attraction.hero_image || getFallbackImage('attraction');
  
  const variables = {
    siteName: seoConfig.global.siteName,
    siteUrl: seoConfig.global.siteUrl,
    attractionName: attraction.name,
    cityName: attraction.city_name,
    attractionImage,
  };

  const title = replaceTemplateVariables(template.title, variables);
  const description = replaceTemplateVariables(template.description, variables);
  const image = replaceTemplateVariables(template.image, variables);
  const url = `${seoConfig.global.siteUrl}/${attraction.city_slug}/${attraction.slug}`;

  // Replace template variables in keywords
  const keywords = template.keywords.map(keyword => 
    replaceTemplateVariables(keyword, variables)
  );

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: seoConfig.global.siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${attraction.name} in ${attraction.city_name} - ${seoConfig.global.siteName}`,
        },
      ],
      locale: seoConfig.global.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: seoConfig.global.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Generate SEO metadata for search pages
export function generateSearchMetadata(query: string, resultCount?: number): Metadata {
  const template = seoConfig.templates.search;
  const variables = {
    siteName: seoConfig.global.siteName,
    siteUrl: seoConfig.global.siteUrl,
    query,
    defaultImage: seoConfig.global.defaultImage,
  };

  const title = replaceTemplateVariables(template.title, variables);
  let description = replaceTemplateVariables(template.description, variables);
  
  // Add result count to description if available
  if (resultCount !== undefined) {
    description = `Found ${resultCount} results for "${query}". ${description}`;
  }

  const image = replaceTemplateVariables(template.image, variables);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: seoConfig.global.siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `Search Results for ${query} - ${seoConfig.global.siteName}`,
        },
      ],
      locale: seoConfig.global.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: seoConfig.global.twitterHandle,
    },
    robots: {
      index: false, // Don't index search pages
      follow: true,
    },
  };
}

// Generate SEO metadata for static pages
export function generateStaticPageMetadata(pageType: keyof typeof seoConfig.templates.static): Metadata {
  const template = seoConfig.templates.static[pageType];
  const variables = {
    siteName: seoConfig.global.siteName,
    siteUrl: seoConfig.global.siteUrl,
    defaultImage: seoConfig.global.defaultImage,
  };

  const title = replaceTemplateVariables(template.title, variables);
  const description = replaceTemplateVariables(template.description, variables);
  const image = replaceTemplateVariables(template.image, variables);
  const url = `${seoConfig.global.siteUrl}/${pageType === 'about' ? 'about' : pageType === 'contact' ? 'contact' : pageType === 'privacy' ? 'privacy-policy' : 'terms-of-service'}`;

  return {
    title,
    description,
    keywords: template.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: seoConfig.global.siteName,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${title} - ${seoConfig.global.siteName}`,
        },
      ],
      locale: seoConfig.global.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: seoConfig.global.twitterHandle,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Generate structured data for different page types
export function generateStructuredData(type: 'organization' | 'website' | 'city' | 'attraction', data?: any) {
  const template = seoConfig.structured_data[type];
  
  if (!template) return null;

  const variables = {
    siteName: seoConfig.global.siteName,
    siteUrl: seoConfig.global.siteUrl,
    ...data,
  };

  // Deep clone and replace variables in the template
  const structuredData = JSON.parse(JSON.stringify(template));
  
  function replaceInObject(obj: any): any {
    if (typeof obj === 'string') {
      return replaceTemplateVariables(obj, variables);
    } else if (Array.isArray(obj)) {
      return obj.map(replaceInObject);
    } else if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = replaceInObject(value);
      }
      return result;
    }
    return obj;
  }

  return replaceInObject(structuredData);
}

// Helper to get fallback image based on page type
export function getFallbackImage(type: 'city' | 'attraction' | 'default'): string {
  switch (type) {
    case 'city':
      return config.images.fallbackCity;
    case 'attraction':
      return config.images.fallbackAttraction;
    default:
      return seoConfig.global.defaultImage;
  }
}