import type { Certification, Education, Skill, Prisma } from "@prisma/client";

export type ProfileWithRelations = Prisma.ProfileGetPayload<{
  include: {
    user: true;
    skills: true;
    experience: true;
    education: true;
    certifications: true;
    projects: true;
  };
}>;

export type ProfileWithUser = Prisma.ProfileGetPayload<{
  include: {
    user: {
      select: {
        email: true;
      };
    };
  };
}>;

export type ApplicationWithRelations = Prisma.ApplicationGetPayload<{
  include: {
    job: true;
    resumes: {
      include: {
        resume: true;
      };
    };
  };
}>;

export type ResumeWithRelations = Prisma.ResumeGetPayload<{
  include: {
    workExperiences: true;
    educationDetails: true;
    skillDetails: true;
    certificationDetails: true;
    summaries: true;
  };
}>;

export type ResumeData = {
  summary: string | null;
  workExperiences: Partial<{
    id?: string;
    company: string;
    position: string;
    startDate: Date;
    endDate?: Date | null;
    descriptions: string[];
    isCurrent: boolean;
  }>[];
  educations: Partial<Education>[];
  certifications: Partial<Certification>[];
  skills: Partial<Skill>[];
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  title: string;
  professionalTitle?: string;
};

export interface JobContent {
  title: string | null;
  companyName: string | null;
  description: string | null;
  duties: string[];
  requirements: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  location?: string | null;
  postingDate?: Date | null;
  applicationDeadline?: Date | null;
  applicationInstructions?: string | null;
  applicationWebsite?: string | null;
}

export interface APIResponse<T> {
  items: T[];
  totalCount: number;
  nextPageKey?: string;
  pageSize: number;
}

export interface APIError {
  error: string;
}

// API Response types for resume data
export interface ResumeWorkExperienceResponse {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  descriptions: string[];
  isCurrent: boolean;
}

export interface ResumeEducationResponse {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string | null;
}

export interface ResumeSkillResponse {
  id: string;
  name: string;
}

export interface ResumeCertificationResponse {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  credentialUrl: string | null;
}

export interface ResumeApiResponse {
  id: string;
  title: string;
  professionalTitle: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  summary: string | null;
  workExperiences: ResumeWorkExperienceResponse[];
  educations: ResumeEducationResponse[];
  skills: ResumeSkillResponse[];
  certifications: ResumeCertificationResponse[];
}
