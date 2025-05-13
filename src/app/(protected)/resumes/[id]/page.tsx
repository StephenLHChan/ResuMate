"use client";

import { FileText } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import ResumeForm from "@/components/resume/ResumeForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axios";
import { type ResumeData } from "@/lib/types";

const EditResumePage = (): React.ReactElement => {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ResumeData>({
    summary: "",
    experience: [],
    education: [],
    certifications: [],
    skills: [],
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    title: "",
    professionalTitle: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async (): Promise<void> => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/resumes/${id}`);
        setFormData(data);
      } catch (error) {
        console.error("Error fetching resume:", error);
        toast({
          title: "Error",
          description: "Failed to load resume",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchResume();
  }, [id, toast]);

  const handleSubmit = async (data: ResumeData): Promise<void> => {
    try {
      await axiosInstance.put(`/resumes/${id}`, data);
      toast({
        title: "Success",
        description: "Resume updated successfully",
      });
      router.push("/resumes");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update resume";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Edit Resume</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resume Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ResumeForm
            initialData={formData}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/resumes")}
            submitButtonText="Save Changes"
            showCancelButton
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditResumePage;
