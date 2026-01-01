"use client";

import { Trash2, RefreshCw } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axios";
import {
  isDeleteResumeErrorResponse,
  isRetryableError,
  isNonRetryableError,
  type DeleteResumeDialogProps,
  type DeleteResumeErrorResponse,
} from "@/lib/types";

export const DeleteResumeDialog = ({
  resumeId,
  resumeTitle,
  onDeleted,
  isInUse = false,
}: DeleteResumeDialogProps): React.ReactElement => {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<DeleteResumeErrorResponse | null>(
    null
  );

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second

  const delay = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

  const handleDelete = async (isRetry = false): Promise<void> => {
    try {
      setIsDeleting(true);
      setLastError(null);

      if (isRetry) {
        await delay(RETRY_DELAY * retryCount);
      }

      const response = await axiosInstance.delete(`/resumes/${resumeId}`);

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Resume deleted successfully",
        });
        onDeleted();
        setIsOpen(false);
        setRetryCount(0);
        setLastError(null);
      }
    } catch (error: unknown) {
      console.error("Error deleting resume:", error);

      let errorResponse: DeleteResumeErrorResponse | null = null;

      // Handle specific error responses
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: DeleteResumeErrorResponse;
            status?: number;
          };
        };

        if (axiosError.response?.data) {
          errorResponse = axiosError.response.data;
        } else {
          // Handle network errors
          errorResponse = {
            error: "Network error. Please check your connection and try again.",
            code: "NETWORK_ERROR",
            retryable: true,
            details: "Failed to connect to server",
          };
        }
      } else if (error instanceof Error) {
        // Handle other errors
        if (
          error.message.includes("timeout") ||
          error.message.includes("TIMEOUT")
        ) {
          errorResponse = {
            error: "Request timed out. Please try again.",
            code: "TIMEOUT_ERROR",
            retryable: true,
            details: error.message,
          };
        } else if (
          error.message.includes("network") ||
          error.message.includes("fetch")
        ) {
          errorResponse = {
            error: "Network error. Please check your connection and try again.",
            code: "NETWORK_ERROR",
            retryable: true,
            details: error.message,
          };
        } else {
          errorResponse = {
            error: "An unexpected error occurred while deleting the resume",
            code: "UNKNOWN_ERROR",
            retryable: true,
            details: error.message,
          };
        }
      } else {
        errorResponse = {
          error: "An unexpected error occurred while deleting the resume",
          code: "UNKNOWN_ERROR",
          retryable: true,
          details: "Unknown error occurred",
        };
      }

      setLastError(errorResponse);

      // Use type guards for better error handling
      if (isDeleteResumeErrorResponse(errorResponse)) {
        // Show appropriate error message based on error type
        if (isRetryableError(errorResponse)) {
          toast({
            title: `Error: ${errorResponse.code}`,
            description: `${errorResponse.error} You can try again.`,
            variant: "destructive",
          });
        } else if (isNonRetryableError(errorResponse)) {
          toast({
            title: `Error: ${errorResponse.code}`,
            description: errorResponse.error,
            variant: "destructive",
          });
          setIsOpen(false);
        }
      } else {
        // Fallback for unexpected error format
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRetry = (): void => {
    setRetryCount(prev => prev + 1);
    void handleDelete(true);
  };

  const handleDialogClose = (open: boolean): void => {
    if (!open && !isDeleting) {
      setRetryCount(0);
      setLastError(null);
    }
    setIsOpen(open);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleDialogClose}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
          aria-label={`Delete resume: ${resumeTitle}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Resume</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>"{resumeTitle}"</strong>?
            This action cannot be undone.
            {isInUse && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                <strong>Warning:</strong> This resume is currently being used in
                job applications. Deleting it will remove it from all
                applications.
              </div>
            )}
            {lastError && lastError.retryable && retryCount < MAX_RETRIES && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                <strong>Previous attempt failed:</strong> {lastError.error}
                {lastError.details && (
                  <div className="mt-1 text-xs text-amber-600">
                    {lastError.details}
                  </div>
                )}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          {lastError && lastError.retryable && retryCount < MAX_RETRIES ? (
            <Button
              onClick={handleRetry}
              disabled={isDeleting}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry ({retryCount + 1}/{MAX_RETRIES})
                </>
              )}
            </Button>
          ) : (
            <AlertDialogAction
              onClick={() => void handleDelete()}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
