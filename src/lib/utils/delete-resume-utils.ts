import {
  isRetryableError,
  isNonRetryableError,
  DELETE_RESUME_ERROR_CODES,
  DELETE_RESUME_EVENTS,
  type DeleteResumeErrorResponse,
  type DeleteResumeSuccessResponse,
  type DeleteResumeErrorCode,
  type DeleteResumeEvent,
  type ErrorContext,
  type ResumeValidationError,
  type DeleteResumeValidationResult,
} from "@/lib/types";

/**
 * Utility functions for delete resume operations
 */

/**
 * Creates a standardized error response
 */
export const createDeleteResumeError = (
  code: DeleteResumeErrorCode,
  message: string,
  details?: string,
  retryable: boolean = false
): DeleteResumeErrorResponse => ({
  error: message,
  code,
  retryable,
  details,
});

/**
 * Creates a standardized success response
 */
export const createDeleteResumeSuccess = (
  message: string = "Resume deleted successfully"
): DeleteResumeSuccessResponse => ({
  success: true,
  message,
});

/**
 * Validates resume ID format
 */
export const validateResumeId = (resumeId: string): ResumeValidationError[] => {
  const errors: ResumeValidationError[] = [];

  if (!resumeId) {
    errors.push({
      field: "resumeId",
      message: "Resume ID is required",
      code: "MISSING_REQUIRED",
    });
  } else if (typeof resumeId !== "string") {
    errors.push({
      field: "resumeId",
      message: "Resume ID must be a string",
      code: "INVALID_FORMAT",
    });
  } else if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      resumeId
    )
  ) {
    errors.push({
      field: "resumeId",
      message: "Resume ID must be a valid UUID",
      code: "INVALID_UUID",
    });
  }

  return errors;
};

/**
 * Validates user ID format
 */
export const validateUserId = (userId: string): ResumeValidationError[] => {
  const errors: ResumeValidationError[] = [];

  if (!userId) {
    errors.push({
      field: "userId",
      message: "User ID is required",
      code: "MISSING_REQUIRED",
    });
  } else if (typeof userId !== "string") {
    errors.push({
      field: "userId",
      message: "User ID must be a string",
      code: "INVALID_FORMAT",
    });
  }

  return errors;
};

/**
 * Validates delete resume parameters
 */
export const validateDeleteResumeParams = (
  resumeId: string,
  userId: string
): DeleteResumeValidationResult => {
  const errors = [...validateResumeId(resumeId), ...validateUserId(userId)];

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Determines if an error is retryable based on error code
 */
export const isErrorRetryable = (error: DeleteResumeErrorResponse): boolean => {
  if (isRetryableError(error)) {
    return true;
  }

  if (isNonRetryableError(error)) {
    return false;
  }

  // Default retryable errors
  const retryableCodes: DeleteResumeErrorCode[] = [
    "NETWORK_ERROR",
    "TIMEOUT_ERROR",
    "SERVER_ERROR",
  ];

  return retryableCodes.includes(error.code || "UNKNOWN_ERROR");
};

/**
 * Gets user-friendly error message for display
 */
export const getErrorMessage = (error: DeleteResumeErrorResponse): string => {
  switch (error.code) {
    case "RESUME_IN_USE":
      return "This resume is currently being used in job applications and cannot be deleted. Please remove it from all applications first.";
    case "RESUME_NOT_FOUND":
      return "Resume not found or you don't have permission to delete it.";
    case "UNAUTHORIZED":
      return "You must be logged in to delete a resume.";
    case "VALIDATION_ERROR":
      return "Invalid request. Please check your input and try again.";
    case "NETWORK_ERROR":
      return "Network error. Please check your connection and try again.";
    case "TIMEOUT_ERROR":
      return "Request timed out. Please try again.";
    case "SERVER_ERROR":
      return "Server error. Please try again later.";
    case "UNKNOWN_ERROR":
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

/**
 * Creates error context for logging
 */
export const createErrorContext = (
  operation: "delete_resume",
  resumeId: string,
  userId?: string,
  additionalData?: Record<string, unknown>
): ErrorContext => ({
  operation,
  resumeId,
  userId,
  timestamp: new Date(),
  userAgent:
    typeof window !== "undefined" ? window.navigator.userAgent : undefined,
  ipAddress: undefined, // Would be set by server
  ...additionalData,
});

/**
 * Creates analytics event for delete resume operations
 */
export const createDeleteResumeEvent = (
  type: "resume_deleted" | "resume_delete_failed" | "resume_delete_cancelled",
  resumeId: string,
  userId: string,
  metadata?: Record<string, unknown>
): DeleteResumeEvent => ({
  type,
  resumeId,
  userId,
  timestamp: new Date(),
  metadata,
});

/**
 * Logs delete resume events
 */
export const logDeleteResumeEvent = (event: DeleteResumeEvent): void => {
  if (process.env.NODE_ENV === "development") {
    console.warn("Delete Resume Event:", event);
  }

  // In production, this would send to analytics service
  // analytics.track(event.type, event);
};

/**
 * Handles error logging with context
 */
export const logDeleteResumeError = (
  error: DeleteResumeErrorResponse,
  context: ErrorContext
): void => {
  const logData = {
    error: error.error,
    code: error.code,
    retryable: error.retryable,
    details: error.details,
    context,
  };

  if (process.env.NODE_ENV === "development") {
    console.error("Delete Resume Error:", logData);
  }

  // In production, this would send to error tracking service
  // errorTracker.captureException(error, { extra: logData });
};

/**
 * Retry delay calculation with exponential backoff
 */
export const calculateRetryDelay = (
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 10000
): number => {
  const delay = baseDelay * Math.pow(2, attempt - 1);
  return Math.min(delay, maxDelay);
};

/**
 * Checks if error should trigger retry
 */
export const shouldRetry = (
  error: DeleteResumeErrorResponse,
  attempt: number,
  maxRetries: number
): boolean => {
  if (attempt >= maxRetries) {
    return false;
  }

  if (!isErrorRetryable(error)) {
    return false;
  }

  return true;
};

/**
 * Formats error for user display
 */
export const formatErrorForUser = (
  error: DeleteResumeErrorResponse
): {
  title: string;
  description: string;
  canRetry: boolean;
} => {
  const canRetry = isErrorRetryable(error);

  return {
    title: `Error: ${error.code || "UNKNOWN_ERROR"}`,
    description: getErrorMessage(error),
    canRetry,
  };
};

/**
 * Constants for error messages
 */
export const ERROR_MESSAGES = {
  [DELETE_RESUME_ERROR_CODES.RESUME_IN_USE]:
    "This resume is currently being used in job applications and cannot be deleted. Please remove it from all applications first.",
  [DELETE_RESUME_ERROR_CODES.RESUME_NOT_FOUND]:
    "Resume not found or you don't have permission to delete it.",
  [DELETE_RESUME_ERROR_CODES.UNAUTHORIZED]:
    "You must be logged in to delete a resume.",
  [DELETE_RESUME_ERROR_CODES.VALIDATION_ERROR]:
    "Invalid request. Please check your input and try again.",
  [DELETE_RESUME_ERROR_CODES.NETWORK_ERROR]:
    "Network error. Please check your connection and try again.",
  [DELETE_RESUME_ERROR_CODES.TIMEOUT_ERROR]:
    "Request timed out. Please try again.",
  [DELETE_RESUME_ERROR_CODES.SERVER_ERROR]:
    "Server error. Please try again later.",
  [DELETE_RESUME_ERROR_CODES.UNKNOWN_ERROR]:
    "An unexpected error occurred. Please try again.",
} as const;

/**
 * Constants for event types
 */
export const EVENT_TYPES = DELETE_RESUME_EVENTS;
