"use client";

import { ChevronDown, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

import type { APIResponse } from "@/lib/types";
import type { Prisma } from "@prisma/client";

type JobWithApplications = Prisma.JobGetPayload<{
  include: { applications: true };
}>;

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  nextPageKey?: string;
  totalCount: number;
}

export const JobList = (): React.ReactElement => {
  const [jobs, setJobs] = useState<JobWithApplications[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalCount: 0,
  });
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [loadingJobId, setLoadingJobId] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(
        `/api/jobs?pageSize=${pagination.pageSize}${
          pagination.nextPageKey ? `&nextPageKey=${pagination.nextPageKey}` : ""
        }`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data: APIResponse<JobWithApplications> = await response.json();

      // If this is the initial load (no nextPageKey), replace the list
      // Otherwise, append to the existing list
      setJobs(prevJobs =>
        pagination.nextPageKey ? [...prevJobs, ...data.items] : data.items
      );

      setPagination(prev => ({
        ...prev,
        nextPageKey: data.nextPageKey,
        totalCount: data.totalCount,
      }));
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to load jobs. Please try again.");
      toast({
        title: "Error",
        description: "Failed to load jobs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = (): void => {
    if (pagination.nextPageKey) {
      fetchJobs();
    }
  };

  const handleAddToApplication = async (jobId: string): Promise<void> => {
    setLoadingJobId(jobId);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobId }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.error === "Please create a profile first") {
          toast({
            title: "Error",
            description: "Please create a profile first",
            variant: "destructive",
          });
          router.push("/profile");
          return;
        }
        throw new Error("Failed to add job to applications");
      }

      toast({
        title: "Success",
        description: "Job added to applications",
      });
      // Refresh the jobs list to update the status
      fetchJobs();
    } catch (error) {
      console.error("Error adding job to application:", error);
      toast({
        title: "Error",
        description: "Failed to add job to applications",
        variant: "destructive",
      });
    } finally {
      setLoadingJobId(null);
    }
  };

  const deleteJobFromThisUser = (id: string): void => {
    if (!confirm("Are you sure you want to remove this job from your list?")) {
      return;
    }

    setLoadingJobId(id);

    fetch(`/api/jobs/${id}/user-link`, {
      method: "DELETE",
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to unlink job");
        }
        toast({
          title: "Success",
          description: "Job removed successfully",
        });
        setJobs(prev => prev.filter(job => job.id !== id));
      })
      .catch(error => {
        console.error("Error unlinking job:", error);
        toast({
          title: "Error",
          description: "Failed to remove job",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoadingJobId(null);
      });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32 mt-2" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="text-destructive">{error}</div>
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                fetchJobs();
              }}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map(job => (
        <Collapsible key={job.id} className="space-y-1">
          <Card>
            <CardHeader className="pb-1">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </CollapsibleTrigger>
                  <div>
                    <CardTitle className="text-base">{job.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {job.companyName}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  {job.applications.length === 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleAddToApplication(job.id)}
                      disabled={loadingJobId === job.id}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => deleteJobFromThisUser(job.id)}
                    disabled={loadingJobId === job.id}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant={
                    job.applications.length > 0 ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {job.applications.length > 0
                    ? "Added to Application"
                    : "Not Added"}
                </Badge>
                {job.location && (
                  <Badge variant="outline" className="text-xs">
                    {job.location}
                  </Badge>
                )}
                {(job.salaryMin || job.salaryMax) && (
                  <Badge variant="outline" className="text-xs">
                    ${job.salaryMin?.toLocaleString() ?? "N/A"} - $
                    {job.salaryMax?.toLocaleString() ?? "N/A"}
                  </Badge>
                )}
                {job.postingDate && (
                  <Badge variant="outline" className="text-xs">
                    Posted: {new Date(job.postingDate).toLocaleDateString()}
                  </Badge>
                )}
                {job.applicationDeadline && (
                  <Badge variant="outline" className="text-xs">
                    Deadline:{" "}
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                {job.description && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {job.description}
                    </p>
                  </div>
                )}
                {job.duties && job.duties.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Duties</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {job.duties.map((duty, index) => (
                        <li key={index}>{duty}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {job.requirements && job.requirements.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Requirements</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {job.applicationInstructions && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">How to Apply</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {job.applicationInstructions}
                    </p>
                  </div>
                )}
                {job.applicationWebsite && (
                  <div>
                    <a
                      href={job.applicationWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      Apply on Company Website
                    </a>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          onClick={() =>
            setPagination(prev => ({ ...prev, page: prev.page - 1 }))
          }
          disabled={pagination.page === 1}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {pagination.page} of{" "}
          {Math.ceil(pagination.totalCount / pagination.pageSize)}
        </span>
        <Button
          variant="outline"
          onClick={loadMore}
          disabled={!pagination.nextPageKey}
        >
          Load More
        </Button>
      </div>
    </div>
  );
};
