"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from "@/lib/axios";
import { resumeTemplate } from "@/lib/templates/resume-template";
import { type ProfileWithRelations, type ResumeData } from "@/lib/types";

type ResumeSection = keyof Omit<ResumeData, "summary">;

const ResumePage = (): React.ReactElement => {
  const [formData, setFormData] = useState<ResumeData>({
    summary: "",
    experience: [],
    education: [],
    certifications: [],
    skills: [],
  });
  const [profile, setProfile] = useState<ProfileWithRelations | null>(null);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        // Fetch profile data
        const { data: profileData } = await axiosInstance.get("/profile");
        setProfile(profileData);

        // Transform profile data into resume data format
        if (profileData) {
          setFormData({
            summary: profileData.bio || "",
            certifications: profileData.certifications.map(
              (cert: ProfileWithRelations["certifications"][number]) => ({
                id: cert.id,
                name: cert.name,
                issuer: cert.issuer,
                issueDate: new Date(cert.issueDate).toISOString().split("T")[0],
                expiryDate: cert.expiryDate
                  ? new Date(cert.expiryDate).toISOString().split("T")[0]
                  : "",
                credentialId: cert.credentialId || "",
              })
            ),
            skills: profileData.skills.map(
              (skill: ProfileWithRelations["skills"][number]) => ({
                id: skill.id,
                name: skill.name,
                level: skill.rating?.toString() || "Intermediate",
              })
            ),
            education: profileData.education.map(
              (edu: ProfileWithRelations["education"][number]) => ({
                id: edu.id,
                institution: edu.institution,
                degree: edu.degree,
                field: edu.field,
                startDate: new Date(edu.startDate).toISOString().split("T")[0],
                endDate: edu.endDate
                  ? new Date(edu.endDate).toISOString().split("T")[0]
                  : "",
                description: edu.description || "",
              })
            ),
            experience: profileData.experience.map(
              (exp: ProfileWithRelations["experience"][number]) => ({
                id: exp.id,
                company: exp.company,
                position: exp.position,
                startDate: new Date(exp.startDate).toISOString().split("T")[0],
                endDate: exp.endDate
                  ? new Date(exp.endDate).toISOString().split("T")[0]
                  : "",
                description: exp.description || "",
              })
            ),
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: keyof ResumeData,
    index?: number,
    field?: string
  ): void => {
    if (index !== undefined && field && section !== "summary") {
      setFormData(prev => ({
        ...prev,
        [section]: (
          prev[section] as Array<
            ResumeData[keyof Omit<ResumeData, "summary">][number]
          >
        ).map((item, i) =>
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

  const addItem = (
    section: ResumeSection,
    template: Omit<ResumeData[keyof Omit<ResumeData, "summary">][number], "id">
  ): void => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], { ...template, id: Date.now().toString() }],
    }));
  };

  const removeItem = (section: ResumeSection, id: string): void => {
    setFormData(prev => ({
      ...prev,
      [section]: (
        prev[section] as Array<
          ResumeData[keyof Omit<ResumeData, "summary">][number]
        >
      ).filter(item => item.id !== id),
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      const _transformedData = transformResumeData(formData);
      // TODO: Add API call to save resume data
      await axiosInstance.post("/resumes", _transformedData);
      toast.success("Resume data saved successfully");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save resume data";
      toast.error(errorMessage);
    }
  };

  const transformResumeData = (formData: ResumeData): ResumeData => ({
    summary: formData.summary,
    experience: formData.experience.map(exp => ({
      ...exp,
      startDate: new Date(exp.startDate),
      endDate: exp.endDate ? new Date(exp.endDate) : null,
      description: exp.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      profileId: profile?.id || "",
      isCurrent: false,
    })),
    education: formData.education.map(edu => ({
      ...edu,
      startDate: new Date(edu.startDate),
      endDate: edu.endDate ? new Date(edu.endDate) : null,
      description: edu.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
      profileId: profile?.id || "",
    })),
    certifications: formData.certifications.map(cert => ({
      ...cert,
      issueDate: new Date(cert.issueDate),
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
      description: null,
      credentialUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      profileId: profile?.id || "",
    })),
    skills: formData.skills.map(skill => ({
      ...skill,
      createdAt: new Date(),
      updatedAt: new Date(),
      profileId: profile?.id || "",
    })),
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Create Your Resume</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Form Section */}
        <Card>
          <CardHeader>
            <CardTitle>Resume Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                        startDate: "",
                        endDate: "",
                        description: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
                {formData.experience.map((exp, index) => (
                  <div key={exp.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Experience {index + 1}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem("experience", exp.id)}
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
                        issueDate: "",
                        expiryDate: "",
                        credentialId: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                </div>
                {formData.certifications.map((cert, index) => (
                  <div key={cert.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Certification {index + 1}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem("certifications", cert.id)}
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
                        startDate: "",
                        endDate: "",
                        description: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>
                {formData.education.map((edu, index) => (
                  <div key={edu.id} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">
                        Education {index + 1}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem("education", edu.id)}
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
                        level: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
                {formData.skills.map((skill, index) => (
                  <Card key={skill.id} className="p-4">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem("skills", skill.id)}
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
                          value={skill.level}
                          onChange={e =>
                            handleInputChange(e, "skills", index, "level")
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
            {profile && (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: resumeTemplate(
                    profile,
                    transformResumeData(formData)
                  ),
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumePage;
