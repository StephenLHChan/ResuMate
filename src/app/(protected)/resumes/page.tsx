"use client";

import { type Resume } from "@prisma/client";
import { Plus, FileText } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axios";

const ResumePage = (): React.ReactElement => {
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumes = async (): Promise<void> => {
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
    };

    fetchResumes();
  }, []);

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
        {resumes?.map(resume => (
          <Link key={resume.id} href={`/resumes/${resume.id}`}>
            <Card className="h-[200px] hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="flex flex-col h-full p-4">
                <div className="flex-1">
                  <h3 className="font-semibold truncate">
                    {resume.title || "Untitled Resume"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Last modified:{" "}
                    {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Resume</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ResumePage;
