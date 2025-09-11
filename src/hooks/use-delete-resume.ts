import { isAxiosError } from "axios";
import { useReducer, useCallback, useState } from "react";

import axiosInstance from "@/lib/axios";
import {
  isDeleteResumeErrorResponse,
  type DeleteResumeErrorResponse,
  type DeleteResumeSuccessResponse,
  type UseDeleteResumeReturn,
  type DeleteResumeState,
  type DeleteResumeAction,
  type DeleteResumeConfig,
} from "@/lib/types";

const DEFAULT_CONFIG: DeleteResumeConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 10000,
  enableAnalytics: true,
  enableLogging: true,
};

// Reducer for managing delete resume state
const deleteResumeReducer = (
  state: DeleteResumeState,
  action: DeleteResumeAction
): DeleteResumeState => {
  switch (action.type) {
    case "START_DELETE":
      return {
        ...state,
        status: "deleting",
        currentResumeId: action.resumeId,
        error: null,
      };
    case "DELETE_SUCCESS":
      return {
        ...state,
        status: "success",
        currentResumeId: null,
        error: null,
        retryCount: 0,
      };
    case "DELETE_ERROR":
      return {
        ...state,
        status: "error",
        error: action.error,
        retryCount: state.retryCount + 1,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
        status: "idle",
      };
    case "RESET":
      return {
        status: "idle",
        currentResumeId: null,
        error: null,
        retryCount: 0,
        maxRetries: state.maxRetries,
      };
    default:
      return state;
  }
};

export const useDeleteResume = (
  config: Partial<DeleteResumeConfig> = {}
): UseDeleteResumeReturn => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const [state, dispatch] = useReducer(deleteResumeReducer, {
    status: "idle",
    currentResumeId: null,
    error: null,
    retryCount: 0,
    maxRetries: finalConfig.maxRetries,
  });

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  const deleteResume = useCallback(
    async (resumeId: string): Promise<void> => {
      dispatch({ type: "START_DELETE", resumeId });

      try {
        const response =
          await axiosInstance.delete<DeleteResumeSuccessResponse>(
            `/resumes/${resumeId}`,
            {
              timeout: finalConfig.timeout,
            }
          );

        if (isDeleteResumeErrorResponse(response.data)) {
          throw response.data;
        }

        dispatch({ type: "DELETE_SUCCESS", resumeId });

        if (finalConfig.enableAnalytics) {
          // Track successful deletion
          console.warn("Resume deleted successfully:", resumeId);
        }
      } catch (error: unknown) {
        let errorResponse: DeleteResumeErrorResponse;

        if (isDeleteResumeErrorResponse(error)) {
          errorResponse = error;
        } else if (isAxiosError(error)) {
          const axiosError = error as {
            response?: { data?: DeleteResumeErrorResponse };
          };
          if (axiosError.response?.data) {
            errorResponse = axiosError.response.data;
          } else {
            errorResponse = {
              error:
                "Network error. Please check your connection and try again.",
              code: "NETWORK_ERROR",
              retryable: true,
              details: "Failed to connect to server",
            };
          }
        } else {
          errorResponse = {
            error: "An unexpected error occurred",
            code: "UNKNOWN_ERROR",
            retryable: true,
            details: error instanceof Error ? error.message : "Unknown error",
          };
        }

        dispatch({ type: "DELETE_ERROR", error: errorResponse });

        if (finalConfig.enableLogging) {
          console.error("Delete resume error:", errorResponse);
        }
      }
    },
    [
      finalConfig.timeout,
      finalConfig.enableAnalytics,
      finalConfig.enableLogging,
    ]
  );

  return {
    deleteResume,
    isDeleting: state.status === "deleting",
    error: state.error,
    clearError,
  };
};

// Hook for managing resume list with delete functionality
export const useResumeListWithDelete = (): {
  resumes: unknown[];
  loading: boolean;
  error: string | null;
  refreshResumes: () => Promise<void>;
  deleteResume: (resumeId: string) => Promise<void>;
  checkResumeUsage: (resumeId: string) => Promise<boolean>;
  isDeleting: boolean;
  clearError: () => void;
} => {
  const [resumes, setResumes] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_resumesInUse, setResumesInUse] = useState<Set<string>>(new Set());

  const {
    deleteResume,
    isDeleting,
    error: deleteError,
    clearError,
  } = useDeleteResume();

  const refreshResumes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get("/resumes");
      setResumes(response.data);
    } catch {
      setError("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }, []);

  const checkResumeUsage = useCallback(
    async (resumeId: string): Promise<boolean> => {
      try {
        const response = await axiosInstance.get(`/resumes/${resumeId}/usage`);
        const isInUse = response.data.isInUse;

        setResumesInUse(prev => {
          const newSet = new Set(prev);
          if (isInUse) {
            newSet.add(resumeId);
          } else {
            newSet.delete(resumeId);
          }
          return newSet;
        });

        return isInUse;
      } catch (err) {
        console.error("Failed to check resume usage:", err);
        return false;
      }
    },
    []
  );

  const handleDeleteResume = useCallback(
    async (resumeId: string) => {
      try {
        await deleteResume(resumeId);
        // Refresh the list after successful deletion
        await refreshResumes();
        // Update usage status
        await checkResumeUsage(resumeId);
      } catch (err) {
        // Error is already handled by the deleteResume hook
        console.error("Delete failed:", err);
      }
    },
    [deleteResume, refreshResumes, checkResumeUsage]
  );

  return {
    resumes,
    loading,
    error: error || deleteError?.error || null,
    refreshResumes,
    deleteResume: handleDeleteResume,
    checkResumeUsage,
    isDeleting,
    clearError,
  };
};
