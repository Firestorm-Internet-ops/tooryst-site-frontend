/**
 * Real-time Form Validation Hooks with Debouncing
 * Feature: frontend-quality-improvements, Task 3.1: Schema-based Form Validation
 * 
 * Provides React hooks for real-time form validation with:
 * - Debounced validation to prevent excessive validation calls
 * - Field-level validation for immediate feedback
 * - Form-level validation for submission
 * - Integration with React Hook Form and Zod schemas
 * - Performance optimized with memoization
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, UseFormProps, UseFormReturn, FieldValues, Path, PathValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import debounce from 'lodash.debounce';

import { getFieldErrors, validateField } from '@/lib/validation-schemas';

/**
 * Enhanced form validation hook with real-time validation and debouncing
 */
export function useFormValidation<TSchema extends z.ZodSchema, TFieldValues extends FieldValues = z.infer<TSchema>>(
  schema: TSchema,
  options?: UseFormProps<TFieldValues> & {
    debounceMs?: number;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
  }
): UseFormReturn<TFieldValues> & {
  validateField: (fieldName: Path<TFieldValues>, value: PathValue<TFieldValues, Path<TFieldValues>>) => Promise<boolean>;
  isValidating: boolean;
  fieldErrors: Record<string, string>;
} {
  const {
    debounceMs = 300,
    validateOnChange = true,
    validateOnBlur = true,
    ...formOptions
  } = options || {};

  const [isValidating, setIsValidating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Initialize React Hook Form with Zod resolver
  const form = useForm<TFieldValues>({
    resolver: zodResolver(schema),
    mode: validateOnChange ? 'onChange' : validateOnBlur ? 'onBlur' : 'onSubmit',
    ...formOptions,
  });

  // Debounced field validation function
  const debouncedValidateField = useMemo(
    () =>
      debounce(async (fieldName: string, value: any) => {
        setIsValidating(true);
        
        try {
          // Validate single field
          const result = validateField(schema as z.ZodObject<any>, fieldName, value);
          
          setFieldErrors(prev => ({
            ...prev,
            [fieldName]: result.error || '',
          }));
          
          return result.success;
        } catch (error) {
          console.error('Field validation error:', error);
          return false;
        } finally {
          setIsValidating(false);
        }
      }, debounceMs),
    [schema, debounceMs]
  );

  // Manual field validation function
  const validateFieldManual = useCallback(
    async (fieldName: Path<TFieldValues>, value: PathValue<TFieldValues, Path<TFieldValues>>) => {
      return debouncedValidateField(fieldName as string, value);
    },
    [debouncedValidateField]
  );

  // Watch for form changes and validate in real-time
  const watchedValues = form.watch();
  
  useEffect(() => {
    if (!validateOnChange) return;

    Object.entries(watchedValues).forEach(([fieldName, value]) => {
      if (value !== undefined && value !== '') {
        debouncedValidateField(fieldName, value);
      }
    });

    return () => {
      debouncedValidateField.cancel();
    };
  }, [watchedValues, debouncedValidateField, validateOnChange]);

  // Update field errors when form errors change
  useEffect(() => {
    const formErrors = form.formState.errors;
    const newFieldErrors: Record<string, string> = {};

    Object.entries(formErrors).forEach(([fieldName, error]) => {
      if (error?.message) {
        newFieldErrors[fieldName] = error.message;
      }
    });

    setFieldErrors(newFieldErrors);
  }, [form.formState.errors]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedValidateField.cancel();
    };
  }, [debouncedValidateField]);

  return {
    ...form,
    validateField: validateFieldManual,
    isValidating,
    fieldErrors,
  };
}

/**
 * Hook for real-time search validation with debouncing
 */
export function useSearchValidation(debounceMs: number = 300) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Debounced query updater
  const debouncedUpdater = useMemo(
    () =>
      debounce((nextQuery: string) => {
        setIsValidating(true);
        
        // Basic validation
        if (nextQuery.length > 100) {
          setValidationError('Search query must be less than 100 characters');
          setIsValidating(false);
          return;
        }
        
        if (nextQuery && !/^[a-zA-Z0-9\s\-.,'"!?()&]+$/.test(nextQuery)) {
          setValidationError('Search query contains invalid characters');
          setIsValidating(false);
          return;
        }
        
        setValidationError(null);
        setDebouncedQuery(nextQuery.trim());
        setIsValidating(false);
      }, debounceMs),
    [debounceMs]
  );

  // Update query and trigger debounced validation
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    debouncedUpdater(newQuery);
  }, [debouncedUpdater]);

  // Clear query and validation
  const clearQuery = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setValidationError(null);
    setIsValidating(false);
    debouncedUpdater.cancel();
  }, [debouncedUpdater]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedUpdater.cancel();
    };
  }, [debouncedUpdater]);

  return {
    query,
    debouncedQuery,
    isValidating,
    validationError,
    isValid: !validationError && debouncedQuery.length > 0,
    updateQuery,
    clearQuery,
  };
}

/**
 * Hook for async field validation (e.g., checking email availability)
 */
export function useAsyncFieldValidation<T>(
  validateFn: (value: T) => Promise<{ isValid: boolean; message?: string }>,
  debounceMs: number = 500
) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message?: string;
  } | null>(null);

  const debouncedValidate = useMemo(
    () =>
      debounce(async (value: T) => {
        if (!value) {
          setValidationResult(null);
          setIsValidating(false);
          return;
        }

        setIsValidating(true);
        
        try {
          const result = await validateFn(value);
          setValidationResult(result);
        } catch (error) {
          setValidationResult({
            isValid: false,
            message: 'Validation failed. Please try again.',
          });
        } finally {
          setIsValidating(false);
        }
      }, debounceMs),
    [validateFn, debounceMs]
  );

  const validate = useCallback((value: T) => {
    debouncedValidate(value);
  }, [debouncedValidate]);

  const reset = useCallback(() => {
    setValidationResult(null);
    setIsValidating(false);
    debouncedValidate.cancel();
  }, [debouncedValidate]);

  useEffect(() => {
    return () => {
      debouncedValidate.cancel();
    };
  }, [debouncedValidate]);

  return {
    validate,
    reset,
    isValidating,
    validationResult,
    isValid: validationResult?.isValid ?? null,
    message: validationResult?.message,
  };
}

/**
 * Hook for form submission with validation and error handling
 */
export function useFormSubmission<TData extends FieldValues>(
  onSubmit: (data: TData) => Promise<void> | void,
  options?: {
    onSuccess?: (data: TData) => void;
    onError?: (error: Error, data: TData) => void;
    resetOnSuccess?: boolean;
  }
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = useCallback(async (data: TData, reset?: () => void) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      await onSubmit(data);
      setSubmitSuccess(true);
      
      if (options?.resetOnSuccess && reset) {
        reset();
      }
      
      options?.onSuccess?.(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Submission failed';
      setSubmitError(errorMessage);
      options?.onError?.(error instanceof Error ? error : new Error(errorMessage), data);
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, options]);

  const clearError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const clearSuccess = useCallback(() => {
    setSubmitSuccess(false);
  }, []);

  return {
    handleSubmit,
    isSubmitting,
    submitError,
    submitSuccess,
    clearError,
    clearSuccess,
  };
}

/**
 * Hook for multi-step form validation
 */
export function useMultiStepForm<TSteps extends Record<string, z.ZodSchema>>(
  steps: TSteps,
  options?: {
    initialStep?: keyof TSteps;
    validateOnStepChange?: boolean;
  }
) {
  const stepNames = Object.keys(steps) as (keyof TSteps)[];
  const [currentStep, setCurrentStep] = useState<keyof TSteps>(
    options?.initialStep || stepNames[0]
  );
  const [completedSteps, setCompletedSteps] = useState<Set<keyof TSteps>>(new Set());
  const [stepData, setStepData] = useState<Record<keyof TSteps, any>>({} as Record<keyof TSteps, any>);

  const currentStepIndex = stepNames.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === stepNames.length - 1;

  const goToStep = useCallback((step: keyof TSteps) => {
    if (stepNames.includes(step)) {
      setCurrentStep(step);
    }
  }, [stepNames]);

  const goToNextStep = useCallback(() => {
    if (!isLastStep) {
      const nextStep = stepNames[currentStepIndex + 1];
      setCurrentStep(nextStep);
    }
  }, [isLastStep, stepNames, currentStepIndex]);

  const goToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      const previousStep = stepNames[currentStepIndex - 1];
      setCurrentStep(previousStep);
    }
  }, [isFirstStep, stepNames, currentStepIndex]);

  const updateStepData = useCallback((step: keyof TSteps, data: any) => {
    setStepData(prev => ({
      ...prev,
      [step]: data,
    }));
  }, []);

  const validateStep = useCallback(async (step: keyof TSteps, data: any) => {
    try {
      const schema = steps[step];
      await schema.parseAsync(data);
      setCompletedSteps(prev => new Set([...prev, step]));
      return true;
    } catch (error) {
      setCompletedSteps(prev => {
        const newSet = new Set(prev);
        newSet.delete(step);
        return newSet;
      });
      return false;
    }
  }, [steps]);

  const isStepCompleted = useCallback((step: keyof TSteps) => {
    return completedSteps.has(step);
  }, [completedSteps]);

  const getAllData = useCallback(() => {
    return stepData;
  }, [stepData]);

  const resetForm = useCallback(() => {
    setCurrentStep(stepNames[0]);
    setCompletedSteps(new Set());
    setStepData({} as Record<keyof TSteps, any>);
  }, [stepNames]);

  return {
    currentStep,
    currentStepIndex,
    stepNames,
    isFirstStep,
    isLastStep,
    completedSteps,
    stepData,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    updateStepData,
    validateStep,
    isStepCompleted,
    getAllData,
    resetForm,
  };
}