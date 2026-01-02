/**
 * Zod Validation Schemas for Form Validation
 * Feature: frontend-quality-improvements, Task 3.1: Schema-based Form Validation
 * 
 * Comprehensive validation schemas for all forms in the application:
 * - Search forms with query validation and filtering
 * - Contact forms with comprehensive field validation
 * - Newsletter subscription with email validation and preferences
 * - Real-time validation with debouncing support
 */

import { z } from 'zod';

/**
 * Search Form Validation Schema
 */
export const searchFormSchema = z.object({
  query: z
    .string()
    .min(1, 'Search query is required')
    .max(100, 'Search query must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-.,'"!?()&]+$/, 'Search query contains invalid characters')
    .transform((val) => val.trim()),

  filter: z
    .enum(['cities', 'attractions', 'all'], {
      errorMap: () => ({ message: 'Invalid filter option' })
    })
    .default('all'),

  location: z
    .string()
    .max(50, 'Location must be less than 50 characters')
    .optional(),

  category: z
    .string()
    .max(30, 'Category must be less than 30 characters')
    .optional(),
});

export type SearchFormData = z.infer<typeof searchFormSchema>;

/**
 * Contact Form Validation Schema
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters')
    .toLowerCase(),
  
  phone: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true; // Optional field
      // Support international phone numbers with optional country code
      const cleanPhone = val.replace(/[\s\-\(\)]/g, '');
      // Must start with optional +, then digit 1-9, then 6-14 more digits (min 7 total, max 15 total)
      const phoneRegex = /^[\+]?[1-9]\d{6,14}$/;
      return phoneRegex.test(cleanPhone);
    }, 'Please enter a valid phone number'),
  
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(100, 'Subject must be less than 100 characters'),
  
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  
  inquiryType: z
    .enum(['general', 'support', 'partnership', 'feedback', 'business'])
    .default('general'),
  
  preferredContact: z
    .enum(['email', 'phone', 'either'])
    .default('email'),
  
  // Honeypot field for spam protection
  website: z
    .string()
    .max(0, 'This field should be empty')
    .optional(),
  
  // Privacy consent
  consent: z
    .boolean()
    .refine((val) => val === true, 'You must agree to our privacy policy'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

/**
 * Newsletter Subscription Validation Schema
 */
export const newsletterFormSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters')
    .toLowerCase(),
  
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(30, 'First name must be less than 30 characters')
    .regex(/^[a-zA-Z\s\-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .optional(),
  
  interests: z
    .array(z.enum([
      'attractions',
      'cities',
      'travel-tips',
      'local-insights',
      'seasonal-guides',
      'crowd-updates',
      'new-features'
    ]))
    .min(1, 'Please select at least one interest')
    .max(7, 'Please select no more than 7 interests'),
  
  frequency: z
    .enum(['weekly', 'biweekly', 'monthly'])
    .default('monthly'),
  
  location: z
    .string()
    .max(50, 'Location must be less than 50 characters')
    .optional(),
  
  // Privacy consent
  consent: z
    .boolean()
    .refine((val) => val === true, 'You must agree to receive our newsletter'),
  
  // Marketing consent (optional)
  marketingConsent: z
    .boolean()
    .default(false),
});

export type NewsletterFormData = z.infer<typeof newsletterFormSchema>;

/**
 * Advanced Search Form Validation Schema
 */
export const advancedSearchFormSchema = z.object({
  query: z
    .string()
    .max(100, 'Search query must be less than 100 characters')
    .optional(),
  
  location: z
    .string()
    .max(50, 'Location must be less than 50 characters')
    .optional(),
  
  categories: z
    .array(z.string())
    .max(5, 'Please select no more than 5 categories')
    .optional(),
  
  priceRange: z
    .object({
      min: z.number().min(0, 'Minimum price must be 0 or greater').optional(),
      max: z.number().min(0, 'Maximum price must be 0 or greater').optional(),
    })
    .refine((data) => {
      if (data.min !== undefined && data.max !== undefined) {
        return data.min <= data.max;
      }
      return true;
    }, 'Minimum price must be less than or equal to maximum price')
    .optional(),
  
  rating: z
    .number()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5')
    .optional(),
  
  accessibility: z
    .array(z.enum([
      'wheelchair-accessible',
      'hearing-impaired-friendly',
      'visually-impaired-friendly',
      'family-friendly',
      'pet-friendly'
    ]))
    .optional(),
  
  openNow: z
    .boolean()
    .optional(),
  
  sortBy: z
    .enum(['relevance', 'rating', 'distance', 'price', 'popularity'])
    .default('relevance'),
  
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('desc'),
});

export type AdvancedSearchFormData = z.infer<typeof advancedSearchFormSchema>;

/**
 * User Feedback Form Validation Schema
 */
export const feedbackFormSchema = z.object({
  rating: z
    .number()
    .min(1, 'Please provide a rating between 1 and 5')
    .max(5, 'Please provide a rating between 1 and 5'),
  
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters'),
  
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(500, 'Comment must be less than 500 characters'),
  
  category: z
    .enum(['attraction', 'website', 'mobile-app', 'customer-service', 'other'])
    .default('attraction'),
  
  wouldRecommend: z
    .boolean(),
  
  email: z
    .string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters')
    .optional(),
  
  anonymous: z
    .boolean()
    .default(false),
});

export type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

/**
 * Validation Schema Utilities
 */

/**
 * Create a partial schema for real-time validation
 * Useful for validating individual fields as user types
 */
export function createPartialSchema<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
  return schema.partial();
}

/**
 * Validate a single field from a schema
 */
export function validateField<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  fieldName: keyof T,
  value: unknown
): { success: boolean; error?: string } {
  try {
    const fieldSchema = schema.shape[fieldName];
    if (!fieldSchema) {
      return { success: false, error: 'Field not found in schema' };
    }
    fieldSchema.parse(value);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors?.[0]?.message || 'Validation failed';
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'Validation failed' };
  }
}

/**
 * Get field-specific error messages from ZodError
 */
export function getFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (!error.errors || !Array.isArray(error.errors)) {
    return fieldErrors;
  }

  error.errors.forEach((err) => {
    if (!err.path || err.path.length === 0) {
      return;
    }
    const fieldName = err.path[0]?.toString() || '';
    if (fieldName && !fieldErrors[fieldName]) {
      fieldErrors[fieldName] = err.message;
    }
  });

  return fieldErrors;
}

/**
 * Transform form data for API submission
 */
export function transformFormData<T>(data: T, transformations?: Partial<Record<keyof T, (value: any) => any>>): T {
  if (!transformations) return data;
  
  const transformed = { ...data };
  
  Object.entries(transformations).forEach(([key, transform]) => {
    if (key in transformed && transform) {
      (transformed as any)[key] = transform((transformed as any)[key]);
    }
  });
  
  return transformed;
}

/**
 * Common validation patterns
 */
export const validationPatterns = {
  // Only letters, spaces, hyphens, and apostrophes
  name: /^[a-zA-Z\s\-']+$/,
  
  // Alphanumeric with common punctuation for search
  search: /^[a-zA-Z0-9\s\-.,'"!?()&]+$/,
  
  // International phone number (basic pattern)
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  
  // URL slug pattern
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  
  // Password strength (at least 8 chars, 1 uppercase, 1 lowercase, 1 number)
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
} as const;

/**
 * Common error messages
 */
export const errorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be less than ${max} characters`,
  invalidFormat: 'Invalid format',
  mustAgree: 'You must agree to continue',
  selectAtLeastOne: 'Please select at least one option',
  invalidRange: 'Invalid range',
} as const;