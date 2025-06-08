"use client";

import { Briefcase, Loader2 } from "lucide-react";
import { useState } from "react";

import { JobList } from "@/components/jobs/job-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axios";

const JobsPage = (): React.ReactElement => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [inputType, setInputType] = useState<"text" | "url" | "manual">("url");
  const [jobInput, setJobInput] = useState("");
  const [manualJob, setManualJob] = useState({
    title: "",
    company: "",
    description: "",
    duties: "",
    requirements: "",
    salaryMin: "",
    salaryMax: "",
    location: "",
    postingDate: "",
    applicationDeadline: "",
    applicationInstructions: "",
    applicationWebsite: "",
  });

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let jobInfo;
      if (inputType === "manual") {
        jobInfo = {
          title: manualJob.title,
          companyName: manualJob.company,
          description: manualJob.description,
          duties: manualJob.duties.split("\n").filter(Boolean),
          requirements: manualJob.requirements.split("\n").filter(Boolean),
          salaryMin: manualJob.salaryMin
            ? parseInt(manualJob.salaryMin)
            : undefined,
          salaryMax: manualJob.salaryMax
            ? parseInt(manualJob.salaryMax)
            : undefined,
          location: manualJob.location || undefined,
          postingDate: manualJob.postingDate
            ? new Date(manualJob.postingDate)
            : undefined,
          applicationDeadline: manualJob.applicationDeadline
            ? new Date(manualJob.applicationDeadline)
            : undefined,
          applicationInstructions:
            manualJob.applicationInstructions || undefined,
          applicationWebsite: manualJob.applicationWebsite || undefined,
        };
      } else {
        const { data: processedJob } = await axiosInstance.post(
          "/jobs/process",
          {
            type: inputType,
            content: jobInput,
          }
        );

        jobInfo = {
          title: processedJob.title,
          companyName: processedJob.companyName,
          description: processedJob.description,
          duties: processedJob.duties,
          requirements: processedJob.requirements,
          salaryMin: processedJob.salaryMin || undefined,
          salaryMax: processedJob.salaryMax || undefined,
          location: processedJob.location || undefined,
          postingDate: processedJob.postingDate || undefined,
          applicationDeadline: processedJob.applicationDeadline || undefined,
          applicationInstructions:
            processedJob.applicationInstructions || undefined,
          applicationWebsite: processedJob.applicationWebsite || undefined,
        };
      }

      // Create the job record
      const { data: newJob } = await axiosInstance.post("/jobs", {
        ...jobInfo,
        url: inputType === "url" ? jobInput : null,
      });

      await axiosInstance.post(`/jobs/${newJob.id}/user-link`);

      toast({
        title: "Success",
        description: "Job created successfully",
      });

      setJobInput("");
      setManualJob({
        title: "",
        company: "",
        description: "",
        duties: "",
        requirements: "",
        salaryMin: "",
        salaryMax: "",
        location: "",
        postingDate: "",
        applicationDeadline: "",
        applicationInstructions: "",
        applicationWebsite: "",
      });
      setInputType("url");
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job",
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
                defaultValue="url"
                onValueChange={value =>
                  setInputType(value as "text" | "url" | "manual")
                }
              >
                <TabsList>
                  <TabsTrigger value="url">Job URL</TabsTrigger>
                  <TabsTrigger value="text">Job Description</TabsTrigger>
                  <TabsTrigger value="manual">Manual Input</TabsTrigger>
                </TabsList>
                <TabsContent value="url">
                  <Input
                    type="url"
                    placeholder="Enter the job posting URL..."
                    value={jobInput}
                    onChange={e => setJobInput(e.target.value)}
                  />
                </TabsContent>
                <TabsContent value="text">
                  <Textarea
                    placeholder="Paste the full job description here..."
                    value={jobInput}
                    onChange={e => setJobInput(e.target.value)}
                    className="min-h-[200px]"
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
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="Minimum Salary"
                        value={manualJob.salaryMin}
                        onChange={e =>
                          setManualJob({
                            ...manualJob,
                            salaryMin: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Maximum Salary"
                        value={manualJob.salaryMax}
                        onChange={e =>
                          setManualJob({
                            ...manualJob,
                            salaryMax: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Input
                      placeholder="Location"
                      value={manualJob.location}
                      onChange={e =>
                        setManualJob({
                          ...manualJob,
                          location: e.target.value,
                        })
                      }
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="date"
                        placeholder="Posting Date"
                        value={manualJob.postingDate}
                        onChange={e =>
                          setManualJob({
                            ...manualJob,
                            postingDate: e.target.value,
                          })
                        }
                      />
                      <Input
                        type="date"
                        placeholder="Application Deadline"
                        value={manualJob.applicationDeadline}
                        onChange={e =>
                          setManualJob({
                            ...manualJob,
                            applicationDeadline: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Textarea
                      placeholder="Job Description"
                      value={manualJob.description}
                      onChange={e =>
                        setManualJob({
                          ...manualJob,
                          description: e.target.value,
                        })
                      }
                      className="min-h-[100px]"
                    />
                    <Textarea
                      placeholder="Job Duties (one per line)"
                      value={manualJob.duties}
                      onChange={e =>
                        setManualJob({
                          ...manualJob,
                          duties: e.target.value,
                        })
                      }
                      className="min-h-[100px]"
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
                      className="min-h-[100px]"
                    />
                    <Textarea
                      placeholder="Application Instructions"
                      value={manualJob.applicationInstructions}
                      onChange={e =>
                        setManualJob({
                          ...manualJob,
                          applicationInstructions: e.target.value,
                        })
                      }
                      className="min-h-[100px]"
                    />
                    <Input
                      type="url"
                      placeholder="Application Website URL"
                      value={manualJob.applicationWebsite}
                      onChange={e =>
                        setManualJob({
                          ...manualJob,
                          applicationWebsite: e.target.value,
                        })
                      }
                    />
                  </div>
                </TabsContent>
              </Tabs>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Processing..." : "Add Job"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <JobList />
      </div>
    </div>
  );
};

export default JobsPage;
