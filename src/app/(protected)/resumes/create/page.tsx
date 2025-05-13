"use client";

import { FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axios";
import { resumeTemplate } from "@/lib/templates/resume-template";
import { type ProfileWithRelations, type ResumeData } from "@/lib/types";
import ResumeForm from "@/components/resume/ResumeForm";

const CreateResumePage = (): React.ReactElement => {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileWithRelations | null>(null);
  const [_loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        setLoading(true);
        const { data: profileData } = await axiosInstance.get("/profile");
        if (profileData && Object.keys(profileData).length > 0) {
          setProfile(profileData);
          setFormData(prev => ({
            ...prev,
            firstName:
              profileData.preferredFirstName ||
              profileData.legalFirstName ||
              "",
            lastName:
              profileData.preferredLastName || profileData.legalLastName || "",
            email: profileData.user?.email || "",
            phone: profileData.phone || "",
            location: profileData.location || "",
            website: profileData.website || "",
            linkedin: profileData.linkedin || "",
            github: profileData.github || "",
          }));
        } else {
          toast({
            title: "No Profile Information",
            description:
              "Consider filling out your profile information to save time when creating resumes.",
            duration: 5000,
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const handleSubmit = async (data: ResumeData): Promise<void> => {
    try {
      await axiosInstance.post("/resumes", data);
      toast({
        title: "Success",
        description: "Resume data saved successfully",
      });
      router.push("/resumes");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save resume data";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileText className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold">Create Your Resume</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Resume Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ResumeForm
              initialData={formData}
              onSubmit={handleSubmit}
              submitButtonText="Save Resume"
            />
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Resume Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="resume-preview-container">
              <iframe
                title="Resume Preview"
                className="resume-preview-content"
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                  padding: "10mm",
                  backgroundColor: "white",
                  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                  color: "#2c3e50",
                  transform: "scale(0.5)",
                  transformOrigin: "top center",
                  overflow: "hidden",
                  border: "none",
                }}
                srcDoc={resumeTemplate(formData)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateResumePage;
