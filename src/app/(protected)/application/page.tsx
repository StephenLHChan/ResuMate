"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface Application {
  id: string;
  company: string;
  position: string;
  jobDescription: string;
  requirements: string[];
  resumeUrl: string | null;
  coverLetterUrl: string | null;
  status: string;
  notes: string | null;
  jobUrl: string | null;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const ApplicationPage = (): React.ReactElement => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [inputType, setInputType] = useState<"text" | "url">("text");
  const [jobInput, setJobInput] = useState("");
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchApplications = async (page = 1): Promise<void> => {
    try {
      const response = await fetch(`/api/applications?page=${page}`);
      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }
      const data = await response.json();
      setApplications(data.applications);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching applications:", error);
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
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First process the job information
      const processResponse = await fetch("/api/process-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: inputType,
          content: jobInput,
        }),
      });

      if (!processResponse.ok) {
        throw new Error("Failed to process job information");
      }

      const jobInfo = await processResponse.json();

      // Then create an application record
      const applicationResponse = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobInfo,
          resumeUrl: null,
          coverLetterUrl: null,
        }),
      });

      if (!applicationResponse.ok) {
        throw new Error("Failed to create application");
      }

      const newApplication = await applicationResponse.json();
      setApplications(prev => [newApplication, ...prev]);

      // Clear the input
      setJobInput("");

      toast({
        title: "Success",
        description: "Application created successfully",
      });
    } catch (error) {
      console.error("Error processing job:", error);
      toast({
        title: "Error",
        description: "Failed to process job information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      const response = await fetch(`/api/generate-${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName: application.company,
          position: application.position,
          description: application.jobDescription,
          requirements: application.requirements,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ${type}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Update the application with the new URL
      const updateResponse = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [`${type}Url`]: url,
        }),
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update ${type} URL`);
      }

      const updatedApplication = await updateResponse.json();

      // Update the applications list
      setApplications(prev =>
        prev.map(app => (app.id === applicationId ? updatedApplication : app))
      );

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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Job Application Assistant</h1>
        <ApplicationForm onSuccess={() => fetchApplications(pagination.page)}>
          <Button>Add Application Manually</Button>
        </ApplicationForm>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Input Job Information</CardTitle>
          <CardDescription>
            Paste the job description or provide a URL to analyze
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Tabs
              defaultValue="text"
              onValueChange={value => setInputType(value as "text" | "url")}
            >
              <TabsList>
                <TabsTrigger value="text">Job Description</TabsTrigger>
                <TabsTrigger value="url">Job URL</TabsTrigger>
              </TabsList>
              <TabsContent value="text">
                <Textarea
                  placeholder="Paste the full job description here..."
                  value={jobInput}
                  onChange={e => setJobInput(e.target.value)}
                  className="min-h-[200px]"
                />
              </TabsContent>
              <TabsContent value="url">
                <Input
                  type="url"
                  placeholder="Enter the job posting URL..."
                  value={jobInput}
                  onChange={e => setJobInput(e.target.value)}
                />
              </TabsContent>
            </Tabs>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Add Application"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Applications</CardTitle>
          <CardDescription>
            View your job applications and generate tailored documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingApplications ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
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
                                {application.position}
                              </CardTitle>
                              <CardDescription>
                                {application.company}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <ApplicationForm
                              application={application}
                              onSuccess={() =>
                                fetchApplications(pagination.page)
                              }
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
                                <DropdownMenuItem
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(
                                        `/api/applications/${application.id}`,
                                        {
                                          method: "PATCH",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            status: "pending",
                                          }),
                                        }
                                      );

                                      if (!response.ok) {
                                        throw new Error(
                                          "Failed to update status"
                                        );
                                      }

                                      const updatedApplication =
                                        await response.json();
                                      setApplications(prev =>
                                        prev.map(app =>
                                          app.id === application.id
                                            ? updatedApplication
                                            : app
                                        )
                                      );

                                      toast({
                                        title: "Success",
                                        description:
                                          "Status updated to Pending",
                                      });
                                    } catch (error) {
                                      console.error(
                                        "Error updating status:",
                                        error
                                      );
                                      toast({
                                        title: "Error",
                                        description: "Failed to update status",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(
                                        `/api/applications/${application.id}`,
                                        {
                                          method: "PATCH",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            status: "applied",
                                          }),
                                        }
                                      );

                                      if (!response.ok) {
                                        throw new Error(
                                          "Failed to update status"
                                        );
                                      }

                                      const updatedApplication =
                                        await response.json();
                                      setApplications(prev =>
                                        prev.map(app =>
                                          app.id === application.id
                                            ? updatedApplication
                                            : app
                                        )
                                      );

                                      toast({
                                        title: "Success",
                                        description:
                                          "Status updated to Applied",
                                      });
                                    } catch (error) {
                                      console.error(
                                        "Error updating status:",
                                        error
                                      );
                                      toast({
                                        title: "Error",
                                        description: "Failed to update status",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  Applied
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(
                                        `/api/applications/${application.id}`,
                                        {
                                          method: "PATCH",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            status: "rejected",
                                          }),
                                        }
                                      );

                                      if (!response.ok) {
                                        throw new Error(
                                          "Failed to update status"
                                        );
                                      }

                                      const updatedApplication =
                                        await response.json();
                                      setApplications(prev =>
                                        prev.map(app =>
                                          app.id === application.id
                                            ? updatedApplication
                                            : app
                                        )
                                      );

                                      toast({
                                        title: "Success",
                                        description:
                                          "Status updated to Rejected",
                                      });
                                    } catch (error) {
                                      console.error(
                                        "Error updating status:",
                                        error
                                      );
                                      toast({
                                        title: "Error",
                                        description: "Failed to update status",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  Rejected
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(
                                        `/api/applications/${application.id}`,
                                        {
                                          method: "PATCH",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            status: "accepted",
                                          }),
                                        }
                                      );

                                      if (!response.ok) {
                                        throw new Error(
                                          "Failed to update status"
                                        );
                                      }

                                      const updatedApplication =
                                        await response.json();
                                      setApplications(prev =>
                                        prev.map(app =>
                                          app.id === application.id
                                            ? updatedApplication
                                            : app
                                        )
                                      );

                                      toast({
                                        title: "Success",
                                        description:
                                          "Status updated to Accepted",
                                      });
                                    } catch (error) {
                                      console.error(
                                        "Error updating status:",
                                        error
                                      );
                                      toast({
                                        title: "Error",
                                        description: "Failed to update status",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                >
                                  Accepted
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex gap-2">
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
                                generateDocument(application.id, "cover-letter")
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
                      </CardHeader>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold">Description</h3>
                              <p className="whitespace-pre-wrap">
                                {application.jobDescription}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold">Requirements</h3>
                              <ul className="list-disc pl-5">
                                {application.requirements.map((req, index) => (
                                  <li key={index}>{req}</li>
                                ))}
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
                    onClick={() => fetchApplications(pagination.page - 1)}
                    disabled={!pagination.hasPreviousPage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchApplications(pagination.page + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    Next
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
