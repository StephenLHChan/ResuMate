"use client";

import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Pencil,
  Send,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

import ApplicationForm from "@/components/application-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

import type { ApplicationWithRelations, APIResponse } from "@/lib/types";

interface PaginationInfo {
  total: number;
  nextPageKey: string | null;
}

const ApplicationSkeleton = (): React.ReactElement => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      <div className="flex items-center gap-4 mt-2">
        <Skeleton className="h-6 w-24" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ApplicationPage = (): React.ReactElement => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [applications, setApplications] = useState<ApplicationWithRelations[]>(
    []
  );
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    nextPageKey: null,
  });

  const fetchApplications = async (nextPageKey?: string): Promise<void> => {
    try {
      const url = new URL("/api/applications", window.location.origin);
      if (nextPageKey) {
        url.searchParams.set("nextPageKey", nextPageKey);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      const data: APIResponse<ApplicationWithRelations> = await response.json();
      setApplications(prev =>
        nextPageKey ? [...prev, ...(data.items || [])] : data.items || []
      );
      setPagination({
        total: data.totalCount || 0,
        nextPageKey: data.nextPageKey || null,
      });
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]); // Set empty array on error
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      });
    } finally {
      setIsLoadingApplications(false);
    }
  };

  useEffect(() => {
    void fetchApplications();
  }, []);

  const generateDocument = async (
    applicationId: string,
    type: "resume" | "cover-letter"
  ): Promise<void> => {
    setIsLoading(true);

    try {
      // Find the application to get job info
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        throw new Error("Application not found");
      }

      // Generate the document
      const response = await fetch(`/api/${type}s/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId,
          jobInfo: {
            companyName: application.job.companyName,
            position: application.job.title,
            description: application.job.description,
            requirements: application.job.requirements,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ${type}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // If it's a resume, update the application with the new resume
      if (type === "resume") {
        const resumeId = response.headers.get("X-Resume-Id");
        if (resumeId) {
          // Refresh the applications to get the updated resume list
          await fetchApplications();
        }
      }

      // Download the file
      const a = document.createElement("a");
      a.href = url;
      a.download = `tailored-${type}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `${
          type.charAt(0).toUpperCase() + type.slice(1)
        } generated successfully`,
      });
    } catch (error) {
      console.error(`Error generating ${type}:`, error);
      toast({
        title: "Error",
        description: `Failed to generate ${type}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteApplication = async (applicationId: string): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete application");
      }

      setApplications(prev => prev.filter(app => app.id !== applicationId));
      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting application:", error);
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const reprintResume = async (
    applicationId: string,
    resumeId: string
  ): Promise<void> => {
    setIsLoading(true);

    try {
      // Find the application to get resume content
      const application = applications.find(app => app.id === applicationId);
      if (!application) {
        throw new Error("Application not found");
      }

      const resume = application.resumes.find(r => r.resume.id === resumeId);
      if (!resume) {
        throw new Error("Resume not found");
      }

      // Generate the PDF
      const response = await fetch("/api/resumes/reprint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeContent: resume.resume.content,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reprint resume");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Download the file
      const a = document.createElement("a");
      a.href = url;
      a.download = `tailored-resume.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Resume reprinted successfully",
      });
    } catch (error) {
      console.error("Error reprinting resume:", error);
      toast({
        title: "Error",
        description: "Failed to reprint resume",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string
  ): Promise<void> => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      const updatedApplication = await response.json();
      setApplications(prev =>
        prev.map(app => (app.id === applicationId ? updatedApplication : app))
      );

      toast({
        title: "Success",
        description: `Status updated to ${
          newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
        }`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const statusOptions = [
    { value: "pending", color: "text-yellow-600", label: "Pending" },
    { value: "applied", color: "text-blue-600", label: "Applied" },
    { value: "rejected", color: "text-red-600", label: "Rejected" },
    { value: "accepted", color: "text-green-600", label: "Accepted" },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Send className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Applications</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
          <CardDescription>
            View your job applications and generate tailored documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingApplications ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <ApplicationSkeleton key={index} />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No applications found. Add your first application above.
            </p>
          ) : (
            <>
              <div className="space-y-4">
                {applications.map(application => (
                  <Collapsible key={application.id} className="space-y-2">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </CollapsibleTrigger>
                            <div>
                              <CardTitle className="text-lg">
                                {application.job.title}
                              </CardTitle>
                              <CardDescription>
                                {application.job.companyName}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <ApplicationForm
                              application={application}
                              onSuccess={() => fetchApplications()}
                            >
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </ApplicationForm>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteApplication(application.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Status:</span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`text-sm ${
                                    application.status === "pending"
                                      ? "text-yellow-600"
                                      : application.status === "applied"
                                      ? "text-blue-600"
                                      : application.status === "rejected"
                                      ? "text-red-600"
                                      : "text-green-600"
                                  }`}
                                >
                                  {application.status.charAt(0).toUpperCase() +
                                    application.status.slice(1)}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                {statusOptions.map(
                                  ({ value, color, label }) => (
                                    <DropdownMenuItem
                                      key={value}
                                      className={color}
                                      onClick={() =>
                                        updateApplicationStatus(
                                          application.id,
                                          value
                                        )
                                      }
                                    >
                                      {label}
                                    </DropdownMenuItem>
                                  )
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold">Description</h3>
                              <p className="whitespace-pre-wrap">
                                {application.job.description}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Requirements</h3>
                              <ul className="list-disc pl-5">
                                {application.job.requirements.map(
                                  (req, index) => (
                                    <li key={index}>{req}</li>
                                  )
                                )}
                              </ul>
                            </div>
                            {application.notes && (
                              <div>
                                <h3 className="font-semibold">Notes</h3>
                                <p className="whitespace-pre-wrap">
                                  {application.notes}
                                </p>
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground">
                              Added on{" "}
                              {new Date(
                                application.createdAt
                              ).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2 pt-4">
                              {application.resumes &&
                                application.resumes.length > 0 && (
                                  <div className="flex gap-2">
                                    {application.resumes.map(
                                      ({ id, resume }) => (
                                        <Button
                                          key={id}
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            reprintResume(
                                              application.id,
                                              resume.id
                                            )
                                          }
                                          disabled={isLoading}
                                        >
                                          {isLoading ? (
                                            <>
                                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                              Reprinting...
                                            </>
                                          ) : (
                                            `Reprint ${resume.title}`
                                          )}
                                        </Button>
                                      )
                                    )}
                                  </div>
                                )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  generateDocument(application.id, "resume")
                                }
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  "Generate Resume"
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  generateDocument(
                                    application.id,
                                    "cover-letter"
                                  )
                                }
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                  </>
                                ) : (
                                  "Generate Cover Letter"
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {applications.length} of {pagination.total}{" "}
                  applications
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (pagination.nextPageKey) {
                        fetchApplications(pagination.nextPageKey);
                      }
                    }}
                    disabled={!pagination.nextPageKey}
                  >
                    Load More
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApplicationPage;
