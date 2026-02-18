import { Metadata } from 'next';
import { seoManager } from '@/lib/seo-manager';
import FAQClient from './FAQClient';

export const metadata: Metadata = seoManager.generateStaticPageMetadata('faq');

export default function FAQPage() {
  return <FAQClient />;
}
