"use client";

import { FileText, Printer, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

import { DeleteResumeDialog } from "@/components/resume/DeleteResumeDialog";
import ResumeForm from "@/components/resume/ResumeForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axios";
import { type ResumeData, type ResumeApiResponse } from "@/lib/types";

const EditResumePage = (): React.ReactElement => {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ResumeData>({
    summary: "",
    workExperiences: [],
    educations: [],
    skills: [],
    certifications: [],
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
  const [isPrinting, setIsPrinting] = useState(false);
  const [isInUse, setIsInUse] = useState(false);

  const checkResumeInUse = useCallback(async (): Promise<void> => {
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

      setIsInUse(inUseResumes.has(id as string));
    } catch (error) {
      console.error("Error checking if resume is in use:", error);
      // Don't show error toast for this as it's not critical
    }
  }, [id]);

  useEffect(() => {
    const fetchResume = async (): Promise<void> => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get<ResumeApiResponse>(
          `/resumes/${id}`
        );
        setFormData({
          ...data,
          workExperiences: data.workExperiences.map(exp => ({
            id: exp.id,
            company: exp.company,
            position: exp.position,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            descriptions: exp.descriptions,
            isCurrent: exp.isCurrent,
          })),
          educations: data.educations.map(edu => ({
            id: edu.id,
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
          })),
          skills: data.skills.map(skill => ({
            id: skill.id,
            name: skill.name,
          })),
          certifications: data.certifications.map(cert => ({
            id: cert.id,
            name: cert.name,
            issuer: cert.issuer,
            issueDate: new Date(cert.issueDate),
            expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
            credentialUrl: cert.credentialUrl,
          })),
        });
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
    void checkResumeInUse();
  }, [id, toast, checkResumeInUse]);

  const handleSubmit = async (data: ResumeData): Promise<void> => {
    try {
      const transformedData = {
        ...data,
        workExperiences: data.workExperiences.map(exp => ({
          ...exp,
          isCurrent: Boolean(exp.isCurrent),
        })),
      };

      await axiosInstance.put(`/resumes/${id}`, transformedData);
      toast({
        title: "Success",
        description: "Resume updated successfully",
      });
      router.push("/resumes");
    } catch (error) {
      console.error("Error updating resume:", error);
      toast({
        title: "Error",
        description: "Failed to update resume",
        variant: "destructive",
      });
    }
  };

  const handlePrint = async (): Promise<void> => {
    try {
      setIsPrinting(true);
      const response = await axiosInstance.post(
        `/resumes/print`,
        {
          resumeContent: JSON.stringify(formData),
        },
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${formData.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Resume downloaded successfully",
      });
    } catch (error) {
      console.error("Error printing resume:", error);
      toast({
        title: "Error",
        description: "Failed to print resume",
        variant: "destructive",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleResumeDeleted = (): void => {
    // Redirect to resume list after successful deletion
    router.push("/resumes");
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
          {isInUse && (
            <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
              In use by applications
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} disabled={isPrinting}>
            {isPrinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Printing...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" />
                Print Resume
              </>
            )}
          </Button>
          <DeleteResumeDialog
            resumeId={id as string}
            resumeTitle={formData.title || "Untitled Resume"}
            onDeleted={handleResumeDeleted}
            disabled={isInUse}
          />
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
            submitButtonText="Update Resume"
            showCancelButton
            onCancel={() => router.push("/resumes")}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditResumePage;
