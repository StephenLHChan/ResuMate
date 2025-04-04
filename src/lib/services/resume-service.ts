import OpenAI from "openai";
import puppeteer from "puppeteer";

import { prisma } from "@/lib/prisma";
import { resumeGenerationPrompt } from "@/lib/prompts/resume-generation";
import { resumeTemplate } from "@/lib/templates/resume-template";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface JobInfo {
  position: string;
  companyName: string;
  description: string;
  requirements: string[];
}

interface ResumeContent {
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

interface User {
  id: string;
  email: string;
  profile: {
    preferredFirstName: string | null;
    preferredLastName: string | null;
    title: string | null;
    phone: string | null;
    location: string | null;
    website: string | null;
    linkedin: string | null;
    github: string | null;
    skills: string[];
    experience: Array<{
      company: string;
      position: string;
      startDate: Date;
      endDate: Date | null;
      description: string | null;
    }>;
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      startDate: Date;
      endDate: Date | null;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      issueDate: Date;
      expiryDate: Date | null;
    }>;
  } | null;
}

export class ResumeService {
  static async generateResumeContent(
    userProfile: NonNullable<User["profile"]>,
    jobInfo: JobInfo
  ): Promise<ResumeContent> {
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

    return JSON.parse(resumeContent);
  }

  static async createResumeRecord(
    userId: string,
    title: string,
    content: string,
    applicationId?: string
  ): Promise<{ id: string }> {
    const resume = await prisma.resume.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        title,
        content,
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

  static async generatePDF(
    user: User,
    resumeContent: ResumeContent
  ): Promise<Uint8Array> {
    if (!user.profile) {
      throw new Error("User profile not found");
    }

    const browser = await puppeteer.launch({
      headless: true,
    });
    const page = await browser.newPage();

    await page.setContent(resumeTemplate(user, resumeContent));

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
}
