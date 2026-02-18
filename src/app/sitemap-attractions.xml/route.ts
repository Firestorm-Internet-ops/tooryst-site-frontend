import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { safeFetchFromApi, extractItems } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  const baseUrl = config.appUrl;
  const currentDate = new Date().toISOString().split('T')[0];

  try {
    // Fetch up to 1000 attractions to cover all current data
    const attractionsData = await safeFetchFromApi(
      '/attractions?limit=1000',
      { items: [] },
      { timeout: 10000, revalidate: 3600 } // Slightly longer timeout for larger dataset
    );

    const attractions = extractItems(attractionsData);

    // Generate URL nodes - removed priority/changefreq for a cleaner XML structure
    const attractionsXml = attractions
      .filter((attraction: any) =>
        attraction.slug &&
        attraction.slug !== 'null' &&
        attraction.city_slug &&
        attraction.city_slug !== 'null'
      )
      .map((attraction: any) => `  <url>
    <loc>${baseUrl}/${attraction.city_slug}/${attraction.slug}</loc>
    <lastmod>${currentDate}</lastmod>
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
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      },
    });
  } catch (error) {
    console.error('Error generating attractions sitemap:', error);

    // Return valid empty urlset to keep Google Search Console happy
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