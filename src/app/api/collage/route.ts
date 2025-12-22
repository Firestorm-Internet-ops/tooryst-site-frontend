import { NextRequest, NextResponse } from 'next/server';
import { generateCollageHTML } from '@/lib/image-collage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const imagesParam = searchParams.get('images');
    const cityName = searchParams.get('city') || 'City';
    const width = parseInt(searchParams.get('width') || '1200');
    const height = parseInt(searchParams.get('height') || '630');
    const quality = parseInt(searchParams.get('quality') || '85');
    const format = searchParams.get('format') || 'jpg';
    const backgroundColor = searchParams.get('bg') || '#f3f4f6';
    const padding = parseInt(searchParams.get('padding') || '10');

    if (!imagesParam) {
      return new NextResponse('Missing images parameter', { status: 400 });
    }

    // Parse image URLs
    const imageUrls = imagesParam.split(',').filter(Boolean).slice(0, 6);
    
    // Convert to AttractionImage format
    const images = imageUrls.map((url, index) => ({
      id: `img-${index}`,
      name: `Attraction ${index + 1}`,
      image_url: url,
      hero_image: url,
    }));

    // Generate HTML for the collage
    const collageHTML = generateCollageHTML(images, cityName, {
      width,
      height,
      backgroundColor,
      padding,
    });

    // For now, return a simple response
    // In production, you'd want to use a service like Puppeteer or Playwright
    // to convert HTML to image, or use a service like Bannerbear, Placid, etc.
    
    // Simple SVG-based collage as fallback
    const svgCollage = generateSVGCollage(images, cityName, { width, height, backgroundColor, padding });
    
    return new NextResponse(svgCollage, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Error generating collage:', error);
    return new NextResponse('Error generating collage', { status: 500 });
  }
}

function generateSVGCollage(
  images: Array<{ id: string; name: string; image_url: string; hero_image?: string }>,
  cityName: string,
  options: { width: number; height: number; backgroundColor: string; padding: number }
): string {
  const { width, height, backgroundColor, padding } = options;
  const selectedImages = images.slice(0, 6);
  
  if (selectedImages.length === 0) {
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#grad)"/>
        <text x="${width/2}" y="${height/2}" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
          ${cityName}
        </text>
      </svg>
    `;
  }

  const cols = selectedImages.length >= 4 ? 3 : selectedImages.length >= 2 ? 2 : 1;
  const rows = Math.ceil(selectedImages.length / cols);
  
  const cellWidth = (width - padding * (cols + 1)) / cols;
  const cellHeight = (height - padding * (rows + 1)) / rows;

  const imageElements = selectedImages.map((attraction, index) => {
    const imageUrl = attraction.hero_image || attraction.image_url;
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    const x = padding + col * (cellWidth + padding);
    const y = padding + row * (cellHeight + padding);

    return `
      <image 
        href="${imageUrl}" 
        x="${x}" 
        y="${y}" 
        width="${cellWidth}" 
        height="${cellHeight}"
        preserveAspectRatio="xMidYMid slice"
        rx="8"
      />
    `;
  }).join('');

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
      ${imageElements}
      <rect x="20" y="${height - 80}" width="${width - 40}" height="60" fill="rgba(0,0,0,0.7)" rx="8"/>
      <text x="${width/2}" y="${height - 45}" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
        Discover ${cityName}
      </text>
    </svg>
  `;
}