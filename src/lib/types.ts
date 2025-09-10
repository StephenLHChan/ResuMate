import type { Prisma } from "@prisma/client";

export type ProfileWithRelations = Prisma.ProfileGetPayload<{
  include: {
    user: true;
    skills: true;
    experience: true;
    education: true;
    certifications: true;
    projects: true;
  };
}>;

export type ProfileWithUser = Prisma.ProfileGetPayload<{
  include: {
    user: {
      select: {
        email: true;
      };
    };
  };
}>;

export type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: {
    job: true;
    resumes: {
      include: {
        resume: true;
      };
    };
  };
}>;

export type ResumeWithRelations = Prisma.ResumeGetPayload<{
  include: {
    workExperiences: true;
    educationDetails: true;
    skillDetails: true;
    certificationDetails: true;
    summaries: true;
  };
}>;

export type ResumeData = {
  summary: string | null;
  workExperiences: {
    id: string;
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date | null;
    descriptions: string[];
    isCurrent: boolean;
  }[];
  educations: {
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date | null;
  }[];
  certifications: {
    id: string;
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date | null;
    credentialUrl?: string | null;
  }[];
  skills: {
    id: string;
    name: string;
  }[];
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  title: string;
  professionalTitle?: string;
};

export interface JobContent {
  title: string | null;
  companyName: string | null;
  description: string | null;
  duties: string[];
  requirements: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  location?: string | null;
  postingDate?: Date | null;
  applicationDeadline?: Date | null;
  applicationInstructions?: string | null;
  applicationWebsite?: string | null;
}

export interface APIResponse<T> {
  items: T[];
  totalCount: number;
  nextPageKey?: string;
  pageSize: number;
}

export interface APIError {
  error: string;
}

export interface DeleteResumeSuccessResponse {
  success: true;
  message: string;
}

export interface DeleteResumeErrorResponse {
  error: string;
  code?:
    | "RESUME_IN_USE"
    | "RESUME_NOT_FOUND"
    | "UNAUTHORIZED"
    | "NETWORK_ERROR"
    | "VALIDATION_ERROR"
    | "SERVER_ERROR"
    | "TIMEOUT_ERROR"
    | "UNKNOWN_ERROR";
  retryable?: boolean;
  details?: string;
}

// Delete Resume Dialog Component Types
export interface DeleteResumeDialogProps {
  resumeId: string;
  resumeTitle: string;
  onDeleted: () => void;
  disabled?: boolean;
}

// Resume List Component Types
export interface ResumeListItem {
  id: string;
  title: string;
  professionalTitle: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
  isInUse?: boolean;
}

export interface ResumeListState {
  resumes: ResumeListItem[];
  loading: boolean;
  error: string | null;
  resumesInUse: Set<string>;
}

// Resume Service Types
export interface DeleteResumeParams {
  resumeId: string;
  userId: string;
}

export interface DeleteResumeResult {
  success: boolean;
  message: string;
}

export interface ResumeUsageCheck {
  resumeId: string;
  isInUse: boolean;
  applicationCount: number;
  applications: Array<{
    id: string;
    jobTitle: string;
    company: string;
  }>;
}

// API Request/Response Types
export interface DeleteResumeRequest {
  resumeId: string;
}

export interface DeleteResumeApiResponse {
  success: true;
  message: string;
}

export interface DeleteResumeApiError {
  error: string;
  code: DeleteResumeErrorResponse["code"];
  retryable: boolean;
  details: string;
}

// Error Handling Types
export interface ErrorContext {
  operation: "delete_resume";
  resumeId: string;
  userId?: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface RetryableError extends DeleteResumeErrorResponse {
  retryable: true;
  retryAfter?: number; // seconds
  maxRetries?: number;
}

export interface NonRetryableError extends DeleteResumeErrorResponse {
  retryable: false;
}

// Validation Types
export interface ResumeValidationError {
  field: string;
  message: string;
  code: "INVALID_UUID" | "MISSING_REQUIRED" | "INVALID_FORMAT";
}

export interface DeleteResumeValidationResult {
  isValid: boolean;
  errors: ResumeValidationError[];
}

// Event Types for Analytics/Logging
export interface DeleteResumeEvent {
  type: "resume_deleted" | "resume_delete_failed" | "resume_delete_cancelled";
  resumeId: string;
  userId: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Hook Types
export interface UseDeleteResumeReturn {
  deleteResume: (resumeId: string) => Promise<void>;
  isDeleting: boolean;
  error: DeleteResumeErrorResponse | null;
  clearError: () => void;
}

export interface UseResumeListReturn {
  resumes: ResumeListItem[];
  loading: boolean;
  error: string | null;
  refreshResumes: () => Promise<void>;
  deleteResume: (resumeId: string) => Promise<void>;
  checkResumeUsage: (resumeId: string) => Promise<boolean>;
}

// Type Guards
export const isDeleteResumeErrorResponse = (
  error: unknown
): error is DeleteResumeErrorResponse =>
  typeof error === "object" &&
  error !== null &&
  "error" in error &&
  typeof (error as Record<string, unknown>).error === "string";

export const isRetryableError = (
  error: DeleteResumeErrorResponse
): error is RetryableError => error.retryable === true;

export const isNonRetryableError = (
  error: DeleteResumeErrorResponse
): error is NonRetryableError => error.retryable === false;

export const isDeleteResumeSuccessResponse = (
  response: unknown
): response is DeleteResumeSuccessResponse =>
  typeof response === "object" &&
  response !== null &&
  "success" in response &&
  (response as Record<string, unknown>).success === true &&
  "message" in response &&
  typeof (response as Record<string, unknown>).message === "string";

// Utility Types
export type DeleteResumeStatus = "idle" | "deleting" | "success" | "error";

export type DeleteResumeAction =
  | { type: "START_DELETE"; resumeId: string }
  | { type: "DELETE_SUCCESS"; resumeId: string }
  | { type: "DELETE_ERROR"; error: DeleteResumeErrorResponse }
  | { type: "CLEAR_ERROR" }
  | { type: "RESET" };

export interface DeleteResumeState {
  status: DeleteResumeStatus;
  currentResumeId: string | null;
  error: DeleteResumeErrorResponse | null;
  retryCount: number;
  maxRetries: number;
}

// Configuration Types
export interface DeleteResumeConfig {
  maxRetries: number;
  retryDelay: number; // milliseconds
  timeout: number; // milliseconds
  enableAnalytics: boolean;
  enableLogging: boolean;
}

// Constants
export const DELETE_RESUME_ERROR_CODES = {
  RESUME_IN_USE: "RESUME_IN_USE",
  RESUME_NOT_FOUND: "RESUME_NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  NETWORK_ERROR: "NETWORK_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  SERVER_ERROR: "SERVER_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export const DELETE_RESUME_EVENTS = {
  RESUME_DELETED: "resume_deleted",
  RESUME_DELETE_FAILED: "resume_delete_failed",
  RESUME_DELETE_CANCELLED: "resume_delete_cancelled",
} as const;

export type DeleteResumeErrorCode =
  (typeof DELETE_RESUME_ERROR_CODES)[keyof typeof DELETE_RESUME_ERROR_CODES];
export type DeleteResumeEventType =
  (typeof DELETE_RESUME_EVENTS)[keyof typeof DELETE_RESUME_EVENTS];

// API Response types for resume data
export interface ResumeWorkExperienceResponse {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  descriptions: string[];
  isCurrent: boolean;
}

export interface ResumeEducationResponse {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
}

export interface ResumeSkillResponse {
  id: string;
  name: string;
}

export interface ResumeCertificationResponse {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  credentialUrl: string | null;
}

export interface ResumeApiResponse {
  id: string;
  title: string;
  professionalTitle: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  summary: string | null;
  workExperiences: ResumeWorkExperienceResponse[];
  educations: ResumeEducationResponse[];
  skills: ResumeSkillResponse[];
  certifications: ResumeCertificationResponse[];
}
