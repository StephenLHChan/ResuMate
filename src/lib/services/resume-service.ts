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
    console.debug("resumeContent", resumeContent);
    return JSON.parse(resumeContent);
  }

  static async createResumeRecord(
    content: ResumeData,
    userId?: string,
    applicationId?: string
  ): Promise<{ id: string }> {
    console.debug("Creating resume record...");
    console.debug("content", content);

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
}
