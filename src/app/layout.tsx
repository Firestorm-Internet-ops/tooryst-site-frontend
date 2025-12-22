import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import '../styles/crowd-levels.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SkipToMain, SkipToSearch } from '@/components/ui/SkipLink';
import { NavigationProgress } from '@/components/ui/NavigationProgress';

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
  title: 'Toorysts',
  description:
    'Discover the best time to visit any attraction with live crowd, weather, and travel intel.',
  authors: [{ name: 'Toorysts' }],
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
      <body className="bg-gray-950 text-gray-50 antialiased">
        <NavigationProgress />
        <SkipToMain />
        <SkipToSearch />
        <QueryProvider>
          <div className="flex min-h-screen flex-col bg-gray-950 text-gray-50">
            <Header />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
