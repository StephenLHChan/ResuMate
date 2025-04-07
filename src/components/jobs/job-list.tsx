"use client";

import { ChevronDown, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

interface Job {
  id: string;
  title: string;
  companyName: string;
  description: string;
  requirements: string[];
  jobUrl: string;
  createdAt: string;
  isAddedToApplication?: boolean;
}

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export const JobList = (): React.ReactElement => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 10,
    total: 0,
  });
  const router = useRouter();

  useEffect(() => {
    fetchJobs();
  }, [pagination.page]);

  const fetchJobs = async (): Promise<void> => {
    try {
      const response = await fetch(
        `/api/jobs?page=${pagination.page}&pageSize=${pagination.pageSize}`
      );
      if (!response.ok) throw new Error("Failed to fetch jobs");
      const data = await response.json();
      setJobs(data.jobs);
      setPagination(prev => ({ ...prev, total: data.total }));
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToApplication = async (jobId: string): Promise<void> => {
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
          toast.error("Please create a profile first");
          router.push("/profile");
          return;
        }
        throw new Error("Failed to add job to applications");
      }

      toast.success("Job added to applications");
      // Refresh the jobs list to update the status
      fetchJobs();
    } catch (error) {
      console.error("Error adding job to application:", error);
      toast.error("Failed to add job to applications");
    }
  };

  const deleteJobFromThisUser = (id: string): void => {
    if (!confirm("Are you sure you want to remove this job from your list?")) {
      return;
    }

    setIsLoading(true);

    fetch(`/api/jobs/${id}/user-link`, {
      method: "DELETE",
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to unlink job");
        }
        toast.success("Job removed successfully");
        setJobs(prev => prev.filter(job => job.id !== id));
      })
      .catch(error => {
        console.error("Error unlinking job:", error);
        toast.error("Failed to remove job");
      })
      .finally(() => {
        setIsLoading(false);
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

  return (
    <div className="space-y-4">
      {jobs.map(job => (
        <Collapsible key={job.id} className="space-y-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription>{job.companyName}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!job.isAddedToApplication && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAddToApplication(job.id)}
                      disabled={isLoading}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteJobFromThisUser(job.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <Badge
                  variant={job.isAddedToApplication ? "default" : "secondary"}
                >
                  {job.isAddedToApplication
                    ? "Added to Application"
                    : "Not Added"}
                </Badge>
              </div>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Description</h3>
                    <p className="whitespace-pre-wrap">{job.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">Requirements</h3>
                    <ul className="list-disc pl-5">
                      {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Added on {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
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
          {Math.ceil(pagination.total / pagination.pageSize)}
        </span>
        <Button
          variant="outline"
          onClick={() =>
            setPagination(prev => ({ ...prev, page: prev.page + 1 }))
          }
          disabled={pagination.page * pagination.pageSize >= pagination.total}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
