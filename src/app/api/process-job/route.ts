import { NextResponse } from "next/server";

import { JobService } from "@/lib/services/job-service";

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const { type, content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    try {
      const extractedInfo = await JobService.analyzeJob(
        content,
        type as "text" | "url"
      );
      return NextResponse.json(extractedInfo);
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json(
        { error: "Failed to process job information" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing job:", error);
    return NextResponse.json(
      { error: "Failed to process job information" },
      { status: 500 }
    );
  }
};
