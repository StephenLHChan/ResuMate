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
