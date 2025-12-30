/**
 * Testing utilities and setup for comprehensive test coverage
 */

import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactElement, ReactNode } from 'react';

// Mock data generators for consistent testing
export const mockAttraction = (overrides = {}) => ({
  id: 1,
  name: 'Test Attraction',
  description: 'A test attraction for testing purposes',
  rating: 4.5,
  reviewCount: 100,
  imageUrl: '/images/fallbacks/attraction-fallback.jpg',
  city: 'Test City',
  country: 'Test Country',
  latitude: 40.7128,
  longitude: -74.0060,
  slug: 'test-attraction',
  city_slug: 'test-city',
  ...overrides,
});

export const mockCity = (overrides = {}) => ({
  id: 1,
  name: 'Test City',
  country: 'Test Country',
  attraction_count: 10,
  imageUrl: '/images/fallbacks/city-fallback.jpg',
  latitude: 40.7128,
  longitude: -74.0060,
  slug: 'test-city',
  ...overrides,
});

export const mockReview = (overrides = {}) => ({
  id: 1,
  rating: 5,
  text: 'Great attraction!',
  authorName: 'Test User',
  authorPhotoUrl: '/images/fallbacks/user-avatar.jpg',
  relativeTimeDescription: '2 days ago',
  ...overrides,
});

// Create test query client with disabled retries and caching for faster tests
const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      staleTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

interface AllTheProvidersProps {
  children: ReactNode;
}

// Test providers wrapper that includes all necessary context providers
const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

// Custom render function that wraps components with test providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };

// Custom matchers and utilities
export const expectToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectToHaveAccessibleName = (element: HTMLElement, name: string) => {
  expect(element).toHaveAccessibleName(name);
};

// Mock intersection observer for lazy loading tests
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null
  });
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

// Mock window.matchMedia for responsive design tests
export const mockMatchMedia = (matches = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Mock ResizeObserver for component resize tests
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
  return mockResizeObserver;
};

// Utility to wait for async operations in tests
export const waitForLoadingToFinish = () => 
  new Promise(resolve => setTimeout(resolve, 0));

// Mock fetch for API testing
export const mockFetch = (response: any, ok = true) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(response),
    text: () => Promise.resolve(JSON.stringify(response)),
  });
};

// Clean up mocks after tests
export const cleanupMocks = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};