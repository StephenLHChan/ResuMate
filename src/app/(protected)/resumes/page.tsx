"use client";

import { type Resume } from "@prisma/client";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

import { DeleteResumeDialog } from "@/components/resume/DeleteResumeDialog";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axios";

const ResumePage = (): React.ReactElement => {
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [_loading, setLoading] = useState(true);
  const [resumesInUse, setResumesInUse] = useState<Set<string>>(new Set());

  const fetchResumes = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get("/resumes", {
        params: {
          pageSize: 20,
        },
      });
      setResumes(data.items);
    } catch (error) {
      console.error("Error fetching resumes:", error);
      toast({
        title: "Error",
        description: "Failed to load resumes",
        variant: "destructive",
      });
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const checkResumesInUse = useCallback(async (): Promise<void> => {
    try {
      const { data } = await axiosInstance.get("/applications");
      const inUseResumes = new Set<string>();

      data.items.forEach(
        (application: { resumes?: Array<{ resume: { id: string } }> }) => {
          if (application.resumes) {
            application.resumes.forEach(
              (resumeLink: { resume: { id: string } }) => {
                inUseResumes.add(resumeLink.resume.id);
              }
            );
          }
        }
      );

      setResumesInUse(inUseResumes);
    } catch (error) {
      console.error("Error checking resumes in use:", error);
      // Don't show error toast for this as it's not critical
    }
  }, []);

  const handleResumeDeleted = useCallback((): void => {
    // Refresh the resume list
    void fetchResumes();
    // Refresh the in-use status
    void checkResumesInUse();
  }, [fetchResumes, checkResumesInUse]);

  useEffect(() => {
    void fetchResumes();
    void checkResumesInUse();
  }, [fetchResumes, checkResumesInUse]);

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Resumes</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Create New Resume Card */}
        <Link href="/resumes/create">
          <Card className="h-[200px] hover:bg-accent/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-full gap-2">
              <Plus className="h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Create new resume</p>
            </CardContent>
          </Card>
        </Link>

        {/* Existing Resumes */}
        {resumes?.map(resume => {
          const isInUse = resumesInUse.has(resume.id);
          return (
            <Card
              key={resume.id}
              className="h-[200px] hover:bg-accent/50 transition-colors relative group"
            >
              <CardContent className="flex flex-col h-full p-4">
                <div className="flex-1">
                  <h3 className="font-semibold truncate">
                    {resume.title || "Untitled Resume"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Last modified:{" "}
                    {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                  {isInUse && (
                    <p className="text-xs text-amber-600 mt-1">
                      In use by applications
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Resume</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/resumes/${resume.id}`}>
                      <button className="text-sm text-primary hover:underline">
                        Edit
                      </button>
                    </Link>
                    <DeleteResumeDialog
                      resumeId={resume.id}
                      resumeTitle={resume.title || "Untitled Resume"}
                      onDeleted={handleResumeDeleted}
                      disabled={isInUse}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ResumePage;
