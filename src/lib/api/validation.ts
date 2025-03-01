// Type for API responses
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
  status: number;
};

// Helper function to create consistent API responses
export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  status: number = success ? 200 : 400,
  errors?: Record<string, string>
): ApiResponse<T> {
  return {
    success,
    ...(data !== undefined && { data }),
    ...(error && { error }),
    ...(errors && { errors }),
    status,
  };
}

// Simple validation rules
export type ValidationRule = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  isEmail?: boolean;
  isDecimal?: boolean;
  isInteger?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean;
  message?: string;
};

// Field validation function
export function validateField(
  value: any,
  rules: ValidationRule,
  fieldName: string
): string | null {
  // Handle required check first
  if (rules.required && (value === undefined || value === null || value === '')) {
    return rules.message || `${fieldName} is required`;
  }

  // Skip other validations if the field is empty and not required
  if (value === undefined || value === null || value === '') {
    return null;
  }

  // String length validations
  if (typeof value === 'string') {
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      return rules.message || `${fieldName} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      return rules.message || `${fieldName} must be no more than ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message || `${fieldName} format is invalid`;
    }

    // Email validation
    if (
      rules.isEmail &&
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)
    ) {
      return rules.message || `${fieldName} must be a valid email address`;
    }
  }

  // Number validations
  if (rules.isInteger || rules.isDecimal) {
    const num = Number(value);
    if (isNaN(num)) {
      return rules.message || `${fieldName} must be a valid number`;
    }

    if (rules.isInteger && !Number.isInteger(num)) {
      return rules.message || `${fieldName} must be an integer`;
    }

    if (rules.min !== undefined && num < rules.min) {
      return rules.message || `${fieldName} must be at least ${rules.min}`;
    }

    if (rules.max !== undefined && num > rules.max) {
      return rules.message || `${fieldName} must be no more than ${rules.max}`;
    }
  }

  // Custom validation
  if (rules.custom && !rules.custom(value)) {
    return rules.message || `${fieldName} is invalid`;
  }

  return null;
}

// Form validation function
export function validateForm(
  data: Record<string, any>,
  validationSchema: Record<string, ValidationRule>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field in validationSchema) {
    const value = data[field];
    const rules = validationSchema[field];
    const error = validateField(value, rules, field);

    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}