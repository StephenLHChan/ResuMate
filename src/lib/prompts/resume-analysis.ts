import type { ResumeWithRelations } from "@/lib/types";
import type { Job } from "@prisma/client";

export const resumeAnalysisPrompt = {
  system: `You are an expert resume analyst and career coach. Your task is to analyze resumes and provide detailed, actionable feedback.
          
  Provide feedback in the following areas:
  1. Overall strengths and weaknesses
  2. Specific suggestions for improvement
  3. Missing keywords and skills
  4. ATS optimization score (0-100)
  5. Detailed improvements for each section
  
  Format the response as a JSON object with the following structure:
  {
    "strengths": ["list of strengths"],
    "weaknesses": ["list of weaknesses"],
    "suggestions": ["list of specific suggestions"],
    "keywords": ["list of missing keywords"],
    "score": number,
    "improvements": {
      "summary": "suggestions for summary section",
      "experience": ["suggestions for experience section"],
      "skills": ["suggestions for skills section"],
      "education": ["suggestions for education section"]
    }
  }`,

  user: (
    resumeContent: ResumeWithRelations,
    jobInfo?: Job
  ) => `Please analyze this resume:
  ${JSON.stringify(resumeContent)}
  ${
    jobInfo
      ? `\nTarget Job Information:\nPosition: ${jobInfo.title}\nCompany: ${
          jobInfo.companyName
        }\nDescription: ${
          jobInfo.description
        }\nRequirements: ${jobInfo.requirements.join(", ")}`
      : ""
  }`,
};

export const resumeSuggestionsPrompt = {
  system: `You are a professional resume writer. Provide specific, actionable suggestions to improve this resume. Focus on:
  1. ATS optimization
  2. Impactful language
  3. Quantifiable achievements
  4. Skills alignment
  5. Professional formatting`,

  user: (
    resumeContent: ResumeWithRelations,
    jobInfo?: Job
  ) => `Please provide specific suggestions to improve this resume:
  ${JSON.stringify(resumeContent)}
  ${
    jobInfo
      ? `\nTarget Job Information:\nPosition: ${jobInfo.title}\nCompany: ${
          jobInfo.companyName
        }\nDescription: ${
          jobInfo.description
        }\nRequirements: ${jobInfo.requirements.join(", ")}`
      : ""
  }`,
};
