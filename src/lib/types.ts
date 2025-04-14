import type {
  Project,
  Certification,
  Education,
  Experience,
  Skill,
} from "@prisma/client";

// Resume template types
export interface ResumeCertification {
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
}

export interface ResumeExperience {
  position: string;
  company: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface ResumeEducation {
  degree: string;
  field: string;
  institution: string;
  startDate: string;
  endDate: string;
}

export interface ResumeData {
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  certifications: ResumeCertification[];
}

// User profile types
export interface UserProfile {
  preferredFirstName: string | null;
  preferredLastName: string | null;
  title: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
}

export interface ResumeContent {
  summary: string;
  experience: Array<{
    position: string;
    company: string;
    description: string;
    startDate: string;
    endDate: string;
  }>;
  education: Array<{
    degree: string;
    field: string;
    institution: string;
    startDate: string;
    endDate: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string | null;
  }>;
}

export interface JobContent {
  title: string | null;
  companyName: string | null;
  description: string | null;
  requirements: string[];
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
