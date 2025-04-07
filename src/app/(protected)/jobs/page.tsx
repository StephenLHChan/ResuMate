"use client";

import { JobList } from "@/components/jobs/job-list";
import { AddJobButton } from "@/components/jobs/add-job-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tabs } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Briefcase, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function JobsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [inputType, setInputType] = useState<"text" | "url" | "manual">("text");
  const [jobInput, setJobInput] = useState("");
  const [manualJob, setManualJob] = useState({
    title: "",
    company: "",
    description: "",
    requirements: "",
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let jobInfo;
      if (inputType === "manual") {
        jobInfo = {
          title: manualJob.title,
          company: manualJob.company,
          description: manualJob.description,
          requirements: manualJob.requirements.split("\n").filter(Boolean),
        };
      } else {
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

        const processedJob = await processResponse.json();
        jobInfo = {
          title: processedJob.position,
          companyName: processedJob.companyName,
          description: processedJob.description,
          requirements: processedJob.requirements,
        };
      }

      // Create the job record
      const jobResponse = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...jobInfo,
          url: inputType === "url" ? jobInput : null,
        }),
      });

      if (!jobResponse.ok) {
        throw new Error("Failed to create job");
      }

      const newJob = await jobResponse.json();

      // Clear the input
      setJobInput("");
      setManualJob({
        title: "",
        company: "",
        description: "",
        requirements: "",
      });

      toast({
        title: "Success",
        description: "Job created successfully",
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

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Jobs</h1>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Job Information</CardTitle>
            <CardDescription>
              Paste the job description or provide a URL to analyze or add a job
              manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs
                defaultValue="text"
                onValueChange={value =>
                  setInputType(value as "text" | "url" | "manual")
                }
              >
                <TabsList>
                  <TabsTrigger value="text">Job Description</TabsTrigger>
                  <TabsTrigger value="url">Job URL</TabsTrigger>
                  <TabsTrigger value="manual">Manual Input</TabsTrigger>
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
                <TabsContent value="manual">
                  <div className="space-y-4">
                    <Input
                      placeholder="Job Title"
                      value={manualJob.title}
                      onChange={e =>
                        setManualJob({ ...manualJob, title: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Company Name"
                      value={manualJob.company}
                      onChange={e =>
                        setManualJob({
                          ...manualJob,
                          company: e.target.value,
                        })
                      }
                    />
                    <Textarea
                      placeholder="Job Description"
                      value={manualJob.description}
                      onChange={e =>
                        setManualJob({
                          ...manualJob,
                          description: e.target.value,
                        })
                      }
                    />
                    <Textarea
                      placeholder="Requirements (one per line)"
                      value={manualJob.requirements}
                      onChange={e =>
                        setManualJob({
                          ...manualJob,
                          requirements: e.target.value,
                        })
                      }
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <Button type="submit" disabled={isLoading} className="w-full">
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
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Jobs</CardTitle>
            <CardDescription>
              View and manage your job applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <JobList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
