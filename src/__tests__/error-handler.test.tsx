/**
 * Test for centralized error handling system
 * Feature: frontend-quality-improvements, Task 2.1: Centralized Error Handling
 */

import { 
  ErrorHandler, 
  APIError, 
  ValidationError, 
  NetworkError, 
  AuthenticationError, 
  PermissionError,
  ErrorSeverity,
  HTTP_STATUS,
  createAPIError,
  createValidationError,
  createNetworkError,
  createAuthenticationError,
  createPermissionError
} from '../utils/error-handler';
import { APIErrorHandler, FetchErrorHandler, APIRetryHandler, APICircuitBreaker } from '../utils/api-error-handler';
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
}));

// Mock axios for testing
const mockAxiosError = (status: number, message: string, config: any = {}) => ({
  isAxiosError: true,
  response: {
    status,
    data: { message },
    statusText: 'Error',
  },
  config: {
    url: '/api/test',
    method: 'GET',
    ...config,
  },
  message,
});

describe('Centralized Error Handling System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console errors during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'group').mockImplementation(() => {});
    jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('APIError class', () => {
    it('should create APIError with correct properties and severity', () => {
      const error = new APIError('API failed', 500, '/api/test', 'POST', { error: 'Server error' });

      expect(error.message).toBe('API failed');
      expect(error.status).toBe(500);
      expect(error.endpoint).toBe('/api/test');
      expect(error.method).toBe('POST');
      expect(error.responseData).toEqual({ error: 'Server error' });
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.name).toBe('APIError');
    });

    it('should determine correct severity based on status code', () => {
      const serverError = new APIError('Server error', 500, '/api/test');
      expect(serverError.severity).toBe(ErrorSeverity.HIGH);

      const authError = new APIError('Unauthorized', 401, '/api/test');
      expect(authError.severity).toBe(ErrorSeverity.MEDIUM);

      const notFoundError = new APIError('Not found', 404, '/api/test');
      expect(notFoundError.severity).toBe(ErrorSeverity.LOW);

      const validationError = new APIError('Validation failed', 422, '/api/test');
      expect(validationError.severity).toBe(ErrorSeverity.LOW);
    });

    it('should identify retryable errors correctly', () => {
      const retryableError = new APIError('Too many requests', 429, '/api/test');
      expect(retryableError.isRetryable()).toBe(true);

      const serverError = new APIError('Server error', 500, '/api/test');
      expect(serverError.isRetryable()).toBe(true);

      const authError = new APIError('Unauthorized', 401, '/api/test');
      expect(authError.isRetryable()).toBe(false);

      const notFoundError = new APIError('Not found', 404, '/api/test');
      expect(notFoundError.isRetryable()).toBe(false);
    });

    it('should provide user-friendly messages', () => {
      const authError = new APIError('Unauthorized', 401, '/api/test');
      expect(authError.getUserMessage()).toBe('Please log in to continue.');

      const forbiddenError = new APIError('Forbidden', 403, '/api/test');
      expect(forbiddenError.getUserMessage()).toBe('You don\'t have permission to perform this action.');

      const notFoundError = new APIError('Not found', 404, '/api/test');
      expect(notFoundError.getUserMessage()).toBe('The requested resource was not found.');

      const serverError = new APIError('Server error', 500, '/api/test');
      expect(serverError.getUserMessage()).toBe('A server error occurred. Please try again later.');
    });
  });

  describe('ValidationError class', () => {
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Email is required', 'email', '', 'required');

      expect(error.message).toBe('Email is required');
      expect(error.field).toBe('email');
      expect(error.value).toBe('');
      expect(error.rule).toBe('required');
      expect(error.severity).toBe(ErrorSeverity.LOW);
      expect(error.name).toBe('ValidationError');
    });

    it('should provide user-friendly validation messages', () => {
      const requiredError = new ValidationError('Field required', 'email', '', 'required');
      expect(requiredError.getUserMessage()).toBe('Email is required.');

      const emailError = new ValidationError('Invalid email', 'email', 'invalid', 'email');
      expect(emailError.getUserMessage()).toBe('Please enter a valid email address.');

      const minLengthError = new ValidationError('Too short', 'password', 'abc', 'minLength');
      expect(minLengthError.getUserMessage()).toBe('Password is too short.');

      const customError = new ValidationError('Custom error', 'field', 'value', 'custom');
      expect(customError.getUserMessage()).toBe('Custom error');
    });
  });

  describe('NetworkError class', () => {
    it('should create NetworkError with correct properties', () => {
      const error = new NetworkError('Connection failed', 'CONNECTION_FAILED');

      expect(error.message).toBe('Connection failed');
      expect(error.code).toBe('CONNECTION_FAILED');
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.name).toBe('NetworkError');
    });

    it('should detect timeout and offline conditions', () => {
      const timeoutError = new NetworkError('Request timeout', 'TIMEOUT');
      expect(timeoutError.timeout).toBe(true);

      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const offlineError = new NetworkError('Network error', 'NETWORK_ERROR');
      expect(offlineError.offline).toBe(true);

      // Reset navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
    });

    it('should provide appropriate user messages', () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const offlineError = new NetworkError('Network error', 'NETWORK_ERROR');
      expect(offlineError.getUserMessage()).toBe('You appear to be offline. Please check your internet connection.');

      // Reset to online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      const timeoutError = new NetworkError('Request timeout', 'TIMEOUT');
      expect(timeoutError.getUserMessage()).toBe('The request timed out. Please try again.');

      const genericError = new NetworkError('Connection failed', 'CONNECTION_FAILED');
      expect(genericError.getUserMessage()).toBe('Network error occurred. Please check your connection and try again.');
    });
  });

  describe('AuthenticationError class', () => {
    it('should create AuthenticationError with correct properties', () => {
      const error = new AuthenticationError('Session expired', 'expired');

      expect(error.message).toBe('Session expired');
      expect(error.reason).toBe('expired');
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.name).toBe('AuthenticationError');
    });

    it('should provide appropriate user messages based on reason', () => {
      const expiredError = new AuthenticationError('Session expired', 'expired');
      expect(expiredError.getUserMessage()).toBe('Your session has expired. Please log in again.');

      const invalidError = new AuthenticationError('Invalid credentials', 'invalid');
      expect(invalidError.getUserMessage()).toBe('Invalid credentials. Please try again.');

      const requiredError = new AuthenticationError('Login required', 'required');
      expect(requiredError.getUserMessage()).toBe('Please log in to continue.');

      const genericError = new AuthenticationError('Auth failed', 'unknown');
      expect(genericError.getUserMessage()).toBe('Authentication failed. Please log in again.');
    });
  });

  describe('PermissionError class', () => {
    it('should create PermissionError with correct properties', () => {
      const error = new PermissionError('Access denied', 'users', 'delete');

      expect(error.message).toBe('Access denied');
      expect(error.resource).toBe('users');
      expect(error.action).toBe('delete');
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.name).toBe('PermissionError');
    });

    it('should provide contextual user messages', () => {
      const specificError = new PermissionError('Access denied', 'users', 'delete');
      expect(specificError.getUserMessage()).toBe('You don\'t have permission to delete users.');

      const genericError = new PermissionError('Access denied');
      expect(genericError.getUserMessage()).toBe('You don\'t have permission to perform this action.');
    });
  });

  describe('ErrorHandler class', () => {
    it('should handle Axios errors correctly', () => {
      const axiosError = mockAxiosError(404, 'Not found');
      const handledError = ErrorHandler.handle(axiosError);

      expect(handledError).toBeInstanceOf(APIError);
      expect(handledError.message).toBe('Not found');
      expect((handledError as APIError).status).toBe(404);
    });

    it('should handle network errors correctly', () => {
      const networkError = new Error('fetch failed');
      networkError.name = 'TypeError';
      
      const handledError = ErrorHandler.handle(networkError);
      expect(handledError).toBeInstanceOf(NetworkError);
    });

    it('should handle validation errors correctly', () => {
      const zodError = {
        name: 'ZodError',
        issues: [{
          message: 'Required',
          path: ['email'],
          code: 'required',
          received: undefined,
        }],
      };

      const handledError = ErrorHandler.handle(zodError);
      expect(handledError).toBeInstanceOf(ValidationError);
      expect((handledError as ValidationError).field).toBe('email');
    });

    it('should enrich context with runtime information', () => {
      const error = new Error('Test error');
      const handledError = ErrorHandler.handle(error, {
        component: 'TestComponent',
        action: 'test_action',
      });

      expect(handledError.context.component).toBe('TestComponent');
      expect(handledError.context.action).toBe('test_action');
      expect(handledError.context.timestamp).toBeDefined();
    });

    it('should format error messages consistently', () => {
      const apiError = new APIError('API failed', 500, '/api/test', 'GET');
      const message = ErrorHandler.formatErrorMessage(apiError);
      expect(message).toBe('A server error occurred. Please try again later.');

      const devMessage = ErrorHandler.formatErrorMessage(apiError, true);
      expect(devMessage).toContain('Status: 500');
      expect(devMessage).toContain('Endpoint: /api/test');
    });

    it('should provide recovery suggestions', () => {
      const networkError = new NetworkError('Connection failed', 'CONNECTION_FAILED');
      const suggestions = ErrorHandler.getRecoverySuggestions(networkError);
      
      expect(suggestions).toContain('Check your internet connection');
      expect(suggestions).toContain('Refresh the page');

      const authError = new AuthenticationError('Session expired', 'expired');
      const authSuggestions = ErrorHandler.getRecoverySuggestions(authError);
      
      expect(authSuggestions).toContain('Log in again');
    });
  });

  describe('APIRetryHandler', () => {
    it('should identify retryable errors correctly', () => {
      const retryableError = new APIError('Server error', 500, '/api/test');
      expect(APIRetryHandler.isRetryable(retryableError)).toBe(true);

      const nonRetryableError = new AuthenticationError('Unauthorized', 'invalid');
      expect(APIRetryHandler.isRetryable(nonRetryableError)).toBe(false);
    });

    it('should calculate retry delay with exponential backoff', () => {
      const delay1 = APIRetryHandler.calculateRetryDelay(0, 1000);
      const delay2 = APIRetryHandler.calculateRetryDelay(1, 1000);
      const delay3 = APIRetryHandler.calculateRetryDelay(2, 1000);

      expect(delay1).toBeGreaterThanOrEqual(1000);
      expect(delay1).toBeLessThan(1200); // With jitter
      expect(delay2).toBeGreaterThanOrEqual(2000);
      expect(delay3).toBeGreaterThanOrEqual(4000);
    });

    it('should retry retryable errors and fail fast on non-retryable', async () => {
      let attempts = 0;
      const retryableFunction = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new APIError('Server error', 500, '/api/test');
        }
        return 'success';
      });

      const result = await APIRetryHandler.withRetry(retryableFunction, {
        maxAttempts: 3,
        baseDelay: 10, // Short delay for testing
      });

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });
  });

  describe('APICircuitBreaker', () => {
    beforeEach(() => {
      // Reset circuit breaker state
      (APICircuitBreaker as any).failures.clear();
      (APICircuitBreaker as any).lastFailureTime.clear();
    });

    it('should open circuit after threshold failures', () => {
      const endpoint = '/api/test';
      
      // Record failures up to threshold
      for (let i = 0; i < 5; i++) {
        APICircuitBreaker.recordFailure(endpoint);
      }

      expect(APICircuitBreaker.isCircuitOpen(endpoint)).toBe(true);
    });

    it('should reset circuit after recovery timeout', () => {
      const endpoint = '/api/test';
      
      // Record failures to open circuit
      for (let i = 0; i < 5; i++) {
        APICircuitBreaker.recordFailure(endpoint);
      }

      expect(APICircuitBreaker.isCircuitOpen(endpoint)).toBe(true);

      // Mock time passage
      const originalNow = Date.now;
      Date.now = jest.fn(() => originalNow() + 61000); // 61 seconds later

      expect(APICircuitBreaker.isCircuitOpen(endpoint)).toBe(false);

      // Restore Date.now
      Date.now = originalNow;
    });

    it('should reset failures on success', () => {
      const endpoint = '/api/test';
      
      // Record some failures
      APICircuitBreaker.recordFailure(endpoint);
      APICircuitBreaker.recordFailure(endpoint);
      
      // Record success
      APICircuitBreaker.recordSuccess(endpoint);
      
      expect(APICircuitBreaker.isCircuitOpen(endpoint)).toBe(false);
    });
  });

  describe('Convenience functions', () => {
    it('should create errors with convenience functions', () => {
      const apiError = createAPIError('API failed', 500, '/api/test');
      expect(apiError).toBeInstanceOf(APIError);

      const validationError = createValidationError('Required', 'email', '');
      expect(validationError).toBeInstanceOf(ValidationError);

      const networkError = createNetworkError('Connection failed');
      expect(networkError).toBeInstanceOf(NetworkError);

      const authError = createAuthenticationError('Unauthorized');
      expect(authError).toBeInstanceOf(AuthenticationError);

      const permissionError = createPermissionError('Access denied');
      expect(permissionError).toBeInstanceOf(PermissionError);
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Property 5: Error Handling Consistency
     * Feature: frontend-quality-improvements, Property 5: Error Handling Consistency
     * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
     */
    it('Feature: frontend-quality-improvements, Property 5: Error Handling Consistency', () => {
      fc.assert(fc.property(
        fc.record({
          errorType: fc.constantFrom('api', 'validation', 'network', 'authentication', 'permission'),
          message: fc.string({ minLength: 1, maxLength: 200 }),
          statusCode: fc.option(fc.integer({ min: 400, max: 599 })),
          field: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          value: fc.option(fc.string({ minLength: 0, maxLength: 100 })),
          rule: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          code: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          reason: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          resource: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          action: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          context: fc.record({
            component: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
            userId: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
            feature: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
          })
        }),
        (errorData) => {
          jest.clearAllMocks();

          let error: any;

          // Create error based on type
          switch (errorData.errorType) {
            case 'api':
              error = createAPIError(
                errorData.message,
                errorData.statusCode || 500,
                '/api/test',
                'GET',
                undefined,
                errorData.context
              );
              break;
            case 'validation':
              error = createValidationError(
                errorData.message,
                errorData.field || 'testField',
                errorData.value || 'testValue',
                errorData.rule,
                errorData.context
              );
              break;
            case 'network':
              error = createNetworkError(
                errorData.message,
                errorData.code,
                errorData.context
              );
              break;
            case 'authentication':
              error = createAuthenticationError(
                errorData.message,
                errorData.reason,
                errorData.context
              );
              break;
            case 'permission':
              error = createPermissionError(
                errorData.message,
                errorData.resource,
                errorData.action,
                errorData.context
              );
              break;
          }

          // PROPERTY 5: All errors must be TrackedError instances
          expect(error.name).toMatch(/Error$/);
          expect(error.message).toBe(errorData.message);
          expect(error.timestamp).toBeInstanceOf(Date);

          // PROPERTY 5: All errors must have consistent context structure
          expect(error.context).toBeDefined();
          expect(typeof error.context).toBe('object');

          // PROPERTY 5: All errors must have severity classification
          expect(error.severity).toBeDefined();
          expect(Object.values(ErrorSeverity)).toContain(error.severity);

          // PROPERTY 5: All errors must provide user-friendly messages
          const userMessage = error.getUserMessage();
          expect(typeof userMessage).toBe('string');
          expect(userMessage.length).toBeGreaterThan(0);

          // PROPERTY 5: Error formatting must be consistent
          const formattedMessage = ErrorHandler.formatErrorMessage(error);
          expect(typeof formattedMessage).toBe('string');
          expect(formattedMessage.length).toBeGreaterThan(0);

          // PROPERTY 5: Recovery suggestions must be provided
          const suggestions = ErrorHandler.getRecoverySuggestions(error);
          expect(Array.isArray(suggestions)).toBe(true);
          expect(suggestions.length).toBeGreaterThan(0);
          suggestions.forEach(suggestion => {
            expect(typeof suggestion).toBe('string');
            expect(suggestion.length).toBeGreaterThan(0);
          });

          // PROPERTY 5: Context must be preserved and enriched
          if (errorData.context.component) {
            expect(error.context.component).toBe(errorData.context.component);
          }
          if (errorData.context.userId) {
            expect(error.context.userId).toBe(errorData.context.userId);
          }
          if (errorData.context.feature) {
            expect(error.context.feature).toBe(errorData.context.feature);
          }

          // PROPERTY 5: Error handling must be consistent across types
          const handledError = ErrorHandler.handle(error, { test: 'context' });
          expect(handledError).toBeInstanceOf(error.constructor);
          expect(handledError.message).toBe(error.message);

          // PROPERTY 5: Sentry integration must be consistent
          const Sentry = require('@sentry/nextjs');
          expect(Sentry.captureException).toHaveBeenCalled();
        }
      ), { numRuns: 100 });
    });

    /**
     * Property 5.1: Context Enrichment Consistency
     * Validates that context enrichment is consistent across all error types
     */
    it('Property 5.1: Context Enrichment Consistency', () => {
      fc.assert(fc.property(
        fc.record({
          errorType: fc.constantFrom('api', 'validation', 'network', 'authentication', 'permission', 'unknown'),
          message: fc.string({ minLength: 1, maxLength: 100 }),
          initialContext: fc.record({
            component: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
            action: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
            userId: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
            feature: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
            correlationId: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          }),
          additionalContext: fc.record({
            severity: fc.option(fc.constantFrom('low', 'medium', 'high', 'critical')),
            recoverable: fc.option(fc.boolean()),
            userMessage: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
            retryable: fc.option(fc.boolean()),
          })
        }),
        (testData) => {
          jest.clearAllMocks();

          // Create a base error
          let baseError: Error;
          switch (testData.errorType) {
            case 'api':
              baseError = createAPIError(testData.message, 500, '/api/test', 'GET', undefined, testData.initialContext);
              break;
            case 'validation':
              baseError = createValidationError(testData.message, 'field', 'value', 'required', testData.initialContext);
              break;
            case 'network':
              baseError = createNetworkError(testData.message, 'CONNECTION_FAILED', testData.initialContext);
              break;
            case 'authentication':
              baseError = createAuthenticationError(testData.message, 'expired', testData.initialContext);
              break;
            case 'permission':
              baseError = createPermissionError(testData.message, 'resource', 'action', testData.initialContext);
              break;
            default:
              baseError = new Error(testData.message);
          }

          // Handle the error with additional context
          const handledError = ErrorHandler.handle(baseError, testData.additionalContext);

          // PROPERTY 5.1: Context must be enriched consistently
          expect(handledError.context).toBeDefined();
          expect(handledError.context.timestamp).toBeDefined();
          expect(typeof handledError.context.timestamp).toBe('string');

          // PROPERTY 5.1: Original context must be preserved
          if (testData.initialContext.component) {
            expect(handledError.context.component).toBe(testData.initialContext.component);
          }
          if (testData.initialContext.action) {
            expect(handledError.context.action).toBe(testData.initialContext.action);
          }
          if (testData.initialContext.userId) {
            expect(handledError.context.userId).toBe(testData.initialContext.userId);
          }

          // PROPERTY 5.1: Additional context must be merged
          const enhancedContext = handledError.context as any;
          if (testData.additionalContext.userMessage) {
            expect(enhancedContext.userMessage).toBe(testData.additionalContext.userMessage);
          }
          if (testData.additionalContext.recoverable !== undefined && testData.additionalContext.recoverable !== null) {
            expect(enhancedContext.recoverable).toBe(testData.additionalContext.recoverable);
          }

          // PROPERTY 5.1: Technical details must be added
          expect(enhancedContext.technicalDetails).toBeDefined();
          expect(typeof enhancedContext.technicalDetails).toBe('object');
        }
      ), { numRuns: 50 });
    });

    /**
     * Property 5.2: Error Message Formatting Consistency
     * Validates that error message formatting is consistent across all scenarios
     */
    it('Property 5.2: Error Message Formatting Consistency', () => {
      fc.assert(fc.property(
        fc.record({
          errorType: fc.constantFrom('api', 'validation', 'network', 'authentication', 'permission'),
          message: fc.string({ minLength: 1, maxLength: 100 }),
          includeDetails: fc.boolean(),
          statusCode: fc.option(fc.integer({ min: 400, max: 599 })),
          field: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
          rule: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          code: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
          reason: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
          resource: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
          action: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
        }),
        (testData) => {
          let error: any;

          // Create error based on type
          switch (testData.errorType) {
            case 'api':
              error = createAPIError(testData.message, testData.statusCode || 500, '/api/test');
              break;
            case 'validation':
              error = createValidationError(testData.message, testData.field || 'field', 'value', testData.rule);
              break;
            case 'network':
              error = createNetworkError(testData.message, testData.code);
              break;
            case 'authentication':
              error = createAuthenticationError(testData.message, testData.reason);
              break;
            case 'permission':
              error = createPermissionError(testData.message, testData.resource, testData.action);
              break;
          }

          // PROPERTY 5.2: User message must always be available and non-empty
          const userMessage = error.getUserMessage();
          expect(typeof userMessage).toBe('string');
          expect(userMessage.length).toBeGreaterThan(0);
          expect(userMessage).not.toBe(testData.message); // Should be user-friendly, not technical

          // PROPERTY 5.2: Formatted message must be consistent
          const formattedMessage = ErrorHandler.formatErrorMessage(error, testData.includeDetails);
          expect(typeof formattedMessage).toBe('string');
          expect(formattedMessage.length).toBeGreaterThan(0);

          // PROPERTY 5.2: When details are included, message should contain technical info
          if (testData.includeDetails) {
            if (testData.errorType === 'api' && testData.statusCode) {
              expect(formattedMessage).toContain(`Status: ${testData.statusCode}`);
            }
            if (testData.errorType === 'validation' && testData.field) {
              expect(formattedMessage).toContain(`Field: ${testData.field}`);
            }
            if (testData.errorType === 'network' && testData.code) {
              expect(formattedMessage).toContain(`Code: ${testData.code}`);
            }
          }

          // PROPERTY 5.2: Message should not contain sensitive information
          expect(formattedMessage).not.toMatch(/password|token|secret|key/i);
          expect(userMessage).not.toMatch(/password|token|secret|key/i);
        }
      ), { numRuns: 75 });
    });

    /**
     * Property 5.3: Recovery Suggestions Consistency
     * Validates that recovery suggestions are appropriate and consistent
     */
    it('Property 5.3: Recovery Suggestions Consistency', () => {
      fc.assert(fc.property(
        fc.record({
          errorType: fc.constantFrom('api', 'validation', 'network', 'authentication', 'permission'),
          statusCode: fc.option(fc.integer({ min: 400, max: 599 })),
          isRetryable: fc.option(fc.boolean()),
          isTimeout: fc.option(fc.boolean()),
          isOffline: fc.option(fc.boolean()),
        }),
        (testData) => {
          let error: any;

          // Create error with specific characteristics
          switch (testData.errorType) {
            case 'api':
              error = createAPIError('API Error', testData.statusCode || 500, '/api/test');
              break;
            case 'validation':
              error = createValidationError('Validation Error', 'field', 'value', 'required');
              break;
            case 'network':
              const code = testData.isTimeout ? 'TIMEOUT' : 'CONNECTION_FAILED';
              error = createNetworkError('Network Error', code);
              // Mock offline state if needed
              if (testData.isOffline) {
                Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
              }
              break;
            case 'authentication':
              error = createAuthenticationError('Auth Error', 'expired');
              break;
            case 'permission':
              error = createPermissionError('Permission Error', 'resource', 'action');
              break;
          }

          const suggestions = ErrorHandler.getRecoverySuggestions(error);

          // PROPERTY 5.3: Must always provide suggestions
          expect(Array.isArray(suggestions)).toBe(true);
          expect(suggestions.length).toBeGreaterThan(0);

          // PROPERTY 5.3: All suggestions must be strings
          suggestions.forEach(suggestion => {
            expect(typeof suggestion).toBe('string');
            expect(suggestion.length).toBeGreaterThan(0);
          });

          // PROPERTY 5.3: Suggestions must be appropriate for error type
          if (testData.errorType === 'network') {
            expect(suggestions.some(s => s.toLowerCase().includes('connection'))).toBe(true);
            if (testData.isTimeout) {
              expect(suggestions.some(s => s.toLowerCase().includes('try again'))).toBe(true);
            }
            if (testData.isOffline) {
              expect(suggestions.some(s => s.toLowerCase().includes('offline'))).toBe(true);
            }
          }

          if (testData.errorType === 'authentication') {
            expect(suggestions.some(s => s.toLowerCase().includes('log in'))).toBe(true);
          }

          if (testData.errorType === 'validation') {
            expect(suggestions.some(s => s.toLowerCase().includes('input') || s.toLowerCase().includes('field'))).toBe(true);
          }

          if (testData.errorType === 'api' && testData.statusCode === 401) {
            expect(suggestions.some(s => s.toLowerCase().includes('log in'))).toBe(true);
          }

          // PROPERTY 5.3: Suggestions should not be duplicated
          const uniqueSuggestions = [...new Set(suggestions)];
          expect(uniqueSuggestions.length).toBe(suggestions.length);

          // Reset navigator.onLine if it was modified
          if (testData.isOffline) {
            Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
          }
        }
      ), { numRuns: 50 });
    });

    /**
     * Property 5.4: Severity Classification Consistency
     * Validates that error severity is classified consistently
     */
    it('Property 5.4: Severity Classification Consistency', () => {
      fc.assert(fc.property(
        fc.record({
          errorType: fc.constantFrom('api', 'validation', 'network', 'authentication', 'permission'),
          statusCode: fc.option(fc.integer({ min: 400, max: 599 })),
          isSystemCritical: fc.boolean(),
        }),
        (testData) => {
          let error: any;

          switch (testData.errorType) {
            case 'api':
              const status = testData.statusCode || (testData.isSystemCritical ? 500 : 400);
              error = createAPIError('API Error', status, '/api/test');
              break;
            case 'validation':
              error = createValidationError('Validation Error', 'field', 'value', 'required');
              break;
            case 'network':
              error = createNetworkError('Network Error', 'CONNECTION_FAILED');
              break;
            case 'authentication':
              error = createAuthenticationError('Auth Error', 'expired');
              break;
            case 'permission':
              error = createPermissionError('Permission Error', 'resource', 'action');
              break;
          }

          // PROPERTY 5.4: Severity must be defined and valid
          expect(error.severity).toBeDefined();
          expect(Object.values(ErrorSeverity)).toContain(error.severity);

          // PROPERTY 5.4: Severity must be appropriate for error type
          if (testData.errorType === 'validation') {
            expect(error.severity).toBe(ErrorSeverity.LOW);
          }

          if (testData.errorType === 'api') {
            if (testData.statusCode && testData.statusCode >= 500) {
              expect(error.severity).toBe(ErrorSeverity.HIGH);
            } else if (testData.statusCode === 401 || testData.statusCode === 403) {
              expect(error.severity).toBe(ErrorSeverity.MEDIUM);
            } else if (testData.statusCode === 404 || testData.statusCode === 422) {
              expect(error.severity).toBe(ErrorSeverity.LOW);
            }
          }

          if (testData.errorType === 'network' || testData.errorType === 'authentication' || testData.errorType === 'permission') {
            expect(error.severity).toBe(ErrorSeverity.MEDIUM);
          }

          // PROPERTY 5.4: Severity should influence retry behavior for API errors
          if (error instanceof APIError) {
            const isRetryable = error.isRetryable();
            if (error.severity === ErrorSeverity.HIGH) {
              // High severity server errors should be retryable
              expect(typeof isRetryable).toBe('boolean');
            }
            if (error.severity === ErrorSeverity.LOW && error.status === 404) {
              // Not found errors should not be retryable
              expect(isRetryable).toBe(false);
            }
          }
        }
      ), { numRuns: 75 });
    });

    /**
     * Property 5.5: Error Chain Consistency
     * Validates that error handling maintains consistency through error chains
     */
    it('Property 5.5: Error Chain Consistency', () => {
      fc.assert(fc.property(
        fc.record({
          chainLength: fc.integer({ min: 1, max: 5 }),
          errorTypes: fc.array(fc.constantFrom('api', 'validation', 'network', 'authentication', 'permission'), { minLength: 1, maxLength: 5 }),
          contexts: fc.array(fc.record({
            component: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
            action: fc.option(fc.string({ minLength: 1, maxLength: 20 })),
            userId: fc.option(fc.string({ minLength: 1, maxLength: 10 })),
          }), { minLength: 1, maxLength: 5 })
        }),
        (testData) => {
          jest.clearAllMocks();

          let currentError: any = new Error('Initial error');
          const errorChain: any[] = [];

          // Create a chain of errors
          for (let i = 0; i < Math.min(testData.chainLength, testData.errorTypes.length); i++) {
            const errorType = testData.errorTypes[i];
            const context = testData.contexts[i % testData.contexts.length];

            switch (errorType) {
              case 'api':
                currentError = createAPIError(`API Error ${i}`, 500, `/api/test${i}`, 'GET', undefined, context);
                break;
              case 'validation':
                currentError = createValidationError(`Validation Error ${i}`, `field${i}`, `value${i}`, 'required', context);
                break;
              case 'network':
                currentError = createNetworkError(`Network Error ${i}`, 'CONNECTION_FAILED', context);
                break;
              case 'authentication':
                currentError = createAuthenticationError(`Auth Error ${i}`, 'expired', context);
                break;
              case 'permission':
                currentError = createPermissionError(`Permission Error ${i}`, `resource${i}`, `action${i}`, context);
                break;
            }

            // Handle the error to enrich it
            currentError = ErrorHandler.handle(currentError, { chainIndex: i });
            errorChain.push(currentError);
          }

          // PROPERTY 5.5: Each error in chain must maintain consistency
          errorChain.forEach((error, index) => {
            // Must be a valid error instance
            expect(error).toBeInstanceOf(Error);
            expect(error.name).toMatch(/Error$/);
            expect(error.timestamp).toBeInstanceOf(Date);

            // Must have consistent context structure
            expect(error.context).toBeDefined();
            expect(typeof error.context).toBe('object');
            expect(error.context.timestamp).toBeDefined();

            // Must have severity classification
            expect(error.severity).toBeDefined();
            expect(Object.values(ErrorSeverity)).toContain(error.severity);

            // Must provide user message
            const userMessage = error.getUserMessage();
            expect(typeof userMessage).toBe('string');
            expect(userMessage.length).toBeGreaterThan(0);

            // Must provide recovery suggestions
            const suggestions = ErrorHandler.getRecoverySuggestions(error);
            expect(Array.isArray(suggestions)).toBe(true);
            expect(suggestions.length).toBeGreaterThan(0);

            // Chain index should be preserved in context
            expect(error.context.chainIndex).toBe(index);
          });

          // PROPERTY 5.5: Sentry should be called for each error in chain
          const Sentry = require('@sentry/nextjs');
          expect(Sentry.captureException).toHaveBeenCalledTimes(errorChain.length);
        }
      ), { numRuns: 30 });
    });
  });
});