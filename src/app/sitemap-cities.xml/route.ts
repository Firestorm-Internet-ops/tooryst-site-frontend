import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  const baseUrl = config.appUrl;
  const currentDate = new Date().toISOString().split('T')[0];

  try {
    console.log('Fetching cities from:', `${config.apiBaseUrl}/cities?limit=1000`);
    
    // Fetch cities from your API
    const response = await fetch(`${config.apiBaseUrl}/cities?limit=1000`, {
      cache: 'no-store',
    });

    console.log('Cities API response status:', response.status);

    let citiesXml = '';
    if (response.ok) {
      const citiesData = await response.json();
      console.log('Cities data structure:', typeof citiesData, Array.isArray(citiesData) ? 'array' : 'object');
      console.log('Cities data sample:', JSON.stringify(citiesData).substring(0, 200));
      
      const cities = Array.isArray(citiesData) ? citiesData : citiesData.items || citiesData.data || [];
      console.log('Processed cities count:', cities.length);
      
      citiesXml = cities.map((city: any) => `  <url>
    <loc>${baseUrl}/${city.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n');
    } else {
      console.log('Cities API failed with status:', response.status);
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }

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