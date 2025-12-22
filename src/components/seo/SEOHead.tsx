import Head from 'next/head';
import { StructuredData } from './StructuredData';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  noindex?: boolean;
  canonical?: string;
  structuredData?: {
    type: 'organization' | 'website' | 'city' | 'attraction';
    data?: any;
  }[];
  additionalMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
}

export function SEOHead({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
  canonical,
  structuredData = [],
  additionalMeta = [],
}: SEOHeadProps) {
  return (
    <>
      {/* Basic Meta Tags */}
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Robots */}
      <meta 
        name="robots" 
        content={noindex ? 'noindex,follow' : 'index,follow'} 
      />
      
      {/* Open Graph */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Tooryst" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@bettervacation_" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Additional Meta Tags */}
      {additionalMeta.map((meta, index) => (
        <meta
          key={index}
          {...(meta.name ? { name: meta.name } : {})}
          {...(meta.property ? { property: meta.property } : {})}
          content={meta.content}
        />
      ))}
      
      {/* Structured Data */}
      {structuredData.map((data, index) => (
        <StructuredData
          key={index}
          type={data.type}
          data={data.data}
        />
      ))}
    </>
  );
}

// Convenience function to generate SEO props from page data
export function generateSEOProps(pageType: string, data: any) {
  // This will be implemented based on the page type and data
  // For now, return basic structure
  return {
    title: data.title || 'Tooryst',
    description: data.description || 'Discover the best time to travel',
    keywords: data.keywords || ['travel', 'attractions', 'tourism'],
    image: data.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    url: data.url,
    canonical: data.canonical || data.url,
  };
}