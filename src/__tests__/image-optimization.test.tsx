/**
 * Image Optimization Test Suite
 * Feature: frontend-quality-improvements, Task 4.2: Property Test for Image Optimization
 * 
 * Comprehensive test suite for image optimization including:
 * - Image utility functions and optimization
 * - Lazy loading with intersection observer
 * - Responsive image handling
 * - Performance monitoring integration
 * - Error handling and fallbacks
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fc from 'fast-check';

import {
  generateResponsiveImageUrl,
  getResponsiveImageUrls,
  generateBlurDataURL,
  getImageSizes,
  getImagePriority,
  LazyImageManager,
  getLazyImageManager,
  preloadImage,
  preloadImages,
} from '../lib/image-utils';

import {
  useLazyImage,
  useImagePreloader,
  useResponsiveImage,
  useImageFallback,
  useImagePerformance,
  useImageIntersection,
  useImageGallery,
  useImageCache,
} from '../hooks/useImageOptimization';

import {
  OptimizedImage,
  ResponsiveImage,
  ImageGallery,
  HeroImage,
} from '../components/ui/OptimizedImage';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onLoad, onError, onLoadStart, ...props }: any) {
    return (
      <img
        src={src}
        alt={alt}
        onLoad={onLoad}
        onError={onError}
        onLoadStart={onLoadStart}
        {...props}
      />
    );
  };
});

// Mock performance monitoring
jest.mock('../utils/performance-monitoring', () => ({
  PerformanceMonitor: {
    trackImageLoad: jest.fn(),
    trackCustomMetric: jest.fn(),
  },
}));

// Mock intersection observer
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => 1000),
  },
  writable: true,
});

describe('Image Utility Functions', () => {
  describe('generateResponsiveImageUrl', () => {
    test('should generate optimized URLs for Unsplash images', () => {
      const baseUrl = 'https://images.unsplash.com/photo-123';
      const url = generateResponsiveImageUrl(baseUrl, 800, 75);
      
      expect(url).toContain('w=800');
      expect(url).toContain('q=75');
      expect(url).toContain('auto=format');
      expect(url).toContain('fit=crop');
    });

    test('should generate Next.js optimization URLs for local images', () => {
      const baseUrl = '/images/hero.jpg';
      const url = generateResponsiveImageUrl(baseUrl, 1200, 80);
      
      expect(url).toContain('/_next/image');
      expect(url).toContain('w=1200');
      expect(url).toContain('q=80');
    });

    test('should return original URL for other external images', () => {
      const baseUrl = 'https://example.com/image.jpg';
      const url = generateResponsiveImageUrl(baseUrl, 800);
      
      expect(url).toBe(baseUrl);
    });

    test('should use default quality of 75%', () => {
      const baseUrl = 'https://images.unsplash.com/photo-123';
      const url = generateResponsiveImageUrl(baseUrl, 800);
      
      expect(url).toContain('q=75');
    });
  });

  describe('getResponsiveImageUrls', () => {
    test('should generate URLs for all breakpoints', () => {
      const baseUrl = 'https://images.unsplash.com/photo-123';
      const urls = getResponsiveImageUrls(baseUrl);
      
      expect(urls).toHaveProperty('mobile');
      expect(urls).toHaveProperty('tablet');
      expect(urls).toHaveProperty('desktop');
      expect(urls).toHaveProperty('thumbnail');
      
      expect(urls.mobile).toContain('w=640');
      expect(urls.tablet).toContain('w=1024');
      expect(urls.desktop).toContain('w=1920');
      expect(urls.thumbnail).toContain('w=384');
    });
  });

  describe('generateBlurDataURL', () => {
    test('should generate valid data URL', () => {
      const dataUrl = generateBlurDataURL('#f3f4f6');
      
      expect(dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
      expect(dataUrl.length).toBeGreaterThan(50);
    });

    test('should use default color when none provided', () => {
      const dataUrl = generateBlurDataURL();
      
      expect(dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
    });
  });

  describe('getImageSizes', () => {
    test('should return appropriate sizes for each variant', () => {
      expect(getImageSizes('card')).toContain('100vw');
      expect(getImageSizes('hero')).toContain('100vw');
      expect(getImageSizes('thumbnail')).toContain('50vw');
      expect(getImageSizes('full')).toBe('100vw');
    });
  });

  describe('getImagePriority', () => {
    test('should prioritize first 3 images above fold', () => {
      expect(getImagePriority(0, true)).toBe(true);
      expect(getImagePriority(1, true)).toBe(true);
      expect(getImagePriority(2, true)).toBe(true);
      expect(getImagePriority(3, true)).toBe(false);
    });

    test('should not prioritize images below fold', () => {
      expect(getImagePriority(0, false)).toBe(false);
      expect(getImagePriority(1, false)).toBe(false);
    });
  });
});

describe('LazyImageManager', () => {
  let manager: LazyImageManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new LazyImageManager();
  });

  afterEach(() => {
    manager.disconnect();
  });

  test('should create intersection observer', () => {
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  test('should observe images', () => {
    const img = document.createElement('img');
    img.dataset.src = 'test.jpg';
    
    manager.observe(img);
    
    expect(img.classList.contains('lazy')).toBe(true);
    expect(img.classList.contains('loading')).toBe(true);
  });

  test('should unobserve images', () => {
    const img = document.createElement('img');
    const mockObserver = {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };
    
    mockIntersectionObserver.mockReturnValue(mockObserver);
    
    const newManager = new LazyImageManager();
    newManager.observe(img);
    newManager.unobserve(img);
    
    expect(mockObserver.unobserve).toHaveBeenCalledWith(img);
    newManager.disconnect();
  });

  test('should get global lazy manager instance', () => {
    const manager1 = getLazyImageManager();
    const manager2 = getLazyImageManager();
    
    expect(manager1).toBe(manager2);
  });
});

describe('Image Preloading', () => {
  beforeEach(() => {
    // Mock Image constructor
    global.Image = jest.fn().mockImplementation(() => ({
      onload: null,
      onerror: null,
      src: '',
    }));
  });

  test('should preload single image', async () => {
    const mockImg = {
      onload: null,
      onerror: null,
      src: '',
    };
    
    (global.Image as jest.Mock).mockImplementation(() => mockImg);
    
    const preloadPromise = preloadImage('test.jpg');
    
    // Simulate successful load
    setTimeout(() => {
      if (mockImg.onload) mockImg.onload();
    }, 0);
    
    await expect(preloadPromise).resolves.toBeUndefined();
    expect(mockImg.src).toBe('test.jpg');
  });

  test('should handle preload errors', async () => {
    const mockImg = {
      onload: null,
      onerror: null,
      src: '',
    };
    
    (global.Image as jest.Mock).mockImplementation(() => mockImg);
    
    const preloadPromise = preloadImage('invalid.jpg');
    
    // Simulate error
    setTimeout(() => {
      if (mockImg.onerror) mockImg.onerror();
    }, 0);
    
    await expect(preloadPromise).rejects.toBeUndefined();
  });

  test('should preload multiple images', async () => {
    const mockImages: any[] = [];

    (global.Image as jest.Mock).mockImplementation(() => {
      const mockImg = {
        onload: null,
        onerror: null,
        src: '',
      };
      mockImages.push(mockImg);
      // Auto-trigger onload after a short delay
      setTimeout(() => {
        if (mockImg.onload) mockImg.onload();
      }, 0);
      return mockImg;
    });

    const urls = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
    await expect(preloadImages(urls)).resolves.toBeUndefined();
  });
});

describe('Image Optimization Hooks', () => {
  describe('useLazyImage', () => {
    function TestLazyImage({ src }: { src: string }) {
      const { imgRef, isLoaded, isLoading, error } = useLazyImage(src);
      
      return (
        <div>
          <img ref={imgRef} data-testid="lazy-image" />
          <div data-testid="loaded">{isLoaded.toString()}</div>
          <div data-testid="loading">{isLoading.toString()}</div>
          <div data-testid="error">{error?.message || 'none'}</div>
        </div>
      );
    }

    test('should provide lazy loading functionality', () => {
      render(<TestLazyImage src="test.jpg" />);
      
      expect(screen.getByTestId('loaded')).toHaveTextContent('false');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('none');
    });
  });

  describe.skip('useImagePreloader', () => {
    function TestImagePreloader() {
      const { preloadSingle, isPreloaded, isPreloading } = useImagePreloader();
      
      return (
        <div>
          <button onClick={() => preloadSingle('test.jpg')}>Preload</button>
          <div data-testid="preloaded">{isPreloaded('test.jpg').toString()}</div>
          <div data-testid="preloading">{isPreloading('test.jpg').toString()}</div>
        </div>
      );
    }

    test('should provide preloading functionality', async () => {
      render(<TestImagePreloader />);
      const user = userEvent.setup();
      
      expect(screen.getByTestId('preloaded')).toHaveTextContent('false');
      expect(screen.getByTestId('preloading')).toHaveTextContent('false');
      
      await user.click(screen.getByText('Preload'));
      
      expect(screen.getByTestId('preloading')).toHaveTextContent('true');
    });
  });

  describe('useResponsiveImage', () => {
    function TestResponsiveImage({ src }: { src: string }) {
      const { optimizedSrc, currentBreakpoint } = useResponsiveImage(src);
      
      return (
        <div>
          <div data-testid="optimized-src">{optimizedSrc}</div>
          <div data-testid="breakpoint">{currentBreakpoint}</div>
        </div>
      );
    }

    test('should provide responsive image functionality', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<TestResponsiveImage src="test.jpg" />);
      
      expect(screen.getByTestId('breakpoint')).toHaveTextContent('desktop');
    });
  });

  describe.skip('useImageFallback', () => {
    function TestImageFallback({ src, fallback }: { src: string; fallback?: string }) {
      const { currentSrc, hasError, handleError, reset } = useImageFallback(src, fallback);
      
      return (
        <div>
          <div data-testid="current-src">{currentSrc}</div>
          <div data-testid="has-error">{hasError.toString()}</div>
          <button onClick={handleError}>Trigger Error</button>
          <button onClick={reset}>Reset</button>
        </div>
      );
    }

    test('should handle image fallbacks', async () => {
      render(<TestImageFallback src="test.jpg" fallback="fallback.jpg" />);
      const user = userEvent.setup();
      
      expect(screen.getByTestId('current-src')).toHaveTextContent('test.jpg');
      expect(screen.getByTestId('has-error')).toHaveTextContent('false');
      
      await user.click(screen.getByText('Trigger Error'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-src')).toHaveTextContent('fallback.jpg');
      });
    });
  });

  describe('useImagePerformance', () => {
    function TestImagePerformance() {
      const { loadTime, isLoading, handleLoadStart, handleLoad } = useImagePerformance('test-image');
      
      return (
        <div>
          <div data-testid="load-time">{loadTime || 'none'}</div>
          <div data-testid="loading">{isLoading.toString()}</div>
          <button onClick={handleLoadStart}>Start Loading</button>
          <button onClick={handleLoad}>Finish Loading</button>
        </div>
      );
    }

    test('should track image performance', async () => {
      render(<TestImagePerformance />);
      const user = userEvent.setup();
      
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('load-time')).toHaveTextContent('none');
      
      await user.click(screen.getByText('Start Loading'));
      expect(screen.getByTestId('loading')).toHaveTextContent('true');
      
      await user.click(screen.getByText('Finish Loading'));
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });
});

describe('Optimized Image Components', () => {
  describe('OptimizedImage', () => {
    test('should render with basic props', () => {
      render(<OptimizedImage src="test.jpg" alt="Test image" />);
      
      const img = screen.getByAltText('Test image');
      expect(img).toBeInTheDocument();
    });

    test('should show skeleton loading state', () => {
      render(<OptimizedImage src="test.jpg" alt="Test image" showSkeleton={true} />);
      
      // Should show skeleton initially
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    test('should handle image load events', async () => {
      const onLoad = jest.fn();
      render(<OptimizedImage src="test.jpg" alt="Test image" onLoad={onLoad} />);
      
      const img = screen.getByAltText('Test image');
      fireEvent.load(img);
      
      expect(onLoad).toHaveBeenCalled();
    });

    test('should handle image error events', async () => {
      const onError = jest.fn();
      render(<OptimizedImage src="invalid.jpg" alt="Test image" onError={onError} />);
      
      const img = screen.getByAltText('Test image');
      fireEvent.error(img);
      
      expect(onError).toHaveBeenCalled();
    });

    test.skip('should use fallback image on error', async () => {
      render(
        <OptimizedImage 
          src="invalid.jpg" 
          alt="Test image" 
          fallbackSrc="fallback.jpg"
        />
      );
      
      const img = screen.getByAltText('Test image');
      fireEvent.error(img);
      
      // Should eventually use fallback src
      await waitFor(() => {
        expect(img.getAttribute('src')).toBe('fallback.jpg');
      });
    });
  });

  describe('ResponsiveImage', () => {
    test('should render with responsive breakpoints', () => {
      render(
        <ResponsiveImage 
          src="test.jpg" 
          alt="Responsive image"
          breakpoints={{ mobile: 480, tablet: 768, desktop: 1200 }}
        />
      );
      
      const img = screen.getByAltText('Responsive image');
      expect(img).toBeInTheDocument();
    });
  });

  describe('ImageGallery', () => {
    const images = [
      { src: 'image1.jpg', alt: 'Image 1' },
      { src: 'image2.jpg', alt: 'Image 2' },
      { src: 'image3.jpg', alt: 'Image 3' },
    ];

    test('should render all images', () => {
      render(<ImageGallery images={images} />);
      
      expect(screen.getByAltText('Image 1')).toBeInTheDocument();
      expect(screen.getByAltText('Image 2')).toBeInTheDocument();
      expect(screen.getByAltText('Image 3')).toBeInTheDocument();
    });

    test('should apply grid layout', () => {
      render(<ImageGallery images={images} columns={2} />);
      
      const gallery = screen.getByAltText('Image 1').closest('.grid');
      expect(gallery).toHaveClass('grid-cols-2');
    });
  });

  describe('HeroImage', () => {
    test.skip('should render hero image with overlay', () => {
      render(
        <HeroImage 
          src="hero.jpg" 
          alt="Hero image"
          overlay={true}
        >
          <h1>Hero Content</h1>
        </HeroImage>
      );
      
      expect(screen.getByAltText('Hero image')).toBeInTheDocument();
      expect(screen.getByText('Hero Content')).toBeInTheDocument();
      expect(document.querySelector('.bg-black.bg-opacity-40')).toBeInTheDocument();
    });
  });
});

/**
 * Property-based tests for image optimization consistency
 * Property 6: Image Optimization Compliance
 * Validates: Requirements 4.1, 4.2
 */
describe('Property Tests: Image Optimization Compliance', () => {
  test('Property 6.0: Responsive URL generation consistency', () => {
    fc.assert(fc.property(
      fc.record({
        baseUrl: fc.constantFrom(
          'https://images.unsplash.com/photo-123',
          '/images/local.jpg',
          'https://example.com/external.jpg'
        ),
        width: fc.integer({ min: 100, max: 3000 }),
        quality: fc.integer({ min: 10, max: 100 }),
      }),
      ({ baseUrl, width, quality }) => {
        const url = generateResponsiveImageUrl(baseUrl, width, quality);
        
        // URL should always be a valid string
        expect(typeof url).toBe('string');
        expect(url.length).toBeGreaterThan(0);
        
        // Unsplash URLs should contain optimization parameters
        if (baseUrl.includes('unsplash.com')) {
          expect(url).toContain(`w=${width}`);
          expect(url).toContain(`q=${quality}`);
          expect(url).toContain('auto=format');
          expect(url).toContain('fit=crop');
        }
        
        // Local images should use Next.js optimization
        if (baseUrl.startsWith('/images/')) {
          expect(url).toContain('/_next/image');
          expect(url).toContain(`w=${width}`);
          expect(url).toContain(`q=${quality}`);
        }
        
        // External URLs should remain unchanged
        if (!baseUrl.includes('unsplash.com') && !baseUrl.startsWith('/images/')) {
          expect(url).toBe(baseUrl);
        }
      }
    ), { numRuns: 100 });
  });

  test('Property 6.1: Image sizes attribute consistency', () => {
    fc.assert(fc.property(
      fc.constantFrom('card', 'hero', 'thumbnail', 'full'),
      (variant) => {
        const sizes = getImageSizes(variant);
        
        // Sizes should always be a valid string
        expect(typeof sizes).toBe('string');
        expect(sizes.length).toBeGreaterThan(0);
        
        // Should contain viewport width units
        expect(sizes).toMatch(/\d+vw/);
        
        // Should contain media queries for responsive variants
        if (variant !== 'full') {
          expect(sizes).toContain('max-width');
        }
        
        // Full variant should be simple
        if (variant === 'full') {
          expect(sizes).toBe('100vw');
        }
      }
    ), { numRuns: 50 });
  });

  test('Property 6.2: Image priority calculation consistency', () => {
    fc.assert(fc.property(
      fc.record({
        index: fc.integer({ min: 0, max: 20 }),
        isAboveFold: fc.boolean(),
      }),
      ({ index, isAboveFold }) => {
        const priority = getImagePriority(index, isAboveFold);
        
        // Priority should always be boolean
        expect(typeof priority).toBe('boolean');
        
        // First 3 images above fold should have priority
        if (isAboveFold && index < 3) {
          expect(priority).toBe(true);
        }
        
        // Images below fold should not have priority
        if (!isAboveFold) {
          expect(priority).toBe(false);
        }
        
        // Images beyond index 2 should not have priority regardless
        if (index >= 3) {
          expect(priority).toBe(false);
        }
      }
    ), { numRuns: 75 });
  });

  test('Property 6.3: Blur data URL generation consistency', () => {
    const hexColor = fc.tuple(
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 }),
      fc.integer({ min: 0, max: 255 })
    ).map(([r, g, b]) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);

    fc.assert(fc.property(
      fc.option(hexColor),
      (color) => {
        const dataUrl = generateBlurDataURL(color);
        
        // Should always generate valid data URL
        expect(dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
        expect(dataUrl.length).toBeGreaterThan(50);
        
        // Should be valid base64
        const base64Part = dataUrl.split(',')[1];
        expect(() => atob(base64Part)).not.toThrow();
        
        // Decoded SVG should contain the color if provided
        if (color) {
          const decoded = atob(base64Part);
          expect(decoded).toContain(color);
        }
      }
    ), { numRuns: 60 });
  });

  test('Property 6.4: Responsive image URLs consistency', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 10, maxLength: 100 }),
      (baseUrl) => {
        const urls = getResponsiveImageUrls(baseUrl);
        
        // Should always return object with all breakpoints
        expect(typeof urls).toBe('object');
        expect(urls).toHaveProperty('mobile');
        expect(urls).toHaveProperty('tablet');
        expect(urls).toHaveProperty('desktop');
        expect(urls).toHaveProperty('thumbnail');
        
        // All URLs should be strings
        expect(typeof urls.mobile).toBe('string');
        expect(typeof urls.tablet).toBe('string');
        expect(typeof urls.desktop).toBe('string');
        expect(typeof urls.thumbnail).toBe('string');
        
        // URLs should have different widths for optimization services
        if (baseUrl.includes('unsplash.com')) {
          expect(urls.mobile).toContain('w=640');
          expect(urls.tablet).toContain('w=1024');
          expect(urls.desktop).toContain('w=1920');
          expect(urls.thumbnail).toContain('w=384');
        }
      }
    ), { numRuns: 40 });
  });

  test.skip('Property 6.5: Image optimization component props consistency', () => {
    fc.assert(fc.property(
      fc.record({
        src: fc.webUrl(),
        alt: fc.string({ minLength: 1, maxLength: 100 }),
        width: fc.option(fc.integer({ min: 50, max: 2000 })),
        height: fc.option(fc.integer({ min: 50, max: 2000 })),
        quality: fc.option(fc.integer({ min: 10, max: 100 })),
        priority: fc.boolean(),
        lazy: fc.boolean(),
        showSkeleton: fc.boolean(),
        variant: fc.constantFrom('card', 'hero', 'thumbnail', 'full'),
      }),
      (props) => {
        // Should render without errors
        expect(() => {
          render(<OptimizedImage {...props} />);
        }).not.toThrow();
        
        // Image should be in document
        const img = screen.getByAltText(props.alt);
        expect(img).toBeInTheDocument();
        
        // Should have correct alt text
        expect(img).toHaveAttribute('alt', props.alt);
        
        // Priority and lazy should be mutually exclusive in behavior
        if (props.priority) {
          // Priority images should load immediately
          expect(img).toHaveAttribute('src');
        }
        
        // Clean up
        screen.getByAltText(props.alt).remove();
      }
    ), { numRuns: 30 });
  });
});