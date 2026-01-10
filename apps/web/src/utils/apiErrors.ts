import type { TFunction } from 'i18next';

// Map of Laravel API error messages to translation keys
const API_ERROR_MAP: Record<string, string> = {
  // Authentication errors
  'These credentials do not match our records.': 'apiErrors.invalidCredentials',
  'The provided credentials are incorrect.': 'apiErrors.invalidCredentials',
  'Invalid credentials': 'apiErrors.invalidCredentials',
  'Unauthenticated.': 'apiErrors.unauthenticated',
  'Your email address is not verified.': 'apiErrors.emailNotVerified',
  'Too many login attempts. Please try again in :seconds seconds.': 'apiErrors.tooManyAttempts',

  // Validation errors
  'The email has already been taken.': 'apiErrors.emailTaken',
  'The email field is required.': 'apiErrors.emailRequired',
  'The email field must be a valid email address.': 'apiErrors.emailInvalid',
  'The password field is required.': 'apiErrors.passwordRequired',
  'The password field must be at least 8 characters.': 'apiErrors.passwordTooShort',
  'The password field confirmation does not match.': 'apiErrors.passwordMismatch',
  'The name field is required.': 'apiErrors.nameRequired',

  // Account errors
  'This account has been deactivated.': 'apiErrors.accountDeactivated',
  'Your subscription has expired.': 'apiErrors.subscriptionExpired',

  // Rate limiting
  'Too many requests.': 'apiErrors.tooManyRequests',

  // Server errors
  'Server Error': 'apiErrors.serverError',
  'Service Unavailable': 'apiErrors.serviceUnavailable',
};

/**
 * Translates an API error message to the user's language
 * Falls back to the original message if no translation is found
 */
export function translateApiError(
  message: string | undefined,
  t: TFunction,
  fallbackKey = 'apiErrors.generic'
): string {
  if (!message) {
    return t(fallbackKey);
  }

  // Check for exact match
  const translationKey = API_ERROR_MAP[message];
  if (translationKey) {
    return t(translationKey);
  }

  // Check for partial matches (for messages with dynamic values like :seconds)
  for (const [pattern, key] of Object.entries(API_ERROR_MAP)) {
    if (pattern.includes(':') && message.includes(pattern.split(':')[0].trim())) {
      // Extract the dynamic value and pass it to translation
      const match = message.match(/(\d+)/);
      if (match) {
        return t(key, { seconds: match[1], count: parseInt(match[1]) });
      }
      return t(key);
    }
  }

  // Return original message if no translation found
  // This ensures we don't hide useful error information
  return message;
}

/**
 * Translates validation errors object from API
 */
export function translateValidationErrors(
  errors: Record<string, string[]> | undefined,
  t: TFunction
): Record<string, string> {
  if (!errors) return {};

  const translated: Record<string, string> = {};
  for (const [field, messages] of Object.entries(errors)) {
    if (messages && messages.length > 0) {
      translated[field] = translateApiError(messages[0], t);
    }
  }
  return translated;
}

/**
 * API Error type for consistent error handling
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

/**
 * Extract error message from various error types
 * Handles Axios errors, API responses, and generic Error objects
 */
export function extractErrorMessage(error: unknown): string {
  // Axios error with response
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object'
  ) {
    const response = error.response as { data?: { message?: string }; status?: number };
    if (response.data?.message) {
      return response.data.message;
    }
    if (response.status === 401) {
      return 'Unauthenticated.';
    }
    if (response.status === 403) {
      return 'Access denied.';
    }
    if (response.status === 404) {
      return 'Resource not found.';
    }
    if (response.status && response.status >= 500) {
      return 'Server Error';
    }
  }

  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // String error
  if (typeof error === 'string') {
    return error;
  }

  // Unknown error
  return 'An unexpected error occurred';
}

/**
 * Handle API errors with consistent logging and message extraction
 */
export function handleApiError(
  error: unknown,
  t: TFunction,
  options?: {
    fallbackKey?: string;
    logError?: boolean;
    context?: string;
  }
): string {
  const { fallbackKey = 'apiErrors.generic', logError = true, context } = options ?? {};

  const message = extractErrorMessage(error);

  if (logError) {
    console.error(context ? `[${context}]` : '[API Error]', error);
  }

  return translateApiError(message, t, fallbackKey);
}
