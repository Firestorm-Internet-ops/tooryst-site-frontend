/**
 * Test for error tracking and Sentry integration
 * Feature: frontend-quality-improvements, Task 1.3: Sentry Configuration
 */

import { render, screen } from '../test-utils';
import { ErrorTracker, TrackedError, ErrorType, createAPIError, createValidationError, withErrorTracking } from '../utils/error-tracking';
import { ErrorBoundary } from '../components/error-boundaries/ErrorBoundary';
import * as fc from 'fast-check';

// Mock Sentry to avoid actual error reporting in tests
jest.mock('@sentry/nextjs', () => ({
  withScope: jest.fn((callback) => callback({
    setLevel: jest.fn(),
    setTag: jest.fn(),
    setContext: jest.fn(),
    setUser: jest.fn(),
  })),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
  setMeasurement: jest.fn(),
  startTransaction: jest.fn(() => ({
    finish: jest.fn(),
  })),
}));

// Component that throws an error for testing
const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }
  return <div data-testid="no-error">No error occurred</div>;
};

describe('Error Tracking System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console errors during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'group').mockImplementation(() => {});
    jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('TrackedError class', () => {
    it('should create a TrackedError with correct properties', () => {
      const context = { component: 'TestComponent', action: 'test' };
      const error = new TrackedError('Test error message', ErrorType.API_ERROR, context);

      expect(error.message).toBe('Test error message');
      expect(error.type).toBe(ErrorType.API_ERROR);
      expect(error.context).toEqual(context);
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.name).toBe('TrackedError');
    });

    it('should default to UNKNOWN_ERROR type', () => {
      const error = new TrackedError('Test error');
      expect(error.type).toBe(ErrorType.UNKNOWN_ERROR);
    });
  });

  describe('ErrorTracker utility', () => {
    it('should track errors with context', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent', userId: '123' };

      ErrorTracker.trackError(error, context);

      // Verify Sentry methods were called
      const Sentry = require('@sentry/nextjs');
      expect(Sentry.withScope).toHaveBeenCalled();
      expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    it('should track messages with context', () => {
      const message = 'Test message';
      const context = { component: 'TestComponent' };

      ErrorTracker.trackMessage(message, 'info', context);

      const Sentry = require('@sentry/nextjs');
      expect(Sentry.withScope).toHaveBeenCalled();
      expect(Sentry.captureMessage).toHaveBeenCalledWith(message);
    });

    it('should set and clear user context', () => {
      const user = { id: '123', email: 'test@example.com' };

      ErrorTracker.setUser(user);
      const Sentry = require('@sentry/nextjs');
      expect(Sentry.setUser).toHaveBeenCalledWith(user);

      ErrorTracker.clearUser();
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });

    it('should add breadcrumbs', () => {
      ErrorTracker.addBreadcrumb('Test breadcrumb', 'test', 'info', { key: 'value' });

      const Sentry = require('@sentry/nextjs');
      expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
        message: 'Test breadcrumb',
        category: 'test',
        level: 'info',
        data: { key: 'value' },
        timestamp: expect.any(Number),
      });
    });
  });

  describe('Error helper functions', () => {
    it('should create API errors correctly', () => {
      const error = createAPIError('API failed', 500, '/api/test', 'POST');

      expect(error).toBeInstanceOf(TrackedError);
      expect(error.type).toBe(ErrorType.API_ERROR);
      expect(error.message).toBe('API failed');
      expect(error.context.additionalData).toEqual({
        status: 500,
        endpoint: '/api/test',
        method: 'POST',
      });
    });

    it('should create validation errors correctly', () => {
      const error = createValidationError('Invalid email', 'email', 'invalid-email');

      expect(error).toBeInstanceOf(TrackedError);
      expect(error.type).toBe(ErrorType.VALIDATION_ERROR);
      expect(error.message).toBe('Invalid email');
      expect(error.context.additionalData).toEqual({
        field: 'email',
        value: 'invalid-email',
      });
    });
  });

  describe('ErrorBoundary component', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('no-error')).toBeInTheDocument();
    });

    it('should render error UI when error occurs', () => {
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('We\'ve been notified about this error and will fix it soon.')).toBeInTheDocument();
      expect(screen.getByText('Reload page')).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
      const customFallback = <div data-testid="custom-fallback">Custom error message</div>;

      render(
        <ErrorBoundary fallback={customFallback}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should call onError callback when error occurs', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ErrorThrowingComponent shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('withErrorTracking HOF', () => {
    it('should track errors from wrapped async functions', async () => {
      const { withErrorTracking } = await import('../utils/error-tracking');
      
      const failingFunction = async () => {
        throw new Error('Async function failed');
      };

      const wrappedFunction = withErrorTracking(failingFunction, { component: 'TestComponent' });

      await expect(wrappedFunction()).rejects.toThrow('Async function failed');

      const Sentry = require('@sentry/nextjs');
      expect(Sentry.captureException).toHaveBeenCalled();
    });

    it('should return result from successful async functions', async () => {
      const { withErrorTracking } = await import('../utils/error-tracking');
      
      const successfulFunction = async () => {
        return 'success';
      };

      const wrappedFunction = withErrorTracking(successfulFunction);
      const result = await wrappedFunction();

      expect(result).toBe('success');
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Property 1: Comprehensive Error Capture
     * Feature: frontend-quality-improvements, Property 1: Comprehensive Error Capture
     * Validates: Requirements 1.1, 1.2, 1.5
     * 
     * This property test ensures that ALL errors are captured and properly enriched
     * with context information, regardless of error type, source, or context data.
     */
    it('Feature: frontend-quality-improvements, Property 1: Comprehensive Error Capture', () => {
      fc.assert(fc.property(
        fc.record({
          errorType: fc.constantFrom('javascript', 'api', 'network', 'validation', 'authentication', 'permission', 'notfound'),
          message: fc.string({ minLength: 1, maxLength: 200 }),
          component: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          action: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          userId: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          level: fc.option(fc.constantFrom('error', 'warning', 'info', 'debug')),
          additionalData: fc.option(fc.record({
            status: fc.option(fc.integer({ min: 100, max: 599 })),
            endpoint: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
            method: fc.option(fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
            field: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
            value: fc.option(fc.string({ minLength: 0, maxLength: 100 })),
            customData: fc.option(fc.record({
              key1: fc.string(),
              key2: fc.integer(),
              key3: fc.boolean(),
            }))
          }))
        }),
        (errorData) => {
          // Clear previous mocks
          jest.clearAllMocks();
          
          // Create error based on type
          let error: Error;
          let expectedErrorType: ErrorType;
          
          switch (errorData.errorType) {
            case 'api':
              error = createAPIError(
                errorData.message,
                errorData.additionalData?.status || 500,
                errorData.additionalData?.endpoint || '/api/test',
                errorData.additionalData?.method || 'GET'
              );
              expectedErrorType = ErrorType.API_ERROR;
              break;
            case 'validation':
              error = createValidationError(
                errorData.message,
                errorData.additionalData?.field || 'testField',
                errorData.additionalData?.value || 'testValue'
              );
              expectedErrorType = ErrorType.VALIDATION_ERROR;
              break;
            case 'network':
              error = new TrackedError(errorData.message, ErrorType.NETWORK_ERROR);
              expectedErrorType = ErrorType.NETWORK_ERROR;
              break;
            case 'authentication':
              error = new TrackedError(errorData.message, ErrorType.AUTHENTICATION_ERROR);
              expectedErrorType = ErrorType.AUTHENTICATION_ERROR;
              break;
            case 'permission':
              error = new TrackedError(errorData.message, ErrorType.PERMISSION_ERROR);
              expectedErrorType = ErrorType.PERMISSION_ERROR;
              break;
            case 'notfound':
              error = new TrackedError(errorData.message, ErrorType.NOT_FOUND_ERROR);
              expectedErrorType = ErrorType.NOT_FOUND_ERROR;
              break;
            default:
              error = new Error(errorData.message);
              expectedErrorType = ErrorType.UNKNOWN_ERROR;
          }

          // Build context with additional data
          const context = {
            component: errorData.component,
            action: errorData.action,
            userId: errorData.userId,
            additionalData: errorData.additionalData?.customData,
          };

          // Track the error with optional level
          const level = (errorData.level as any) || 'error';
          ErrorTracker.trackError(error, context, level);

          // Verify Sentry was called
          const Sentry = require('@sentry/nextjs');
          expect(Sentry.withScope).toHaveBeenCalled();
          expect(Sentry.captureException).toHaveBeenCalledWith(error);

          // Verify scope was configured with context
          const scopeCallback = Sentry.withScope.mock.calls[0][0];
          const mockScope = {
            setLevel: jest.fn(),
            setTag: jest.fn(),
            setContext: jest.fn(),
            setUser: jest.fn(),
          };
          
          scopeCallback(mockScope);

          // PROPERTY 1: ALL errors must have level set
          expect(mockScope.setLevel).toHaveBeenCalledWith(level);

          // PROPERTY 1: ALL errors must have enriched context with timestamp
          expect(mockScope.setContext).toHaveBeenCalledWith(
            'errorContext',
            expect.objectContaining({
              timestamp: expect.any(String),
            })
          );

          // PROPERTY 1: Context enrichment must preserve all provided data
          const contextCall = mockScope.setContext.mock.calls.find(call => call[0] === 'errorContext');
          if (contextCall) {
            const enrichedContext = contextCall[1];
            if (errorData.component) {
              expect(enrichedContext.component).toBe(errorData.component);
            }
            if (errorData.action) {
              expect(enrichedContext.action).toBe(errorData.action);
            }
            if (errorData.userId) {
              expect(enrichedContext.userId).toBe(errorData.userId);
            }
          }

          // PROPERTY 1: User context must be set when userId is provided
          if (errorData.userId) {
            expect(mockScope.setUser).toHaveBeenCalledWith({ id: errorData.userId });
          }

          // PROPERTY 1: Component tag must be set when component is provided
          if (errorData.component) {
            expect(mockScope.setTag).toHaveBeenCalledWith('component', errorData.component);
          }

          // PROPERTY 1: Action tag must be set when action is provided
          if (errorData.action) {
            expect(mockScope.setTag).toHaveBeenCalledWith('action', errorData.action);
          }

          // PROPERTY 1: TrackedError must have additional error details context
          if (error instanceof TrackedError) {
            expect(mockScope.setTag).toHaveBeenCalledWith('errorType', expectedErrorType);
            expect(mockScope.setContext).toHaveBeenCalledWith(
              'errorDetails',
              expect.objectContaining({
                type: expectedErrorType,
                timestamp: expect.any(String),
              })
            );
          }

          // PROPERTY 1: Error message must be preserved exactly
          expect(error.message).toBe(errorData.message);

          // PROPERTY 1: Error must be an instance of Error
          expect(error).toBeInstanceOf(Error);
        }
      ), { numRuns: 200 });
    });

    /**
     * Property 1.1: Error Boundary Integration
     * Validates that error boundaries properly capture and report errors
     */
    it('Property 1.1: Error Boundary Integration captures all component errors', () => {
      fc.assert(fc.property(
        fc.record({
          errorMessage: fc.string({ minLength: 1, maxLength: 100 }),
          componentName: fc.string({ minLength: 1, maxLength: 50 }),
          shouldThrow: fc.boolean(),
          hasCustomFallback: fc.boolean(),
          hasOnError: fc.boolean(),
        }),
        (testData) => {
          jest.clearAllMocks();

          // Create unique identifiers for this test run
          const testId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const successTestId = `success-${testId}`;
          const fallbackTestId = `fallback-${testId}`;

          const TestComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
            if (shouldThrow) {
              throw new Error(testData.errorMessage);
            }
            return <div data-testid={successTestId}>Success</div>;
          };

          const customFallback = testData.hasCustomFallback ? 
            <div data-testid={fallbackTestId}>Custom Error</div> : undefined;
          
          const onError = testData.hasOnError ? jest.fn() : undefined;

          const { container, unmount } = render(
            <ErrorBoundary fallback={customFallback} onError={onError}>
              <TestComponent shouldThrow={testData.shouldThrow} />
            </ErrorBoundary>
          );

          try {
            if (testData.shouldThrow) {
              // PROPERTY 1.1: Error boundary must capture and display error UI
              if (testData.hasCustomFallback) {
                expect(container.querySelector(`[data-testid="${fallbackTestId}"]`)).toBeInTheDocument();
              } else {
                expect(container.querySelector('h3')).toHaveTextContent('Something went wrong');
              }

              // PROPERTY 1.1: Error must be reported to Sentry
              const Sentry = require('@sentry/nextjs');
              expect(Sentry.captureException).toHaveBeenCalled();

              // PROPERTY 1.1: Custom onError callback must be called if provided
              if (testData.hasOnError && onError) {
                expect(onError).toHaveBeenCalledWith(
                  expect.any(Error),
                  expect.objectContaining({
                    componentStack: expect.any(String),
                  })
                );
              }
            } else {
              // PROPERTY 1.1: No error means normal rendering
              expect(container.querySelector(`[data-testid="${successTestId}"]`)).toBeInTheDocument();
            }
          } finally {
            // Clean up after each test
            unmount();
          }
        }
      ), { numRuns: 20 });
    });

    /**
     * Property 1.2: Message Tracking Consistency
     * Validates that message tracking works consistently across all levels and contexts
     */
    it('Property 1.2: Message Tracking Consistency', () => {
      fc.assert(fc.property(
        fc.record({
          message: fc.string({ minLength: 1, maxLength: 200 }),
          level: fc.constantFrom('error', 'warning', 'info', 'debug'),
          component: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          action: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          additionalData: fc.option(fc.record({
            key1: fc.string(),
            key2: fc.integer(),
          }))
        }),
        (messageData) => {
          jest.clearAllMocks();

          const context = {
            component: messageData.component,
            action: messageData.action,
            additionalData: messageData.additionalData,
          };

          ErrorTracker.trackMessage(messageData.message, messageData.level as any, context);

          // PROPERTY 1.2: Message must be captured by Sentry
          const Sentry = require('@sentry/nextjs');
          expect(Sentry.withScope).toHaveBeenCalled();
          expect(Sentry.captureMessage).toHaveBeenCalledWith(messageData.message);

          // PROPERTY 1.2: Scope must be configured with correct level and context
          const scopeCallback = Sentry.withScope.mock.calls[0][0];
          const mockScope = {
            setLevel: jest.fn(),
            setTag: jest.fn(),
            setContext: jest.fn(),
          };
          
          scopeCallback(mockScope);

          expect(mockScope.setLevel).toHaveBeenCalledWith(messageData.level);
          expect(mockScope.setContext).toHaveBeenCalledWith('messageContext', context);

          if (messageData.component) {
            expect(mockScope.setTag).toHaveBeenCalledWith('component', messageData.component);
          }

          if (messageData.action) {
            expect(mockScope.setTag).toHaveBeenCalledWith('action', messageData.action);
          }
        }
      ), { numRuns: 100 });
    });

    /**
     * Property 1.3: Breadcrumb Consistency
     * Validates that breadcrumbs are consistently added with proper structure
     */
    it('Property 1.3: Breadcrumb Consistency', () => {
      fc.assert(fc.property(
        fc.record({
          message: fc.string({ minLength: 1, maxLength: 100 }),
          category: fc.string({ minLength: 1, maxLength: 50 }),
          level: fc.constantFrom('error', 'warning', 'info', 'debug'),
          data: fc.option(fc.record({
            key1: fc.string(),
            key2: fc.integer(),
            key3: fc.boolean(),
          }))
        }),
        (breadcrumbData) => {
          jest.clearAllMocks();

          ErrorTracker.addBreadcrumb(
            breadcrumbData.message,
            breadcrumbData.category,
            breadcrumbData.level as any,
            breadcrumbData.data
          );

          // PROPERTY 1.3: Breadcrumb must be added to Sentry
          const Sentry = require('@sentry/nextjs');
          expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
            message: breadcrumbData.message,
            category: breadcrumbData.category,
            level: breadcrumbData.level,
            data: breadcrumbData.data,
            timestamp: expect.any(Number),
          });

          // PROPERTY 1.3: Timestamp must be a valid number
          const breadcrumbCall = Sentry.addBreadcrumb.mock.calls[0][0];
          expect(typeof breadcrumbCall.timestamp).toBe('number');
          expect(breadcrumbCall.timestamp).toBeGreaterThan(0);
        }
      ), { numRuns: 100 });
    });

    /**
     * Property 1.4: withErrorTracking HOF Consistency
     * Validates that the higher-order function consistently wraps and tracks errors
     */
    it('Property 1.4: withErrorTracking HOF Consistency', async () => {
      await fc.assert(fc.asyncProperty(
        fc.record({
          shouldThrow: fc.boolean(),
          errorMessage: fc.string({ minLength: 1, maxLength: 100 }),
          successValue: fc.string({ minLength: 1, maxLength: 50 }),
          context: fc.record({
            component: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
            action: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          })
        }),
        async (testData) => {
          jest.clearAllMocks();

          const testFunction = async () => {
            if (testData.shouldThrow) {
              throw new Error(testData.errorMessage);
            }
            return testData.successValue;
          };

          const wrappedFunction = withErrorTracking(testFunction, testData.context);

          if (testData.shouldThrow) {
            // PROPERTY 1.4: Error must be tracked and re-thrown
            await expect(wrappedFunction()).rejects.toThrow(testData.errorMessage);
            
            const Sentry = require('@sentry/nextjs');
            expect(Sentry.captureException).toHaveBeenCalled();
          } else {
            // PROPERTY 1.4: Success value must be returned unchanged
            const result = await wrappedFunction();
            expect(result).toBe(testData.successValue);
            
            // No error should be tracked
            const Sentry = require('@sentry/nextjs');
            expect(Sentry.captureException).not.toHaveBeenCalled();
          }
        }
      ), { numRuns: 20 });
    });
  });
});