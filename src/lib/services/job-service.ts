import OpenAI from "openai";

import { jobAnalysisPrompt } from "@/lib/prompts/job-analysis";
import { prisma } from "../prisma";
import { JobContent } from "../types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class JobService {
  static async analyzeJob(
    content: string,
    type: "text" | "url" = "text"
  ): Promise<JobContent> {
    let jobContent = content;

    // If URL is provided, fetch the content
    if (type === "url") {
      try {
        const existingJob = await this.checkJobExistsByUrl(content);

        if (existingJob) {
          return existingJob;
        }

        const response = await fetch(content);
        jobContent = await response.text();
      } catch (error) {
        throw new Error(`Failed to fetch job posting from URL: ${error}`);
      }
    }

    // Process the job description using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: jobAnalysisPrompt.system,
        },
        {
          role: "user",
          content: jobAnalysisPrompt.user(jobContent),
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error("Failed to analyze job posting");
    }

    try {
      return JSON.parse(result);
    } catch (error) {
      console.error("Error parsing job analysis result:", error);
      throw new Error("Failed to parse job analysis result");
    }
  }

  static async checkJobExistsByUrl(url: string): Promise<JobContent | null> {
    const existingJob = await prisma.job.findUnique({
      where: { url },
    });

    if (existingJob) {
      return {
        companyName: existingJob.companyName,
        title: existingJob.title,
        description: existingJob.description,
        requirements: existingJob.requirements || [],
      };
    }

    return null;
  }
}
