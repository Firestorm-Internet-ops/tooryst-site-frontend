import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

export async function GET(request: NextRequest) {
  const baseUrl = config.appUrl;
  const currentDate = new Date().toISOString().split('T')[0];

  try {
    console.log('Fetching attractions from:', `${config.apiBaseUrl}/attractions?limit=1000`);
    
    // Fetch attractions from your API
    const response = await fetch(`${config.apiBaseUrl}/attractions?limit=1000`, {
      cache: 'no-store',
    });

    console.log('Attractions API response status:', response.status);

    let attractionsXml = '';
    if (response.ok) {
      const attractionsData = await response.json();
      console.log('Attractions data structure:', typeof attractionsData, Array.isArray(attractionsData) ? 'array' : 'object');
      console.log('Attractions data sample:', JSON.stringify(attractionsData).substring(0, 200));
      
      const attractions = Array.isArray(attractionsData) ? attractionsData : attractionsData.items || attractionsData.data || [];
      console.log('Processed attractions count:', attractions.length);
      
      attractionsXml = attractions.map((attraction: any) => `  <url>
    <loc>${baseUrl}/${attraction.city_slug}/${attraction.slug}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n');
    } else {
      console.log('Attractions API failed with status:', response.status);
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }

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