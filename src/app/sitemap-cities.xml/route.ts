import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { safeFetchFromApi, extractItems } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const baseUrl = config.appUrl;
  const currentDate = new Date().toISOString().split('T')[0];

  try {
    console.log('Fetching cities from:', `${config.apiBaseUrl}/cities?limit=1000`);
    
    // Use robust API fetching with fallback
    const citiesData = await safeFetchFromApi(
      '/cities?limit=1000',
      { items: [] },
      { timeout: 8000, revalidate: 3600 }
    );

    const cities = extractItems(citiesData);
    console.log('Processed cities count:', cities.length);
    
    const citiesXml = cities.map((city: any) => `  <url>
    <loc>${baseUrl}/${city.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n');

    const citiesSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${citiesXml}
</urlset>`;

    return new NextResponse(citiesSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200', // Cache for 1 hour, CDN for 2 hours
      },
    });
  } catch (error) {
    console.error('Error generating cities sitemap:', error);

    // Return empty but valid sitemap on error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Cities sitemap will be populated when API is available -->
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