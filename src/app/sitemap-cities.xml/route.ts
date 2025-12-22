import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Fetch cities sitemap from backend
    const response = await fetch(`${BACKEND_URL}/api/v1/sitemap-cities.xml`, {
      headers: {
        'User-Agent': 'Storyboard-Frontend/1.0',
      },
      // Cache for 1 hour
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const sitemapXml = await response.text();

    return new NextResponse(sitemapXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200', // Cache for 1 hour, CDN for 2 hours
      },
    });
  } catch (error) {
    console.error('Error fetching cities sitemap from backend:', error);

    // Return minimal cities sitemap on error (empty but valid XML)
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Cities sitemap will be populated when backend is available -->
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300', // Shorter cache on error
      },
    });
  }
}