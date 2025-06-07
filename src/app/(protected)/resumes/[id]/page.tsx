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

  useEffect(() => {
    const fetchResume = async (): Promise<void> => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/resumes/${id}`);
        setFormData({
          ...data,
          workExperiences: data.workExperiences.map((exp: any) => ({
            company: exp.company,
            position: exp.position,
            startDate: new Date(exp.startDate),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            descriptions: exp.descriptions,
            isCurrent: exp.isCurrent,
          })),
          educations: data.educations.map((edu: any) => ({
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field,
            startDate: new Date(edu.startDate),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
          })),
          skills: data.skills.map((skill: any) => ({
            name: skill.name,
          })),
          certifications: data.certifications.map((cert: any) => ({
            name: cert.name,
            issuer: cert.issuer,
            issueDate: new Date(cert.issueDate),
            expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
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
  }, [id, toast]);

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
