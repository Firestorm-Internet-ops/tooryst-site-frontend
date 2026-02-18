import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';
import './globals.css';
import '../styles/crowd-levels.css';
import { Header } from '@/components/layout/Header';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SkipToMain, SkipToSearch } from '@/components/ui/SkipLink';
import { GoogleAnalytics } from '@next/third-parties/google';
import { PageErrorBoundary, SectionErrorBoundary } from '@/components/error-boundaries/ErrorBoundary';
import { MonitoringProvider } from '@/components/providers/MonitoringProvider';
import dynamic from 'next/dynamic';

const NavigationProgress = dynamic(
  () => import('@/components/ui/NavigationProgress').then(mod => mod.NavigationProgress)
);

const Footer = dynamic(
  () => import('@/components/layout/Footer').then(mod => mod.Footer),
  { ssr: true } // Let SEO see the footer
);
// import { ServiceWorkerProvider } from '@/components/providers/ServiceWorkerProvider';
import { config } from '@/lib/config';
import { CDN_CONFIG } from '@/lib/cdn-image';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(config.appUrl),
  title: 'Tooryst',
  description:
    'Discover the best time to visit any attraction with live crowd, weather, and travel intel.',
  authors: [{ name: 'Tooryst' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        {/* Preconnect to weserv.nl for faster image loading */}
        {CDN_CONFIG.provider === 'weserv' && (
          <link rel="preconnect" href={CDN_CONFIG.weserv} crossOrigin="anonymous" />
        )}
      </head>
      <body className="bg-gray-950 text-gray-50 antialiased">
        <GoogleAnalytics gaId="G-CW2LJ9QCNN" />
        {/* <ServiceWorkerProvider /> */}
        <MonitoringProvider>
          <PageErrorBoundary context={{ section: 'root-layout' }}>
            <Suspense fallback={null}>
              <NavigationProgress />
            </Suspense>
            <SkipToMain />
            <SkipToSearch />
            <QueryProvider>
              <div className="flex min-h-screen flex-col bg-gray-950 text-gray-50">
                <SectionErrorBoundary context={{ section: 'header' }}>
                  <Header />
                </SectionErrorBoundary>
                <main id="main-content" className="flex-1">
                  <SectionErrorBoundary context={{ section: 'main-content' }}>
                    {children}
                  </SectionErrorBoundary>
                </main>
                <SectionErrorBoundary context={{ section: 'footer' }}>
                  <Footer />
                </SectionErrorBoundary>
              </div>
            </QueryProvider>
          </PageErrorBoundary>
        </MonitoringProvider>
      </body>
    </html>
  );
}
