import OpenAI from "openai";

import { jobAnalysisPrompt } from "@/lib/prompts/job-analysis";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface JobContent {
  companyName: string;
  position: string;
  description: string;
  requirements: string[];
}

export class JobService {
  static async analyzeJob(
    content: string,
    type: "text" | "url" = "text"
  ): Promise<JobContent> {
    let jobContent = content;

    // If URL is provided, fetch the content
    if (type === "url") {
      try {
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
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error("Failed to analyze job posting");
    }

    return JSON.parse(result);
  }
}
