import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resumeTemplate } from "@/lib/templates/resume-template";
import { type ResumeData } from "@/lib/types";

type ResumeSection = keyof Omit<ResumeData, "summary">;

type ResumeItem = {
  id: string;
  [key: string]: any;
};

interface ResumeFormProps {
  initialData: ResumeData;
  onSubmit: (data: ResumeData) => Promise<void>;
  onCancel?: () => void;
  submitButtonText?: string;
  showCancelButton?: boolean;
}

const ResumeForm = ({
  initialData,
  onSubmit,
  onCancel,
  submitButtonText = "Save Resume",
  showCancelButton = false,
}: ResumeFormProps): React.ReactElement => {
  const [formData, setFormData] = useState<ResumeData>(initialData);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    section: keyof ResumeData,
    index?: number,
    field?: string,
    value?: any
  ): void => {
    if (index !== undefined && field && section !== "summary") {
      setFormData(prev => ({
        ...prev,
        [section]: (prev[section] as ResumeItem[]).map((item, i) =>
          i === index ? { ...item, [field]: value || e.target.value } : item
        ),
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: value || e.target.value,
      }));
    }
  };

  const addItem = <T extends ResumeSection>(
    section: T,
    template: Omit<ResumeData[T] extends Array<infer U> ? U : never, "id">
  ): void => {
    setFormData(prev => ({
      ...prev,
      [section]: [
        ...(prev[section] as Array<
          ResumeData[T] extends Array<infer U> ? U : never
        >),
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
    await onSubmit(formData);
  };

  const formatDate = (date: Date | string | null | undefined): string => {
    if (!date) return "";
    if (date instanceof Date) {
      return date.toISOString().split("T")[0];
    }
    return date;
  };

  const handleAddDescription = (
    exp: ResumeData["workExperiences"][number],
    index: number
  ): void => {
    const newDescriptions = [...(exp.descriptions || []), ""];
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences?.map((item, i) =>
        i === index ? { ...item, descriptions: newDescriptions } : item
      ),
    }));
  };

  const handleRemoveDescription = (
    exp: ResumeData["workExperiences"][number],
    index: number,
    descIndex: number
  ): void => {
    const newDescriptions = [...(exp.descriptions || [])].filter(
      (_, i) => i !== descIndex
    );
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences?.map((item, i) =>
        i === index ? { ...item, descriptions: newDescriptions } : item
      ),
    }));
  };

  const handleDescriptionChange = (
    exp: ResumeData["workExperiences"][number],
    index: number,
    descIndex: number,
    value: string
  ): void => {
    const newDescriptions = [...(exp.descriptions || [])];
    newDescriptions[descIndex] = value;
    setFormData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences?.map((item, i) =>
        i === index ? { ...item, descriptions: newDescriptions } : item
      ),
    }));
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Resume Title</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={e => handleInputChange(e, "title")}
                  placeholder="e.g., Software Engineer Resume"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="professionalTitle">Professional Title</Label>
                <Input
                  id="professionalTitle"
                  value={formData.professionalTitle || ""}
                  onChange={e => handleInputChange(e, "professionalTitle")}
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ""}
                  onChange={e => handleInputChange(e, "firstName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ""}
                  onChange={e => handleInputChange(e, "lastName")}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={e => handleInputChange(e, "email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={e => handleInputChange(e, "phone")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={e => handleInputChange(e, "location")}
                placeholder="e.g., San Francisco, CA"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website || ""}
                  onChange={e => handleInputChange(e, "website")}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin || ""}
                  onChange={e => handleInputChange(e, "linkedin")}
                  placeholder="https://linkedin.com/in/"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  value={formData.github || ""}
                  onChange={e => handleInputChange(e, "github")}
                  placeholder="https://github.com/"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.summary || ""}
              onChange={e => handleInputChange(e, "summary")}
              placeholder="Write a compelling summary of your professional background..."
              className="min-h-[150px]"
            />
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Work Experience</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                addItem("workExperiences", {
                  company: "",
                  position: "",
                  startDate: new Date(),
                  endDate: null,
                  descriptions: [""],
                  isCurrent: false,
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.workExperiences?.map((exp, index) => (
              <div key={exp.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`company-${exp.id}`}>Company</Label>
                        <Input
                          id={`company-${exp.id}`}
                          value={exp.company || ""}
                          onChange={e =>
                            handleInputChange(
                              e,
                              "workExperiences",
                              index,
                              "company"
                            )
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`position-${exp.id}`}>Position</Label>
                        <Input
                          id={`position-${exp.id}`}
                          value={exp.position || ""}
                          onChange={e =>
                            handleInputChange(
                              e,
                              "workExperiences",
                              index,
                              "position"
                            )
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`startDate-${exp.id}`}>
                          Start Date
                        </Label>
                        <Input
                          id={`startDate-${exp.id}`}
                          type="date"
                          value={formatDate(exp.startDate)}
                          onChange={e =>
                            handleInputChange(
                              e,
                              "workExperiences",
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
                          value={formatDate(exp.endDate)}
                          onChange={e =>
                            handleInputChange(
                              e,
                              "workExperiences",
                              index,
                              "endDate"
                            )
                          }
                          disabled={exp.isCurrent}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`isCurrent-${exp.id}`}
                        checked={exp.isCurrent}
                        onChange={e =>
                          handleInputChange(
                            e,
                            "workExperiences",
                            index,
                            "isCurrent",
                            e.target.checked
                          )
                        }
                      />
                      <Label htmlFor={`isCurrent-${exp.id}`}>
                        I currently work here
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      {exp.descriptions?.map((desc, descIndex) => (
                        <div key={descIndex} className="flex gap-2">
                          <Textarea
                            value={desc || ""}
                            onChange={e =>
                              handleDescriptionChange(
                                exp,
                                index,
                                descIndex,
                                e.target.value
                              )
                            }
                            placeholder="Describe your responsibilities and achievements..."
                            className="min-h-[100px]"
                          />
                          {exp.descriptions && exp.descriptions.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleRemoveDescription(exp, index, descIndex)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleAddDescription(exp, index)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Description
                      </Button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      removeItem("workExperiences", exp.id as string)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Education</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                addItem("education", {
                  institution: "",
                  degree: "",
                  field: "",
                  startDate: new Date(),
                  endDate: null,
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.education?.map((edu, index) => (
              <div key={edu.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`institution-${edu.id}`}>
                          Institution
                        </Label>
                        <Input
                          id={`institution-${edu.id}`}
                          value={edu.institution || ""}
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
                          value={edu.degree || ""}
                          onChange={e =>
                            handleInputChange(e, "education", index, "degree")
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`field-${edu.id}`}>Field of Study</Label>
                      <Input
                        id={`field-${edu.id}`}
                        value={edu.field || ""}
                        onChange={e =>
                          handleInputChange(e, "education", index, "field")
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`startDate-${edu.id}`}>
                          Start Date
                        </Label>
                        <Input
                          id={`startDate-${edu.id}`}
                          type="date"
                          value={formatDate(edu.startDate)}
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
                          value={formatDate(edu.endDate)}
                          onChange={e =>
                            handleInputChange(e, "education", index, "endDate")
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem("education", edu.id as string)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Skills</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                addItem("skills", {
                  name: "",
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.skills?.map((skill, index) => (
              <div key={skill.id} className="flex items-center gap-4">
                <Input
                  value={skill.name || ""}
                  onChange={e => handleInputChange(e, "skills", index, "name")}
                  placeholder="Enter a skill"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem("skills", skill.id as string)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Certifications</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                addItem("certifications", {
                  name: "",
                  issuer: "",
                  issueDate: new Date(),
                  expiryDate: null,
                })
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.certifications?.map((cert, index) => (
              <div key={cert.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`name-${cert.id}`}>Name</Label>
                        <Input
                          id={`name-${cert.id}`}
                          value={cert.name || ""}
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
                          value={cert.issuer || ""}
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`issueDate-${cert.id}`}>
                          Issue Date
                        </Label>
                        <Input
                          id={`issueDate-${cert.id}`}
                          type="date"
                          value={formatDate(cert.issueDate)}
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
                          value={formatDate(cert.expiryDate)}
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
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      removeItem("certifications", cert.id as string)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          {showCancelButton && onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">{submitButtonText}</Button>
        </div>
      </form>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="resume-preview-container relative h-[calc(100vh-12rem)] overflow-hidden">
            <div className="absolute inset-0 overflow-auto">
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
                  margin: "0 auto",
                }}
                srcDoc={resumeTemplate(formData)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeForm;
