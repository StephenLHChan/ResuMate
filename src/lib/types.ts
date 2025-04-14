import type {
  Project,
  Certification,
  Education,
  Experience,
  Skill,
} from "@prisma/client";

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

export interface ResumeData {
  summary: string;
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
}

export interface JobContent {
  title: string | null;
  companyName: string | null;
  description: string | null;
  requirements: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  location?: string | null;
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
