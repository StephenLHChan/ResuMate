import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { ResumeService } from "@/lib/services/resume-service";

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const { resumeContent } = await request.json();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse the JSON content
    const parsedData = JSON.parse(resumeContent);

    // Convert HTML to PDF using Puppeteer

    const pdf = await ResumeService.generatePDF(parsedData);

    // Return the PDF
    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="tailored-resume.pdf"',
      },
    });
  } catch (error: unknown) {
    console.error("Error reprinting resume:", error);
    return NextResponse.json(
      { error: "Failed to reprint resume" },
      { status: 500 }
    );
  }
};
