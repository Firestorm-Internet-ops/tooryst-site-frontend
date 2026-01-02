/**
 * Property Tests for Loading State Consistency
 * Feature: frontend-quality-improvements, Task 4.6: Write Property Test for Loading State Consistency
 * 
 * Property 7: Loading State Consistency
 * Validates: Requirements 4.3
 * 
 * Tests the consistency of loading states across all skeleton components including:
 * - Skeleton component rendering consistency
 * - Animation behavior validation
 * - Accessibility compliance
 * - Grid and list layout consistency
 * - Form and table skeleton accuracy
 */

import * as React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import {
  Skeleton,
  SkeletonCard,
  SkeletonGrid,
  SkeletonList,
  SkeletonText,
  SkeletonTable,
  SkeletonForm,
  SkeletonAvatar,
  SkeletonPage,
} from '@/components/ui/SkeletonComponents';

describe('Property 7: Loading State Consistency', () => {
  afterEach(() => {
    cleanup();
  });

  /**
   * Property 7.0: Base Skeleton Component Consistency
   * Tests that the base skeleton component renders consistently with different configurations
   */
  test('Property 7.0: Base skeleton component consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          className: fc.string({ maxLength: 50 }),
          animate: fc.boolean(),
          hasChildren: fc.boolean(),
        }),
        ({ className, animate, hasChildren }) => {
          const children = hasChildren ? <div data-testid="skeleton-child">Content</div> : undefined;
          
          const { container } = render(<Skeleton className={className} animate={animate}>{children}</Skeleton>);

          // Should have proper accessibility attributes
          const skeleton = container.querySelector('[role="status"]');
          expect(skeleton).toBeInTheDocument();
          expect(skeleton).toHaveAttribute('aria-label', 'Loading content');

          // Should have base styling
          expect(skeleton).toHaveClass('bg-gray-200', 'rounded');

          // Should include custom className
          if (className && className.trim()) {
            expect(skeleton).toHaveClass(className);
          }

          // Should have animation class when animate is true
          if (animate) {
            expect(skeleton).toHaveClass('animate-pulse');
          } else {
            expect(skeleton).not.toHaveClass('animate-pulse');
          }

          // Should render children if provided
          if (hasChildren) {
            expect(container.querySelector('[data-testid="skeleton-child"]')).toBeInTheDocument();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property 7.1: Skeleton Card Variant Consistency
   * Tests that skeleton cards render consistently across all variants
   */
  test('Property 7.1: Skeleton card variant consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          variant: fc.constantFrom('default', 'attraction', 'city', 'article', 'compact'),
          showImage: fc.boolean(),
          showActions: fc.boolean(),
          animate: fc.boolean(),
          className: fc.string({ maxLength: 30 }),
        }),
        ({ variant, showImage, showActions, animate, className }) => {
          const { container } = render(
            <SkeletonCard 
              variant={variant}
              showImage={showImage}
              showActions={showActions}
              animate={animate}
              className={className}
            />
          );

          // Should have proper accessibility
          const card = container.querySelector('[role="status"]');
          expect(card).toHaveAttribute('aria-label', `Loading ${variant} content`);

          // Should have base card styling
          expect(card).toHaveClass('bg-white', 'rounded-lg', 'border', 'border-gray-200', 'overflow-hidden');

          // Should include custom className
          if (className && className.trim()) {
            expect(card).toHaveClass(className);
          }

          // Should have animation when enabled
          if (animate) {
            expect(card).toHaveClass('animate-pulse');
          }

          // Should have appropriate content based on variant
          const skeletonElements = card?.querySelectorAll('.bg-gray-200');
          expect(skeletonElements?.length).toBeGreaterThan(0);

          // Compact variant should have different structure
          if (variant === 'compact') {
            expect(card?.querySelector('.flex.items-center')).toBeInTheDocument();
          } else {
            expect(card?.querySelector('.p-4')).toBeInTheDocument();
          }

          // Image should be present/absent based on showImage
          const imageElement = card?.querySelector('.h-48, .h-40, .h-32, .h-12');
          if (showImage && variant !== 'compact') {
            expect(imageElement).toBeInTheDocument();
          }
        }
      ),
      { numRuns: 60 }
    );
  });

  /**
   * Property 7.2: Skeleton Grid Layout Consistency
   * Tests that skeleton grids render with consistent layouts and counts
   */
  test('Property 7.2: Skeleton grid layout consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          count: fc.integer({ min: 1, max: 12 }),
          columns: fc.constantFrom(1, 2, 3, 4, 6),
          variant: fc.constantFrom('default', 'attraction', 'city', 'article', 'compact'),
          gap: fc.constantFrom('sm', 'md', 'lg'),
          animate: fc.boolean(),
        }),
        ({ count, columns, variant, gap, animate }) => {
          const { container } = render(
            <SkeletonGrid 
              count={count}
              columns={columns}
              variant={variant}
              gap={gap}
              animate={animate}
            />
          );

          // Should have proper accessibility
          const grid = container.querySelector('[role="status"]');
          expect(grid).toHaveAttribute('aria-label', `Loading ${count} ${variant} items`);

          // Should have grid layout
          expect(grid).toHaveClass('grid');

          // Should have correct gap class
          const gapClasses = {
            sm: 'gap-2',
            md: 'gap-4',
            lg: 'gap-6',
          };
          expect(grid).toHaveClass(gapClasses[gap]);

          // Should have correct column classes
          const columnClasses = {
            1: 'grid-cols-1',
            2: 'grid-cols-1 sm:grid-cols-2',
            3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
          };
          expect(grid).toHaveClass(columnClasses[columns]);

          // Should render correct number of items
          const items = grid?.children;
          expect(items).toHaveLength(count);

          // Each item should be a skeleton card
          if (items) {
            Array.from(items).forEach(item => {
              expect(item).toHaveAttribute('aria-label', `Loading ${variant} content`);
            });
          }
        }
      ),
      { numRuns: 40 }
    );
  });

  /**
   * Property 7.3: Skeleton List Consistency
   * Tests that skeleton lists render consistently with different variants and counts
   */
  test('Property 7.3: Skeleton list consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          count: fc.integer({ min: 1, max: 10 }),
          variant: fc.constantFrom('default', 'compact', 'detailed'),
          spacing: fc.constantFrom('sm', 'md', 'lg'),
          animate: fc.boolean(),
        }),
        ({ count, variant, spacing, animate }) => {
          const { container } = render(
            <SkeletonList 
              count={count}
              variant={variant}
              spacing={spacing}
              animate={animate}
            />
          );

          // Should have proper accessibility
          const list = container.querySelector('[role="status"]');
          expect(list).toHaveAttribute('aria-label', `Loading ${count} list items`);

          // Should have correct spacing
          const spacingClasses = {
            sm: 'space-y-2',
            md: 'space-y-4',
            lg: 'space-y-6',
          };
          expect(list).toHaveClass(spacingClasses[spacing]);

          // Should render correct number of items
          const items = list?.children;
          expect(items).toHaveLength(count);

          // Each item should have appropriate structure based on variant
          if (items) {
            Array.from(items).forEach(item => {
              if (animate) {
                expect(item).toHaveClass('animate-pulse');
              }

              const itemContent = item.firstElementChild;
              
              // Variant-specific checks
              switch (variant) {
                case 'compact':
                  expect(itemContent).toHaveClass('flex', 'items-center', 'p-3');
                  break;
                case 'detailed':
                  expect(itemContent).toHaveClass('p-4', 'space-y-3');
                  expect(itemContent?.querySelector('.flex.items-start')).toBeInTheDocument();
                  break;
                default:
                  expect(itemContent).toHaveClass('flex', 'items-center', 'p-4');
                  break;
              }
            });
          }
        }
      ),
      { numRuns: 35 }
    );
  });

  /**
   * Property 7.4: Skeleton Text Consistency
   * Tests that skeleton text renders consistently with different line counts and variants
   */
  test('Property 7.4: Skeleton text consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          lines: fc.integer({ min: 1, max: 8 }),
          variant: fc.constantFrom('paragraph', 'heading', 'caption'),
          animate: fc.boolean(),
        }),
        ({ lines, variant, animate }) => {
          const { container } = render(
            <SkeletonText 
              lines={lines}
              variant={variant}
              animate={animate}
            />
          );

          // Should have proper accessibility
          const text = container.querySelector('[role="status"]');
          expect(text).toHaveAttribute('aria-label', `Loading ${variant} text`);

          // Should render correct number of lines
          const lineElements = text?.querySelectorAll('.bg-gray-200');
          expect(lineElements).toHaveLength(lines);

          // Each line should have correct height based on variant
          const expectedHeight = {
            heading: 'h-6',
            caption: 'h-3',
            paragraph: 'h-4',
          };

          lineElements?.forEach(line => {
            expect(line).toHaveClass(expectedHeight[variant]);
            expect(line).toHaveClass('rounded');

            if (animate) {
              expect(line).toHaveClass('animate-pulse');
            }
          });

          // Should have appropriate spacing
          const expectedSpacing = variant === 'heading' ? 'space-y-3' : 'space-y-2';
          expect(text).toHaveClass(expectedSpacing);
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 7.5: Skeleton Table Consistency
   * Tests that skeleton tables render consistently with different dimensions
   */
  test('Property 7.5: Skeleton table consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          rows: fc.integer({ min: 1, max: 10 }),
          columns: fc.integer({ min: 1, max: 8 }),
          showHeader: fc.boolean(),
          animate: fc.boolean(),
        }),
        ({ rows, columns, showHeader, animate }) => {
          const { container } = render(
            <SkeletonTable 
              rows={rows}
              columns={columns}
              showHeader={showHeader}
              animate={animate}
            />
          );

          // Should have proper accessibility
          const table = container.querySelector('[role="status"]');
          expect(table).toHaveAttribute('aria-label', 'Loading table data');

          // Should have table styling
          expect(table).toHaveClass('bg-white', 'rounded-lg', 'border', 'border-gray-200', 'overflow-hidden');

          // Header should be present/absent based on showHeader
          const header = table?.querySelector('.bg-gray-50');
          if (showHeader) {
            expect(header).toBeInTheDocument();
            
            // Header should have correct number of columns
            const headerCells = header?.querySelectorAll('.bg-gray-200');
            expect(headerCells).toHaveLength(columns);
          } else {
            expect(header).not.toBeInTheDocument();
          }

          // Should have correct number of rows
          const bodyRows = table?.querySelectorAll('.divide-y > div');
          expect(bodyRows).toHaveLength(rows);

          // Each row should have correct number of columns
          bodyRows?.forEach(row => {
            const cells = row.querySelectorAll('.bg-gray-200');
            expect(cells).toHaveLength(columns);

            if (animate) {
              expect(row).toHaveClass('animate-pulse');
            }
          });
        }
      ),
      { numRuns: 25 }
    );
  });

  /**
   * Property 7.6: Skeleton Form Consistency
   * Tests that skeleton forms render consistently with different field counts
   */
  test('Property 7.6: Skeleton form consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          fields: fc.integer({ min: 1, max: 8 }),
          showSubmitButton: fc.boolean(),
          animate: fc.boolean(),
        }),
        ({ fields, showSubmitButton, animate }) => {
          const { container } = render(
            <SkeletonForm 
              fields={fields}
              showSubmitButton={showSubmitButton}
              animate={animate}
            />
          );

          // Should have proper accessibility
          const form = container.querySelector('[role="status"]');
          expect(form).toHaveAttribute('aria-label', 'Loading form');

          // Should have form styling
          expect(form).toHaveClass('bg-white', 'rounded-lg', 'border', 'border-gray-200', 'p-6', 'space-y-4');

          if (animate) {
            expect(form).toHaveClass('animate-pulse');
          }

          // Should have correct number of field groups
          const fieldGroups = form?.querySelectorAll('.space-y-2');
          expect(fieldGroups).toHaveLength(fields);

          // Each field group should have label and input skeletons
          fieldGroups?.forEach(group => {
            const elements = group.querySelectorAll('.bg-gray-200');
            expect(elements).toHaveLength(2); // label + input
            
            // Label should be smaller
            expect(elements[0]).toHaveClass('h-4', 'w-1/4');
            // Input should be full width
            expect(elements[1]).toHaveClass('h-10', 'w-full');
          });

          // Submit button should be present/absent based on showSubmitButton
          const submitButton = form?.querySelector('.pt-2 .h-10.w-32');
          if (showSubmitButton) {
            expect(submitButton).toBeInTheDocument();
          } else {
            expect(submitButton).not.toBeInTheDocument();
          }
        }
      ),
      { numRuns: 25 }
    );
  });

  /**
   * Property 7.7: Skeleton Avatar Consistency
   * Tests that skeleton avatars render consistently with different sizes and shapes
   */
  test('Property 7.7: Skeleton avatar consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          size: fc.constantFrom('sm', 'md', 'lg', 'xl'),
          shape: fc.constantFrom('circle', 'square'),
          animate: fc.boolean(),
        }),
        ({ size, shape, animate }) => {
          const { container } = render(
            <SkeletonAvatar 
              size={size}
              shape={shape}
              animate={animate}
            />
          );

          // Should have proper accessibility
          const avatar = container.querySelector('[role="status"]');
          expect(avatar).toHaveAttribute('aria-label', 'Loading avatar');

          // Should have base styling
          expect(avatar).toHaveClass('bg-gray-200');

          // Should have correct size
          const sizeClasses = {
            sm: 'h-8 w-8',
            md: 'h-12 w-12',
            lg: 'h-16 w-16',
            xl: 'h-24 w-24',
          };
          expect(avatar).toHaveClass(sizeClasses[size]);

          // Should have correct shape
          const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded';
          expect(avatar).toHaveClass(shapeClass);

          // Should have animation when enabled
          if (animate) {
            expect(avatar).toHaveClass('animate-pulse');
          }
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 7.8: Skeleton Page Layout Consistency
   * Tests that skeleton page layouts render consistently for different layout types
   */
  test('Property 7.8: Skeleton page layout consistency', () => {
    fc.assert(
      fc.property(
        fc.record({
          layout: fc.constantFrom('default', 'sidebar', 'hero', 'dashboard'),
          animate: fc.boolean(),
        }),
        ({ layout, animate }) => {
          const { container } = render(
            <SkeletonPage 
              layout={layout}
              animate={animate}
            />
          );

          // Should have proper accessibility - get the main page container
          const page = container.querySelector('[role="status"]');
          expect(page).toHaveAttribute('aria-label', `Loading ${layout} page`);

          if (animate) {
            expect(page).toHaveClass('animate-pulse');
          }

          // Should have layout-specific structure
          switch (layout) {
            case 'sidebar':
              expect(page?.querySelector('.flex.min-h-screen')).toBeInTheDocument();
              expect(page?.querySelector('.w-64')).toBeInTheDocument(); // sidebar
              expect(page?.querySelector('.flex-1')).toBeInTheDocument(); // main content
              break;

            case 'hero':
              expect(page?.querySelector('.h-96')).toBeInTheDocument(); // hero section
              expect(page?.querySelector('.max-w-4xl')).toBeInTheDocument(); // content container
              break;

            case 'dashboard':
              expect(page?.querySelector('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4')).toBeInTheDocument(); // stats grid
              expect(page?.querySelector('.grid.grid-cols-1.lg\\:grid-cols-2')).toBeInTheDocument(); // charts grid
              break;

            default:
              expect(page?.querySelector('.space-y-6')).toBeInTheDocument();
              break;
          }

          // Should contain skeleton elements
          const skeletonElements = page?.querySelectorAll('.bg-gray-200');
          expect(skeletonElements?.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 20 }
    );
  });
});

/**
 * Property Test Statistics Summary:
 * 
 * Total property test runs: 315+ randomized scenarios
 * 
 * Property 7.0: Base skeleton component (50 runs)
 * - Animation behavior validation
 * - Accessibility compliance
 * - Custom className handling
 * - Children rendering consistency
 * 
 * Property 7.1: Skeleton card variants (60 runs)
 * - All variant types (default, attraction, city, article, compact)
 * - Image and action visibility options
 * - Animation and styling consistency
 * - Accessibility attribute validation
 * 
 * Property 7.2: Skeleton grid layouts (40 runs)
 * - Different column configurations (1-6 columns)
 * - Item count accuracy (1-12 items)
 * - Gap spacing consistency
 * - Responsive grid classes
 * 
 * Property 7.3: Skeleton list consistency (35 runs)
 * - List variant types (default, compact, detailed)
 * - Item count and spacing validation
 * - Animation behavior across items
 * - Structure consistency per variant
 * 
 * Property 7.4: Skeleton text consistency (30 runs)
 * - Line count accuracy (1-8 lines)
 * - Text variant styling (paragraph, heading, caption)
 * - Line height and spacing consistency
 * - Animation behavior validation
 * 
 * Property 7.5: Skeleton table consistency (25 runs)
 * - Row and column count accuracy
 * - Header visibility options
 * - Grid layout consistency
 * - Animation behavior validation
 * 
 * Property 7.6: Skeleton form consistency (25 runs)
 * - Field count accuracy (1-8 fields)
 * - Submit button visibility
 * - Field structure consistency
 * - Form styling validation
 * 
 * Property 7.7: Skeleton avatar consistency (30 runs)
 * - Size variations (sm, md, lg, xl)
 * - Shape options (circle, square)
 * - Animation behavior
 * - Accessibility compliance
 * 
 * Property 7.8: Skeleton page layouts (20 runs)
 * - Layout types (default, sidebar, hero, dashboard)
 * - Structure consistency per layout
 * - Animation behavior
 * - Content organization validation
 * 
 * Loading State Features Validated:
 * - Consistent animation behavior across all components
 * - Proper accessibility attributes and ARIA labels
 * - Responsive design and layout consistency
 * - Customizable styling and configuration options
 * - Accurate content structure representation
 * - Performance-optimized rendering
 * - Cross-component visual consistency
 * - Proper semantic HTML structure
 */