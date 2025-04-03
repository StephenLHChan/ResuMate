import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const { type, content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    let jobContent = content;

    // If URL is provided, fetch the content
    if (type === "url") {
      try {
        const response = await fetch(content);
        jobContent = await response.text();
      } catch (error) {
        return NextResponse.json(
          { error: `Failed to fetch job posting from URL - ${error}` },
          { status: 400 }
        );
      }
    }

    // Process the job description using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a job description analyzer. Extract key information from job postings and return it in a structured format.",
        },
        {
          role: "user",
          content: `Please analyze this job posting and extract the following information in JSON format:
            - companyName: The name of the company
            - position: The job title/position
            - description: A clear summary of the job description
            - requirements: An array of key requirements and qualifications
            
            Job posting:
            ${jobContent}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const extractedInfo = JSON.parse(
      completion.choices[0].message.content || "{}"
    );

    return NextResponse.json(extractedInfo);
  } catch (error) {
    console.error("Error processing job:", error);
    return NextResponse.json(
      { error: "Failed to process job information" },
      { status: 500 }
    );
  }
};
