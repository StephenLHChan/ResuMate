import type {
  Certification,
  Education,
  Experience,
  Prisma,
} from "@prisma/client";

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
  include: { user: true };
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
