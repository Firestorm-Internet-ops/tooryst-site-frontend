import { generateStructuredData } from '@/lib/seo-utils';

interface StructuredDataProps {
  type: 'organization' | 'website' | 'city' | 'attraction';
  data?: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = generateStructuredData(type, data);

  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
    />
  );
}

// Convenience components for specific types
export function OrganizationStructuredData() {
  return <StructuredData type="organization" />;
}

export function WebsiteStructuredData() {
  return <StructuredData type="website" />;
}

export function CityStructuredData(props: { 
  cityName: string;
  cityDescription?: string;
  cityLatitude?: number;
  cityLongitude?: number;
  attractions?: any[];
}) {
  return <StructuredData type="city" data={props} />;
}

export function AttractionStructuredData(props: {
  attractionName: string;
  attractionDescription?: string;
  attractionImage?: string;
  attractionLatitude?: number;
  attractionLongitude?: number;
  cityName: string;
  countryName?: string;
  openingHours?: string;
  rating?: number;
  reviewCount?: number;
}) {
  return <StructuredData type="attraction" data={props} />;
}