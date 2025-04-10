import { NextResponse } from "next/server";
import { z } from "zod";

import { JobService } from "@/lib/services/job-service";

const processJobSchema = z.object({
  type: z.enum(["text", "url"]),
  content: z.string().min(1),
});

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const body = await request.json();
    const validationResult = processJobSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }
    const { type, content } = validationResult.data;

    try {
      const extractedInfo = await JobService.analyzeJob(content, type);
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
