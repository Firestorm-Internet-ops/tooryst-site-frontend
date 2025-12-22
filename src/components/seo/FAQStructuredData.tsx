interface FAQ {
  question: string;
  answer: string;
}

interface FAQStructuredDataProps {
  faqs: FAQ[];
  pageTitle?: string;
}

export function FAQStructuredData({ faqs, pageTitle }: FAQStructuredDataProps) {
  if (!faqs || faqs.length === 0) return null;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: pageTitle ? `${pageTitle} - Frequently Asked Questions` : 'Frequently Asked Questions',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqSchema, null, 2),
      }}
    />
  );
}

// HowTo schema for travel guides
interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

interface HowToStructuredDataProps {
  title: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  estimatedCost?: string;
}

export function HowToStructuredData({
  title,
  description,
  steps,
  totalTime,
  estimatedCost,
}: HowToStructuredDataProps) {
  if (!steps || steps.length === 0) return null;

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    description,
    ...(totalTime && { totalTime }),
    ...(estimatedCost && { estimatedCost: { '@type': 'MonetaryAmount', value: estimatedCost } }),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(howToSchema, null, 2),
      }}
    />
  );
}

// Review/Rating schema for attractions
interface Review {
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: string;
}

interface ReviewStructuredDataProps {
  itemName: string;
  reviews: Review[];
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
}

export function ReviewStructuredData({
  itemName,
  reviews,
  aggregateRating,
}: ReviewStructuredDataProps) {
  if (!reviews || reviews.length === 0) return null;

  const reviewSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product', // or 'Place' for attractions
    name: itemName,
    ...(aggregateRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: aggregateRating.ratingValue,
        reviewCount: aggregateRating.reviewCount,
        bestRating: aggregateRating.bestRating || 5,
        worstRating: aggregateRating.worstRating || 1,
      },
    }),
    review: reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author,
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.reviewBody,
      datePublished: review.datePublished,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(reviewSchema, null, 2),
      }}
    />
  );
}

// Breadcrumb schema
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbStructuredDataProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbStructuredData({ items }: BreadcrumbStructuredDataProps) {
  if (!items || items.length === 0) return null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbSchema, null, 2),
      }}
    />
  );
}