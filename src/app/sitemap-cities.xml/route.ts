import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { safeFetchFromApi, extractItems } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const baseUrl = config.appUrl;
  const currentDate = new Date().toISOString().split('T')[0];

  try {
    // Fetch cities from API
    const citiesData = await safeFetchFromApi(
      '/cities?limit=1000',
      { items: [] },
      { timeout: 8000, revalidate: 3600 }
    );

    const cities = extractItems(citiesData);

    // Generate URL nodes - keeping data simple and matching your static sitemap style
    const citiesXml = cities.map((city: any) => `  <url>
    <loc>${baseUrl}/${city.slug}</loc>
    <lastmod>${currentDate}</lastmod>
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
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      },
    });
  } catch (error) {
    console.error('Error generating cities sitemap:', error);

    // Return an empty urlset so Google doesn't see a 500 error
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
}