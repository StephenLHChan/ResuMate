import type { Skill } from "@prisma/client";

export interface BaseCertification {
  name: string;
  issuer: string;
  issueDate: string | Date;
  expiryDate: string | Date | null;
}

export interface BaseExperience {
  company: string;
  position: string;
  startDate: string | Date;
  endDate: string | Date | null;
  description: string | null;
}

export interface BaseEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: string | Date;
  endDate: string | Date | null;
  description: string | null;
}

export interface BaseProject {
  name: string;
  description: string;
  startDate: string | Date;
  endDate: string | Date | null;
  technologies: string[];
  projectUrl: string | null;
  githubUrl: string | null;
}

// Database model types (matching Prisma schema)
export interface DBCertification extends BaseCertification {
  id: string;
  profileId: string;
  credentialId: string | null;
  credentialUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBExperience extends BaseExperience {
  id: string;
  profileId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBEducation extends BaseEducation {
  id: string;
  profileId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBProject extends BaseProject {
  id: string;
  profileId: string;
  createdAt: Date;
  updatedAt: Date;
}

// API response types
export interface APICertification extends BaseCertification {
  id: string;
  credentialId: string | null;
  credentialUrl: string | null;
  description: string | null;
}

export interface APIExperience extends BaseExperience {
  id: string;
}

export interface APIEducation extends BaseEducation {
  id: string;
}

export interface APIProject extends BaseProject {
  id: string;
}

// Form types
export interface CertificationFormValues {
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date | null;
  credentialId?: string;
  credentialUrl?: string;
  description?: string;
}

export interface ExperienceFormValues {
  company: string;
  position: string;
  startDate: Date;
  endDate: Date | null;
  currentlyWorking: boolean;
  description?: string;
}

export interface EducationFormValues {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate: Date | null;
  currentlyStudying: boolean;
  description?: string;
}

export interface ProjectFormValues {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
}

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
  experience: APIExperience[];
  education: APIEducation[];
  certifications: APICertification[];
  projects: APIProject[];
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
