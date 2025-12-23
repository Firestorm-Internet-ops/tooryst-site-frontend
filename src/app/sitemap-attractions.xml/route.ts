import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { safeFetchFromApi, extractItems } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const baseUrl = config.appUrl;
  const currentDate = new Date().toISOString().split('T')[0];

  try {
    console.log('Fetching attractions from:', `${config.apiBaseUrl}/attractions?limit=1000`);
    
    // Use robust API fetching with fallback
    const attractionsData = await safeFetchFromApi(
      '/attractions?limit=1000',
      { items: [] },
      { timeout: 8000, revalidate: 3600 }
    );

    const attractions = extractItems(attractionsData);
    console.log('Processed attractions count:', attractions.length);
    
    const attractionsXml = attractions.map((attraction: any) => `  <url>
    <loc>${baseUrl}/${attraction.city_slug}/${attraction.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');

    const attractionsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${attractionsXml}
</urlset>`;

    return new NextResponse(attractionsSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200', // Cache for 1 hour, CDN for 2 hours
      },
    });
  } catch (error) {
    console.error('Error generating attractions sitemap:', error);

    // Return empty but valid sitemap on error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Attractions sitemap will be populated when API is available -->
  <!-- Error: ${error instanceof Error ? error.message : 'Unknown error'} -->
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