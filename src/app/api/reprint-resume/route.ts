import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ResumeService } from "@/lib/services/resume-service";

export const POST = async (request: Request): Promise<NextResponse> => {
  try {
    const { resumeContent } = await request.json();
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get user's profile data
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        profile: {
          include: {
            experience: true,
            education: true,
            certifications: true,
            projects: true,
          },
        },
      },
    });

    if (!user?.profile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    // Parse the JSON content
    const parsedData = JSON.parse(resumeContent);

    // Convert HTML to PDF using Puppeteer

    const pdf = await ResumeService.generatePDF(user, parsedData);

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
