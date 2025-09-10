import OpenAI from "openai";
import puppeteer from "puppeteer";

import { prisma } from "@/lib/prisma";
import { resumeSuggestionsPrompt } from "@/lib/prompts/resume-analysis";
import { resumeGenerationPrompt } from "@/lib/prompts/resume-generation";
import { resumeTemplate } from "@/lib/templates/resume-template";

import type {
  ResumeWithRelations,
  ProfileWithRelations,
  ResumeData,
  DeleteResumeSuccessResponse,
  DeleteResumeErrorResponse,
  DeleteResumeParams,
  ResumeUsageCheck,
} from "@/lib/types";
import type { Job } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GeneratedResumeContent {
  title: string;
  professionalTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
  workExperiences: {
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
    descriptions: string[];
    isCurrent: boolean;
  }[];
  educations: {
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string | null;
  }[];
  skills: {
    name: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate: string | null;
    credentialUrl: string | null;
  }[];
}

export class ResumeService {
  static async generateResumeContent(
    userProfile: ProfileWithRelations,
    jobInfo: Job
  ): Promise<GeneratedResumeContent> {
    // Check if user has premium subscription
    // const isPremium = await SubscriptionService.isPremiumUser(
    //   userProfile.userId
    // );

    // if (!isPremium) {
    //   throw new Error("Premium subscription required to generate resumes");
    // }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: resumeGenerationPrompt.system,
        },
        {
          role: "user",
          content: resumeGenerationPrompt.user(userProfile, jobInfo),
        },
      ],
      response_format: { type: "json_object" },
    });

    const resumeContent = completion.choices[0]?.message?.content;
    if (!resumeContent) {
      throw new Error("Failed to generate resume content");
    }
    // Resume content generated successfully
    return JSON.parse(resumeContent);
  }

  static async createResumeRecord(
    content: ResumeData,
    userId?: string,
    applicationId?: string
  ): Promise<{ id: string }> {
    // Creating resume record...

    if (!userId) {
      throw new Error("User ID is required to create a resume");
    }

    const resume = await prisma.resume.create({
      data: {
        title: content.title,
        userId,
        professionalTitle: content.professionalTitle || null,
        firstName: content.firstName,
        lastName: content.lastName,
        email: content.email,
        phone: content.phone || null,
        location: content.location || null,
        website: content.website || null,
        linkedin: content.linkedin || null,
        github: content.github || null,
        summary: content.summary || null,
        workExperiences: {
          create: content.workExperiences.map(exp => ({
            company: exp.company || "",
            position: exp.position || "",
            startDate: new Date(exp.startDate || new Date()),
            endDate: exp.endDate ? new Date(exp.endDate) : null,
            descriptions: exp.descriptions || [],
            isCurrent: exp.isCurrent || false,
          })),
        },
        educations: {
          create: content.educations.map(edu => ({
            institution: edu.institution || "",
            degree: edu.degree || "",
            field: edu.field || "",
            startDate: new Date(edu.startDate || new Date()),
            endDate: edu.endDate ? new Date(edu.endDate) : null,
          })),
        },
        skills: {
          create: content.skills.map(skill => ({
            name: skill.name || "",
          })),
        },
        certifications: {
          create: content.certifications.map(cert => ({
            name: cert.name || "",
            issuer: cert.issuer || "",
            issueDate: new Date(cert.issueDate || new Date()),
            expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
            credentialUrl: cert.credentialUrl || null,
          })),
        },
      },
    });

    if (applicationId) {
      await prisma.applicationResume.create({
        data: {
          application: {
            connect: {
              id: applicationId,
            },
          },
          resume: {
            connect: {
              id: resume.id,
            },
          },
        },
      });
    }

    return resume;
  }

  static async generatePDF(resumeContent: ResumeData): Promise<Uint8Array> {
    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();

    await page.setContent(resumeTemplate(resumeContent));

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "1cm",
        right: "1cm",
        bottom: "1cm",
        left: "1cm",
      },
    });

    await browser.close();
    return pdf;
  }

  // static async analyzeResume(
  //   resumeContent: ResumeWithRelations,
  //   jobInfo?: Job
  // ): Promise<ResumeAnalysis> {
  //   const completion = await openai.chat.completions.create({
  //     model: "gpt-4-turbo-preview",
  //     messages: [
  //       {
  //         role: "system",
  //         content: resumeAnalysisPrompt.system,
  //       },
  //       {
  //         role: "user",
  //         content: resumeAnalysisPrompt.user(resumeContent, jobInfo),
  //       },
  //     ],
  //     response_format: { type: "json_object" },
  //     temperature: 0.3,
  //   });

  //   const analysis = completion.choices[0]?.message?.content;
  //   if (!analysis) {
  //     throw new Error("Failed to analyze resume");
  //   }

  //   return JSON.parse(analysis);
  // }

  static async generateResumeSuggestions(
    resumeContent: ResumeWithRelations,
    jobInfo?: Job
  ): Promise<string[]> {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: resumeSuggestionsPrompt.system,
        },
        {
          role: "user",
          content: resumeSuggestionsPrompt.user(resumeContent, jobInfo),
        },
      ],
      temperature: 0.3,
    });

    const suggestions = completion.choices[0]?.message?.content;
    if (!suggestions) {
      throw new Error("Failed to generate suggestions");
    }

    return suggestions.split("\n").filter(Boolean);
  }

  static async deleteResume(
    resumeId: string,
    userId: string
  ): Promise<DeleteResumeSuccessResponse> {
    try {
      // Validate input parameters
      if (!resumeId || !userId) {
        const error: DeleteResumeErrorResponse = {
          error: "Resume ID and User ID are required",
          code: "VALIDATION_ERROR",
          retryable: false,
          details: "Both resumeId and userId must be provided",
        };
        throw error;
      }

      // Validate resume ID format (CUID validation)
      const cuidRegex = /^c[0-9a-z]{24}$/i;
      if (!cuidRegex.test(resumeId)) {
        const error: DeleteResumeErrorResponse = {
          error: "Invalid resume ID format",
          code: "VALIDATION_ERROR",
          retryable: false,
          details: "Resume ID must be a valid CUID",
        };
        throw error;
      }

      // Check if resume exists and belongs to the user
      const resume = await prisma.resume.findFirst({
        where: {
          id: resumeId,
          userId: userId,
        },
        include: {
          applications: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!resume) {
        const error: DeleteResumeErrorResponse = {
          error: "Resume not found or you don't have permission to delete it",
          code: "RESUME_NOT_FOUND",
          retryable: false,
          details: "The resume either doesn't exist or belongs to another user",
        };
        throw error;
      }

      // Note: Resume deletion will automatically remove it from all applications
      // due to cascade delete relationships in the database schema

      // Delete the resume (cascade delete will handle related records)
      await prisma.resume.delete({
        where: {
          id: resumeId,
        },
      });

      return {
        success: true,
        message:
          resume.applications.length > 0
            ? `Resume deleted successfully. It has been removed from ${resume.applications.length} job application(s).`
            : "Resume deleted successfully",
        applicationsAffected: resume.applications.length,
      };
    } catch (error) {
      // Re-throw known errors
      if (error && typeof error === "object" && "code" in error) {
        throw error;
      }

      // Handle database connection errors
      if (error instanceof Error) {
        if (
          error.message.includes("timeout") ||
          error.message.includes("TIMEOUT")
        ) {
          const timeoutError: DeleteResumeErrorResponse = {
            error: "Request timed out. Please try again.",
            code: "TIMEOUT_ERROR",
            retryable: true,
            details: error.message,
          };
          throw timeoutError;
        }

        if (
          error.message.includes("connection") ||
          error.message.includes("network") ||
          error.message.includes("Connection lost")
        ) {
          const networkError: DeleteResumeErrorResponse = {
            error: "Network error. Please check your connection and try again.",
            code: "NETWORK_ERROR",
            retryable: true,
            details: error.message,
          };
          throw networkError;
        }
      }

      // Handle unknown errors
      const unknownError: DeleteResumeErrorResponse = {
        error: "An unexpected error occurred while deleting the resume",
        code: "UNKNOWN_ERROR",
        retryable: true,
        details: error instanceof Error ? error.message : "Unknown error",
      };
      throw unknownError;
    }
  }

  /**
   * Check if a resume is currently being used in job applications
   */
  static async checkResumeUsage(
    resumeId: string,
    userId: string
  ): Promise<ResumeUsageCheck> {
    try {
      const resume = await prisma.resume.findFirst({
        where: {
          id: resumeId,
          userId: userId,
        },
        include: {
          applications: {
            select: {
              id: true,
              job: {
                select: {
                  title: true,
                  company: true,
                },
              },
            },
          },
        },
      });

      if (!resume) {
        return {
          resumeId,
          isInUse: false,
          applicationCount: 0,
          applications: [],
        };
      }

      const applications = resume.applications.map(app => ({
        id: app.id,
        jobTitle: app.job.title,
        company: app.job.company,
      }));

      return {
        resumeId,
        isInUse: applications.length > 0,
        applicationCount: applications.length,
        applications,
      };
    } catch (error) {
      console.error("Error checking resume usage:", error);
      throw new Error("Failed to check resume usage");
    }
  }

  /**
   * Validate resume deletion parameters
   */
  static validateDeleteParams(params: DeleteResumeParams): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!params.resumeId || typeof params.resumeId !== "string") {
      errors.push("Resume ID is required");
    } else if (!/^c[0-9a-z]{24}$/i.test(params.resumeId)) {
      errors.push("Resume ID must be a valid CUID");
    }

    if (!params.userId || typeof params.userId !== "string") {
      errors.push("User ID is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
