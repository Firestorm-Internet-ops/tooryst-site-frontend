/**
 * CDN Image URL Optimization
 * Generates optimized image URLs for different CDN services
 *
 * Supports:
 * - Next.js Image Optimization API
 * - Cloudinary
 * - ImageKit
 * - AWS CloudFront
 * - Custom CDN
 */

export interface ImageOptimizationOptions {
  width?: number;
  quality?: number; // 1-100
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * CDN providers configuration
 */
const CDN_CONFIG = {
  // Set your CDN provider here
  provider: process.env.NEXT_PUBLIC_CDN_PROVIDER || 'nextjs', // 'nextjs' | 'cloudinary' | 'imagekit' | 'cloudfront'

  // CDN base URLs
  cloudinary: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`
    : '',
  imagekit: process.env.NEXT_PUBLIC_IMAGEKIT_ID
    ? `https://ik.imagekit.io/${process.env.NEXT_PUBLIC_IMAGEKIT_ID}`
    : '',
  cloudfront: process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN
    ? `https://${process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN}`
    : '',
};

/**
 * Generate optimized image URL based on CDN provider
 */
export function getCDNImageURL(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  // Return original URL if empty
  if (!src) return src;

  const {
    width,
    quality = 75,
    format = 'auto',
    fit = 'cover'
  } = options;

  // Handle external URLs that are already optimized
  if (src.startsWith('http') && !src.includes('localhost')) {
    // If it's already from our CDN, return as-is
    if (
      src.includes('res.cloudinary.com') ||
      src.includes('ik.imagekit.io') ||
      src.includes(CDN_CONFIG.cloudfront)
    ) {
      return src;
    }
  }

  switch (CDN_CONFIG.provider) {
    case 'cloudinary':
      return getCloudinaryURL(src, options);

    case 'imagekit':
      return getImageKitURL(src, options);

    case 'cloudfront':
      return getCloudFrontURL(src, options);

    case 'nextjs':
    default:
      return getNextJSImageURL(src, options);
  }
}

/**
 * Next.js Image Optimization API
 */
function getNextJSImageURL(
  src: string,
  options: ImageOptimizationOptions
): string {
  const { width, quality = 75 } = options;

  // For local images, use Next.js Image Optimization
  if (src.startsWith('/') || !src.startsWith('http')) {
    const params = new URLSearchParams();
    params.set('url', src);
    if (width) params.set('w', width.toString());
    params.set('q', quality.toString());

    return `/_next/image?${params.toString()}`;
  }

  // For external images, return as-is (Next.js will optimize via next/image component)
  return src;
}

/**
 * Cloudinary CDN URL
 */
function getCloudinaryURL(
  src: string,
  options: ImageOptimizationOptions
): string {
  if (!CDN_CONFIG.cloudinary) {
    return getNextJSImageURL(src, options);
  }

  const { width, quality = 75, format = 'auto', fit = 'cover' } = options;

  const transformations = [];

  // Format
  if (format === 'auto') {
    transformations.push('f_auto');
  } else {
    transformations.push(`f_${format}`);
  }

  // Quality
  transformations.push(`q_${quality}`);

  // Width
  if (width) {
    transformations.push(`w_${width}`);
  }

  // Fit mode
  const fitMap = {
    cover: 'fill',
    contain: 'fit',
    fill: 'fill',
    inside: 'limit',
    outside: 'mfit'
  };
  transformations.push(`c_${fitMap[fit]}`);

  // Extract image path (remove protocol and domain if present)
  let imagePath = src;
  if (src.startsWith('http')) {
    const url = new URL(src);
    imagePath = url.pathname;
  }

  return `${CDN_CONFIG.cloudinary}/${transformations.join(',')}${imagePath}`;
}

/**
 * ImageKit CDN URL
 */
function getImageKitURL(
  src: string,
  options: ImageOptimizationOptions
): string {
  if (!CDN_CONFIG.imagekit) {
    return getNextJSImageURL(src, options);
  }

  const { width, quality = 75, format = 'auto' } = options;

  const params = [];

  // Format
  if (format !== 'auto') {
    params.push(`f-${format}`);
  }

  // Quality
  params.push(`q-${quality}`);

  // Width
  if (width) {
    params.push(`w-${width}`);
  }

  // Auto optimization
  params.push('fo-auto');

  // Extract image path
  let imagePath = src;
  if (src.startsWith('http')) {
    const url = new URL(src);
    imagePath = url.pathname;
  }

  const transformation = params.length > 0 ? `/tr:${params.join(',')}` : '';
  return `${CDN_CONFIG.imagekit}${transformation}${imagePath}`;
}

/**
 * AWS CloudFront CDN URL
 */
function getCloudFrontURL(
  src: string,
  options: ImageOptimizationOptions
): string {
  if (!CDN_CONFIG.cloudfront) {
    return getNextJSImageURL(src, options);
  }

  const { width, quality = 75, format = 'auto' } = options;

  // CloudFront with Lambda@Edge for image optimization
  const params = new URLSearchParams();

  if (width) params.set('w', width.toString());
  params.set('q', quality.toString());
  if (format !== 'auto') params.set('f', format);

  // Extract image path
  let imagePath = src;
  if (src.startsWith('http')) {
    const url = new URL(src);
    imagePath = url.pathname;
  }

  const queryString = params.toString();
  return `${CDN_CONFIG.cloudfront}${imagePath}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Get responsive image srcset for different screen sizes
 */
export function getResponsiveImageSrcSet(
  src: string,
  quality: number = 75
): string {
  const sizes = [640, 750, 828, 1080, 1200, 1920];

  return sizes
    .map(width => `${getCDNImageURL(src, { width, quality })} ${width}w`)
    .join(', ');
}

/**
 * Get image sizes attribute for responsive images
 */
export function getImageSizes(variant: 'card' | 'hero' | 'thumbnail' | 'full' = 'card'): string {
  switch (variant) {
    case 'card':
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    case 'hero':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw';
    case 'thumbnail':
      return '(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px';
    case 'full':
      return '100vw';
    default:
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  }
}

/**
 * Check if URL is external
 */
export function isExternalURL(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Preload critical images
 */
export function preloadImage(src: string, options: ImageOptimizationOptions = {}): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = getCDNImageURL(src, options);

  if (options.format) {
    link.type = `image/${options.format}`;
  }

  document.head.appendChild(link);
}

/**
 * Preload multiple images
 */
export function preloadImages(images: Array<{ src: string; options?: ImageOptimizationOptions }>): void {
  images.forEach(({ src, options }) => preloadImage(src, options));
}
