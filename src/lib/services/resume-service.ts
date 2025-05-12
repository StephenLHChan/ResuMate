import OpenAI from "openai";
import puppeteer from "puppeteer";

import { prisma } from "@/lib/prisma";
import {
  // resumeAnalysisPrompt,
  resumeSuggestionsPrompt,
} from "@/lib/prompts/resume-analysis";
import { resumeGenerationPrompt } from "@/lib/prompts/resume-generation";
import { SubscriptionService } from "@/lib/services/subscription-service";
import { resumeTemplate } from "@/lib/templates/resume-template";

import type { ResumeWithRelations, ProfileWithRelations } from "@/lib/types";
import type { Job } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// interface ResumeAnalysis {
//   strengths: string[];
//   weaknesses: string[];
//   suggestions: string[];
//   keywords: string[];
//   score: number;
//   improvements: {
//     summary: string;
//     experience: string[];
//     skills: string[];
//     education: string[];
//   };
// }

export class ResumeService {
  static async generateResumeContent(
    userProfile: ProfileWithRelations,
    jobInfo: Job
  ): Promise<ResumeWithRelations> {
    // Check if user has premium subscription
    const isPremium = await SubscriptionService.isPremiumUser(
      userProfile.userId
    );

    if (!isPremium) {
      throw new Error("Premium subscription required to generate resumes");
    }

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
    title: string,
    content: string,
    applicationId?: string
  ): Promise<{ id: string }> {
    const resumeResponse = await fetch("/api/resumes", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });

    const resume = await resumeResponse.json();

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
    userProfile: ProfileWithRelations,
    resumeContent: ResumeWithRelations
  ): Promise<Uint8Array> {
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
