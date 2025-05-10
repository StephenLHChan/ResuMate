"use client";

import { Plus, Trash2, FileText } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/lib/axios";
import { resumeTemplate } from "@/lib/templates/resume-template";
import { type ProfileWithRelations, type ResumeData } from "@/lib/types";

type ResumeSection = keyof Omit<ResumeData, "summary">;

type ResumeItem = {
  id: string;
  [key: string]: any;
};

const CreateResumePage = (): React.ReactElement => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ResumeData>({
    summary: "",
    experience: [],
    education: [],
    certifications: [],
    skills: [],
    name: "",
    email: "",
  });
  const [profile, setProfile] = useState<ProfileWithRelations | null>(null);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        setLoading(true);
        const { data: profileData } = await axiosInstance.get("/profile");
        if (profileData && Object.keys(profileData).length > 0) {
          setProfile(profileData);
          toast({
            title: "Profile Information Available",
            description:
              "Your profile information has been loaded. You can use this to save time filling out your resume.",
            duration: 5000,
          });
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: keyof ResumeData,
    index?: number,
    field?: string
  ): void => {
    if (index !== undefined && field && section !== "summary") {
      setFormData(prev => ({
        ...prev,
        [section]: (prev[section] as ResumeItem[]).map((item, i) =>
          i === index ? { ...item, [field]: e.target.value } : item
        ),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: e.target.value,
      }));
    }
  };

  const addItem = <T extends ResumeSection>(
    section: T,
    template: Omit<ResumeData[T][number], "id">
  ): void => {
    setFormData(prev => ({
      ...prev,
      [section]: [
        ...(prev[section] as ResumeItem[]),
        { ...template, id: Date.now().toString() },
      ],
    }));
  };

  const removeItem = (section: ResumeSection, id: string): void => {
    setFormData(prev => ({
      ...prev,
      [section]: (prev[section] as ResumeItem[]).filter(item => item.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      await axiosInstance.post("/resumes", formData);
      toast({
        title: "Success",
        description: "Resume data saved successfully",
      });
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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={
                        formData.name ||
                        (profile?.preferredFirstName &&
                        profile?.preferredLastName
                          ? `${profile.preferredFirstName} ${profile.preferredLastName}`
                          : profile?.legalFirstName && profile?.legalLastName
                          ? `${profile.legalFirstName} ${profile.legalLastName}`
                          : "")
                      }
                      onChange={e => handleInputChange(e, "name")}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={formData.email || profile?.user?.email || ""}
                      onChange={e => handleInputChange(e, "email")}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  name="summary"
                  value={formData.summary}
                  onChange={e => handleInputChange(e, "summary")}
                  required
                />
              </div>

              {/* Work Experience */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Work Experience</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addItem("experience", {
                        company: "",
                        position: "",
                        startDate: new Date(),
                        endDate: null,
                        description: "",
                        isCurrent: false,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
                {formData.experience?.map((exp, index) => (
                  <div key={exp.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Experience {index + 1}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (exp.id) {
                            removeItem("experience", exp.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`company-${exp.id}`}>Company</Label>
                        <Input
                          id={`company-${exp.id}`}
                          value={exp.company}
                          onChange={e =>
                            handleInputChange(e, "experience", index, "company")
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`position-${exp.id}`}>Position</Label>
                        <Input
                          id={`position-${exp.id}`}
                          value={exp.position}
                          onChange={e =>
                            handleInputChange(
                              e,
                              "experience",
                              index,
                              "position"
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`startDate-${exp.id}`}>
                          Start Date
                        </Label>
                        <Input
                          id={`startDate-${exp.id}`}
                          type="date"
                          value={
                            exp.startDate instanceof Date
                              ? exp.startDate.toISOString().split("T")[0]
                              : exp.startDate
                          }
                          onChange={e =>
                            handleInputChange(
                              e,
                              "experience",
                              index,
                              "startDate"
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`endDate-${exp.id}`}>End Date</Label>
                        <Input
                          id={`endDate-${exp.id}`}
                          type="date"
                          value={
                            exp.endDate instanceof Date
                              ? exp.endDate.toISOString().split("T")[0]
                              : exp.endDate || ""
                          }
                          onChange={e =>
                            handleInputChange(e, "experience", index, "endDate")
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`description-${exp.id}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`description-${exp.id}`}
                        value={exp.description || ""}
                        onChange={e =>
                          handleInputChange(
                            e,
                            "experience",
                            index,
                            "description"
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Certifications</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addItem("certifications", {
                        name: "",
                        issuer: "",
                        issueDate: new Date(),
                        expiryDate: null,
                        credentialId: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                </div>
                {formData.certifications?.map((cert, index) => (
                  <div key={cert.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Certification {index + 1}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (cert.id) {
                            removeItem("certifications", cert.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${cert.id}`}>Name</Label>
                        <Input
                          id={`name-${cert.id}`}
                          value={cert.name}
                          onChange={e =>
                            handleInputChange(
                              e,
                              "certifications",
                              index,
                              "name"
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`issuer-${cert.id}`}>Issuer</Label>
                        <Input
                          id={`issuer-${cert.id}`}
                          value={cert.issuer}
                          onChange={e =>
                            handleInputChange(
                              e,
                              "certifications",
                              index,
                              "issuer"
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`issueDate-${cert.id}`}>
                          Issue Date
                        </Label>
                        <Input
                          id={`issueDate-${cert.id}`}
                          type="date"
                          value={
                            cert.issueDate instanceof Date
                              ? cert.issueDate.toISOString().split("T")[0]
                              : cert.issueDate
                          }
                          onChange={e =>
                            handleInputChange(
                              e,
                              "certifications",
                              index,
                              "issueDate"
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`expiryDate-${cert.id}`}>
                          Expiry Date
                        </Label>
                        <Input
                          id={`expiryDate-${cert.id}`}
                          type="date"
                          value={
                            cert.expiryDate instanceof Date
                              ? cert.expiryDate.toISOString().split("T")[0]
                              : cert.expiryDate || ""
                          }
                          onChange={e =>
                            handleInputChange(
                              e,
                              "certifications",
                              index,
                              "expiryDate"
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Education</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addItem("education", {
                        institution: "",
                        degree: "",
                        field: "",
                        startDate: new Date(),
                        endDate: null,
                        description: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
                {formData.education?.map((edu, index) => (
                  <div key={edu.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Education {index + 1}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (edu.id) {
                            removeItem("education", edu.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`institution-${edu.id}`}>
                          Institution
                        </Label>
                        <Input
                          id={`institution-${edu.id}`}
                          value={edu.institution}
                          onChange={e =>
                            handleInputChange(
                              e,
                              "education",
                              index,
                              "institution"
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`degree-${edu.id}`}>Degree</Label>
                        <Input
                          id={`degree-${edu.id}`}
                          value={edu.degree}
                          onChange={e =>
                            handleInputChange(e, "education", index, "degree")
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`startDate-${edu.id}`}>
                          Start Date
                        </Label>
                        <Input
                          id={`startDate-${edu.id}`}
                          type="date"
                          value={
                            edu.startDate instanceof Date
                              ? edu.startDate.toISOString().split("T")[0]
                              : edu.startDate
                          }
                          onChange={e =>
                            handleInputChange(
                              e,
                              "education",
                              index,
                              "startDate"
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`endDate-${edu.id}`}>End Date</Label>
                        <Input
                          id={`endDate-${edu.id}`}
                          type="date"
                          value={
                            edu.endDate instanceof Date
                              ? edu.endDate.toISOString().split("T")[0]
                              : edu.endDate || ""
                          }
                          onChange={e =>
                            handleInputChange(e, "education", index, "endDate")
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`description-${edu.id}`}>
                        Description
                      </Label>
                      <Textarea
                        id={`description-${edu.id}`}
                        value={edu.description || ""}
                        onChange={e =>
                          handleInputChange(
                            e,
                            "education",
                            index,
                            "description"
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Skills</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addItem("skills", {
                        name: "",
                        rating: 3,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
                {formData.skills?.map((skill, index) => (
                  <Card key={skill.id} className="p-4">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (skill.id) {
                            removeItem("skills", skill.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <Label>Skill Name</Label>
                        <Input
                          value={skill.name}
                          onChange={e =>
                            handleInputChange(e, "skills", index, "name")
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label>Level</Label>
                        <Input
                          value={skill.rating?.toString() || ""}
                          onChange={e =>
                            handleInputChange(e, "skills", index, "rating")
                          }
                          required
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button type="submit" className="w-full">
                Save Resume
              </Button>
            </form>
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
                  transform: "scale(0.8)",
                  transformOrigin: "top center",
                  overflow: "hidden",
                  border: "none",
                }}
                srcDoc={resumeTemplate(
                  profile || {
                    id: "",
                    userId: "",
                    legalFirstName: "",
                    legalLastName: "",
                    preferredFirstName: "",
                    preferredLastName: "",
                    hasPreferredName: false,
                    title: "",
                    bio: "",
                    address: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "",
                    location: "",
                    phone: "",
                    website: "",
                    linkedin: "",
                    github: "",
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    user: {
                      id: "",
                      name: null,
                      email: "",
                      emailVerified: null,
                      image: null,
                      password: null,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    },
                    skills: [],
                    experience: [],
                    education: [],
                    certifications: [],
                    projects: [],
                  },
                  formData
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateResumePage;
