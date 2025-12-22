/**
 * Image collage generator for city SEO images
 * Creates a collage of attraction images for cities without hero images
 */

export interface AttractionImage {
  id: string;
  name: string;
  image_url: string;
  hero_image?: string;
}

export interface CollageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpg' | 'png' | 'webp';
  backgroundColor?: string;
  padding?: number;
}

// Generate collage URL using a service (you can implement your own or use external service)
export function generateCollageUrl(
  images: AttractionImage[],
  cityName: string,
  options: CollageOptions = {}
): string {
  const {
    width = 1200,
    height = 630,
    quality = 85,
    format = 'jpg',
    backgroundColor = '#f3f4f6',
    padding = 10
  } = options;

  // Take up to 6 images
  const selectedImages = images.slice(0, 6);
  
  // If we have images, create collage
  if (selectedImages.length > 0) {
    // For now, return a placeholder URL that your backend can handle
    // You'll need to implement the actual collage generation
    const imageUrls = selectedImages
      .map(img => img.hero_image || img.image_url)
      .filter(Boolean)
      .slice(0, 6);
    
    if (imageUrls.length > 0) {
      // Create a URL that your backend can process to generate the collage
      const params = new URLSearchParams({
        images: imageUrls.join(','),
        city: cityName,
        width: width.toString(),
        height: height.toString(),
        quality: quality.toString(),
        format,
        bg: backgroundColor,
        padding: padding.toString()
      });
      
      return `/api/collage?${params.toString()}`;
    }
  }
  
  // Fallback to a default city image
  return `https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=${width}&h=${height}&q=${quality}`;
}

// Generate collage using canvas (client-side implementation)
export async function generateCollageCanvas(
  images: AttractionImage[],
  options: CollageOptions = {}
): Promise<string> {
  const {
    width = 1200,
    height = 630,
    backgroundColor = '#f3f4f6',
    padding = 10
  } = options;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Take up to 6 images
  const selectedImages = images.slice(0, 6);
  
  if (selectedImages.length === 0) {
    return canvas.toDataURL('image/jpeg', 0.85);
  }

  // Calculate grid layout
  const cols = selectedImages.length >= 4 ? 3 : selectedImages.length >= 2 ? 2 : 1;
  const rows = Math.ceil(selectedImages.length / cols);
  
  const cellWidth = (width - padding * (cols + 1)) / cols;
  const cellHeight = (height - padding * (rows + 1)) / rows;

  // Load and draw images
  const imagePromises = selectedImages.map(async (attraction, index) => {
    const imageUrl = attraction.hero_image || attraction.image_url;
    if (!imageUrl) return;

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      return new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          
          const x = padding + col * (cellWidth + padding);
          const y = padding + row * (cellHeight + padding);
          
          // Draw image with cover behavior
          const imgAspect = img.width / img.height;
          const cellAspect = cellWidth / cellHeight;
          
          let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
          
          if (imgAspect > cellAspect) {
            // Image is wider than cell
            drawHeight = cellHeight;
            drawWidth = drawHeight * imgAspect;
            offsetX = (cellWidth - drawWidth) / 2;
          } else {
            // Image is taller than cell
            drawWidth = cellWidth;
            drawHeight = drawWidth / imgAspect;
            offsetY = (cellHeight - drawHeight) / 2;
          }
          
          ctx.drawImage(img, x + offsetX, y + offsetY, drawWidth, drawHeight);
          resolve();
        };
        
        img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
        img.src = imageUrl;
      });
    } catch (error) {
      console.warn(`Failed to load image for ${attraction.name}:`, error);
    }
  });

  // Wait for all images to load
  await Promise.allSettled(imagePromises);

  return canvas.toDataURL('image/jpeg', 0.85);
}

// Server-side collage generation (for API route)
export function generateCollageHTML(
  images: AttractionImage[],
  cityName: string,
  options: CollageOptions = {}
): string {
  const {
    width = 1200,
    height = 630,
    backgroundColor = '#f3f4f6',
    padding = 10
  } = options;

  const selectedImages = images.slice(0, 6);
  
  if (selectedImages.length === 0) {
    return `
      <div style="
        width: ${width}px;
        height: ${height}px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: Arial, sans-serif;
        font-size: 48px;
        font-weight: bold;
        text-align: center;
      ">
        ${cityName}
      </div>
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
      <div style="
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${cellWidth}px;
        height: ${cellHeight}px;
        background-image: url('${imageUrl}');
        background-size: cover;
        background-position: center;
        border-radius: 8px;
      "></div>
    `;
  }).join('');

  return `
    <div style="
      position: relative;
      width: ${width}px;
      height: ${height}px;
      background-color: ${backgroundColor};
    ">
      ${imageElements}
      <div style="
        position: absolute;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-family: Arial, sans-serif;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
      ">
        Discover ${cityName}
      </div>
    </div>
  `;
}

// Utility to get attraction images for a city
export async function getCityAttractionImages(citySlug: string): Promise<AttractionImage[]> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    const response = await fetch(`${API_BASE_URL}/cities/${citySlug}/attractions?limit=6&with_images=true`);
    
    if (!response.ok) {
      console.warn(`Failed to fetch attractions for ${citySlug}`);
      return [];
    }
    
    const data = await response.json();
    const attractions = Array.isArray(data) ? data : data.items || data.data || [];
    
    return attractions
      .filter((attraction: any) => attraction.hero_image || attraction.image_url)
      .slice(0, 6)
      .map((attraction: any) => ({
        id: attraction.id || attraction.slug,
        name: attraction.name,
        image_url: attraction.image_url,
        hero_image: attraction.hero_image,
      }));
  } catch (error) {
    console.error(`Error fetching attraction images for ${citySlug}:`, error);
    return [];
  }
}