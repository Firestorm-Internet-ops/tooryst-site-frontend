import type { Metadata } from 'next';
import { 
  generateHomepageMetadata,
  generateCityMetadata,
  generateAttractionMetadata,
  generateSearchMetadata,
  generateStaticPageMetadata,
  generateStructuredData,
  getFallbackImage,
  type CityData,
  type AttractionData
} from './seo-utils';

// Import SEO templates
import homepageSEO from '@/data/seo/homepage.json';
import cityTemplate from '@/data/seo/city-template.json';
import attractionTemplate from '@/data/seo/attraction-template.json';

export class SEOManager {
  private static instance: SEOManager;
  
  public static getInstance(): SEOManager {
    if (!SEOManager.instance) {
      SEOManager.instance = new SEOManager();
    }
    return SEOManager.instance;
  }

  // Generate metadata for homepage
  generateHomepageMetadata(): Metadata {
    return generateHomepageMetadata();
  }

  // Generate metadata for city pages
  async generateCityMetadata(city: CityData): Promise<Metadata> {
    return await generateCityMetadata(city);
  }

  // Generate metadata for attraction pages
  generateAttractionMetadata(attraction: AttractionData): Metadata {
    return generateAttractionMetadata(attraction);
  }

  // Generate metadata for search pages
  generateSearchMetadata(query: string, resultCount?: number): Metadata {
    return generateSearchMetadata(query, resultCount);
  }

  // Generate metadata for static pages
  generateStaticPageMetadata(pageType: 'about' | 'contact' | 'privacy' | 'terms'): Metadata {
    return generateStaticPageMetadata(pageType);
  }

  // Generate structured data for any page type
  generateStructuredData(type: 'organization' | 'website' | 'city' | 'attraction', data?: any) {
    return generateStructuredData(type, data);
  }

  // Get SEO configuration for homepage
  getHomepageSEOConfig() {
    return homepageSEO;
  }

  // Get SEO configuration for city pages
  getCitySEOConfig(city: CityData) {
    const template = cityTemplate;
    
    // Replace template variables
    const replaceVariables = (text: string) => {
      return text
        .replace(/\{cityName\}/g, city.name)
        .replace(/\{attractionCount\}/g, String(city.attraction_count || 'many'))
        .replace(/\{citySlug\}/g, city.slug);
    };

    return {
      meta: {
        title: replaceVariables(template.meta.title_template),
        description: replaceVariables(template.meta.description_template),
        keywords: template.meta.keywords_template.map(replaceVariables),
        image: city.hero_image || getFallbackImage('city'),
      },
      structured_data: template.structured_data,
      content: {
        hero: {
          title: replaceVariables(template.content.hero.title_template),
          subtitle: replaceVariables(template.content.hero.subtitle_template),
          description: replaceVariables(template.content.hero.description_template),
        },
        sections: template.content.sections,
      },
    };
  }

  // Get SEO configuration for attraction pages
  getAttractionSEOConfig(attraction: AttractionData) {
    const template = attractionTemplate;
    
    // Replace template variables
    const replaceVariables = (text: string) => {
      return text
        .replace(/\{attractionName\}/g, attraction.name)
        .replace(/\{cityName\}/g, attraction.city_name)
        .replace(/\{attractionSlug\}/g, attraction.slug)
        .replace(/\{citySlug\}/g, attraction.city_slug);
    };

    return {
      meta: {
        title: replaceVariables(template.meta.title_template),
        description: replaceVariables(template.meta.description_template),
        keywords: template.meta.keywords_template.map(replaceVariables),
        image: attraction.hero_image || getFallbackImage('attraction'),
      },
      structured_data: template.structured_data,
      content: {
        hero: {
          title: replaceVariables(template.content.hero.title_template),
          subtitle: replaceVariables(template.content.hero.subtitle_template),
          description: replaceVariables(template.content.hero.description_template),
        },
        sections: template.content.sections,
      },
    };
  }

  // Generate sitemap data
  generateSitemapData() {
    return {
      static_pages: [
        { url: '/', priority: 1.0, changefreq: 'daily' },
        { url: '/about', priority: 0.8, changefreq: 'monthly' },
        { url: '/contact', priority: 0.8, changefreq: 'monthly' },
        { url: '/privacy-policy', priority: 0.5, changefreq: 'yearly' },
        { url: '/terms-of-service', priority: 0.5, changefreq: 'yearly' },
        { url: '/search', priority: 0.6, changefreq: 'weekly' },
      ],
      dynamic_patterns: {
        cities: {
          pattern: '/{city-slug}',
          priority: 0.9,
          changefreq: 'weekly',
        },
        attractions: {
          pattern: '/{city-slug}/{attraction-slug}',
          priority: 0.8,
          changefreq: 'weekly',
        },
      },
    };
  }

  // Generate robots.txt content
  generateRobotsTxt() {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tooryst.com';
    
    return `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-cities.xml
Sitemap: ${baseUrl}/sitemap-attractions.xml

# Disallow search pages with parameters
Disallow: /search?*

# Disallow admin or private areas (if any)
Disallow: /admin/
Disallow: /api/

# Allow all other pages
Allow: /`;
  }

  // Validate and optimize images for SEO
  optimizeImageForSEO(imageUrl: string, alt: string, type: 'hero' | 'thumbnail' | 'social') {
    const dimensions = {
      hero: { width: 1200, height: 630 },
      thumbnail: { width: 400, height: 300 },
      social: { width: 1200, height: 630 },
    };

    const size = dimensions[type];
    
    // If it's an Unsplash image, add optimization parameters
    if (imageUrl.includes('unsplash.com')) {
      const separator = imageUrl.includes('?') ? '&' : '?';
      return `${imageUrl}${separator}auto=format&fit=crop&w=${size.width}&h=${size.height}&q=80`;
    }

    return imageUrl;
  }

  // Generate meta tags for AEO (Answer Engine Optimization)
  generateAEOTags(pageType: string, data: any) {
    const aeoTags = [];

    // Add FAQ schema for attraction pages
    if (pageType === 'attraction' && data.faqs) {
      aeoTags.push({
        type: 'application/ld+json',
        content: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: data.faqs.map((faq: any) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        }),
      });
    }

    // Add HowTo schema for travel guides
    if (pageType === 'city' && data.howToVisit) {
      aeoTags.push({
        type: 'application/ld+json',
        content: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: `How to visit ${data.name}`,
          description: `Complete guide to visiting ${data.name}`,
          step: data.howToVisit.map((step: any, index: number) => ({
            '@type': 'HowToStep',
            position: index + 1,
            name: step.title,
            text: step.description,
          })),
        }),
      });
    }

    return aeoTags;
  }
}

// Export singleton instance
export const seoManager = SEOManager.getInstance();