/**
 * Test to verify testing infrastructure is properly configured
 */

import { render, screen } from '../test-utils';
import { mockAttraction, mockCity, mockReview } from '../test-utils';

// Simple test component to verify React Testing Library setup
const TestComponent = ({ message }: { message: string }) => (
  <div data-testid="test-component">{message}</div>
);

describe('Testing Infrastructure', () => {
  it('should render components correctly', () => {
    render(<TestComponent message="Hello, Testing!" />);
    
    const element = screen.getByTestId('test-component');
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Hello, Testing!');
  });

  it('should provide mock data generators', () => {
    const attraction = mockAttraction();
    expect(attraction).toHaveProperty('id');
    expect(attraction).toHaveProperty('name');
    expect(attraction.name).toBe('Test Attraction');

    const city = mockCity();
    expect(city).toHaveProperty('id');
    expect(city).toHaveProperty('name');
    expect(city.name).toBe('Test City');

    const review = mockReview();
    expect(review).toHaveProperty('id');
    expect(review).toHaveProperty('rating');
    expect(review.rating).toBe(5);
  });

  it('should allow mock data overrides', () => {
    const customAttraction = mockAttraction({ name: 'Custom Attraction', rating: 3.5 });
    expect(customAttraction.name).toBe('Custom Attraction');
    expect(customAttraction.rating).toBe(3.5);
    expect(customAttraction.id).toBe(1); // Default value should remain
  });

  it('should have TypeScript support', () => {
    // This test will fail to compile if TypeScript is not properly configured
    const typedData: { id: number; name: string } = mockAttraction();
    expect(typeof typedData.id).toBe('number');
    expect(typeof typedData.name).toBe('string');
  });

  it('should have proper Jest matchers from jest-dom', () => {
    render(<TestComponent message="Visible content" />);
    
    const element = screen.getByTestId('test-component');
    expect(element).toBeVisible();
    expect(element).toHaveTextContent('Visible content');
  });
});